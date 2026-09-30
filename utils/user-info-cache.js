/**
 * 用户信息缓存管理类
 * 
 * 功能：
 * 1. 缓存用户信息，减少重复的 API 调用
 * 2. 自动过期机制（默认5分钟）
 * 3. 支持强制刷新
 * 4. 统一的错误处理
 * 
 * 使用场景：
 * - 考勤管理页面频繁验证用户信息
 * - 电费查询页面权限判断
 * - 其他需要用户信息的页面
 */

const { API, apiCall } = require('./api');

class UserInfoCache {
  constructor() {
    // 缓存数据
    this._cache = null;
    
    // 缓存时间戳
    this._timestamp = 0;

    // 缓存所属账号，防止切换账号后复用旧用户信息
    this._openid = '';
    
    // 缓存有效期（5分钟）
    this._ttl = 5 * 60 * 1000;
    
    // 是否正在加载
    this._loading = false;

    // 当前请求所属账号
    this._loadingOpenid = '';

    // 缓存代次，用于忽略账号切换前尚未完成的请求
    this._generation = 0;
    
    // 等待队列（避免并发请求）
    this._pendingCallbacks = [];
  }

  /**
   * 获取用户信息
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 用户信息
   */
  get(forceRefresh = false) {
    const currentOpenid = this._getCurrentOpenid();

    // openid 变化意味着登录身份已经切换，旧缓存和旧请求都不能复用。
    const cachedIdentityChanged = this._cache && this._openid !== currentOpenid;
    const loadingIdentityChanged = this._loading && this._loadingOpenid !== currentOpenid;
    if (cachedIdentityChanged || loadingIdentityChanged) {
      console.log('[UserInfoCache] 检测到账号切换，清除旧用户缓存');
      this.clear();
    }

    // 如果强制刷新或缓存已过期，则重新获取
    if (forceRefresh || this.isExpired()) {
      return this.fetch();
    }

    // 如果缓存有效，直接返回
    if (this._cache) {
      console.log('[UserInfoCache] 使用缓存的用户信息');
      return Promise.resolve(this._cache);
    }

    // 如果没有缓存，则获取
    return this.fetch();
  }

  /**
   * 检查缓存是否过期
   * @returns {boolean}
   */
  isExpired() {
    if (!this._cache || !this._timestamp) {
      return true;
    }
    
    const now = Date.now();
    const expired = (now - this._timestamp) > this._ttl;
    
    if (expired) {
      console.log('[UserInfoCache] 缓存已过期');
    }
    
    return expired;
  }

  /**
   * 从服务器获取用户信息
   * @returns {Promise<Object>}
   */
  fetch() {
    const requestOpenid = this._getCurrentOpenid();

    // 如果正在加载，将回调加入队列
    if (this._loading) {
      console.log('[UserInfoCache] 已有请求进行中，加入等待队列');
      return new Promise((resolve, reject) => {
        this._pendingCallbacks.push({ resolve, reject });
      });
    }

    console.log('[UserInfoCache] 从服务器获取用户信息');
    this._loading = true;
    this._loadingOpenid = requestOpenid;
    const requestGeneration = this._generation;

    return new Promise((resolve, reject) => {
      apiCall(
        () => API.user.getInfo(),
        null,
        (response) => {
          // 请求期间如果发生账号切换，丢弃旧账号响应。
          if (requestGeneration !== this._generation || requestOpenid !== this._getCurrentOpenid()) {
            reject(new Error('用户身份已切换，已忽略旧账号响应'));
            return;
          }

          // 处理API返回数据，确保格式正确
          const userInfo = response.data || response;
          
          // 更新缓存
          this._cache = userInfo;
          this._timestamp = Date.now();
          this._openid = requestOpenid;
          this._loading = false;
          this._loadingOpenid = '';

          console.log('[UserInfoCache] 用户信息已缓存', {
            nickname: userInfo.nickname,
            real_name: userInfo.real_name,
            is_admin: userInfo.is_admin
          });

          // 同时更新本地存储
          try {
            wx.setStorageSync('userInfo', userInfo);
          } catch (error) {
            console.error('[UserInfoCache] 保存到本地存储失败:', error);
          }

          // 执行等待队列中的回调
          this._resolvePendingCallbacks(userInfo);

          resolve(userInfo);
        },
        (error) => {
          if (requestGeneration !== this._generation || requestOpenid !== this._getCurrentOpenid()) {
            reject(error);
            return;
          }

          this._loading = false;
          this._loadingOpenid = '';
          console.error('[UserInfoCache] 获取用户信息失败:', error);

          // 尝试从本地存储获取
          try {
            const localUserInfo = wx.getStorageSync('userInfo');
            if (localUserInfo) {
              console.log('[UserInfoCache] 使用本地存储的用户信息作为降级方案');
              this._cache = localUserInfo;
              this._timestamp = Date.now();
              this._openid = requestOpenid;
              
              // 执行等待队列中的回调
              this._resolvePendingCallbacks(localUserInfo);
              
              resolve(localUserInfo);
              return;
            }
          } catch (e) {
            console.error('[UserInfoCache] 读取本地存储失败:', e);
          }

          // 执行等待队列中的错误回调
          this._rejectPendingCallbacks(error);

          reject(error);
        }
      );
    });
  }

  /**
   * 执行等待队列中的成功回调
   * @param {Object} userInfo 
   */
  _resolvePendingCallbacks(userInfo) {
    const callbacks = this._pendingCallbacks.slice();
    this._pendingCallbacks = [];
    
    callbacks.forEach(callback => {
      callback.resolve(userInfo);
    });
  }

  /**
   * 执行等待队列中的错误回调
   * @param {Error} error 
   */
  _rejectPendingCallbacks(error) {
    const callbacks = this._pendingCallbacks.slice();
    this._pendingCallbacks = [];
    
    callbacks.forEach(callback => {
      callback.reject(error);
    });
  }

  /**
   * 清除缓存
   */
  clear() {
    console.log('[UserInfoCache] 清除缓存');
    this._generation += 1;
    this._cache = null;
    this._timestamp = 0;
    this._openid = '';
    this._loading = false;
    this._loadingOpenid = '';

    if (this._pendingCallbacks.length > 0) {
      this._rejectPendingCallbacks(new Error('用户缓存已失效，请重新获取'));
    }
  }

  /**
   * 更新缓存
   * @param {Object} userInfo 
   */
  update(userInfo) {
    console.log('[UserInfoCache] 更新缓存');
    this._generation += 1;
    this._cache = userInfo;
    this._timestamp = Date.now();
    this._openid = this._getCurrentOpenid();
    this._loading = false;
    this._loadingOpenid = '';

    if (this._pendingCallbacks.length > 0) {
      this._resolvePendingCallbacks(userInfo);
    }
    
    // 同时更新本地存储
    try {
      wx.setStorageSync('userInfo', userInfo);
    } catch (error) {
      console.error('[UserInfoCache] 保存到本地存储失败:', error);
    }
  }

  /**
   * 设置缓存有效期
   * @param {number} ttl - 有效期（毫秒）
   */
  setTTL(ttl) {
    this._ttl = ttl;
  }

  /**
   * 获取缓存的用户信息（不触发加载）
   * @returns {Object|null}
   */
  getCached() {
    const currentOpenid = this._getCurrentOpenid();
    if (this._cache && this._openid !== currentOpenid) {
      this.clear();
      return null;
    }

    if (this.isExpired()) {
      return null;
    }
    return this._cache;
  }

  /**
   * 获取当前登录账号标识。
   * @returns {string}
   */
  _getCurrentOpenid() {
    try {
      return (typeof wx !== 'undefined' && wx.getStorageSync('openid')) || '';
    } catch (error) {
      return '';
    }
  }
}

// 导出单例
const userInfoCache = new UserInfoCache();

module.exports = {
  UserInfoCache,
  userInfoCache
};

