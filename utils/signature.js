/**
 * API签名工具类
 * 
 * 用于生成API请求签名，防止参数篡改和重放攻击
 * 
 * 依赖：
 * - crypto-js (需要安装: npm install crypto-js)
 * 
 * 使用方法：
 * 1. 在构建工具中安装: npm install crypto-js
 * 2. 在微信开发者工具中点击"工具 -> 构建npm"
 * 3. 导入此文件: const SignatureUtil = require('./signature.js')
 * 4. 使用: SignatureUtil.generateSignature(method, url, data)
 */

// 注意：需要先安装 crypto-js
// 在小程序项目根目录执行: npm install crypto-js
// 然后在微信开发者工具中点击"工具 -> 构建npm"

// 尝试加载 crypto-js，如果失败则使用 polyfill（用于 wept 环境）
let CryptoJS;
try {
  CryptoJS = require('crypto-js');
} catch (e) {
  console.warn('crypto-js 加载失败，使用 polyfill (wept 环境)', e.message);
  CryptoJS = require('./crypto-polyfill.js');
}

/**
 * API签名工具类
 */
class SignatureUtil {
  /**
   * 生成API签名
   * 
   * @param {String} method - HTTP方法（GET/POST）
   * @param {String} url - 完整URL或路径
   * @param {Object} data - 请求参数（GET的query或POST的body）
   * @returns {Object} {timestamp, signature}
   * 
   * @example
   * const {timestamp, signature} = SignatureUtil.generateSignature(
   *   'GET',
   *   '/api/wechat/user/info',
   *   {id: 123, type: 'detail'}
   * );
   */
  static generateSignature(method, url, data = {}) {
    try {
      // 1. 生成时间戳（13位毫秒）
      const timestamp = Date.now().toString();
      
      // 2. 获取openid
      const openid = wx.getStorageSync('openid') || '';
      
      // 3. 提取路径（去除域名和query）
      let path = this._extractPath(url);
      
      // 4. 处理参数
      let queryString = '';
      let bodyString = '';
      
      if (method.toUpperCase() === 'GET' || method.toUpperCase() === 'DELETE') {
        // GET/DELETE请求：参数在URL中
        queryString = this._buildQueryString(data, url);
      } else {
        // POST/PUT/PATCH请求：参数在body中
        bodyString = data ? JSON.stringify(data) : '';
      }
      
      // 5. 拼接签名字符串
      const signStr = `${timestamp}${openid}${path}${queryString}${bodyString}`;
      
      // 6. 计算HMAC-SHA256签名
      const signature = CryptoJS.HmacSHA256(signStr, this.SECRET_KEY).toString();
      
      // 调试日志（仅在显式开启调试模式时打印）
      // 如需开启调试，在 app.js 中设置：globalData.enableSignatureDebug = true
      try {
        const app = getApp();
        const enableDebug = app && app.globalData && app.globalData.enableSignatureDebug;
        if (enableDebug) {
          console.log('🔐 签名生成:');
          console.log('  timestamp:', timestamp);
          console.log('  openid:', openid);
          console.log('  path:', path);
          console.log('  queryString:', queryString);
          console.log('  bodyString:', bodyString.substring(0, 100));
          console.log('  signStr:', signStr.substring(0, 100) + '...');
          console.log('  signature:', signature);
        }
      } catch (e) {
        // 静默失败（getApp 可能在某些时机不可用）
      }
      
      return {
        timestamp,
        signature
      };
    } catch (error) {
      console.error('签名生成失败:', error);
      // 如果签名生成失败，返回空签名（后端会拒绝）
      return {
        timestamp: Date.now().toString(),
        signature: ''
      };
    }
  }
  
  /**
   * 提取URL路径
   * @private
   */
  static _extractPath(url) {
    let path = url;
    
    if (url.includes('://')) {
      // 完整URL: https://example.com/api/wechat/user/info?id=123
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname;  // /api/wechat/user/info
      } catch (e) {
        // 如果URL解析失败，尝试提取路径
        const match = url.match(/https?:\/\/[^\/]+(\/[^\?]*)/);
        path = match ? match[1] : url;
      }
    } else if (url.includes('?')) {
      // 相对路径带query: /api/wechat/user/info?id=123
      path = url.split('?')[0];
    }
    
    // 解码路径（与后端 Flask 保持一致）
    // Flask 会自动解码 URL 路径，所以前端签名时也需要解码
    try {
      path = decodeURIComponent(path);
    } catch (e) {
      // 如果解码失败，保持原样
    }
    
    return path;
  }
  
  /**
   * 构建查询字符串（参数按key排序）
   * @private
   */
  static _buildQueryString(data, url) {
    let queryString = '';
    
    if (data && Object.keys(data).length > 0) {
      // 参数对象存在，按key排序拼接
      const keys = Object.keys(data).sort();
      queryString = keys.map(key => `${key}=${data[key]}`).join('&');
    } else if (url && url.includes('?')) {
      // URL中已经有query参数，直接提取
      const queryPart = url.split('?')[1];
      // 对query参数排序
      const params = queryPart.split('&');
      const sortedParams = params.map(p => {
        const [key, val] = p.split('=');
        return {key, val};
      }).sort((a, b) => a.key.localeCompare(b.key));
      queryString = sortedParams.map(p => `${p.key}=${p.val}`).join('&');
    }
    
    return queryString;
  }
  
  /**
   * 为wx.request添加签名
   * 
   * @param {Object} options - wx.request的参数对象
   * @returns {Object} 添加了签名的参数对象
   * 
   * @example
   * let options = {
   *   url: '/api/wechat/user/info',
   *   method: 'GET',
   *   data: {id: 123}
   * };
   * options = SignatureUtil.signRequest(options);
   * wx.request(options);
   */
  static signRequest(options) {
    const method = options.method || 'GET';
    const url = options.url;
    const data = options.data || {};
    
    // 生成签名
    const {timestamp, signature} = this.generateSignature(method, url, data);
    
    // 添加签名到请求头
    if (!options.header) {
      options.header = {};
    }
    
    options.header['X-Timestamp'] = timestamp;
    options.header['X-Signature'] = signature;
    
    return options;
  }
  
  /**
   * 检查是否为测试模式
   * 测试模式下会跳过签名验证
   */
  static isTestMode() {
    const openid = wx.getStorageSync('openid') || '';
    return openid.startsWith('test_');
  }
}

// API签名密钥（必须与后端config.py中的API_SIGNATURE_SECRET保持一致）
// 小程序端不再内置真实密钥，默认使用占位值；如需启用签名，请在构建时注入
SignatureUtil.SECRET_KEY = 'change-me-in-production';

module.exports = SignatureUtil;

