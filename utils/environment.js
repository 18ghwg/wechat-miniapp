/**
 * 全局环境管理器
 * 统一处理开发/生产环境的判断和API地址配置
 */

// 导入轻量级配置（不包含地区数据，提升性能）
const { config } = require('../config/config-lite');

/**
 * 环境管理器
 */
class EnvironmentManager {
  constructor() {
    this._isDev = null;
    this._baseUrl = null;
    this._lastCheckTime = 0;
    this._checkInterval = 5000; // 5秒检查一次环境变化
  }

  /**
   * 检测当前是否为开发环境
   * @returns {boolean}
   */
  isDevelopment() {
    const now = Date.now();
    
    // 如果距离上次检查时间超过间隔，重新检查
    if (this._isDev === null || (now - this._lastCheckTime) > this._checkInterval) {
      this._isDev = this._detectEnvironment();
      this._lastCheckTime = now;
    }
    
    return this._isDev;
  }

  /**
   * 检测环境的核心逻辑
   * @private
   */
  _detectEnvironment() {
    try {
      // 使用多种方法检测开发环境
      const appInfo = wx.getAppBaseInfo();
      const deviceInfo = wx.getDeviceInfo();
      
      // 方法1：检查设备平台（登录页面使用的方法）
      const isDevToolsPlatform = deviceInfo ? deviceInfo.platform === 'devtools' : false;
      
      // 方法2：检查host环境
      const isDevToolsEnv = (appInfo && appInfo.host) ? appInfo.host.env === 'devtools' : false;
      
      // 方法3：检查是否为开发者工具环境
      const isDevToolsHost = (appInfo && appInfo.host ? appInfo.host.env === 'WeChat' : false) && (deviceInfo ? deviceInfo.platform === 'devtools' : false);
      
      // 综合判断：只要有一种方法检测到是开发环境就认为是开发环境
      const isDev = isDevToolsPlatform || isDevToolsEnv || isDevToolsHost;
      
      // 环境检测日志（仅在开启调试模式时打印）
      try {
        const app = getApp();
        if (app && app.globalData && app.globalData.enableApiDebug) {
          console.log('🌍 环境检测:', {
            timestamp: new Date().toLocaleTimeString(),
            appInfo: appInfo,
            deviceInfo: deviceInfo,
            检测方法1_设备平台: isDevToolsPlatform,
            检测方法2_host环境: isDevToolsEnv,
            检测方法3_综合判断: isDevToolsHost,
            最终结果: isDev
          });
        }
      } catch (e) {
        // 静默失败
      }
      
      return isDev;
    } catch (error) {
      console.warn('🌍 环境检测失败，默认使用生产环境:', error);
      return false;
    }
  }

  /**
   * 获取当前环境对应的API基础地址
   * @returns {string}
   */
  getApiBaseUrl() {
    const isDev = this.isDevelopment();
    return isDev && config.api.devBaseUrl ? config.api.devBaseUrl : config.api.baseUrl;
  }

  /**
   * 获取完整的API地址（包含前缀）
   * @returns {string}
   */
  getFullApiUrl() {
    const baseUrl = this.getApiBaseUrl();
    const prefix = config.api.prefix || '';
    const fullUrl = baseUrl + prefix;
    
    // API地址日志（仅在开启调试模式时打印）
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.enableApiDebug) {
        console.log('🔗 API地址:', {
          isDev: this.isDevelopment(),
          baseUrl: baseUrl,
          prefix: prefix,
          fullUrl: fullUrl
        });
      }
    } catch (e) {
      // 静默失败
    }
    
    return fullUrl;
  }

  /**
   * 获取请求超时时间
   * @param {boolean} isLongTimeout 是否使用长超时时间
   * @returns {number}
   */
  getTimeout(isLongTimeout = false) {
    return isLongTimeout ? 
      (config.api.longTimeout || 120000) : 
      (config.api.timeout || 60000);
  }

  /**
   * 获取环境信息摘要
   * @returns {object}
   */
  getEnvironmentInfo() {
    return {
      isDev: this.isDevelopment(),
      apiBaseUrl: this.getApiBaseUrl(),
      fullApiUrl: this.getFullApiUrl(),
      timeout: this.getTimeout(),
      longTimeout: this.getTimeout(true),
      lastCheckTime: new Date(this._lastCheckTime).toLocaleTimeString()
    };
  }

  /**
   * 强制重新检测环境
   */
  forceRefresh() {
    this._isDev = null;
    this._lastCheckTime = 0;
    
    // 刷新日志（仅在开启调试模式时打印）
    try {
      const app = getApp();
      if (app && app.globalData && app.globalData.enableApiDebug) {
        console.log('🔄 强制刷新环境检测');
      }
    } catch (e) {
      // 静默失败
    }
    
    return this.isDevelopment();
  }
}

// 创建全局单例实例
const environmentManager = new EnvironmentManager();

/**
 * 获取环境信息的便捷函数
 * @returns {object}
 */
function getEnvironmentInfo() {
  return {
    isDev: environmentManager.isDevelopment(),
    baseUrl: environmentManager.getApiBaseUrl(),
    prefix: config.api.prefix || '',
    fullUrl: environmentManager.getFullApiUrl(),
    timeout: environmentManager.getTimeout(),
    longTimeout: environmentManager.getTimeout(true)
  };
}

module.exports = {
  environmentManager,
  EnvironmentManager,
  getEnvironmentInfo
};
