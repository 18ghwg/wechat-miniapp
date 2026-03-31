/**
 * 小程序性能管理器
 * 统一管理内存、性能监控、资源清理
 */

// 引入测试模式管理器
const { testModeManager } = require('./testMode.js');

class PerformanceManager {
  constructor() {
    this.memoryStats = {
      pageInstanceCount: 0,
      totalRenderTime: 0,
      averageRenderTime: 0,
      memoryWarningCount: 0,
      lastMemoryWarning: 0
    };
    
    this.resourcePool = {
      canvasContexts: new Map(),
      imageInstances: new Map(),
      timers: new Set(),
      intervals: new Set()
    };
    
    this.performanceMetrics = {
      pageLoadTimes: [],
      apiCallTimes: [],
      renderTimes: [],
      memoryUsage: [],
      errorCount: 0
    };
    
    // 监听系统内存警告
    this.setupMemoryWarningListener();
  }

  /**
   * 设置内存警告监听
   */
  setupMemoryWarningListener() {
    try {
      // 检查 API 是否存在（wept 环境不支持）
      if (typeof wx.onMemoryWarning !== 'function') {
        console.warn('当前环境不支持 wx.onMemoryWarning (wept 环境)');
        return;
      }
      
      wx.onMemoryWarning((res) => {
        this.memoryStats.memoryWarningCount++;
        this.memoryStats.lastMemoryWarning = Date.now();
        
        console.warn('内存警告触发，警告级别:', res.level);
        
        // 根据警告级别执行清理
        switch (res.level) {
          case 10: // 严重警告
          case 15: // 超严重警告
            this.performEmergencyCleanup();
            break;
          case 5:  // 轻微警告
          default:
            this.performNormalCleanup();
            break;
        }
      });
    } catch (error) {
      console.error('设置内存警告监听失败:', error);
    }
  }

  /**
   * 页面性能监控
   */
  trackPagePerformance(pagePath, loadTime) {
    this.performanceMetrics.pageLoadTimes.push({
      page: pagePath,
      loadTime: loadTime,
      timestamp: Date.now()
    });
    
    // 保持最近50条记录
    if (this.performanceMetrics.pageLoadTimes.length > 50) {
      this.performanceMetrics.pageLoadTimes.shift();
    }
    
    console.log(`页面性能: ${pagePath} 加载耗时 ${loadTime}ms`);
    
    // 打印用户状态信息
    this.printUserStatus(pagePath);
  }
  
  /**
   * 打印当前用户状态信息（包含路由信息）
   */
  printUserStatus(pagePath) {
    try {
      // 获取用户信息和登录状态
      const userInfo = wx.getStorageSync('userInfo');
      const openid = wx.getStorageSync('openid');
      const userLevel = this.getUserLevel(userInfo, openid);
      
      // 获取测试模式状态
      const testModeStatus = testModeManager.getTestModeStatus();
      const testModeInfo = this.formatTestModeInfo(testModeStatus);
      
      // 获取运行环境
      const isDevEnv = wx.getDeviceInfo().platform === 'devtools';
      const envInfo = isDevEnv ? '🔧 开发环境' : '📱 生产环境';
      
      // 获取页面信息
      const pageInfo = this.getPageInfo(pagePath);
      
      console.log(`🚀 页面路由: ${pagePath} | ${pageInfo} | 用户: ${userLevel} | ${testModeInfo} | ${envInfo}`);
    } catch (error) {
      console.warn('❌ 获取用户状态失败:', error);
      // 降级处理：至少打印基本信息
      try {
        const userInfo = wx.getStorageSync('userInfo');
        const openid = wx.getStorageSync('openid');
        const userLevel = this.getUserLevel(userInfo, openid);
        const pageInfo = this.getPageInfo(pagePath);
        const isDevEnv = wx.getDeviceInfo().platform === 'devtools';
        const envInfo = isDevEnv ? '🔧 开发环境' : '📱 生产环境';
        console.log(`🚀 页面路由: ${pagePath} | ${pageInfo} | 用户: ${userLevel} | 测试模式: ⚠️ 检测失败 | ${envInfo}`);
      } catch (fallbackError) {
        const isDevEnv = wx.getDeviceInfo().platform === 'devtools';
        const envInfo = isDevEnv ? '🔧 开发环境' : '📱 生产环境';
        console.log(`🚀 页面路由: ${pagePath} | 页面信息: ❓ | 用户: ❓ 未知 | 测试模式: ❓ 未知 | ${envInfo}`);
      }
    }
  }
  
  /**
   * 获取页面信息描述
   */
  getPageInfo(pagePath) {
    // 解析页面路径，获取页面类型信息
    const pageMap = {
      'pages/home/home': '🏠 首页',
      'pages/electric/index': '⚡ 电费查询',
      'pages/electric/history/index': '📊 电费历史',
      'pages/electric/account-manage/index': '🔧 账号管理',
      'pages/attendance/index': '📅 考勤管理',
      'pages/attendance/history/index': '📈 考勤历史',
      'pages/announcement/manage': '📢 公告管理',
      'pages/admin/miniprogram-users/index': '👥 用户管理',
      'pages/usercenter/index': '👤 用户中心',
      'pages/login/index': '🔑 登录页面',
      'pages/user/bind/index': '🔗 账号绑定'
    };
    
    const pageDesc = pageMap[pagePath] || '📄 其他页面';
    
    // 尝试获取更多页面信息
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route === pagePath) {
        const options = currentPage.options || {};
        const optionsStr = Object.keys(options).length > 0 
          ? ` (参数: ${JSON.stringify(options)})`
          : '';
        return `${pageDesc}${optionsStr}`;
      }
    } catch (error) {
      // 获取页面信息失败，使用基本描述
    }
    
    return pageDesc;
  }
  
  /**
   * 获取用户等级描述
   */
  getUserLevel(userInfo, openid) {
    // 检查是否已登录：需要同时有 userInfo 和 openid
    const isLoggedIn = this.checkLoginStatus(userInfo, openid);
    
    if (!isLoggedIn) {
      return '❌ 未登录';
    }
    
    // 检查管理员权限（多种可能的字段）
    if (this.isAdminUser(userInfo)) {
      return '👑 管理员';
    }
    
    return '👤 普通用户';
  }
  
  /**
   * 检查用户登录状态
   */
  checkLoginStatus(userInfo, openid) {
    // 基本检查：必须有 openid
    if (!openid) {
      return false;
    }
    
    // 如果有 userInfo，检查关键字段
    if (userInfo) {
      // 有用户基本信息就认为已登录
      return !!(userInfo.id || userInfo.nickname || userInfo.openid);
    }
    
    // 只有 openid 也可以认为是登录状态（可能是登录中）
    return true;
  }
  
  /**
   * 检查是否为管理员用户
   */
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }
    
    return !!(
      userInfo.is_admin ||
      userInfo.user_level === 'admin' ||
      userInfo.web_user_level === 'admin' ||
      (userInfo.permissions && userInfo.permissions.includes('admin'))
    );
  }
  
  /**
   * 格式化测试模式信息
   */
  formatTestModeInfo(testModeStatus) {
    // 防御性编程：处理 testModeStatus 为空或异常的情况
    if (!testModeStatus || typeof testModeStatus.isTestMode === 'undefined') {
      return '测试模式: ⚠️ 检测异常';
    }
    
    if (!testModeStatus.isTestMode) {
      return '测试模式: ❌ 关闭 (真实数据)';
    }
    
    let modeType = '';
    let emoji = '';
    
    switch (testModeStatus.source) {
      case 'global_switch':
        modeType = '全局测试模式';
        emoji = '🧪';
        break;
      case 'wechat_dev_login':
        modeType = '微信一键登录';
        emoji = '📱';
        break;
      default:
        modeType = '未知来源';
        emoji = '❓';
        break;
    }
    
    return `测试模式: ✅ 开启 (${emoji} ${modeType})`;
  }

  /**
   * API性能监控
   */
  trackAPIPerformance(url, duration, success) {
    this.performanceMetrics.apiCallTimes.push({
      url: url,
      duration: duration,
      success: success,
      timestamp: Date.now()
    });
    
    if (!success) {
      this.performanceMetrics.errorCount++;
    }
    
    // 保持最近100条记录
    if (this.performanceMetrics.apiCallTimes.length > 100) {
      this.performanceMetrics.apiCallTimes.shift();
    }
  }

  /**
   * 渲染性能监控
   */
  trackRenderPerformance(componentName, renderTime) {
    this.performanceMetrics.renderTimes.push({
      component: componentName,
      renderTime: renderTime,
      timestamp: Date.now()
    });
    
    // 更新渲染统计
    this.memoryStats.totalRenderTime += renderTime;
    const renderCount = this.performanceMetrics.renderTimes.length;
    this.memoryStats.averageRenderTime = this.memoryStats.totalRenderTime / renderCount;
    
    // 保持最近100条记录
    if (this.performanceMetrics.renderTimes.length > 100) {
      const removed = this.performanceMetrics.renderTimes.shift();
      this.memoryStats.totalRenderTime -= removed.renderTime;
    }
  }

  /**
   * Canvas上下文池管理
   */
  getCanvasContext(canvasId, componentInstance) {
    const key = `${canvasId}_${componentInstance.__wxExparserNodeId__ || Date.now()}`;
    
    if (!this.resourcePool.canvasContexts.has(key)) {
      const ctx = wx.createCanvasContext(canvasId, componentInstance);
      this.resourcePool.canvasContexts.set(key, {
        context: ctx,
        created: Date.now(),
        used: 0
      });
    }
    
    const contextInfo = this.resourcePool.canvasContexts.get(key);
    contextInfo.used++;
    
    return contextInfo.context;
  }

  /**
   * 图片实例池管理
   */
  getImageInstance(src) {
    if (!this.resourcePool.imageInstances.has(src)) {
      const img = wx.createImage();
      img.src = src;
      
      this.resourcePool.imageInstances.set(src, {
        instance: img,
        created: Date.now(),
        references: 0
      });
    }
    
    const imageInfo = this.resourcePool.imageInstances.get(src);
    imageInfo.references++;
    
    return imageInfo.instance;
  }

  /**
   * 定时器管理
   */
  createManagedTimer(callback, delay, type = 'timeout') {
    let timerId;
    
    if (type === 'timeout') {
      timerId = setTimeout(() => {
        this.resourcePool.timers.delete(timerId);
        callback();
      }, delay);
      this.resourcePool.timers.add(timerId);
    } else if (type === 'interval') {
      timerId = setInterval(callback, delay);
      this.resourcePool.intervals.add(timerId);
    }
    
    return timerId;
  }

  /**
   * 清理定时器
   */
  clearManagedTimer(timerId, type = 'timeout') {
    if (type === 'timeout') {
      clearTimeout(timerId);
      this.resourcePool.timers.delete(timerId);
    } else if (type === 'interval') {
      clearInterval(timerId);
      this.resourcePool.intervals.delete(timerId);
    }
  }

  /**
   * 正常清理
   */
  performNormalCleanup() {
    console.log('执行正常内存清理');
    
    // 清理过期Canvas上下文
    const now = Date.now();
    const contextExpireTime = 5 * 60 * 1000; // 5分钟过期
    
    for (const [key, info] of this.resourcePool.canvasContexts.entries()) {
      if (now - info.created > contextExpireTime && info.used === 0) {
        this.resourcePool.canvasContexts.delete(key);
      }
    }
    
    // 清理无引用的图片
    for (const [key, info] of this.resourcePool.imageInstances.entries()) {
      if (info.references === 0 && now - info.created > contextExpireTime) {
        this.resourcePool.imageInstances.delete(key);
      }
    }
    
    // 清理过期性能数据
    this.cleanupPerformanceMetrics();
  }

  /**
   * 紧急清理
   */
  performEmergencyCleanup() {
    console.warn('执行紧急内存清理');
    
    // 清空所有Canvas上下文
    this.resourcePool.canvasContexts.clear();
    
    // 清空图片实例
    this.resourcePool.imageInstances.clear();
    
    // 清理所有定时器
    this.resourcePool.timers.forEach(timerId => {
      clearTimeout(timerId);
    });
    this.resourcePool.timers.clear();
    
    this.resourcePool.intervals.forEach(timerId => {
      clearInterval(timerId);
    });
    this.resourcePool.intervals.clear();
    
    // 清空性能数据
    this.performanceMetrics.pageLoadTimes = [];
    this.performanceMetrics.apiCallTimes = [];
    this.performanceMetrics.renderTimes = [];
    this.performanceMetrics.memoryUsage = [];
    
    // 触发垃圾回收
    this.triggerGC();
  }

  /**
   * 清理性能指标数据
   */
  cleanupPerformanceMetrics() {
    const now = Date.now();
    const keepTime = 10 * 60 * 1000; // 保留10分钟数据
    
    // 清理过期的页面加载时间数据
    this.performanceMetrics.pageLoadTimes = this.performanceMetrics.pageLoadTimes.filter(
      item => now - item.timestamp < keepTime
    );
    
    // 清理过期的API调用数据
    this.performanceMetrics.apiCallTimes = this.performanceMetrics.apiCallTimes.filter(
      item => now - item.timestamp < keepTime
    );
    
    // 清理过期的渲染时间数据
    this.performanceMetrics.renderTimes = this.performanceMetrics.renderTimes.filter(
      item => now - item.timestamp < keepTime
    );
  }

  /**
   * 触发垃圾回收（尝试）
   */
  triggerGC() {
    try {
      // 尝试触发垃圾回收
      if (wx.triggerGC) {
        wx.triggerGC();
      }
      
      // 创建大量临时对象然后释放，帮助GC
      const tempObjects = [];
      for (let i = 0; i < 1000; i++) {
        tempObjects.push({ data: new Array(100).fill(0) });
      }
      tempObjects.length = 0;
      
      console.log('垃圾回收触发尝试完成');
    } catch (error) {
      console.error('垃圾回收触发失败:', error);
    }
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const now = Date.now();
    
    // 计算平均值
    const avgPageLoadTime = this.performanceMetrics.pageLoadTimes.reduce((sum, item) => sum + item.loadTime, 0) / 
                           Math.max(this.performanceMetrics.pageLoadTimes.length, 1);
                           
    const avgAPICallTime = this.performanceMetrics.apiCallTimes.reduce((sum, item) => sum + item.duration, 0) / 
                          Math.max(this.performanceMetrics.apiCallTimes.length, 1);
                          
    const avgRenderTime = this.performanceMetrics.renderTimes.reduce((sum, item) => sum + item.renderTime, 0) / 
                         Math.max(this.performanceMetrics.renderTimes.length, 1);

    // API成功率
    const apiSuccessRate = this.performanceMetrics.apiCallTimes.length > 0 
      ? (this.performanceMetrics.apiCallTimes.filter(item => item.success).length / this.performanceMetrics.apiCallTimes.length * 100).toFixed(2)
      : '100';

    return {
      // 性能指标
      performance: {
        avgPageLoadTime: `${avgPageLoadTime.toFixed(2)}ms`,
        avgAPICallTime: `${avgAPICallTime.toFixed(2)}ms`,
        avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
        apiSuccessRate: `${apiSuccessRate}%`,
        totalErrors: this.performanceMetrics.errorCount
      },
      
      // 内存指标
      memory: {
        memoryWarningCount: this.memoryStats.memoryWarningCount,
        lastMemoryWarning: this.memoryStats.lastMemoryWarning ? new Date(this.memoryStats.lastMemoryWarning).toLocaleString() : '无',
        resourcePoolSize: {
          canvasContexts: this.resourcePool.canvasContexts.size,
          imageInstances: this.resourcePool.imageInstances.size,
          timers: this.resourcePool.timers.size,
          intervals: this.resourcePool.intervals.size
        }
      },
      
      // 统计信息
      stats: {
        totalPageLoads: this.performanceMetrics.pageLoadTimes.length,
        totalAPICalls: this.performanceMetrics.apiCallTimes.length,
        totalRenders: this.performanceMetrics.renderTimes.length,
        reportTime: new Date(now).toLocaleString()
      }
    };
  }

  /**
   * 页面卸载时的资源清理
   */
  onPageUnload(pageInstance) {
    // 清理页面相关的Canvas上下文
    const pageId = pageInstance.__wxExparserNodeId__;
    if (pageId) {
      for (const [key, info] of this.resourcePool.canvasContexts.entries()) {
        if (key.includes(pageId)) {
          this.resourcePool.canvasContexts.delete(key);
        }
      }
    }
    
    // 减少页面实例计数
    this.memoryStats.pageInstanceCount = Math.max(0, this.memoryStats.pageInstanceCount - 1);
  }

  /**
   * 页面加载时的资源初始化
   */
  onPageLoad(pageInstance) {
    this.memoryStats.pageInstanceCount++;
    
    // 如果页面实例过多，执行清理
    if (this.memoryStats.pageInstanceCount > 10) {
      console.warn('页面实例过多，执行清理');
      this.performNormalCleanup();
    }
  }
}

// 全局性能管理器实例
const performanceManager = new PerformanceManager();

module.exports = {
  performanceManager,
  PerformanceManager
};
