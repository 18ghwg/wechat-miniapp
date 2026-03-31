/**
 * 小程序信息获取工具
 * 通过微信API和后端配置获取小程序的基本信息
 */

class MiniprogramInfo {
  constructor() {
    this._accountInfo = null;  // 小程序账号信息（来自微信API）
    this._systemConfig = null; // 系统配置信息（来自后端）
    this._appName = '无感tool';  // 默认名称
    this._appDescription = '您的智能管理助手';  // 默认描述
  }

  /**
   * 获取小程序账号信息（通过微信API）
   * @returns {Object} 账号信息
   */
  getAccountInfo() {
    if (!this._accountInfo) {
      try {
        this._accountInfo = wx.getAccountInfoSync();
        console.log('📱 小程序账号信息:', this._accountInfo);
      } catch (error) {
        console.error('获取小程序账号信息失败:', error);
        this._accountInfo = {
          miniProgram: {
            appId: '',
            envVersion: 'release', // release, develop, trial
            version: '1.0.0'
          }
        };
      }
    }
    return this._accountInfo;
  }

  /**
   * 获取小程序AppID
   * @returns {String} AppID
   */
  getAppId() {
    const accountInfo = this.getAccountInfo();
    return accountInfo.miniProgram?.appId || '';
  }

  /**
   * 获取小程序版本号
   * @returns {String} 版本号
   */
  getVersion() {
    const accountInfo = this.getAccountInfo();
    return accountInfo.miniProgram?.version || '1.0.0';
  }

  /**
   * 获取运行环境
   * @returns {String} release(正式版) / develop(开发版) / trial(体验版)
   */
  getEnvVersion() {
    const accountInfo = this.getAccountInfo();
    return accountInfo.miniProgram?.envVersion || 'release';
  }

  /**
   * 判断是否为开发环境
   * @returns {Boolean}
   */
  isDevelopment() {
    return this.getEnvVersion() === 'develop';
  }

  /**
   * 设置系统配置（从后端获取）
   * @param {Object} config 系统配置
   */
  setSystemConfig(config) {
    if (config) {
      this._systemConfig = config;
      
      // 更新小程序名称和描述
      if (config.app_name) {
        this._appName = config.app_name;
      }
      if (config.app_description) {
        this._appDescription = config.app_description;
      }
      
      console.log('✅ 系统配置已更新:', {
        appName: this._appName,
        appDescription: this._appDescription
      });
    }
  }

  /**
   * 获取小程序名称
   * @returns {String} 小程序名称
   */
  getAppName() {
    return this._appName;
  }

  /**
   * 获取小程序描述
   * @returns {String} 小程序描述
   */
  getAppDescription() {
    return this._appDescription;
  }

  /**
   * 获取完整的小程序信息
   * @returns {Object} 完整信息
   */
  getFullInfo() {
    return {
      appId: this.getAppId(),
      appName: this.getAppName(),
      description: this.getAppDescription(),
      version: this.getVersion(),
      envVersion: this.getEnvVersion(),
      isDevelopment: this.isDevelopment()
    };
  }

  /**
   * 获取分享标题（小程序名称）
   * @param {String} suffix 标题后缀（可选）
   * @returns {String} 分享标题
   */
  getShareTitle(suffix = '') {
    if (suffix) {
      return `${suffix} - ${this._appName}`;
    }
    return this._appName;
  }

  /**
   * 获取分享描述
   * @returns {String} 分享描述
   */
  getShareDesc() {
    return this._appDescription;
  }
}

// 创建全局单例
const miniprogramInfo = new MiniprogramInfo();

module.exports = {
  miniprogramInfo,
  MiniprogramInfo
};

