/**
 * 系统信息工具
 * 使用新的微信API替代已弃用的 wx.getSystemInfoSync()
 */

/**
 * 获取设备信息（包括平台信息）
 * @returns {Object} 设备信息
 */
function getDeviceInfo() {
  try {
    // 优先使用新API
    if (wx.getDeviceInfo) {
      return wx.getDeviceInfo();
    }
    // 降级使用旧API
    return wx.getSystemInfoSync();
  } catch (error) {
    console.error('获取设备信息失败:', error);
    return {
      platform: 'unknown',
      brand: 'unknown',
      model: 'unknown'
    };
  }
}

/**
 * 获取窗口信息
 * @returns {Object} 窗口信息
 */
function getWindowInfo() {
  try {
    if (wx.getWindowInfo) {
      return wx.getWindowInfo();
    }
    return wx.getSystemInfoSync();
  } catch (error) {
    console.error('获取窗口信息失败:', error);
    return {};
  }
}

/**
 * 获取小程序基础信息
 * @returns {Object} 基础信息
 */
function getAppBaseInfo() {
  try {
    if (wx.getAppBaseInfo) {
      return wx.getAppBaseInfo();
    }
    return wx.getSystemInfoSync();
  } catch (error) {
    console.error('获取应用信息失败:', error);
    return {
      version: 'unknown',
      SDKVersion: 'unknown'
    };
  }
}

/**
 * 检查是否在开发者工具中
 * @returns {Boolean} 是否在开发者工具
 */
function isDevtools() {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.platform === 'devtools';
}

/**
 * 获取平台信息
 * @returns {String} 平台名称 (ios/android/devtools/windows/mac)
 */
function getPlatform() {
  const deviceInfo = getDeviceInfo();
  return deviceInfo.platform || 'unknown';
}

/**
 * 获取微信版本
 * @returns {String} 微信版本号
 */
function getWechatVersion() {
  const appBaseInfo = getAppBaseInfo();
  return appBaseInfo.version || appBaseInfo.hostVersion || 'unknown';
}

/**
 * 获取基础库版本
 * @returns {String} 基础库版本号
 */
function getSDKVersion() {
  const appBaseInfo = getAppBaseInfo();
  return appBaseInfo.SDKVersion || 'unknown';
}

/**
 * 获取完整的系统信息（向后兼容）
 * 注意：这个方法会组合多个新API的结果
 * @returns {Object} 系统信息
 */
function getSystemInfo() {
  const deviceInfo = getDeviceInfo();
  const windowInfo = getWindowInfo();
  const appBaseInfo = getAppBaseInfo();
  
  return {
    // 设备信息
    platform: deviceInfo.platform,
    brand: deviceInfo.brand,
    model: deviceInfo.model,
    system: deviceInfo.system,
    
    // 窗口信息
    windowWidth: windowInfo.windowWidth,
    windowHeight: windowInfo.windowHeight,
    screenWidth: windowInfo.screenWidth,
    screenHeight: windowInfo.screenHeight,
    pixelRatio: windowInfo.pixelRatio,
    
    // 应用信息
    version: appBaseInfo.version || appBaseInfo.hostVersion,
    SDKVersion: appBaseInfo.SDKVersion,
    language: appBaseInfo.language,
    theme: appBaseInfo.theme
  };
}

module.exports = {
  getDeviceInfo,
  getWindowInfo,
  getAppBaseInfo,
  isDevtools,
  getPlatform,
  getWechatVersion,
  getSDKVersion,
  getSystemInfo
};

