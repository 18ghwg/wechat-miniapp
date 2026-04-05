const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const avatarGenerator = require('../../utils/avatar-generator');  // 导入的是实例，不是类
const { testModeManager } = require('../../utils/testMode');
const mockData = require('../../utils/mock-data');
const featureUsage = require('../../utils/feature-usage');
const { userInfoCache } = require('../../utils/user-info-cache');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { isDevtools } = require('../../utils/system-info');

const getDefaultData = () => ({
  pageAnimationClass: '',
  cardAnimationClass: '',
  userInfo: {
    avatar_url: '',
    nickname: '正在加载...',
    is_web_bound: false,
    register_time: '',
    last_login: '',
    permissions: []
  },
  systemConfig: {
    version: '1.0.0',
    functions: []
  },
  showSystemInfo: false,
  versionNo: '',
  permissionTags: [],  // 用户权限标签
  isAdmin: false,      // 是否为管理员
  avatarGenerator: null,   // 头像生成器
  generatedAvatarUrl: '', // 生成的头像URL
  // 账号注销相关
  showDeleteDialog: false, // 是否显示注销确认弹窗
  countdown: 0,           // 倒计时秒数
  countdownTimer: null,   // 倒计时定时器
  
  // 全局测试模式相关
  globalTestMode: false,  // 全局测试模式开关状态
  showTestModeDialog: false, // 是否显示测试模式说明弹窗
  
  // 常用功能
  frequentFeatures: [], // 用户常用功能列表
  featureStatsInfo: '', // 功能统计说明
  
  // �游客模式相关
  isGuest: false, // 是否为游客模式
  showGuestBanner: false, // 是否显示游客模式横幅
  
  // �测试账号相关
  isTestAccount: false, // 是否为测试账号（用于隐藏全局测试模式开关）
  
  // �管理员菜单项
  adminMenuItems: [
    { iconFile: 'users', label: '小程序账号管理', bgColor: '#E3F2FD', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/miniprogram-users/index' },
    { iconFile: 'megaphone', label: '公告管理', bgColor: '#FCE4EC', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/announcement/manage' },
    { iconFile: 'bell', label: '通知群管理', bgColor: '#FFD93D', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/notification-group/index' },
    { iconFile: 'zap', label: '电费通知设置', bgColor: '#FFEBCC', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/df-notification-settings/index' },
    { iconFile: 'cloud-sun', label: '天气设置', bgColor: '#B9FBC0', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/weather-settings/index' },
    { iconFile: 'clock', label: '定时任务管理', bgColor: '#E0BBE4', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/task-management/list/index' },
    { iconFile: 'bar-chart', label: '使用记录管理', bgColor: '#98F5E1', borderColor: 'rgba(94, 78, 62, 0.3)', path: '/pages/admin/usage-records/index' }
  ],
  
  // �账号管理菜单项
  accountMenuItems: [
    { iconFile: 'link', label: 'Web账号管理', bgColor: '#E3F2FD', borderColor: 'rgba(94, 78, 62, 0.3)', action: 'bindWeb' },
    { iconFile: 'person', label: '个人信息', bgColor: '#B9FBC0', borderColor: 'rgba(94, 78, 62, 0.3)', action: 'updateInfo' },
    { iconFile: 'log-out', label: '退出登录', bgColor: '#FFF8F0', borderColor: '#FF8C00', action: 'logout', danger: false },
    { iconFile: 'warning', label: '账号注销', bgColor: '#FEE', borderColor: '#F44', action: 'deleteAccount', danger: true }
  ]
});

Page({
  data: getDefaultData(),

  onLoad() {
    console.log('usercenter 页面加载');
    
    // �检查游客模式
    const isGuest = mockData.isGuestMode();
    
    // �检查是否为测试账号
    const openid = wx.getStorageSync('openid');
    const isTestAccount = openid && openid.includes('test');
    
    this.setData({ 
      isGuest: isGuest,
      showGuestBanner: isGuest,
      isTestAccount: isTestAccount
    });
    
    this.getVersionInfo();
    
    // 初始化头像生成器（使用全局单例）
    this.setData({
      avatarGenerator: avatarGenerator
    });
    console.log('usercenter 头像生成器初始化完成');
    
    // 显示分享菜单（包含朋友圈分享）
    wx.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        console.log('�用户中心：分享菜单显示成功');
      },
      fail: (err) => {
        console.warn('⚠�用户中心：分享菜单显示失败，但不影响分享功能');
      }
    });

    // 异步初始化全局测试模式状态
    this.loadGlobalTestModeStatus();
  },

  onShow() {
    // 触发页面进入动画
    const { triggerPageAnimation } = require('../../utils/page-animation');
    triggerPageAnimation();

    this.getTabBar().init();
    this.init();
  },
  
  /**
   * 分享给好友
   */
  onShareAppMessage(res) {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `个人中心 - ${appName}`,
      path: '/pages/usercenter/index',
      imageUrl: ''
    };
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `个人中心 - ${appName}`,
      query: '',
      imageUrl: ''
    };
  },

  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetchUserInfo();
    this.fetchSystemConfig();
    this.loadFrequentFeatures();
  },
  
  /**
   * 加载用户常用功能
   * 配置说明：
   * - limit: 最多显示6个功能
   * - minUsageCount: 至少使用3次才显示
   * - days: 统计最近30天的活跃功能
   */
  loadFrequentFeatures() {
    // �游客模式不加载常用功能
    if (mockData.isGuestMode()) {
      console.log('�用户中心-游客模式：不加载常用功能');
      this.setData({
        frequentFeatures: [],
        featureStatsInfo: ''
      });
      return;
    }
    
    const limit = 6;
    const minUsageCount = 3;  // 至少使用3次才显示
    const days = 30;  // 统计最近30天
    
    // feature_key �PNG 文件名映射（替代后端返回的 emoji）
    const featureIconMap = {
      'electric': 'zap',
      'attendance': 'clipboard',
      'home': 'home',
      'weather': 'cloud-sun',
      'notification-group': 'bell',
      'df-notification': 'zap',
      'weather-settings': 'cloud-sun',
      'user-management': 'users',
      'announcement': 'megaphone',
      'task-management': 'clock',
      'bar-chart': 'bar-chart',
    };

    featureUsage.getFrequentFeatures(limit, minUsageCount, days)
      .then(features => {
        console.log(`[UserCenter] 加载常用功能: ${features.length}�(阈值: ${minUsageCount}次, 范围: ${days}天)`);
        // 注�iconFile 字段
        const featuresWithIcon = features.map(f => Object.assign({}, f, {
          iconFile: featureIconMap[f.feature_key] || 'home'
        }));
        this.setData({
          frequentFeatures: featuresWithIcon,
          featureStatsInfo: `最近${days}天内使用超过${minUsageCount}次的功能`
        });
      })
      .catch(err => {
        console.error('[UserCenter] 加载常用功能失败:', err);
        // 失败时显示空数组，会显示默认功能
        this.setData({
          frequentFeatures: [],
          featureStatsInfo: ''
        });
      });
  },
  
  /**
   * 根据功能key导航到对应页面
   * 区�TabBar 页面和普通页面，使用不同的跳转方式
   */
  navigateToFeature(e) {
    const { featureKey, featureName } = e.currentTarget.dataset;
    
    // 功能key到页面路径的映射
    const featureRoutes = {
      'electric': '/pages/electric/index',
      'attendance': '/pages/attendance/index',
      'home': '/pages/home/home',
      'weather': '/pages/admin/weather-settings/index',
      'notification-group': '/pages/admin/notification-group/index',
      'df-notification': '/pages/admin/df-notification-settings/index',
      'weather-settings': '/pages/admin/weather-settings/index',
      'user-management': '/pages/admin/miniprogram-users/index',
      'announcement': '/pages/announcement/manage',
      'task-management': '/pages/admin/task-management/list/index'
    };
    
    // TabBar 页面列表（需要使�switchTab 跳转）
    const tabBarPages = [
      '/pages/home/home',
      '/pages/electric/index',
      '/pages/attendance/index',
      '/pages/usercenter/index'
    ];
    
    const route = featureRoutes[featureKey];
    
    if (route) {
      console.log(`[UserCenter] 导航到: ${featureName} (${route})`);
      
      // 判断是否为 TabBar 页面
      const isTabBarPage = tabBarPages.includes(route);
      
      if (isTabBarPage) {
        // TabBar 页面使�switchTab
        wx.switchTab({
          url: route,
          success: () => {
            console.log(`[UserCenter] TabBar跳转成功: ${route}`);
          },
          fail: (err) => {
            console.error(`[UserCenter] TabBar跳转失败:`, err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        // 普通页面使�navigateTo
        wx.navigateTo({
          url: route,
          success: () => {
            console.log(`[UserCenter] 页面跳转成功: ${route}`);
          },
          fail: (err) => {
            console.error(`[UserCenter] 页面跳转失败:`, err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }
    } else {
      console.warn(`[UserCenter] 未知的功能key: ${featureKey}`);
      wx.showToast({
        title: '功能暂不可用',
        icon: 'none'
      });
    }
  },

  // 获取头像URL（Web用户专用）
  getAvatarUrl() {
    const { userInfo, avatarGenerator, generatedAvatarUrl } = this.data;
    
    console.log('usercenter getAvatarUrl - 获取头像URL:', {
      hasUserInfo: !!userInfo,
      hasGenerator: !!avatarGenerator,
      generatedAvatarUrl: !!generatedAvatarUrl,
      isWebBound: userInfo ? userInfo.is_web_bound : undefined
    });
    
    if (!userInfo) {
      return '/static/default-avatar.svg';
    }

    // 强制Web用户使用生成的头像
    if (userInfo.is_web_bound) {
      if (generatedAvatarUrl) {
        console.log('usercenter getAvatarUrl - Web用户使用生成的头像');
        return generatedAvatarUrl;
      } else {
        console.log('usercenter getAvatarUrl - Web用户头像生成中，使用默认头像');
        // 异步生成头像
        if (avatarGenerator && !this.isGeneratingAvatar) {
          this.checkAndGenerateAvatar();
        }
        return '/static/default-avatar.svg';
      }
    }
    
    // 非Web用户使用微信头像
    if (this.hasValidWechatAvatar(userInfo)) {
      console.log('usercenter getAvatarUrl - 非Web用户使用微信头像');
      return userInfo.avatar_url;
    }
    
    return '/static/default-avatar.svg';
  },

  // 检查是否有有效的微信头像
  hasValidWechatAvatar(userInfo) {
    if (!userInfo) {
      console.log('usercenter hasValidWechatAvatar - 无用户信息');
      return false;
    }
    
    console.log('usercenter hasValidWechatAvatar - 检查头像有效性:', {
      avatar_url: userInfo.avatar_url,
      is_web_bound: userInfo.is_web_bound,
      useGeneratedAvatar: userInfo.useGeneratedAvatar,
      openid: userInfo.openid
    });
    
    // 强制Web用户生成头像
    if (userInfo.is_web_bound) {
      console.log('usercenter hasValidWechatAvatar - Web用户强制生成头像');
      return false;
    }
    
    // 强制微信登录用户生成头像（不使用微信API返回的默认头像）
    if (userInfo.useGeneratedAvatar) {
      console.log('usercenter hasValidWechatAvatar - 微信用户强制生成头像（基于openid）');
      return false;
    }
    
    if (!userInfo.avatar_url || userInfo.avatar_url === '' || userInfo.avatar_url === null) {
      console.log('usercenter hasValidWechatAvatar - 头像URL为空');
      return false;
    }
    
    // 排除默认头像URL和微信默认头像
    const defaultUrls = [
      '/static/default-avatar.svg',
      '/images/default-avatar.png', 
      'default-avatar',
      'default'
    ];
    
    const isValid = !defaultUrls.some(url => userInfo.avatar_url.includes(url)) && 
                    !userInfo.avatar_url.includes('default') &&
                    !userInfo.avatar_url.includes('wx.qlogo.cn'); // 排除微信默认头像域名
    
    console.log('usercenter hasValidWechatAvatar - 头像有效性:', isValid);
    return isValid;
  },

  // 检查并生成头像
  checkAndGenerateAvatar() {
    const { userInfo, avatarGenerator } = this.data;
    
    console.log('usercenter checkAndGenerateAvatar - 开始检查:', {
      hasUserInfo: !!userInfo,
      hasGenerator: !!avatarGenerator
    });
    
    if (!userInfo || !avatarGenerator) {
      console.log('usercenter checkAndGenerateAvatar - 缺少必要数据，延迟重试');
      setTimeout(() => {
        this.checkAndGenerateAvatar();
      }, 500);
      return;
    }
    
    // 检查是否需要生成头像
    if (!this.hasValidWechatAvatar(userInfo)) {
      console.log('usercenter checkAndGenerateAvatar - 需要生成头像');
      
      // 缓存键也要考虑真实姓名优先级
      const keyText = userInfo.real_name && userInfo.real_name.trim() !== '' 
        ? userInfo.real_name 
        : (userInfo.nickname || userInfo.web_username || 'user');
      const cacheKey = `${userInfo.id || 'default'}_${keyText}`;
      const cachedAvatar = avatarGenerator.getCachedAvatar(cacheKey);
      
      if (cachedAvatar) {
        console.log('usercenter checkAndGenerateAvatar - 使用缓存头像');
        this.setData({ generatedAvatarUrl: cachedAvatar });
      } else {
        console.log('usercenter checkAndGenerateAvatar - 生成新头像');
        this.generateTextAvatar();
      }
    } else {
      console.log('usercenter checkAndGenerateAvatar - 用户已有有效头像');
    }
  },

  // 生成文字头像
  generateTextAvatar() {
    return new Promise((resolve, reject) => {
      const { userInfo, avatarGenerator } = this.data;
      
      if (!userInfo || !avatarGenerator) {
        console.error('usercenter generateTextAvatar - 缺少必要参数');
        reject(new Error('缺少必要参数'));
        return;
      }
      
      console.log('usercenter generateTextAvatar - 开始生成头像');
      this.isGeneratingAvatar = true;
      
      // 优先使用真实姓名的最后一个字，否则使用昵称的最后一个字
      let displayChar;
      let sourceText;
      
      if (userInfo.real_name && userInfo.real_name.trim() !== '') {
        sourceText = userInfo.real_name;
        displayChar = sourceText.charAt(sourceText.length - 1); // 取最后一个字
        console.log('usercenter generateTextAvatar - 使用真实姓名最后一个字:', displayChar);
      } else {
        sourceText = userInfo.nickname || userInfo.web_username || '用户';
        displayChar = sourceText.charAt(sourceText.length - 1); // 修改：取最后一个字而不是第一个字
        console.log('usercenter generateTextAvatar - 使用昵称最后一个字:', displayChar);
      }
      
      const cacheKey = `${userInfo.id || 'default'}_${sourceText}`;
      
      // 使�Canvas 2D 接口绘制头像
      const canvasId = 'avatarCanvas';
      const query = wx.createSelectorQuery().in(this);
      query.select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) {
            console.error('usercenter generateTextAvatar - 无法找到Canvas元素');
            this.isGeneratingAvatar = false;
            reject(new Error('无法找到Canvas元素'));
            return;
          }
          
          try {
            const canvas = res[0].node;
            const ctx = canvas.getContext('2d');
            const canvasSize = 120;
            
            // 设置canvas实际尺寸（考虑设备像素比）
            const dpr = wx.getWindowInfo().pixelRatio || 1;
            canvas.width = canvasSize * dpr;
            canvas.height = canvasSize * dpr;
            ctx.scale(dpr, dpr);
            
            console.log('usercenter generateTextAvatar - Canvas 2D上下文创建完成, 设备像素比:', dpr);
            
            const firstChar = displayChar;
            
            // 优先使用openid最后一位来生成颜色索引
            let colorIndex;
            if (userInfo.avatarSeed && userInfo.useGeneratedAvatar) {
              // 微信登录用户：使用openid最后一位生成颜色
              const seedChar = userInfo.avatarSeed;
              colorIndex = parseInt(seedChar, 16) || 0; // 将16进制字符转为数字
              console.log('usercenter generateTextAvatar - 使用openid生成颜色索引:', seedChar, '=>', colorIndex);
            } else {
              // Web用户或其他情况：使用原有逻辑
              colorIndex = avatarGenerator.generateColorIndex(userInfo, sourceText);
            }
            
            const backgroundColor = avatarGenerator.defaultColors[colorIndex % avatarGenerator.defaultColors.length];
            
            // 绘制背景
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvasSize, canvasSize);
            
            // 绘制文字
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(firstChar, canvasSize / 2, canvasSize / 2);
            
            // Canvas 2D 不需要调�draw()，直接生成图片
            setTimeout(() => {
              // 生成图片
              wx.canvasToTempFilePath({
                canvas: canvas,  // Canvas 2D 使�canvas 对象而不�canvasId
                destWidth: canvasSize,
                destHeight: canvasSize,
                quality: 0.8,
                success: (res) => {
                  console.log('usercenter generateTextAvatar - 临时头像生成成功:', res.tempFilePath);
                  
                  // 将临时文件转换为Base64格式进行持久化存储
                  wx.getFileSystemManager().readFile({
                    filePath: res.tempFilePath,
                    encoding: 'base64',
                    success: (base64Res) => {
                      const base64Data = 'data:image/png;base64,' + base64Res.data;
                      console.log('usercenter generateTextAvatar - Base64头像生成成功');
                      
                      console.log('usercenter generateTextAvatar - 设置Base64头像数据:', base64Data.substring(0, 50) + '...');
                      
                      // 缓存Base64头像数据
                      avatarGenerator.cacheAvatar(cacheKey, base64Data);
                      
                      // 更新数�- 强制刷新页面显示
                      this.setData({ 
                        generatedAvatarUrl: base64Data,
                        // 强制清空外链头像，确保使用生成的头像
                        'userInfo.avatar_url': '' 
                      });
                      
                      console.log('usercenter generateTextAvatar - Base64头像已设置并清空外链');
                      
                      this.isGeneratingAvatar = false;
                      resolve(base64Data);
                    },
                    fail: (base64Error) => {
                      console.error('usercenter generateTextAvatar - Base64转换失败:', base64Error);
                      
                      console.log('usercenter generateTextAvatar - Base64转换失败，使用临时文件作为备用');
                      
                      // 转换失败时仍使用临时文件，但优先显示生成的头像
                      avatarGenerator.cacheAvatar(cacheKey, res.tempFilePath);
                      this.setData({ 
                        generatedAvatarUrl: res.tempFilePath,
                        'userInfo.avatar_url': '' // 清空外链
                      });
                      
                      this.isGeneratingAvatar = false;
                      resolve(res.tempFilePath);
                    }
                  });
                },
                fail: (error) => {
                  console.error('usercenter generateTextAvatar - 头像生成失败:', error);
                  this.isGeneratingAvatar = false;
                  reject(error);
                }
              });
            }, 100); // 稍微延迟确保绘制完成
            
          } catch (error) {
            console.error('usercenter generateTextAvatar - 绘制异常:', error);
            this.isGeneratingAvatar = false;
            reject(error);
          }
        });
    });
  },

  // 获取用户信息
  async fetchUserInfo() {
    try {
      // �游客模式：不加载用户信息，显示未登录状态
      if (mockData.isGuestMode()) {
        console.log('�用户中心-游客模式：显示未登录状态');
        return;
      }
      
      // 检查是否为测试模式
      const isTestMode = wx.getStorageSync('isTestMode');
      
      let userInfo;
      if (isTestMode) {
        // 测试模式：使用本地存储的用户信息
        console.log('用户中心-测试模式：使用本地用户信息');
        userInfo = wx.getStorageSync('userInfo');
        
        // 确保测试模式下有完整的用户信息
        if (!userInfo || Object.keys(userInfo).length === 0) {
          userInfo = this.initTestModeUserInfo();
        }
      } else {
        // 正常模式：调用API获取用户信息
        const response = await API.user.getInfo();
        userInfo = response.data;
      }
      
      console.log('usercenter fetchUserInfo - 获取用户信息:', userInfo);

      // �保存到本地存储，供其他页面访问
      wx.setStorageSync('userInfo', userInfo);
      console.log('�用户信息已保存到Storage');

      // 计算权限标签和管理员状态
      const isAdmin = this.isAdminUser(userInfo);
      const permissionTags = this.buildPermissionTags(userInfo);
      
      this.setData({ 
        userInfo,
        isAdmin,
        permissionTags,
        generatedAvatarUrl: '' // 重置生成的头像
      });
      
      // 确保头像生成器已初始化
      if (!this.data.avatarGenerator) {
        console.log('usercenter fetchUserInfo - 初始化头像生成器');
        this.setData({ avatarGenerator: avatarGenerator });
      }
      
      // 检查并生成头像
      setTimeout(() => {
        this.checkAndGenerateAvatar();
      }, 300);
      
      wx.stopPullDownRefresh();
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      showError('获取用户信息失败');
      wx.stopPullDownRefresh();
    }
  },

  // 初始化测试模式用户信息
  initTestModeUserInfo() {
    const testUserInfo = {
      id: 'test_user_001',
      openid: 'test_openid_001',
      nickname: '微信用户d_001', // 与testMode.js保持一致
      avatar_url: '/images/default-avatar.png',
      real_name: '', // 测试未完善真实姓名的场景
      is_web_bound: true,
      web_username: 'admin',
      web_user_level: 'admin',
      user_level: 'admin',
      is_admin: true,
      is_active: true,
      register_time: '2025-09-25 10:00:00',
      last_login: '2025-09-25 12:00:00',
      permissions: [
        { code: 'electric_query', name: '电费查询', is_granted: true },
        { code: 'attendance', name: '考勤管理', is_granted: true },
        { code: 'admin', name: '管理员权限', is_granted: true },
        { code: 'announcement', name: '公告管理', is_granted: true }
      ]
    };
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', testUserInfo);
    console.log('测试模式：已初始化用户信息', testUserInfo);
    
    return testUserInfo;
  },

  // 获取系统配置
  async fetchSystemConfig() {
    try {
      // �优先检查游客模式
      if (mockData.isGuestMode()) {
        console.log('�用户中心-游客模式：使用简化配置');
        const miniProgramInfo = this.getMiniProgramVersionInfo();
        const guestConfig = {
          name: '微信管理工具',
          version: miniProgramInfo.displayVersion + '-体验',
          functions: [
            { name: '电费查询', enabled: true, description: '支持多账户电费查询和图表分析' },
            { name: '考勤管理', enabled: true, description: '员工考勤记录和统计管理' },
            { name: '用户中心', enabled: true, description: '个人信息和系统设置管理' }
          ],
          guestMode: true
        };
        this.setData({ systemConfig: guestConfig });
        return;
      }
      
      // 检查是否为测试模式
      const isTestMode = wx.getStorageSync('isTestMode');
      
      // 获取小程序版本信息
      const miniProgramInfo = this.getMiniProgramVersionInfo();
      
      // 基础配置
      const baseConfig = {
        name: '微信管理工具',
        description: '专业的管理工具平台，提供电费查询、考勤管理等功能',
        updateDate: '2025-09-28',
        developer: {
          team: '管理工具团队',
          copyright: '© 2025 管理工具团队'
        },
        // 使用微信官方API获取的版本信息
        version: miniProgramInfo.displayVersion,
        appId: miniProgramInfo.appId,
        envVersion: miniProgramInfo.envVersion,
        miniProgramVersion: true  // 标记版本来源为微信官方API
      };
      
      if (isTestMode) {
        // 测试模式
        console.log('用户中心-测试模式：使用微信官方版本API');
        const testConfig = Object.assign({}, baseConfig, {
          version: miniProgramInfo.displayVersion + '-测试',
          functions: [
            { name: '电费查询', enabled: true, description: '支持多账户电费查询和图表分析' },
            { name: '考勤管理', enabled: true, description: '员工考勤记录和统计管理' },
            { name: '管理员功能', enabled: true, description: '系统管理和用户权限控制' }
          ],
          testMode: true
        });
        
        this.setData({ systemConfig: testConfig });
        console.log('用户中心-测试模式：系统配置设置完成', testConfig);
      } else {
        // 正常模式：结合微信版本信息和后端配置
        console.log('用户中心：使用微信官方版本API + 后端系统配置');
        
        // 先设置基础配置（包含微信版本信息）
        const initialConfig = Object.assign({}, baseConfig, {
          functions: [
            { name: '电费查询', enabled: true, description: '支持多账户电费查询和图表分析' },
            { name: '考勤管理', enabled: true, description: '员工考勤记录和统计管理' },
            { name: '用户中心', enabled: true, description: '个人信息和系统设置管理' },
            { name: '公告管理', enabled: true, description: '系统公告发布和管理' },
            { name: '账号管理', enabled: true, description: '小程序用户权限管理' }
          ]
        });
        
        this.setData({ systemConfig: initialConfig });
        console.log('用户中心：初始配置设置完成', initialConfig);
        
        // �游客模式不调用后端配置API
        if (mockData.isGuestMode()) {
          console.log('�用户中心-游客模式：不获取后端配置，使用初始配置');
          return;
        }
        
        // 获取后端配置作为补充信息
        apiCall(
          () => API.system.getConfig(),
          null, // 不显示loading
          (data) => {
            console.log('用户中心：获取后端系统配置成功', data);
            
            // 正确提取后端数据
            let backendConfig;
            if (data.data) {
              backendConfig = data.data;
            } else {
              backendConfig = data;
            }
            
            console.log('后端系统配置:', backendConfig);
            
            // 合并配置：微信版本信�+ 后端配置
            const mergedConfig = Object.assign({}, initialConfig, {
              // 后端配置补充
              app_name: backendConfig.app_name || initialConfig.name,
              server_status: backendConfig.server_status || 'running',
              server_time: backendConfig.server_time,
              // 功能列表：优先使用后端配置
              functions: backendConfig.functions && Array.isArray(backendConfig.functions) 
                ? backendConfig.functions 
                : initialConfig.functions,
            });
            // 再次合并后端配置，但版本信息仍使用微信官方API获取的
            Object.assign(mergedConfig, backendConfig, {
              version: initialConfig.version,
              appId: initialConfig.appId,
              envVersion: initialConfig.envVersion,
              miniProgramVersion: true
            });
            
            this.setData({ systemConfig: mergedConfig });
            console.log('用户中心：合并配置完成', mergedConfig);
          },
          (error) => {
            console.log('用户中心：后端系统配置获取失败，使用基础配置', error.message);
            // 后端获取失败不影响，已经设置了基础配置
          }
        );
      }
    } catch (error) {
      console.error('用户中心：fetchSystemConfig异常', error);
      
      // 异常情况：使用兜底配置
      const miniProgramInfo = this.getMiniProgramVersionInfo();
      const fallbackConfig = {
        name: '微信管理工具',
        version: miniProgramInfo.displayVersion,
        functions: [
          { name: '电费查询', enabled: true },
          { name: '考勤管理', enabled: true },
          { name: '用户中心', enabled: true }
        ],
        fallback: true
      };
      
      this.setData({ systemConfig: fallbackConfig });
      console.log('用户中心：异常情况下使用兜底配置', fallbackConfig);
    }
  },

  // 快速功能按钮
  goToElectric() {
    wx.switchTab({ url: '/pages/electric/index' });
  },

  goToAttendance() {
    wx.switchTab({ url: '/pages/attendance/index' });
  },

  checkPermissions() {
    this.viewPermissions();
  },

  viewLogs() {
    console.log('�进入使用记录页面');
    wx.navigateTo({
      url: '/pages/usercenter/usage-history/index'
    });
  },

  // 微信通知群管理
  goToNotificationGroupManagement() {
    if (!this.data.isAdmin) {
      showError('权限不足，需要管理员权限');
      return;
    }
    
    console.log('进入微信通知群管理');
    wx.navigateTo({
      url: '/pages/admin/notification-group/index'
    });
  },

  // 导航到电费通知设置页面
  goToDFNotificationSettings() {
    console.log('�电费通知设置跳转检查:');
    console.log('- isAdmin:', this.data.isAdmin);
    console.log('- userInfo:', this.data.userInfo);
    
    if (!this.data.isAdmin) {
      console.log('�权限检查失败');
      showError('权限不足，需要管理员权限');
      return;
    }
    
    console.log('�权限检查通过，开始跳转');
    console.log('�跳转到: /pages/admin/df-notification-settings/index');
    
    wx.navigateTo({
      url: '/pages/admin/df-notification-settings/index',
      success: () => {
        console.log('�页面跳转成功');
      },
      fail: (err) => {
        console.error('�页面跳转失败:', err);
        showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
      }
    });
  },

  // 导航到天气设置页面（统一入口）
  goToWeatherSettings() {
    console.log('�天气设置跳转检查:');
    console.log('- isAdmin:', this.data.isAdmin);
    console.log('- userInfo:', this.data.userInfo);
    
    if (!this.data.isAdmin) {
      console.log('�权限检查失败');
      showError('权限不足，需要管理员权限');
      return;
    }
    
    console.log('�权限检查通过，开始跳转');
    console.log('�跳转到: /pages/admin/weather-settings/index');
    
    wx.navigateTo({
      url: '/pages/admin/weather-settings/index',
      success: () => {
        console.log('�页面跳转成功');
      },
      fail: (err) => {
        console.error('�页面跳转失败:', err);
        showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
      }
    });
  },

  // 导航到定时任务管理页面
  goToTaskManagement() {
    console.log('�定时任务管理跳转检查:');
    console.log('- isAdmin:', this.data.isAdmin);
    console.log('- userInfo:', this.data.userInfo);
    
    if (!this.data.isAdmin) {
      console.log('�权限检查失败');
      showError('权限不足，需要管理员权限');
      return;
    }
    
    console.log('�权限检查通过，开始跳转');
    console.log('�跳转到: /pages/admin/task-management/list/index');
    
    wx.navigateTo({
      url: '/pages/admin/task-management/list/index',
      success: () => {
        console.log('�页面跳转成功');
      },
      fail: (err) => {
        console.error('�页面跳转失败:', err);
        showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
      }
    });
  },

  // 使用记录管理
  goToUsageRecordsManagement() {
    console.log('�使用记录管理跳转检查:');
    console.log('- isAdmin:', this.data.isAdmin);
    
    if (!this.data.isAdmin) {
      console.log('�权限检查失败');
      showError('权限不足，需要管理员权限');
      return;
    }
    
    console.log('�权限检查通过，开始跳转');
    console.log('�跳转到: /pages/admin/usage-records/index');
    
    wx.navigateTo({
      url: '/pages/admin/usage-records/index',
      success: () => {
        console.log('�页面跳转成功');
      },
      fail: (err) => {
        console.error('�页面跳转失败:', err);
        showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
      }
    });
  },

  // 账号管理
  handleBindStatus() {
    if (this.data.userInfo.is_web_bound) {
      // 已绑定，显示管理选项
      wx.showActionSheet({
        itemList: ['解绑Web账号', '查看绑定信息'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.unbindWebAccount();
          } else if (res.tapIndex === 1) {
            this.showBindInfo();
          }
        }
      });
    } else {
      // 未绑定，跳转到绑定页面
      wx.navigateTo({ url: '/pages/user/bind/index' });
    }
  },

  unbindWebAccount() {
    // 检查是否为测试模式
    const isTestMode = wx.getStorageSync('isTestMode');
    
    if (isTestMode) {
      // 测试模式：直接模拟解绑
      console.log('用户中心-测试模式：模拟Web账号解绑');
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.is_web_bound = false;
      userInfo.web_username = null;
      wx.setStorageSync('userInfo', userInfo);
      
      // 重新计算权限标签和管理员状态
      const isAdmin = this.isAdminUser(userInfo);
      const permissionTags = this.buildPermissionTags(userInfo);
      
      this.setData({ 
        userInfo,
        isAdmin,
        permissionTags 
      });
      
      showSuccess('解绑成功(测试模式)');
      return;
    }
    
    // 正常模式：调用API解绑
    apiCall(
      () => API.auth.unbind(),
      '解绑中...',
      (data) => {
        this.fetchUserInfo(); // 刷新用户信息
        showSuccess('解绑成功');
      },
      (error) => {
        showError(error.message || '解绑失败');
      }
    );
  },

  showBindInfo() {
    const { userInfo } = this.data;
    wx.showModal({
      title: '绑定信息',
      content: `已绑定Web账号\n绑定时间：${userInfo.last_login}`,
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 处理姓名完善
  handleNameCompletion() {
    wx.showModal({
      title: '完善真实姓名',
      content: '',
      editable: true,
      placeholderText: '请输入2-10个汉字',
      success: (res) => {
        if (res.confirm) {
          const realName = res.content ? res.content.trim() : undefined;
          if (!realName) {
            showError('姓名不能为空');
            return;
          }

          // 验证姓名格式
          const nameRegex = /^[\u4e00-\u9fa5]{2,10}$/;
          if (!nameRegex.test(realName)) {
            showError('请输入2-10个汉字的真实姓名');
            return;
          }

          this.updateRealName(realName);
        }
      }
    });
  },

  // 更新真实姓名
  updateRealName(realName) {
    // 检查是否为测试模式
    const isTestMode = wx.getStorageSync('isTestMode');
    
    if (isTestMode) {
      // 测试模式：直接更新本地数据
      console.log('用户中心-测试模式：模拟姓名更新');
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.real_name = realName;
      wx.setStorageSync('userInfo', userInfo);
      
      // 重新计算权限标签和管理员状态
      const isAdmin = this.isAdminUser(userInfo);
      const permissionTags = this.buildPermissionTags(userInfo);
      
      this.setData({ 
        userInfo,
        isAdmin,
        permissionTags 
      });
      
      showSuccess('姓名更新成功(测试模式)');
      return;
    }
    
    // 正常模式：调用API更新
    apiCall(
      () => API.user.updateRealName(realName),
      '更新中...',
      (data) => {
        showSuccess('姓名更新成功');

        // 刷新用户信息
        this.fetchUserInfo();
      },
      (error) => {
        showError(error.message || '更新失败');
      }
    );
  },

  updateUserInfo() {
    wx.showToast({
      title: '个人信息编辑功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  viewPermissions() {
    const { userInfo } = this.data;
    const permissions = (userInfo && userInfo.permissions) ? userInfo.permissions : [];
    
    if (permissions.length === 0) {
      wx.showModal({
        title: '权限信息',
        content: '当前无特殊权限\n请联系管理员开通功能权限',
        showCancel: false,
        confirmText: '确定'
      });
    } else {
      const permissionText = permissions.map(p => `�${p.name}: ${p.is_granted ? '已开通' : '未开通'}`).join('\n');
      wx.showModal({
        title: '我的权限',
        content: permissionText,
        showCancel: false,
        confirmText: '确定'
      });
    }
  },

  // 系统设置
  showSystemInfo() {
    this.setData({ showSystemInfo: true });
  },

  closeSystemInfo() {
    this.setData({ showSystemInfo: false });
  },

  checkUpdate() {
    wx.showModal({
      title: '检查更新',
      content: '当前已是最新版本',
      showCancel: false,
      confirmText: '确定'
    });
  },

  clearCache() {
    wx.showModal({
      title: '清理缓存',
      content: '确定要清理本地缓存吗？\n\n将清理以下内容：\n�本地存储数据\n�用户信息缓存\n�页面缓存数据\n\n（登录状态将保留）',
      success: (res) => {
        if (res.confirm) {
          // 清理本地存储和内存缓存
          try {
            console.log('[清理缓存] 开始清理缓存...');
            
            // ===== 性能优化：清理内存中的缓�=====
            // 1. 清理用户信息缓存
            console.log('[清理缓存] 清理用户信息缓存');
            userInfoCache.clear();
            
            // 2. 清理本地存储
            console.log('[清理缓存] 清理本地存储');
            const keys = wx.getStorageInfoSync().keys;
            let clearedCount = 0;
            keys.forEach(key => {
              // 保留关键信息：openid（登录）�isTestMode（测试模式状态）
              if (key !== 'openid' && key !== 'isTestMode') {
                wx.removeStorageSync(key);
                clearedCount++;
              }
            });
            
            console.log(`[清理缓存] 清理完成，共清�${clearedCount} 项缓存`);
            showSuccess('缓存清理完成，正在刷新...');
            
            // �清理后直接刷新页面，重新加载所有数据
            console.log('[清理缓存] 刷新页面，重新加载数据');
            setTimeout(() => {
              // 使�reLaunch 重新加载页面，这样会完全重置页面状态
              wx.reLaunch({
                url: '/pages/usercenter/index'
              });
            }, 800);
          } catch (error) {
            console.error('[清理缓存] 清理失败:', error);
            showError('清理失败：' + (error.message || '未知错误'));
          }
        }
      }
    });
  },

  // 帮助支持
  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 电费查询：查看家庭电费余额\n2. 考勤管理：提交和查看考勤记录\n3. 账号绑定：绑定Web账号获取更多权限\n\n如需帮助请联系管理员',
      showCancel: false,
      confirmText: '确定'
    });
  },

  feedback() {
    wx.navigateTo({
      url: '/pages/feedback/index'
    });
  },

  // 跳转到小程序用户管理（管理员功能）
  goToUserManagement() {
    if (!this.data.isAdmin) {
      showError('权限不足，需要管理员权限');
      return;
    }
    
    wx.navigateTo({
      url: '/pages/admin/miniprogram-users/index'
    });
  },

  // 跳转到公告管理（管理员功能）
  goToAnnouncementManagement() {
    if (!this.data.isAdmin) {
      showError('权限不足，需要管理员权限');
      return;
    }
    
    wx.navigateTo({
      url: '/pages/announcement/manage'
    });
  },

  about() {
    wx.showModal({
      title: '关于我们',
      content: `微信管理工具 v${this.data.versionNo}\n\n专业的管理工具平台\n提供电费查询、考勤管理等功能\n\n© 2025 管理工具团队`,
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 跳转到个人资料页面
  goToProfile() {
    wx.navigateTo({
      url: '/pages/user/profile/index'
    });
  },

  getVersionInfo() {
    try {
      const versionInfo = wx.getAccountInfoSync();
      const { version, envVersion } = versionInfo.miniProgram;
      
      // 根据环境版本设置显示的版本号
      let displayVersion = '';
      switch (envVersion) {
        case 'release':
          displayVersion = version || '1.0.0';  // 正式版显示具体版本号
          break;
        case 'trial':
          displayVersion = 'Trial';  // 体验版
          break;
        case 'develop':
          displayVersion = 'Dev';    // 开发版
          break;
        default:
          displayVersion = envVersion || 'Unknown';
      }
      
      this.setData({
        versionNo: displayVersion,
      });
      
      console.log('版本信息获取成功:', {
        version: version,
        envVersion: envVersion,
        displayVersion: displayVersion
      });
      
    } catch (error) {
      console.error('获取版本信息失败:', error);
      this.setData({
        versionNo: '1.0.0',  // 默认版本号
      });
    }
  },

  // 获取微信小程序版本信息（用于系统信息显示）
  getMiniProgramVersionInfo() {
    try {
      const accountInfo = wx.getAccountInfoSync();
      const { version, envVersion, appId } = accountInfo.miniProgram;
      
      return {
        appId: appId,
        version: version || '1.0.0',
        envVersion: envVersion || 'unknown',
        displayVersion: this.formatDisplayVersion(version, envVersion)
      };
    } catch (error) {
      console.error('获取小程序版本信息失败:', error);
      return {
        appId: 'unknown',
        version: '1.0.0',
        envVersion: 'unknown',
        displayVersion: '1.0.0'
      };
    }
  },

  // 格式化显示版本号
  formatDisplayVersion(version, envVersion) {
    switch (envVersion) {
      case 'release':
        return version || '1.0.0';
      case 'trial':
        return `${version || '1.0.0'}-体验版`;
      case 'develop':
        return `${version || '1.0.0'}-开发版`;
      default:
        return version || '1.0.0';
    }
  },

  // 处理退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      cancelText: '取消',
      confirmColor: '#007AFF',
      success: (res) => {
        if (res.confirm) {
          this.logout();
        }
      }
    });
  },

  // 退出登录
  logout() {
    try {
      showSuccess('正在退出登录...');
      
      // 延迟执行退出登录操作
      setTimeout(() => {
        // 清理登录相关的本地存储数据
        wx.removeStorageSync('openid');
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('sessionKey');
        wx.removeStorageSync('isTestMode');
        
        // 跳转到登录页面
        wx.reLaunch({
          url: '/pages/login/index'
        });
        
        console.log('用户已退出登录');
      }, 1000);
      
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      showError('退出登录失败，请重试');
    }
  },

  // 账号注销处理
  handleDeleteAccount() {
    wx.showModal({
      title: '⚠�账号注销确认',
      content: '注销账号将永久删除您的所有数据，包括：\n�个人信息和设置\n�历史操作记录\n�已绑定的Web账号关联\n\n此操作不可撤销，请谨慎操作！',
      confirmText: '确认注销',
      cancelText: '取消',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.showSecondConfirmation();
        }
      }
    });
  },

  // 二次确认
  showSecondConfirmation() {
    wx.showModal({
      title: '�最终确认',
      content: '您确定要注销账号吗？\n\n注销后将立即清除所有数据并退出登录，且无法恢复！',
      confirmText: '我确定要注销',
      cancelText: '我再想想',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteAccount();
        }
      }
    });
  },

  // 执行账号注销
  performDeleteAccount() {
    // 检查是否为测试模式
    const isTestMode = wx.getStorageSync('isTestMode');
    
    if (isTestMode) {
      // 测试模式：直接模拟注销
      console.log('用户中心-测试模式：模拟账号注销');
      
      showSuccess('账号注销成功(测试模式)');

      // 延迟清理数据并跳转
      setTimeout(() => {
        this.clearAllDataAndLogout();
      }, 2000);
      return;
    }
    
    // 正常模式：调用API注销
    apiCall(
      () => API.user.deleteAccount(),
      '注销中...',
      (data) => {
        // 显示注销成功提示
        showSuccess('账号注销成功');

        // 延迟清理数据并跳转
        setTimeout(() => {
          this.clearAllDataAndLogout();
        }, 2000);
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        
        showError(error.message || '注销失败，请重试');
      }
    );
  },

  // 清理所有数据并退出登录
  clearAllDataAndLogout() {
    try {
      // 清理所有本地存储数据
      wx.clearStorageSync();
      
      // 跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/index'
      });

    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      
      // 如果清理失败，尝试重启小程序
      wx.showModal({
        title: '提示',
        content: '账号已注销，请重启小程序完成退出登录',
        showCancel: false,
        success: () => {
          wx.exitMiniProgram();
        }
      });
    }
  },

  // 构建权限标签
  buildPermissionTags(userInfo) {
    const tags = [];
    if (!userInfo) {
      return tags;
    }

    const addTag = (text, type = 'default') => {
      if (!text) {
        return;
      }
      if (!tags.some(tag => tag.text === text)) {
        tags.push({ text, type });
      }
    };

    const isAdmin = this.isAdminUser(userInfo);
    if (isAdmin) {
      addTag('管理员', 'admin');
    }

    if (userInfo.is_web_bound) {
      addTag('已绑定Web', 'web');
    } else {
      addTag('未绑定Web', 'warning');
    }

    const permissionNameMap = {
      electric_query: '电费查询',
      attendance: '考勤管理',
      expense: '报销管理',
      announcement: '公告管理',
      admin: '管理员权限'
    };

    if (Array.isArray(userInfo.permissions)) {
      userInfo.permissions.forEach(perm => {
        if (!perm) return;
        let code;
        let name;
        let granted = true;

        if (typeof perm === 'string') {
          code = perm;
        } else {
          code = perm.code || perm.permission_code;
          name = perm.name || perm.permission_name;
          if (perm.hasOwnProperty('is_granted')) {
            granted = !!perm.is_granted;
          }
        }

        if (!granted) {
          return;
        }

        if (!name && code) {
          name = permissionNameMap[code] || code;
        }

        if (name) {
          addTag(name, code && String(code).toLowerCase() === 'admin' ? 'admin' : 'permission');
        }
      });
    }

    if (userInfo.real_name) {
      addTag(`实名：${userInfo.real_name}`, 'info');
    }

    return tags;
  },

  // 判断是否为管理员
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }

    if (userInfo.is_admin) {
      return true;
    }

    if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') {
      return true;
    }

    if (Array.isArray(userInfo.permissions)) {
      return userInfo.permissions.some(perm => {
        if (!perm) return false;
        if (typeof perm === 'string') {
          return perm.toLowerCase() === 'admin';
        }
        const code = perm.code || perm.permission_code;
        return code && String(code).toLowerCase() === 'admin';
      });
    }

    return false;
  },

  // 头像加载成功
  onAvatarLoad(e) {
    console.log('usercenter 头像加载成功');
  },

  // 头像加载失败
  onAvatarError(e) {
    console.log('usercenter 头像加载失败，尝试生成新头像:', e);
    
    // 头像加载失败时，强制生成文字头像
    if (!this.isGeneratingAvatar && this.data.avatarGenerator) {
      this.generateTextAvatar().catch(error => {
        // 移除console.error以避免触发全局错误恢复机制
      });
    }
  },

  onUnload() {
    // 清理头像生成器资源
    if (this.data.avatarGenerator && typeof this.data.avatarGenerator.cleanup === 'function') {
      try {
        this.data.avatarGenerator.cleanup();
      } catch (error) {
        console.warn('usercenter onUnload - 头像生成器清理失败:', error);
      }
    }
    
    // 清理倒计时定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
    
    // 清理生成状态
    this.isGeneratingAvatar = false;
  },




  // 比较版本号
  compareVersion(v1, v2) {
    const arr1 = v1.split('.');
    const arr2 = v2.split('.');
    const length = Math.max(arr1.length, arr2.length);
    
    for (let i = 0; i < length; i++) {
      const num1 = parseInt(arr1[i] || '0');
      const num2 = parseInt(arr2[i] || '0');
      
      if (num1 > num2) {
        return 1;
      } else if (num1 < num2) {
        return -1;
      }
    }
    
    return 0;
  },

  // 显示账号注销确认弹窗
  showDeleteAccountDialog() {
    console.log('显示账号注销确认弹窗');
    this.setData({
      showDeleteDialog: true,
      countdown: 10 // 10秒倒计时
    });
    
    // 开始倒计时
    this.startCountdown();
  },

  // 关闭注销确认弹窗
  closeDeleteDialog() {
    // 清理倒计时
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
    
    this.setData({
      showDeleteDialog: false,
      countdown: 0,
      countdownTimer: null
    });
  },

  // 开始倒计时
  startCountdown() {
    const timer = setInterval(() => {
      const countdown = this.data.countdown;
      if (countdown <= 1) {
        clearInterval(timer);
        this.setData({
          countdown: 0,
          countdownTimer: null
        });
      } else {
        this.setData({
          countdown: countdown - 1
        });
      }
    }, 1000);
    
    this.setData({
      countdownTimer: timer
    });
  },

  // 确认注销账号
  async confirmDeleteAccount() {
    if (this.data.countdown > 0) {
      return; // 倒计时未结束，不能操作
    }

    try {
      console.log('开始注销账号');
      
      // 显示加载提示
      wx.showLoading({
        title: '注销中...',
        mask: true
      });

      // 调用注销API
      await API.user.deleteAccount();

      wx.hideLoading();
      
      // 显示成功提示
      wx.showToast({
        title: '账号注销成功',
        icon: 'success',
        duration: 2000
      });

      // 关闭弹窗
      this.closeDeleteDialog();

      // 延迟跳转到登录页面
      setTimeout(() => {
        // 清除本地存储
        wx.clearStorageSync();
        
        // 跳转到登录页面
        wx.reLaunch({
          url: '/pages/login/index'
        });
      }, 2000);

    } catch (error) {
      wx.hideLoading();
      // 移除console.error以避免触发全局错误恢复机制
      
      wx.showModal({
        title: '注销失败',
        content: error.message || '账号注销失败，请稍后重试',
        showCancel: false,
        confirmText: '确定'
      });
    }
  },

  /**
   * 异步加载全局测试模式状态
   */
  async loadGlobalTestModeStatus() {
    try {
      // 从服务器获取最新状态
      await testModeManager.fetchGlobalTestModeFromServer();
      
      // 更新界面状态
      this.setData({
        globalTestMode: testModeManager.isTestMode()
      });
    } catch (error) {
      console.warn('加载全局测试模式状态失败:', error);
      // 使用默认状态
      this.setData({
        globalTestMode: testModeManager.isTestMode()
      });
    }
  },

  /**
   * 切换全局测试模式
   */
  async onToggleTestMode(e) {
    const enabled = e.detail.value;
    console.log('切换全局测试模式:', enabled);
    
    // 显示加载提示
    wx.showLoading({
      title: enabled ? '启用中...' : '关闭中...',
    });
    
    try {
      // 设置测试模式状态（异步调用）
      const success = await testModeManager.setTestMode(enabled);
      
      wx.hideLoading();
      
      if (success) {
        // 更新界面状态
        this.setData({
          globalTestMode: enabled
        });

        // 显示成功提示
        wx.showToast({
          title: enabled ? '测试模式已启用' : '测试模式已关闭',
          icon: 'success',
          duration: 2000
        });
      } else {
        // 操作失败，恢复开关状态
        this.setData({
          globalTestMode: !enabled
        });
        
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('切换测试模式失败:', error);
      
      // 操作失败，恢复开关状态
      this.setData({
        globalTestMode: !enabled
      });
      
      wx.showToast({
        title: '操作失败，请检查网络',
        icon: 'error',
        duration: 2000
      });
    }
  },

  /**
   * 显示测试模式说明
   */
  showTestModeInfo() {
    this.setData({
      showTestModeDialog: true
    });
  },

  /**
   * 隐藏测试模式说明弹窗
   */
  hideTestModeDialog() {
    this.setData({
      showTestModeDialog: false
    });
  },

  /**
   * 确认测试模式说明
   */
  confirmTestModeInfo() {
    this.hideTestModeDialog();
  },

  /**
   * 关闭游客模式横幅
   */
  closeGuestBanner() {
    this.setData({
      showGuestBanner: false
    });
  },

  /**
   * 跳转到登录页
   */
  goToLogin() {
    wx.reLaunch({
      url: '/pages/login/index'
    });
  },

  /**
   * 管理员菜单导航
   */
  navigateToPage(e) {
    const { path } = e.currentTarget.dataset;
    
    if (!path) {
      console.warn('[UserCenter] navigateToPage - 缺少路径参数');
      return;
    }
    
    console.log(`[UserCenter] 导航到管理页面: ${path}`);
    
    wx.navigateTo({
      url: path,
      success: () => {
        console.log(`[UserCenter] 页面跳转成功: ${path}`);
      },
      fail: (err) => {
        console.error(`[UserCenter] 页面跳转失败:`, err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 账号管理菜单操作
   */
  handleAccountAction(e) {
    const { action } = e.currentTarget.dataset;
    
    if (!action) {
      console.warn('[UserCenter] handleAccountAction - 缺少操作参数');
      return;
    }
    
    console.log(`[UserCenter] 执行账号操作: ${action}`);
    
    switch (action) {
      case 'bindWeb':
        // Web账号管理
        this.handleBindStatus();
        break;
        
      case 'updateInfo':
        // 个人信�- 弹出姓名编辑框
        this.handleNameCompletion();
        break;
        
      case 'logout':
        // 退出登录
        wx.showModal({
          title: '确认退出',
          content: '确定要退出登录吗？',
          confirmText: '退出',
          confirmColor: '#FF8C00',
          success: (res) => {
            if (res.confirm) {
              console.log('[UserCenter] 用户确认退出登录');
              this.logout();
            }
          }
        });
        break;
        
      case 'deleteAccount':
        // 账号注销
        this.showDeleteAccountDialog();
        break;
        
      default:
        console.warn(`[UserCenter] 未知的操作: ${action}`);
        wx.showToast({
          title: '功能暂不可用',
          icon: 'none'
        });
    }
  }
});
