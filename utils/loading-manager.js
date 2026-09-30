/**
 * 智能Loading管理器
 * 优化用户体验，防止loading闪烁，支持加载状态复用
 */

class LoadingManager {
  constructor() {
    this.activeLoadings = new Map();
    this.loadingQueue = [];
    this.loadingHistory = [];
    
    // 配置
    this.config = {
      minShowTime: 500,      // 最短显示时间500ms，防止闪烁
      maxConcurrent: 3,      // 最大并发loading数
      animationDuration: 300, // 动画持续时间
      queueTimeout: 10000    // 队列超时时间
    };
  }

  /**
   * 显示Loading
   * @param {string} loadingId - Loading唯一标识
   * @param {Object} options - Loading选项
   */
  showLoading(loadingId, options = {}) {
    const {
      title = '加载中...',
      mask = true,
      delay = 0,
      priority = 'normal',
      timeout = 30000
    } = options;

    // 如果已经存在相同的loading，复用
    if (this.activeLoadings.has(loadingId)) {
      console.log(`Loading复用: ${loadingId}`);
      return this.activeLoadings.get(loadingId);
    }

    const loadingInfo = {
      id: loadingId,
      title,
      mask,
      priority,
      startTime: Date.now(),
      showTime: null,
      isShowing: false,
      timeout: null
    };

    // 设置超时
    loadingInfo.timeout = setTimeout(() => {
      console.warn(`Loading超时自动隐藏: ${loadingId}`);
      this.hideLoading(loadingId);
    }, timeout);

    // 延迟显示
    if (delay > 0) {
      setTimeout(() => {
        this._doShowLoading(loadingInfo);
      }, delay);
    } else {
      this._doShowLoading(loadingInfo);
    }

    this.activeLoadings.set(loadingId, loadingInfo);
    return loadingInfo;
  }

  /**
   * 实际显示Loading
   */
  _doShowLoading(loadingInfo) {
    // 检查并发数限制
    const currentShowing = Array.from(this.activeLoadings.values()).filter(info => info.isShowing).length;
    
    if (currentShowing >= this.config.maxConcurrent) {
      // 添加到队列
      this.loadingQueue.push({
        action: 'show',
        loadingInfo,
        timestamp: Date.now()
      });
      
      console.log(`Loading排队: ${loadingInfo.id}, 当前队列长度: ${this.loadingQueue.length}`);
      return;
    }

    try {
      wx.showLoading({
        title: loadingInfo.title,
        mask: loadingInfo.mask
      });

      loadingInfo.isShowing = true;
      loadingInfo.showTime = Date.now();
      
      console.log(`Loading显示: ${loadingInfo.id}`);
      
      // 记录历史
      this.loadingHistory.push({
        id: loadingInfo.id,
        action: 'show',
        timestamp: loadingInfo.showTime
      });

    } catch (error) {
      console.error('显示Loading失败:', error);
    }
  }

  /**
   * 隐藏Loading
   * @param {string} loadingId - Loading标识
   * @param {boolean} force - 是否强制隐藏
   */
  hideLoading(loadingId, force = false) {
    const loadingInfo = this.activeLoadings.get(loadingId);
    
    if (!loadingInfo) {
      console.warn(`Loading不存在: ${loadingId}`);
      return;
    }

    // 清除超时定时器
    if (loadingInfo.timeout) {
      clearTimeout(loadingInfo.timeout);
    }

    // 检查最小显示时间
    if (!force && loadingInfo.showTime) {
      const showDuration = Date.now() - loadingInfo.showTime;
      if (showDuration < this.config.minShowTime) {
        const remainingTime = this.config.minShowTime - showDuration;
        setTimeout(() => {
          this._doHideLoading(loadingId);
        }, remainingTime);
        return;
      }
    }

    this._doHideLoading(loadingId);
  }

  /**
   * 实际隐藏Loading
   */
  _doHideLoading(loadingId) {
    const loadingInfo = this.activeLoadings.get(loadingId);
    
    if (!loadingInfo || !loadingInfo.isShowing) {
      this.activeLoadings.delete(loadingId);
      this._processQueue();
      return;
    }

    try {
      wx.hideLoading();
      
      console.log(`Loading隐藏: ${loadingId}`);
      
      // 记录历史
      this.loadingHistory.push({
        id: loadingId,
        action: 'hide',
        timestamp: Date.now(),
        duration: Date.now() - (loadingInfo.showTime || loadingInfo.startTime)
      });

    } catch (error) {
      console.error('隐藏Loading失败:', error);
    } finally {
      this.activeLoadings.delete(loadingId);
      this._processQueue();
    }
  }

  /**
   * 处理Loading队列
   */
  _processQueue() {
    if (this.loadingQueue.length === 0) return;

    // 清理过期队列项
    const now = Date.now();
    this.loadingQueue = this.loadingQueue.filter(item => 
      now - item.timestamp < this.config.queueTimeout
    );

    // 检查是否可以处理队列
    const currentShowing = Array.from(this.activeLoadings.values()).filter(info => info.isShowing).length;
    
    if (currentShowing < this.config.maxConcurrent && this.loadingQueue.length > 0) {
      // 按优先级排序
      this.loadingQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.loadingInfo.priority] - priorityOrder[a.loadingInfo.priority];
      });

      const queueItem = this.loadingQueue.shift();
      if (queueItem.action === 'show') {
        this._doShowLoading(queueItem.loadingInfo);
      }
    }
  }

  /**
   * 隐藏所有Loading
   */
  hideAllLoadings(force = false) {
    console.log('隐藏所有Loading');
    
    const loadingIds = Array.from(this.activeLoadings.keys());
    loadingIds.forEach(id => {
      this.hideLoading(id, force);
    });
    
    // 清空队列
    this.loadingQueue = [];
  }

  /**
   * 获取Loading状态
   */
  getLoadingStatus() {
    const activeCount = this.activeLoadings.size;
    const showingCount = Array.from(this.activeLoadings.values()).filter(info => info.isShowing).length;
    const queueCount = this.loadingQueue.length;

    return {
      active: activeCount,
      showing: showingCount,
      queued: queueCount,
      maxConcurrent: this.config.maxConcurrent,
      history: this.loadingHistory.slice(-10) // 最近10条历史记录
    };
  }

  /**
   * 智能Loading包装器
   * 自动管理Loading的显示和隐藏
   */
  wrapWithLoading(asyncFunction, loadingOptions = {}) {
    const self = this;
    return async function() {
      const args = Array.prototype.slice.call(arguments);
      const loadingId = loadingOptions.id || 'auto_' + Date.now() + '_' + Math.random();
      
      self.showLoading(loadingId, loadingOptions);
      
      try {
        const result = await asyncFunction.apply(null, args);
        return result;
      } catch (error) {
        throw error;
      } finally {
        self.hideLoading(loadingId);
      }
    };
  }

  /**
   * 批量Loading管理
   * 用于管理多个相关的异步操作
   */
  createBatchLoader(batchId, operations = []) {
    const batchLoadings = new Map();
    let completedCount = 0;
    
    const showBatchLoading = () => {
      this.showLoading(`batch_${batchId}`, {
        title: `加载中 0/${operations.length}`,
        priority: 'high'
      });
    };

    const updateBatchLoading = () => {
      completedCount++;
      const loadingInfo = this.activeLoadings.get(`batch_${batchId}`);
      if (loadingInfo) {
        // 更新标题（注意：小程序不支持动态更新loading标题，这里只是示意）
        console.log(`批量加载进度: ${completedCount}/${operations.length}`);
      }
      
      if (completedCount >= operations.length) {
        this.hideLoading(`batch_${batchId}`);
      }
    };

    return {
      start: showBatchLoading,
      complete: updateBatchLoading,
      cancel: () => this.hideLoading(`batch_${batchId}`, true)
    };
  }

  /**
   * 清理过期历史记录
   */
  cleanupHistory() {
    const maxHistorySize = 50;
    if (this.loadingHistory.length > maxHistorySize) {
      this.loadingHistory = this.loadingHistory.slice(-maxHistorySize);
    }
  }
}

// 全局Loading管理器实例
const loadingManager = new LoadingManager();

// 定期清理历史记录
setInterval(() => {
  loadingManager.cleanupHistory();
}, 5 * 60 * 1000); // 每5分钟清理一次

module.exports = {
  loadingManager,
  LoadingManager
};
