/**
 * API配置文件（全局唯一）
 * 所有API相关配置统一在此文件中管理
 * 
 * 注意：这是唯一的API配置文件，不要在其他地方重复定义API配置
 */

/**
 * 动态获取是否使用Mock数据
 * 只在测试模式下启用Mock
 */
function getUseMock() {
  try {
    // 只在测试模式下启用mock
    const isTestMode = wx.getStorageSync('isTestMode');
    return isTestMode === true;
  } catch (e) {
    return false;
  }
}

/**
 * API配置对象
 */
export const apiConfig = {
  /** 
   * 后端API配置
   */
  api: {
    /**
     * 正式环境API地址
     * 生产环境使用此地址
     */
    baseUrl: 'https://ccrl.blog18.cn',
    
    /**
     * API路径前缀
     * 所有API请求都会自动添加此前缀
     */
    prefix: '/api/wechat',
    
    /**
     * 请求超时时间（毫秒）
     * 普通请求使用此超时时间
     */
    timeout: 60000,
    
    /**
     * 长超时时间（毫秒）
     * 用于电费查询等耗时操作
     */
    longTimeout: 120000
  },
  
  /**
   * 是否使用mock代替api返回
   * 使用getter动态获取，根据isTestMode决定
   * 
   * 使用方式：
   * - 测试模式：wx.setStorageSync('isTestMode', true)
   * - 正常模式：wx.setStorageSync('isTestMode', false)
   */
  get useMock() {
    return getUseMock();
  }
};
