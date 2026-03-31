/**
 * 小程序入口文件
 * 集成性能优化工具，启动全局监控和管理
 */

// 导入性能优化工具
const { performanceMonitor } = require('./utils/performance-monitor');
const { errorRecoveryManager } = require('./utils/error-recovery');
const { performanceManager } = require('./utils/performance-manager');
const { loadingManager } = require('./utils/loading-manager');
const { miniprogramInfo } = require('./utils/miniprogram-info');

App({
  /**
   * 小程序初始化
   */
  onLaunch: function () {
    console.log('小程序启动中...');
    
    try {
      // 获取小程序账号信息（通过微信API）
      this.initMiniprogramInfo();
      
      // 启动性能优化系统
      this.initPerformanceSystem();
      
      // 初始化全局配置
      this.initGlobalConfig();
      
      // 检查登录状态，未登录则设置为游客模式
      this.checkLoginStatus();
      
      // 标记首次启动
      this.markFirstLaunch();
      
      console.log('✅ 小程序启动完成，性能优化系统已激活');
    } catch (error) {
      console.error('小程序启动失败:', error);
    }
  },
  
  /**
   * 检查登录状态
   */
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo');
    const openid = wx.getStorageSync('openid');
    
    // 如果没有用户信息或openid，设置为游客模式
    if (!userInfo || !openid) {
      wx.setStorageSync('isGuestMode', true);
      console.log('🎭 未登录，已设置为游客模式');
    } else {
      // 已登录，确保不是游客模式
      wx.removeStorageSync('isGuestMode');
      console.log('✅ 已登录，非游客模式');
    }
  },
  
  /**
   * 标记首次启动
   */
  markFirstLaunch: function () {
    // 检查是否是首次启动（本次会话）
    const hasLaunched = wx.getStorageSync('hasLaunchedThisSession');
    if (!hasLaunched) {
      // 标记为首次启动
      wx.setStorageSync('isFirstLaunch', true);
      wx.setStorageSync('hasLaunchedThisSession', true);
      console.log('📱 首次启动小程序，已标记');
    }
  },
  
  /**
   * 初始化小程序信息
   */
  initMiniprogramInfo: function () {
    try {
      // 获取小程序账号信息
      const accountInfo = miniprogramInfo.getAccountInfo();
      const fullInfo = miniprogramInfo.getFullInfo();
      
      console.log('📱 ===== 小程序信息 =====');
      console.log(`  名称: ${fullInfo.appName}`);
      console.log(`  AppID: ${fullInfo.appId}`);
      console.log(`  版本: ${fullInfo.version}`);
      console.log(`  环境: ${fullInfo.envVersion}`);
      console.log('=========================');
      
      // 存储到全局数据
      this.globalData.miniprogramInfo = fullInfo;
      
    } catch (error) {
      console.error('初始化小程序信息失败:', error);
    }
  },

  /**
   * 小程序显示
   */
  onShow: function () {
    console.log('小程序显示');
    
    // 恢复性能监控
    if (!performanceMonitor.isMonitoring) {
      performanceMonitor.startMonitoring();
    }
  },

  /**
   * 小程序隐藏
   */
  onHide: function () {
    console.log('小程序隐藏');
    
    // 执行轻度清理，保持应用响应
    this.performLightCleanup();
  },

  /**
   * 错误处理
   */
  onError: function (msg) {
    console.error('全局错误:', msg);
    
    // 错误已由errorRecoveryManager自动处理
    // 这里可以添加额外的错误上报逻辑
  },

  /**
   * 初始化性能优化系统
   */
  initPerformanceSystem: function () {
    console.log('🚀 初始化性能优化系统...');
    
    // 1. 启动性能监控
    performanceMonitor.startMonitoring();
    console.log('✅ 性能监控已启动');
    
    // 2. 启用错误自动恢复
    errorRecoveryManager.autoRecoveryEnabled = true;
    console.log('✅ 错误自动恢复已启用');
    
    // 3. 配置性能阈值
    performanceMonitor.thresholds = {
      pageLoadTime: 3000,      // 页面加载3秒阈值
      apiResponseTime: 5000,   // API响应5秒阈值
      renderTime: 100,         // 渲染100ms阈值
      memoryWarningCount: 3,   // 内存警告3次阈值
      errorRate: 0.05         // 5%错误率阈值
    };
    console.log('✅ 性能阈值已配置');
    
    // 4. 配置Loading管理器
    loadingManager.config.maxConcurrent = 3;
    loadingManager.config.minShowTime = 500;
    console.log('✅ Loading管理器已配置');
    
    // 5. 设置定期性能报告
    this.setupPerformanceReporting();
  },

  /**
   * 初始化全局配置
   */
  initGlobalConfig: function () {
    // 检测是否为开发环境（微信开发者工具）
    const isDevEnv = wx.getDeviceInfo().platform === 'devtools';
    
    // 全局数据
    this.globalData = {
      userInfo: null,
      openid: null,
      loginMode: null,
      
      // 调试日志开关（开发环境自动开启，生产环境关闭）
      enableApiDebug: isDevEnv,       // API请求/响应/环境检测日志
      enableSignatureDebug: isDevEnv, // 签名生成详细日志
      
      // 性能优化配置
      performanceConfig: {
        enableMonitoring: true,
        enableAutoRecovery: true,
        enableCaching: true,
        enableOptimization: true
      },
      
      // 应用状态
      appState: {
        launchTime: Date.now(),
        backgroundTime: 0,
        foregroundTime: 0,
        sessionCount: 1
      }
    };
    
    // 输出环境和调试状态信息
    console.log('🔧 小程序环境配置:');
    console.log(`  📱 运行环境: ${isDevEnv ? '开发环境 (devtools)' : '生产环境'}`);
    console.log(`  🔍 API调试日志: ${isDevEnv ? '✅ 已开启' : '❌ 已关闭'}`);
    console.log(`  🔐 签名调试日志: ${isDevEnv ? '✅ 已开启' : '❌ 已关闭'}`);
    
    console.log('✅ 全局配置已初始化');
  },

  /**
   * 设置性能报告
   */
  setupPerformanceReporting: function () {
    // 每5分钟生成一次性能报告
    setInterval(() => {
      try {
        const report = performanceMonitor.generatePerformanceReport();
        
        // 检查性能健康状况
        if (report.healthScore < 70) {
          console.warn(`⚠️ 性能健康评分较低: ${report.healthScore}分`);
          this.performMaintenanceCleanup();
        } else if (report.healthScore >= 90) {
          console.log(`✅ 性能健康状况良好: ${report.healthScore}分`);
        }
        
        // 详细性能日志（仅在开发环境）
        if (this.isDevelopment()) {
          console.log('📊 性能监控报告:', report);
        }
        
      } catch (error) {
        console.error('性能报告生成失败:', error);
      }
    }, 5 * 60 * 1000);
    
    console.log('✅ 定期性能报告已设置 (5分钟间隔)');
  },

  /**
   * 执行轻度清理
   */
  performLightCleanup: function () {
    try {
      console.log('🧹 执行轻度清理...');
      
      // 隐藏所有loading
      loadingManager.hideAllLoadings();
      
      // 执行普通清理
      performanceManager.performNormalCleanup();
      
      // 清理过期警报
      const alerts = performanceMonitor.alerts || [];
      const now = Date.now();
      performanceMonitor.alerts = alerts.filter(alert => 
        now - alert.timestamp < 10 * 60 * 1000 // 保留10分钟内的警报
      );
      
      console.log('✅ 轻度清理完成');
    } catch (error) {
      console.error('轻度清理失败:', error);
    }
  },

  /**
   * 执行维护性清理
   */
  performMaintenanceCleanup: function () {
    try {
      console.log('🔧 执行维护性清理...');
      
      // 强制清理所有资源
      performanceManager.performEmergencyCleanup();
      
      // 重置错误统计
      errorRecoveryManager.errorStats.criticalErrors = 0;
      
      // 清理性能监控历史
      performanceMonitor.alerts = [];
      
      // 重新初始化关键组件
      setTimeout(() => {
        if (!performanceMonitor.isMonitoring) {
          performanceMonitor.startMonitoring();
        }
      }, 1000);
      
      console.log('✅ 维护性清理完成');
    } catch (error) {
      console.error('维护性清理失败:', error);
    }
  },

  /**
   * 获取性能统计报告
   */
  getPerformanceStats: function () {
    try {
      const report = performanceMonitor.generatePerformanceReport();
      const errorReport = errorRecoveryManager.getErrorReport();
      const loadingStatus = loadingManager.getLoadingStatus();
      
      return {
        performance: report,
        errors: errorReport,
        loading: loadingStatus,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('获取性能统计失败:', error);
      return null;
    }
  },

  /**
   * 检查是否为开发环境
   */
  isDevelopment: function () {
    // 简单的开发环境检测
    try {
      return wx.getAppBaseInfo().host.env === 'devtools';
    } catch (error) {
      return false;
    }
  },

  /**
   * 优雅关闭应用
   */
  shutdown: function () {
    console.log('🛑 应用正在关闭...');
    
    try {
      // 停止性能监控
      performanceMonitor.stopMonitoring();
      
      // 隐藏所有loading
      loadingManager.hideAllLoadings(true);
      
      // 清理所有资源
      performanceManager.performEmergencyCleanup();
      
      console.log('✅ 应用关闭清理完成');
    } catch (error) {
      console.error('应用关闭清理失败:', error);
    }
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    openid: null,
    loginMode: null,
    
    // 调试日志开关（会在 initGlobalConfig 中根据环境自动设置）
    // 开发环境：自动开启
    // 生产环境：自动关闭
    enableApiDebug: false,       // API请求/响应/环境检测日志
    enableSignatureDebug: false  // 签名生成详细日志
  }
});