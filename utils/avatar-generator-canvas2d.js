/**
 * 头像生成器 - Canvas 2D 版本
 * 这是迁移后的新版本，使用 Canvas 2D API
 */

class AvatarGenerator {
  constructor() {
    this.cacheKey = 'avatar_cache';
    this.cache = new Map();
    
    // 默认颜色集合（保持与旧版一致）
    this.defaultColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B500', '#6C5CE7', '#00B894', '#FD79A8'
    ];
  }

  /**
   * 生成颜色索引
   * @param {Object} userInfo - 用户信息
   * @param {String} text - 显示文本
   * @returns {Number} 颜色索引
   */
  generateColorIndex(userInfo, text) {
    let hash = 0;
    const str = (userInfo.id || userInfo.openid || text || '').toString();
    
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    
    return Math.abs(hash);
  }

  /**
   * 绘制文字头像 - Canvas 2D 版本
   * @param {String} canvasSelector - Canvas选择器（如 '#avatarCanvas'）
   * @param {Object} componentInstance - 组件实例（Page或Component的this）
   * @param {String} text - 显示文字
   * @param {String} bgColor - 背景颜色
   * @param {Number} size - 画布大小
   * @param {Function} callback - 回调函数
   */
  drawTextAvatar(canvasSelector, componentInstance, text, bgColor, size = 120, callback) {
    try {
      console.log('AvatarGenerator Canvas2D - 开始绘制:', {
        selector: canvasSelector,
        text: text,
        bgColor: bgColor,
        size: size
      });
      
      // 使用 Canvas 2D API
      const query = wx.createSelectorQuery().in(componentInstance);
      query.select(canvasSelector)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) {
            console.error('AvatarGenerator Canvas2D - 无法找到Canvas元素:', canvasSelector);
            if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
            return;
          }
          
          try {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            
            // 设置canvas实际尺寸（考虑设备像素比）
            const dpr = wx.getWindowInfo().pixelRatio || 1;
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.scale(dpr, dpr);
            
            console.log('AvatarGenerator Canvas2D - 上下文创建完成, DPR:', dpr);
            
            // 清空画布
            ctx.clearRect(0, 0, size, size);
            
            // 绘制圆形背景
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = bgColor;
            ctx.fill();
            
            // 设置文字样式
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${size * 0.4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 绘制文字
            ctx.fillText(text, size / 2, size / 2);
            
            console.log('AvatarGenerator Canvas2D - 绘制完成，准备导出图片');
            
            // Canvas 2D 不需要 draw()，直接导出
            setTimeout(() => {
              wx.canvasToTempFilePath({
                canvas: canvas,  // 使用 canvas 对象
                destWidth: size,
                destHeight: size,
                quality: 0.8,
                success: (res) => {
                  console.log('AvatarGenerator Canvas2D - 导出成功:', res.tempFilePath);
                  if (callback) callback(res);
                },
                fail: (err) => {
                  console.error('AvatarGenerator Canvas2D - 导出失败:', err);
                  if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
                }
              });
            }, 100); // 延迟确保绘制完成
            
          } catch (error) {
            console.error('AvatarGenerator Canvas2D - 绘制异常:', error);
            if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
          }
        });
      
    } catch (error) {
      console.error('AvatarGenerator Canvas2D - 初始化失败:', error);
      if (callback) callback({ tempFilePath: '/static/default-avatar.svg' });
    }
  }

  /**
   * 缓存头像
   * @param {String} key - 缓存键
   * @param {String} avatarUrl - 头像URL
   */
  cacheAvatar(key, avatarUrl) {
    this.cache.set(key, avatarUrl);
    
    // 持久化到本地存储
    try {
      const cacheData = {};
      this.cache.forEach((value, key) => {
        cacheData[key] = value;
      });
      wx.setStorageSync(this.cacheKey, cacheData);
    } catch (error) {
      console.error('AvatarGenerator - 缓存保存失败:', error);
    }
  }

  /**
   * 获取缓存的头像
   * @param {String} key - 缓存键
   * @returns {String|null} 头像URL或null
   */
  getCachedAvatar(key) {
    // 先从内存缓存获取
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // 从本地存储加载
    try {
      const cacheData = wx.getStorageSync(this.cacheKey);
      if (cacheData && cacheData[key]) {
        this.cache.set(key, cacheData[key]);
        return cacheData[key];
      }
    } catch (error) {
      console.error('AvatarGenerator - 缓存读取失败:', error);
    }
    
    return null;
  }

  /**
   * 清除头像缓存
   * @param {String} key - 可选，清除指定缓存；不传则清除全部
   */
  clearCache(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    
    try {
      if (key) {
        const cacheData = wx.getStorageSync(this.cacheKey) || {};
        delete cacheData[key];
        wx.setStorageSync(this.cacheKey, cacheData);
      } else {
        wx.removeStorageSync(this.cacheKey);
      }
    } catch (error) {
      console.error('AvatarGenerator - 缓存清除失败:', error);
    }
  }
}

// 创建全局单例
const avatarGenerator = new AvatarGenerator();

module.exports = avatarGenerator;
