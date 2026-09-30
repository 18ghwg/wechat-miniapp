/**
 * 全局环境管理器
 * 固定使用生产环境API地址
 */

// 导入轻量级配置（不包含地区数据，提升性能）
const { config } = require('../config/config-lite');

/**
 * 环境管理器
 */
class EnvironmentManager {
  constructor() {
    this._isDev = false;
    this._lastCheckTime = Date.now();
  }

  /**
   * 当前小程序固定按生产环境运行
   * @returns {boolean}
   */
  isDevelopment() {
    return false;
  }

  /**
   * 保留兼容旧调用，固定返回生产环境
   * @private
   */
  _detectEnvironment() {
    return false;
  }

  /**
   * 获取当前环境对应的API基础地址
   * @returns {string}
   */
  getApiBaseUrl() {
    return config.api.baseUrl;
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
          isDev: false,
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
    this._isDev = false;
    this._lastCheckTime = Date.now();
    
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
