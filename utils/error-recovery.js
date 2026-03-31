/**
 * 智能错误恢复管理器
 * 自动捕获、分析和恢复各种错误，提升用户体验
 */

const { loadingManager } = require('./loading-manager.js');
const { performanceManager } = require('./performance-manager.js');

class ErrorRecoveryManager {
  constructor() {
    this.errorHistory = [];
    this.recoveryStrategies = new Map();
    this.autoRecoveryEnabled = true;
    
    // 错误统计
    this.errorStats = {
      totalErrors: 0,
      recoveredErrors: 0,
      criticalErrors: 0,
      lastError: null
    };
    
    // 恢复配置
    this.config = {
      maxRetryAttempts: 3,
      retryDelay: 1000,
      maxErrorHistory: 100,
      criticalErrorThreshold: 5, // 5个严重错误触发紧急处理
      errorReportInterval: 60000  // 每分钟报告一次错误统计
    };
    
    // 注册默认恢复策略
    this.registerDefaultStrategies();
    
    // 设置全局错误监听
    this.setupGlobalErrorHandling();
  }

  /**
   * 注册默认恢复策略
   */
  registerDefaultStrategies() {
    // 网络错误恢复策略
    this.registerStrategy('network_error', {
      canRecover: (error) => {
        return error.message && (
          error.message.includes('timeout') ||
          error.message.includes('网络') ||
          error.message.includes('request:fail')
        );
      },
      recover: async (error, context) => {
        console.log('执行网络错误恢复策略');
        
        // 检查网络状态
        const networkType = await this.checkNetworkStatus();
        if (networkType === 'none') {
          this.showNetworkErrorDialog();
          return false;
        }
        
        // 重试请求
        if (context.retryCount < this.config.maxRetryAttempts) {
          await this.delay(this.config.retryDelay * (context.retryCount + 1));
          return await this.retryOperation(context);
        }
        
        return false;
      }
    });

    // 数据加载错误恢复策略
    this.registerStrategy('data_load_error', {
      canRecover: (error) => {
        return error.type === 'data_load_failed' || 
               (error.message ? error.message.includes('数据加载') : false);
      },
      recover: async (error, context) => {
        console.log('执行数据加载错误恢复策略');
        
        // 尝试从缓存恢复
        if (context.cacheKey) {
          const cachedData = this.tryLoadFromCache(context.cacheKey);
          if (cachedData) {
            console.log('从缓存恢复数据成功');
            return cachedData;
          }
        }
        
        // 尝试加载默认数据
        if (context.defaultData) {
          console.log('使用默认数据恢复');
          return context.defaultData;
        }
        
        return false;
      }
    });

    // 页面渲染错误恢复策略
    this.registerStrategy('render_error', {
      canRecover: (error) => {
        return (error.message ? error.message.includes('setData') : false) ||
               (error.message ? error.message.includes('render') : false);
      },
      recover: async (error, context) => {
        console.log('执行页面渲染错误恢复策略');
        
        // 清理可能导致问题的数据
        if (context.pageInstance && context.problematicData) {
          try {
            const cleanData = this.sanitizeData(context.problematicData);
            context.pageInstance.setData(cleanData);
            return true;
          } catch (e) {
            console.error('数据清理失败:', e);
          }
        }
        
        // 尝试重新渲染页面关键组件
        return this.rerenderPage(context.pageInstance);
      }
    });

    // Canvas错误恢复策略
    this.registerStrategy('canvas_error', {
      canRecover: (error) => {
        return (error.message ? error.message.includes('canvas') : false) ||
               (error.message ? error.message.includes('createCanvasContext') : false);
      },
      recover: async (error, context) => {
        console.log('执行Canvas错误恢复策略');
        
        // 重新创建Canvas上下文
        if (context.canvasId && context.componentInstance) {
          try {
            const newCtx = performanceManager.getCanvasContext(
              context.canvasId, 
              context.componentInstance
            );
            if (context.onCanvasRecovered) {
              context.onCanvasRecovered(newCtx);
            }
            return true;
          } catch (e) {
            console.error('Canvas恢复失败:', e);
          }
        }
        
        return false;
      }
    });
  }

  /**
   * 注册错误恢复策略
   */
  registerStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
    console.log(`注册错误恢复策略: ${errorType}`);
  }

  /**
   * 设置全局错误处理
   */
  setupGlobalErrorHandling() {
    // 监听小程序错误（检查 API 是否存在，wept 环境不支持）
    if (typeof wx.onError === 'function') {
      wx.onError((error) => {
        this.handleError(error, { source: 'wx.onError' });
      });
    } else {
      console.warn('当前环境不支持 wx.onError (wept 环境)');
    }

    // 监听未处理的Promise rejection（检查 API 是否存在）
    if (typeof wx.onUnhandledRejection === 'function') {
      wx.onUnhandledRejection((res) => {
        this.handleError(res.reason, { 
          source: 'unhandledRejection',
          promise: res.promise 
        });
      });
    } else {
      console.warn('当前环境不支持 wx.onUnhandledRejection (wept 环境)');
    }

    // 拦截console.error
    const originalConsoleError = console.error;
    console.error = function() {
      const args = Array.prototype.slice.call(arguments);
      const error = args[0];
      if (error instanceof Error) {
        errorRecoveryManager.handleError(error, { source: 'console.error', args: args });
      }
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * 处理错误
   */
  async handleError(error, context = {}) {
    try {
      // 防止递归错误处理
      if (context.isRecoveryError) {
        console.error('恢复过程中的错误，跳过自动处理:', error.message);
        return false;
      }
      
      // 记录错误
      this.recordError(error, context);
      
      // 检查是否可以自动恢复
      if (this.autoRecoveryEnabled) {
        const recovered = await this.attemptRecovery(error, context);
        if (recovered) {
          console.log('错误自动恢复成功:', error.message);
          return true;
        }
      }
      
      // 显示用户友好的错误信息（但不是所有错误都需要显示给用户）
      if (!context.source || context.source !== 'performance_monitor') {
        this.showUserFriendlyError(error, context);
      }
      
      return false;
      
    } catch (recoveryError) {
      console.error('错误恢复过程中出现异常:', recoveryError);
      this.recordError(recoveryError, Object.assign({}, context, { isRecoveryError: true }));
      return false;
    }
  }

  /**
   * 记录错误
   */
  recordError(error, context) {
    const errorRecord = {
      id: `error_${Date.now()}_${Math.random()}`,
      message: error.message || error.toString(),
      stack: error.stack,
      timestamp: Date.now(),
      context,
      severity: this.calculateErrorSeverity(error, context),
      recovered: false
    };
    
    this.errorHistory.push(errorRecord);
    this.errorStats.totalErrors++;
    this.errorStats.lastError = errorRecord;
    
    // 检查是否为严重错误
    if (errorRecord.severity === 'critical') {
      this.errorStats.criticalErrors++;
    }
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory.shift();
    }
    
    // 检查是否需要紧急处理
    this.checkEmergencyHandling(errorRecord);
    
    console.error('错误已记录:', errorRecord);
  }

  /**
   * 计算错误严重程度
   */
  calculateErrorSeverity(error, context) {
    const message = error.message || error.toString();
    
    // 严重错误
    if (message.includes('ReferenceError') ||
        message.includes('TypeError') ||
        context.source === 'unhandledRejection' ||
        message.includes('Maximum call stack')) {
      return 'critical';
    }
    
    // 警告级错误
    if (message.includes('network') ||
        message.includes('timeout') ||
        message.includes('request:fail')) {
      return 'warning';
    }
    
    // 信息级错误
    return 'info';
  }

  /**
   * 尝试恢复错误
   */
  async attemptRecovery(error, context) {
    // 遍历所有恢复策略
    for (const [strategyName, strategy] of this.recoveryStrategies.entries()) {
      try {
        if (strategy.canRecover(error)) {
          console.log(`尝试使用策略恢复错误: ${strategyName}`);
          
          const recoveryContext = Object.assign({}, context, {
            retryCount: context.retryCount || 0,
            strategyName: strategyName
          });
          
          const result = await strategy.recover(error, recoveryContext);
          
          if (result !== false) {
            // 恢复成功
            this.markErrorAsRecovered(error);
            this.errorStats.recoveredErrors++;
            return result;
          }
        }
      } catch (strategyError) {
        console.error(`恢复策略 ${strategyName} 执行失败:`, strategyError);
      }
    }
    
    return false;
  }

  /**
   * 标记错误为已恢复
   */
  markErrorAsRecovered(error) {
    const errorRecord = this.errorHistory.find(record => 
      record.message === error.message && !record.recovered
    );
    
    if (errorRecord) {
      errorRecord.recovered = true;
      errorRecord.recoveryTime = Date.now();
    }
  }

  /**
   * 检查网络状态
   */
  checkNetworkStatus() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => resolve(res.networkType),
        fail: () => resolve('unknown')
      });
    });
  }

  /**
   * 显示网络错误对话框
   */
  showNetworkErrorDialog() {
    wx.showModal({
      title: '网络连接异常',
      content: '请检查网络连接后重试',
      showCancel: true,
      cancelText: '取消',
      confirmText: '重试',
      success: (res) => {
        if (res.confirm) {
          // 用户点击重试，可以触发重新加载
          this.triggerPageReload();
        }
      }
    });
  }

  /**
   * 重试操作
   */
  async retryOperation(context) {
    if (context.retryFunction) {
      try {
        context.retryCount = (context.retryCount || 0) + 1;
        return await context.retryFunction();
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  /**
   * 从缓存加载数据
   */
  tryLoadFromCache(cacheKey) {
    try {
      const cachedData = wx.getStorageSync(cacheKey);
      return cachedData || false;
    } catch (error) {
      console.error('从缓存加载数据失败:', error);
      return false;
    }
  }

  /**
   * 清理数据
   */
  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return {};
    }
    
    const cleaned = {};
    
    for (const [key, value] of Object.entries(data)) {
      try {
        // 检查数据是否可序列化
        JSON.stringify(value);
        cleaned[key] = value;
      } catch (e) {
        console.warn(`跳过不可序列化的数据: ${key}`);
        cleaned[key] = null;
      }
    }
    
    return cleaned;
  }

  /**
   * 重新渲染页面
   */
  async rerenderPage(pageInstance) {
    if (!pageInstance) return false;
    
    try {
      // 触发页面重新渲染
      pageInstance.setData({
        _forceRerender: Date.now()
      });
      
      await this.delay(100);
      return true;
    } catch (error) {
      console.error('页面重渲染失败:', error);
      return false;
    }
  }

  /**
   * 触发页面重新加载
   */
  triggerPageReload() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    if (currentPage && currentPage.onPullDownRefresh) {
      currentPage.onPullDownRefresh();
    }
  }

  /**
   * 显示用户友好的错误信息
   */
  showUserFriendlyError(error, context) {
    const message = this.getFriendlyErrorMessage(error);
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  }

  /**
   * 获取用户友好的错误信息
   */
  getFriendlyErrorMessage(error) {
    const message = error.message || error.toString();
    
    if (message.includes('network') || message.includes('timeout')) {
      return '网络连接异常，请检查网络后重试';
    }
    
    if (message.includes('数据') || message.includes('data')) {
      return '数据加载失败，请稍后重试';
    }
    
    if (message.includes('权限') || message.includes('permission')) {
      return '权限不足，请联系管理员';
    }
    
    return '操作失败，请稍后重试';
  }

  /**
   * 检查是否需要紧急处理
   */
  checkEmergencyHandling(errorRecord) {
    if (this.errorStats.criticalErrors >= this.config.criticalErrorThreshold) {
      console.warn('严重错误过多，触发紧急处理');
      this.performEmergencyHandling();
    }
  }

  /**
   * 执行紧急处理
   */
  performEmergencyHandling() {
    // 隐藏所有loading
    loadingManager.hideAllLoadings(true);
    
    // 清理内存
    performanceManager.performEmergencyCleanup();
    
    // 重置错误统计
    this.errorStats.criticalErrors = 0;
    
    // 显示紧急提示
    wx.showModal({
      title: '系统提示',
      content: '检测到多个严重错误，已执行自动修复。如问题持续存在，请重启小程序。',
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * 延迟执行
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取错误统计报告
   */
  getErrorReport() {
    const now = Date.now();
    const recentErrors = this.errorHistory.filter(error => 
      now - error.timestamp < 60 * 60 * 1000 // 最近1小时
    );
    
    return Object.assign({}, this.errorStats, {
      recoveryRate: this.errorStats.totalErrors > 0 
        ? ((this.errorStats.recoveredErrors / this.errorStats.totalErrors) * 100).toFixed(2) + '%'
        : '100%',
      recentErrorCount: recentErrors.length,
      registeredStrategies: Array.from(this.recoveryStrategies.keys()),
      config: this.config
    });
  }

  /**
   * 清理错误历史
   */
  clearErrorHistory() {
    this.errorHistory = [];
    this.errorStats = {
      totalErrors: 0,
      recoveredErrors: 0,
      criticalErrors: 0,
      lastError: null
    };
    console.log('错误历史已清理');
  }
}

// 全局错误恢复管理器实例
const errorRecoveryManager = new ErrorRecoveryManager();

module.exports = {
  errorRecoveryManager,
  ErrorRecoveryManager
};
