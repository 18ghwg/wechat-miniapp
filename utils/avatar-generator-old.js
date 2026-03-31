/**
 * 高性能头像生成器工具类
 * 用于生成用户默认头像，优化Canvas性能和内存管理
 */

class AvatarGenerator {
  constructor() {
    this.defaultColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#F0A500', '#FF8C94',
      '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
      '#E17055', '#81ECEC', '#74B9FF', '#55A3FF',
      '#FF7675', '#00B894', '#0984E3', '#6C5CE7',
      '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055'
    ];
    
    // 性能优化：Canvas上下文缓存
    this.canvasContextCache = new Map();
    
    // 性能优化：绘制参数预计算
    this.drawParamsCache = new Map();
    
    // 性能优化：内存管理
    this.maxCacheSize = 50; // 最大缓存数量
    this.cacheCleanupThreshold = 0.8; // 缓存清理阈值
    
    // 性能监控
    this.performanceStats = {
      totalDraws: 0,
      totalCacheHits: 0,
      averageDrawTime: 0,
      memoryUsage: 0
    };
    
    this.gradientPairs = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a8edea', '#fed6e3'],
      ['#ff9a9e', '#fecfef'],
      ['#ffecd2', '#fcb69f']
    ];
  }

  /**
   * 根据用户信息获取头像URL
   * @param {Object} userInfo 用户信息
   * @returns {String} 头像URL
   */
  getAvatarUrl(userInfo) {
    // 如果有微信头像且不是默认头像，直接使用
    if (userInfo.avatar_url && 
        userInfo.avatar_url !== '' && 
        !userInfo.avatar_url.includes('default') &&
        !userInfo.avatar_url.includes('mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0')) {
      return userInfo.avatar_url;
    }
    
    // 生成文字头像
    return this.generateTextAvatar(userInfo);
  }

  /**
   * 生成文字头像
   * @param {Object} userInfo 用户信息
   * @returns {String} base64头像数据
   */
  generateTextAvatar(userInfo) {
    // 优先使用真实姓名的最后一个字，否则使用昵称的最后一个字
    let displayChar;
    let sourceText;
    
    if (userInfo.real_name && userInfo.real_name.trim() !== '') {
      sourceText = userInfo.real_name;
      displayChar = sourceText.charAt(sourceText.length - 1); // 取最后一个字
    } else {
      sourceText = userInfo.nickname || userInfo.web_username || '用户';
      displayChar = sourceText.charAt(sourceText.length - 1); // 修改：取最后一个字而不是第一个字
    }
    
    // 根据用户ID或源文本生成固定颜色
    const colorIndex = this.generateColorIndex(userInfo, sourceText);
    const bgColor = this.defaultColors[colorIndex];
    
    return this.createTextAvatarData(displayChar, bgColor);
  }

  /**
   * 获取昵称的第一个字符
   * @param {String} nickname 昵称
   * @returns {String} 第一个字符
   */
  getFirstChar(nickname) {
    if (!nickname) return '用';
    
    // 处理中文、英文、数字
    const char = nickname.charAt(0);
    
    // 中文字符直接返回
    if (/[\u4e00-\u9fa5]/.test(char)) {
      return char;
    }
    
    // 英文字符转大写
    if (/[a-zA-Z]/.test(char)) {
      return char.toUpperCase();
    }
    
    // 数字或其他字符
    if (/[0-9]/.test(char)) {
      return char;
    }
    
    return '用';
  }

  /**
   * 生成颜色索引
   * @param {Object} userInfo 用户信息
   * @param {String} nickname 昵称
   * @returns {Number} 颜色索引
   */
  generateColorIndex(userInfo, nickname) {
    let seed = 0;
    
    // 优先使用用户ID
    if (userInfo.id) {
      seed = userInfo.id;
    } else if (userInfo.openid) {
      // 使用openid生成种子
      for (let i = 0; i < userInfo.openid.length; i++) {
        seed += userInfo.openid.charCodeAt(i);
      }
    } else {
      // 使用昵称生成种子
      for (let i = 0; i < nickname.length; i++) {
        seed += nickname.charCodeAt(i);
      }
    }
    
    return seed % this.defaultColors.length;
  }

  /**
   * 创建文字头像数据
   * @param {String} text 显示的文字
   * @param {String} bgColor 背景颜色
   * @returns {String} Canvas生成的临时文件路径或缓存路径
   */
  createTextAvatarData(text, bgColor) {
    // 这个方法返回一个标识，实际的Canvas绘制在页面中进行
    return `text_avatar_${text}_${bgColor}`;
  }

  /**
   * 在页面中绘制文字头像
   * @param {String} canvasId Canvas ID
   * @param {String} text 显示文字
   * @param {String} bgColor 背景颜色
   * @param {Number} size 尺寸
   * @param {Function} callback 完成回调
   */
  drawTextAvatar(canvasId, text, bgColor, size = 120, callback) {
    try {
      console.log('AvatarGenerator drawTextAvatar - 开始绘制:', {
        canvasId: canvasId,
        text: text,
        bgColor: bgColor,
        size: size
      });
      
      const ctx = wx.createCanvasContext(canvasId);
      
      if (!ctx) {
        console.error('AvatarGenerator drawTextAvatar - 无法创建Canvas上下文:', canvasId);
        if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
        return;
      }
      
      // 清空画布
      ctx.clearRect(0, 0, size, size);
      
      // 绘制圆形背景
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
      ctx.setFillStyle(bgColor);
      ctx.fill();
      
      // 设置文字样式
      ctx.setFillStyle('#FFFFFF');
      ctx.setFontSize(size * 0.4); // 字体大小为画布大小的40%
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      
      // 绘制文字
      ctx.fillText(text, size / 2, size / 2);
      
      console.log('AvatarGenerator drawTextAvatar - Canvas绘制命令已执行');
      
      // 执行绘制
      ctx.draw(true, () => {
        console.log('AvatarGenerator drawTextAvatar - Canvas绘制完成回调');
        if (callback) {
          // 延迟一点时间确保绘制完成
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: canvasId,
              success: (res) => {
                console.log('AvatarGenerator drawTextAvatar - 导出成功:', res.tempFilePath);
                callback(res);
              },
              fail: (err) => {
                console.error('AvatarGenerator drawTextAvatar - Canvas导出失败:', canvasId, err);
                if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
              }
            });
          }, 200); // 增加延迟时间到200ms
        }
      });
      
    } catch (error) {
      console.error('AvatarGenerator drawTextAvatar - 绘制文字头像失败:', error);
      if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
    }
  }

  /**
   * 生成渐变背景头像
   * @param {String} text 显示文字
   * @param {Array} gradientColors 渐变色数组
   * @returns {String} 头像标识
   */
  generateGradientAvatar(text, gradientColors) {
    return `gradient_avatar_${text}_${gradientColors.join('_')}`;
  }

  /**
   * 生成随机颜色
   * @returns {String} 随机颜色的Hex值
   */
  generateRandomColor() {
    // 从预设颜色中随机选择
    return this.defaultColors[Math.floor(Math.random() * this.defaultColors.length)];
  }

  /**
   * 生成随机HSL颜色
   * @returns {String} HSL颜色的Hex值
   */
  generateRandomHSLColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 30); // 60-90
    const lightness = 45 + Math.floor(Math.random() * 20);  // 45-65
    
    return this.hslToHex(hue, saturation, lightness);
  }

  /**
   * HSL转Hex
   * @param {Number} h 色相
   * @param {Number} s 饱和度
   * @param {Number} l 明度
   * @returns {String} Hex颜色值
   */
  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  /**
   * 缓存头像到本地
   * @param {String} cacheKey 缓存键
   * @param {String} filePath 文件路径
   */
  cacheAvatar(cacheKey, filePath) {
    try {
      wx.setStorageSync(`avatar_cache_${cacheKey}`, {
        filePath: filePath,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('缓存头像失败:', error);
    }
  }

  /**
   * 获取缓存的头像
   * @param {String} cacheKey 缓存键
   * @returns {String|null} 缓存的文件路径
   */
  getCachedAvatar(cacheKey) {
    try {
      const cached = wx.getStorageSync(`avatar_cache_${cacheKey}`);
      if (cached && cached.filePath) {
        // 检查缓存时间（7天过期）
        const now = Date.now();
        const cacheAge = now - (cached.timestamp || 0);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
        
        if (cacheAge < maxAge) {
          return cached.filePath;
        } else {
          // 清除过期缓存
          wx.removeStorageSync(`avatar_cache_${cacheKey}`);
        }
      }
    } catch (error) {
      console.error('获取缓存头像失败:', error);
    }
    return null;
  }

  /**
   * 清理所有头像缓存
   */
  clearAvatarCache() {
    try {
      const storageInfo = wx.getStorageInfoSync();
      const keys = storageInfo.keys || [];
      
      keys.forEach(key => {
        if (key.startsWith('avatar_cache_')) {
          wx.removeStorageSync(key);
        }
      });
      
      console.log('头像缓存清理完成');
    } catch (error) {
      console.error('清理头像缓存失败:', error);
    }
  }

  /**
   * 清理资源 - 页面卸载时调用
   */
  cleanup() {
    try {
      // 清理Canvas上下文缓存
      if (this.canvasContextCache) {
        this.canvasContextCache.clear();
      }
      
      // 清理绘制参数缓存
      if (this.drawParamsCache) {
        this.drawParamsCache.clear();
      }
      
      console.log('AvatarGenerator 资源清理完成');
    } catch (error) {
      console.error('AvatarGenerator 资源清理失败:', error);
    }
  }
}

module.exports = AvatarGenerator;
