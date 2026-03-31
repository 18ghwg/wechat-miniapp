/**
 * 数据预加载器
 * 
 * 功能：
 * 1. 在用户浏览首页时，预加载其他页面的数据
 * 2. 智能预判用户可能访问的页面
 * 3. 缓存预加载的数据
 * 4. 减少页面切换时的等待时间
 * 
 * 使用场景：
 * - 首页加载完成后，预加载电费查询数据
 * - 首页加载完成后，预加载考勤数据
 * - 用户浏览某个页面时，预加载相关页面数据
 */

const { API, apiCall } = require('./api');
const { userInfoCache } = require('./user-info-cache');

class DataPreloader {
  constructor() {
    // 预加载数据缓存
    this._cache = new Map();
    
    // 缓存有效期（5分钟）
    this._ttl = 5 * 60 * 1000;
    
    // 是否启用预加载
    this._enabled = true;
    
    // 预加载任务队列
    this._queue = [];
    
    // 是否正在执行预加载
    this._loading = false;
  }

  /**
   * 设置是否启用预加载
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this._enabled = enabled;
    console.log(`[数据预加载] ${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 预加载电费查询数据
   * @returns {Promise}
   */
  async preloadElectricData() {
    if (!this._enabled) return;

    const cacheKey = 'electric_binding_status';
    
    // 检查缓存
    if (this._isCacheValid(cacheKey)) {
      console.log('[数据预加载] 电费数据缓存有效，跳过');
      return this._cache.get(cacheKey).data;
    }

    console.log('[数据预加载] 开始预加载电费绑定状态');

    try {
      // 获取用户信息
      const userInfo = await userInfoCache.get();
      
      // 检查绑定状态
      const response = await API.grid.getAccounts();
      let data = response;
      if (response && response.data) {
        data = response.data;
      }

      const hasBinding = data && Array.isArray(data) && data.length > 0;
      
      const result = {
        hasBinding,
        userInfo,
        accounts: hasBinding ? data : []
      };

      // 缓存结果
      this._setCache(cacheKey, result);
      
      console.log('[数据预加载] 电费绑定状态预加载完成:', hasBinding);
      return result;
    } catch (error) {
      console.error('[数据预加载] 电费数据预加载失败:', error);
      return null;
    }
  }

  /**
   * 预加载考勤数据
   * @returns {Promise}
   */
  async preloadAttendanceData() {
    if (!this._enabled) return;

    const cacheKey = 'attendance_user_info';
    
    // 检查缓存
    if (this._isCacheValid(cacheKey)) {
      console.log('[数据预加载] 考勤数据缓存有效，跳过');
      return this._cache.get(cacheKey).data;
    }

    console.log('[数据预加载] 开始预加载考勤用户信息');

    try {
      // 获取用户信息
      const userInfo = await userInfoCache.get();
      
      const result = {
        userInfo,
        hasRealName: !!(userInfo && userInfo.real_name)
      };

      // 缓存结果
      this._setCache(cacheKey, result);
      
      console.log('[数据预加载] 考勤用户信息预加载完成:', result.hasRealName);
      return result;
    } catch (error) {
      console.error('[数据预加载] 考勤数据预加载失败:', error);
      return null;
    }
  }

  /**
   * 预加载用户中心数据
   * @returns {Promise}
   */
  async preloadUserCenterData() {
    if (!this._enabled) return;

    const cacheKey = 'usercenter_data';
    
    // 检查缓存
    if (this._isCacheValid(cacheKey)) {
      console.log('[数据预加载] 用户中心数据缓存有效，跳过');
      return this._cache.get(cacheKey).data;
    }

    console.log('[数据预加载] 开始预加载用户中心数据');

    try {
      // 获取用户信息（已缓存）
      const userInfo = await userInfoCache.get();
      
      const result = {
        userInfo
      };

      // 缓存结果
      this._setCache(cacheKey, result);
      
      console.log('[数据预加载] 用户中心数据预加载完成');
      return result;
    } catch (error) {
      console.error('[数据预加载] 用户中心数据预加载失败:', error);
      return null;
    }
  }

  /**
   * 批量预加载（按优先级）
   * @param {Array} tasks - 任务列表
   */
  async preloadBatch(tasks = []) {
    if (!this._enabled || tasks.length === 0) return;

    console.log(`[数据预加载] 开始批量预加载 ${tasks.length} 个任务`);

    // 串行执行（避免并发过多）
    for (const task of tasks) {
      try {
        await task();
        // 添加短暂延迟，避免阻塞主线程
        await this._delay(100);
      } catch (error) {
        console.error('[数据预加载] 任务执行失败:', error);
      }
    }

    console.log('[数据预加载] 批量预加载完成');
  }

  /**
   * 从首页预加载常用数据
   */
  async preloadFromHome() {
    console.log('[数据预加载] 从首页开始预加载');

    // 延迟执行（等待首页加载完成）
    await this._delay(1000);

    // 按优先级预加载
    await this.preloadBatch([
      () => this.preloadElectricData(),     // 优先级1：电费查询
      () => this.preloadAttendanceData(),   // 优先级2：考勤管理
      () => this.preloadUserCenterData()    // 优先级3：用户中心
    ]);
  }

  /**
   * 获取缓存的数据
   * @param {string} key 
   * @returns {*}
   */
  getCached(key) {
    if (!this._isCacheValid(key)) {
      return null;
    }
    return this._cache.get(key).data;
  }

  /**
   * 检查缓存是否有效
   * @param {string} key 
   * @returns {boolean}
   */
  _isCacheValid(key) {
    const cached = this._cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this._ttl;
  }

  /**
   * 设置缓存
   * @param {string} key 
   * @param {*} data 
   */
  _setCache(key, data) {
    this._cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 清除指定缓存
   * @param {string} key 
   */
  clearCache(key) {
    this._cache.delete(key);
    console.log(`[数据预加载] 清除缓存: ${key}`);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache() {
    this._cache.clear();
    console.log('[数据预加载] 清除所有缓存');
  }

  /**
   * 延迟执行
   * @param {number} ms 
   * @returns {Promise}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取缓存统计
   * @returns {Object}
   */
  getStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    this._cache.forEach((value, key) => {
      if ((now - value.timestamp) < this._ttl) {
        validCount++;
      } else {
        expiredCount++;
      }
    });

    return {
      total: this._cache.size,
      valid: validCount,
      expired: expiredCount
    };
  }
}

// 导出单例
const dataPreloader = new DataPreloader();

module.exports = {
  dataPreloader,
  DataPreloader
};

