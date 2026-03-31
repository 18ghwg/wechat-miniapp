const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { setupPageShare } = require('../../utils/share');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { diagnoseShare } = require('../../utils/share-debug');
const { isDevtools } = require('../../utils/system-info');
const mockData = require('../../utils/mock-data'); // ⭐ 新增

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    isGuest: false, // ⭐ 新增：游客模式标识
    functionList: [
      {
        id: 'electric',
        name: '电费查询',
        icon: '⚡',
        desc: '查询家庭电费余额',
        url: '/pages/electric/index',
        permission: '',  // 移除权限检查，所有用户可用
        hasPermission: true
      },
      {
        id: 'attendance',
        name: '考勤管理',
        icon: '📝',
        desc: '工作考勤记录',
        url: '/pages/attendance/index',
        permission: '',  // 移除权限检查，所有用户可用
        hasPermission: true
      },
      {
        id: 'expense',
        name: '报销管理',
        icon: '💰',
        desc: '报销申请处理',
        url: '',  // 页面暂未创建
        permission: '',  // 移除权限检查，所有用户可用
        hasPermission: true
      },
      {
        id: 'weather',
        name: '天气服务',
        icon: '🌤️',
        desc: '天气预报与预警通知',
        url: '/pages/admin/weather-settings/index',  // 添加跳转地址
        permission: '',  // 移除权限检查，所有用户可用
        hasPermission: true
      }
    ],
    systemConfig: null,
    pageLoading: true,
    announcements: [],          // 公告列表
    announcementsLoading: false, // 公告加载状态
    showNoticeModal: false,      // 公告弹窗显示状态
    noticeModalList: []          // 公告弹窗数据列表
  },

  onShow() {
    // 安全地初始化 TabBar
    const tabBar = this.getTabBar();
    if (tabBar && typeof tabBar.init === 'function') {
      tabBar.init();
    }
    
    // ⭐ 检查游客模式变化
    const oldGuestMode = this.data.isGuest || false;
    const newGuestMode = mockData.isGuestMode();
    const guestModeChanged = oldGuestMode !== newGuestMode;
    
    if (guestModeChanged) {
      console.log(`🔄 首页-游客模式状态变化: ${oldGuestMode} -> ${newGuestMode}`);
      this.setData({ isGuest: newGuestMode });
      // 强制重新加载数据
      this._hasLoaded = false;
      this.checkLoginAndLoadData();
      return;
    }
    
    this.setData({ isGuest: newGuestMode });
    
    // 只有在页面不是第一次显示时才重新加载数据
    if (this._hasLoaded) {
      this.checkLoginAndLoadData();
    }
  },

  onLoad() {
    this._currentPopupId = null;
    this._hasLoaded = false;
    this.checkLoginAndLoadData();
    
    // 显示分享菜单（包含朋友圈分享）
    // 注意：只要定义了 onShareTimeline，就会自动显示"分享到朋友圈"选项
    // 不需要在 showShareMenu 中指定 menus 参数
    wx.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        console.log('✅ 分享菜单显示成功:', res);
      },
      fail: (err) => {
        console.warn('⚠️ 分享菜单显示失败:', err);
        // 即使失败，onShareTimeline 仍然有效
      }
    });
    
    // 🔍 调试：如需诊断分享功能，请在控制台执行：
    // require('../../utils/share-debug').diagnoseShare();
  },
  
  /**
   * 分享给好友
   */
  onShareAppMessage(res) {
    const appName = miniprogramInfo.getAppName();
    const appDesc = miniprogramInfo.getAppDescription();
    
    return {
      title: `${appName} - ${appDesc}`,
      path: '/pages/home/home',
      imageUrl: ''
    };
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: appName,
      query: '',
      imageUrl: ''
    };
  },

  onPullDownRefresh() {
    // 下拉刷新时重置加载状态，允许重新显示公告
    this._hasLoaded = false;
    this._currentPopupId = null;
    this.checkLoginAndLoadData();
  },

  /**
   * 检查登录状态并加载数据
   */
  checkLoginAndLoadData() {
    const openid = wx.getStorageSync('openid');
    const userInfo = wx.getStorageSync('userInfo');
    
    // ⭐ 修改：支持游客模式
    if (!openid) {
      // 检查是否为游客模式
      const isGuest = mockData.isGuestMode();
      if (isGuest) {
        console.log('🎭 首页-游客模式：不使用mock用户数据');
        this.setData({
          isLoggedIn: false,
          isGuest: true,
          userInfo: null,
          isAdmin: false,
          permissionTags: []
        });
        this._hasLoaded = true;
        this.loadAnnouncements(); // 游客也可以查看公告（正常API获取）
        this.setData({ pageLoading: false });
        return;
      }
      
      // 非游客模式且未登录，跳转到登录页
      wx.reLaunch({
        url: '/pages/login/index'
      });
      return;
    }

    const isAdmin = this.isAdminUser(userInfo);
    const permissionTags = this.buildPermissionTags(userInfo);

    this.setData({
      isLoggedIn: true,
      userInfo: userInfo,
      isAdmin,
      permissionTags
    });

    this.loadData();
  },

  /**
   * 加载首页数据
   */
  loadData() {
    this.setData({ pageLoading: true });

    Promise.all([
      this.loadUserInfo(),
      this.loadSystemConfig()
    ])
      .then(() => this.loadAnnouncements())
      .finally(() => {
        this.setData({ pageLoading: false });
        wx.stopPullDownRefresh();
        // 标记页面已加载完成
        this._hasLoaded = true;
      });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 检查是否为测试模式
    const isTestMode = wx.getStorageSync('isTestMode');
    
    if (isTestMode) {
      // 测试模式：直接使用本地存储的用户信息
      console.log('测试模式：使用本地用户信息');
      let userInfo = wx.getStorageSync('userInfo');
      
      // 确保测试模式下有完整的用户信息
      if (!userInfo || Object.keys(userInfo).length === 0) {
        userInfo = this.initTestModeUserInfo();
      }
      
      const isAdmin = this.isAdminUser(userInfo);
      const permissionTags = this.buildPermissionTags(userInfo);

      this.setData({ userInfo, isAdmin, permissionTags });
      this.updatePermissionStatus(userInfo);
      return Promise.resolve(userInfo);
    }
    
    // 正常模式：调用API获取用户信息
    return apiCall(
      () => API.user.getInfo(),
      null,
      (data) => {
        const userInfo = data.data;
        const isAdmin = this.isAdminUser(userInfo);
        const permissionTags = this.buildPermissionTags(userInfo);

        this.setData({ userInfo: userInfo, isAdmin, permissionTags });
        wx.setStorageSync('userInfo', userInfo);
        this.updatePermissionStatus(userInfo);
      },
      (error) => {
        console.error('加载用户信息失败:', error);
      }
    );
  },

  /**
   * 初始化测试模式用户信息
   */
  initTestModeUserInfo() {
    const testUserInfo = {
      id: 'test_user_001',
      openid: 'test_openid_001',
      nickname: '测试管理员',
      avatar_url: '/images/default-avatar.png',
      real_name: '张三',
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
        { code: 'weather', name: '天气服务', is_granted: true },
        { code: 'admin', name: '管理员权限', is_granted: true },
        { code: 'announcement', name: '公告管理', is_granted: true }
      ]
    };
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', testUserInfo);
    console.log('首页测试模式：已初始化用户信息', testUserInfo);
    
    return testUserInfo;
  },

  /**
   * 更新权限状态
   */
  updatePermissionStatus(userInfo) {
    const functionList = this.data.functionList.map(item => {
      if (item.permission) {
        // 检查权限
        let hasPermission = false;
        
        if (userInfo && userInfo.is_web_bound) {
          // 已绑定Web账号，拥有所有权限
          hasPermission = true;
        } else if (userInfo && userInfo.is_admin) {
          // 管理员拥有所有权限
          hasPermission = true;
        } else if (userInfo && userInfo.permissions && Array.isArray(userInfo.permissions)) {
          // 检查特定权限
          hasPermission = userInfo.permissions.some(p => {
            // 支持字符串数组和对象数组
            if (typeof p === 'string') {
              return p === item.permission;
            } else if (p && p.code) {
              return p.code === item.permission;
            }
            return false;
          });
        }
        
        return Object.assign({}, item, { hasPermission: hasPermission });
      }
      return Object.assign({}, item, { hasPermission: true });
    });

    const permissionTags = this.buildPermissionTags(userInfo);
    const isAdmin = this.isAdminUser(userInfo);
    
    this.setData({ functionList, permissionTags, isAdmin });
  },

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
      weather: '天气服务',
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

  /**
   * 获取微信小程序版本信息
   */
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
      console.error('首页：获取小程序版本信息失败:', error);
      return {
        appId: 'unknown',
        version: '1.0.0',
        envVersion: 'unknown',
        displayVersion: '1.0.0'
      };
    }
  },

  /**
   * 格式化显示版本号
   */
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

  /**
   * 加载系统配置
   */
  loadSystemConfig() {
    // 检查是否为测试模式
    const isTestMode = wx.getStorageSync('isTestMode');
    
    // 获取小程序版本信息
    const miniProgramInfo = this.getMiniProgramVersionInfo();
    
    if (isTestMode) {
      // 测试模式：使用微信官方API + mock配置
      console.log('首页-测试模式：使用微信官方版本API');
      const mockSystemConfig = {
        version: `${miniProgramInfo.displayVersion}-测试`,
        appId: miniProgramInfo.appId,
        envVersion: miniProgramInfo.envVersion,
        functions: [
          { name: '电费查询', enabled: true },
          { name: '考勤管理', enabled: true },
          { name: '天气服务', enabled: true },
          { name: '管理员功能', enabled: true }
        ],
        testMode: true,
        miniProgramVersion: true
      };
      
      this.setData({ systemConfig: mockSystemConfig });
      console.log('首页-测试模式：系统配置设置完成', mockSystemConfig);
      return Promise.resolve(mockSystemConfig);
    }
    
    // 正常模式：结合微信版本信息和后端配置
    console.log('首页：使用微信官方版本API + 后端系统配置');
    
    // 先设置基础配置（包含微信版本信息）
    const initialConfig = {
      version: miniProgramInfo.displayVersion,
      appId: miniProgramInfo.appId,
      envVersion: miniProgramInfo.envVersion,
      miniProgramVersion: true,
      functions: [
        { name: '电费查询', enabled: true },
        { name: '考勤管理', enabled: true },
        { name: '天气服务', enabled: true },
        { name: '用户中心', enabled: true }
      ]
    };
    
    this.setData({ systemConfig: initialConfig });
    console.log('首页：初始配置设置完成', initialConfig);
    
    // 调用后端API获取系统配置作为补充
    return apiCall(
      () => API.system.getConfig(),
      null,
      (data) => {
        console.log('首页：获取后端系统配置成功', data);
        
        const backendConfig = data.data || data;
        
        // 更新小程序信息（名称、描述等）
        if (backendConfig) {
          miniprogramInfo.setSystemConfig(backendConfig);
          console.log('✅ 小程序信息已更新:', {
            appName: backendConfig.app_name,
            appDescription: backendConfig.app_description
          });
        }
        console.log('首页：后端系统配置', backendConfig);
        
        // 合并配置：微信版本信息 + 后端配置
        const mergedConfig = Object.assign({}, initialConfig, {
          // 后端配置补充
          app_name: backendConfig.app_name,
          server_status: backendConfig.server_status,
          server_time: backendConfig.server_time,
          // 功能列表：优先使用后端配置
          functions: backendConfig.functions && Array.isArray(backendConfig.functions) 
            ? backendConfig.functions 
            : initialConfig.functions
        });
        
        // 再次合并后端配置，但版本信息仍使用微信官方API获取的
        Object.assign(mergedConfig, backendConfig, {
          version: initialConfig.version,
          appId: initialConfig.appId,
          envVersion: initialConfig.envVersion,
          miniProgramVersion: true
        });
        
        this.setData({ systemConfig: mergedConfig });
        console.log('首页：合并配置完成', mergedConfig);
      },
      (error) => {
        console.log('首页：后端系统配置获取失败，使用基础配置', error);
        // 后端获取失败不影响，已经设置了基础配置
      }
    );
  },

  /**
   * 功能点击处理
   */
  onFunctionTap(e) {
    console.log('🔍 ===== 功能卡片点击事件 =====');
    console.log('📤 事件对象:', e);
    console.log('📤 currentTarget:', e.currentTarget);
    console.log('📤 dataset:', e.currentTarget.dataset);
    
    const { item } = e.currentTarget.dataset;
    
    console.log('📦 点击的功能项:', item);
    console.log('- ID:', item.id);
    console.log('- 名称:', item.name);
    console.log('- URL:', item.url);
    console.log('- permission:', item.permission);
    console.log('- hasPermission:', item.hasPermission);

    // 检查权限
    if (item.permission && !item.hasPermission) {
      console.log('❌ 权限检查失败，显示权限不足提示');
      wx.showModal({
        title: '权限不足',
        content: `您还没有${item.name}的使用权限，请联系管理员或绑定Web账号。`,
        showCancel: true,
        cancelText: '知道了',
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/user/bind/index'
            });
          }
        }
      });
      return;
    }

    console.log('✅ 权限检查通过，准备跳转');
    this.navigateToFunction(item);
  },

  /**
   * 导航到功能页面
   */
  navigateToFunction(item) {
    console.log('🚀 ===== 开始导航 =====');
    console.log('📦 功能项:', item);
    console.log('🎯 目标URL:', item.url);
    
    if (!item.url) {
      console.log('❌ URL为空，无法跳转');
      showError('功能暂未开放');
      return;
    }
    
    // TabBar 页面列表（需要使用 switchTab 跳转）
    const tabBarPages = [
      'pages/home/home',
      'pages/electric/index',
      'pages/attendance/index',
      'pages/usercenter/index'
    ];
    
    // 判断是否为 TabBar 页面
    const isTabBarPage = tabBarPages.some(page => item.url.includes(page));
    
    if (isTabBarPage) {
      console.log('📱 TabBar页面，使用 switchTab 跳转');
      wx.switchTab({
        url: item.url,
        success: () => {
          console.log('✅ TabBar页面跳转成功:', item.url);
        },
        fail: (err) => {
          console.error('❌ TabBar页面跳转失败:', err);
          console.error('- 错误信息:', err.errMsg);
          console.error('- 目标URL:', item.url);
          showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
        }
      });
    } else {
      console.log('📄 普通页面，使用 navigateTo 跳转');
      wx.navigateTo({
        url: item.url,
        success: () => {
          console.log('✅ 页面跳转成功:', item.url);
        },
        fail: (err) => {
          console.error('❌ 页面跳转失败:', err);
          console.error('- 错误信息:', err.errMsg);
          console.error('- 目标URL:', item.url);
          showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
        }
      });
    }
  },

  /**
   * 跳转到个人中心
   */
  goToUserCenter() {
    wx.switchTab({
      url: '/pages/usercenter/index'
    });
  },

  /**
   * 加载公告列表
   */
  loadAnnouncements() {
    this.setData({ announcementsLoading: true });
    
    // ⭐ 修改：只在测试模式使用mock公告，游客模式正常获取
    const isTestMode = wx.getStorageSync('isTestMode');
    
    if (isTestMode) {
      // 测试模式：使用mock公告数据
      console.log('测试模式：使用mock公告数据');
      const mockAnnouncements = [
        {
          id: 'announce_1',
          title: '测试公告',
          content: '这是一个测试模式下的公告内容，用于演示弹窗功能。',
          priority: 1,
          show_popup: true,
          is_active: true,
          create_time: new Date().toISOString()
        },
        {
          id: 'announce_2', 
          title: '系统维护通知',
          content: '系统将于今晚进行例行维护，预计持续2小时。',
          priority: 0,
          show_popup: false,
          is_active: true,
          create_time: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      setTimeout(() => {
        this.setData({
          announcements: mockAnnouncements,
          announcementsLoading: false
        });
        
        // 检查是否有需要弹窗显示的公告
        const popupAnnouncements = mockAnnouncements.filter(item => item.show_popup && item.is_active);
        if (popupAnnouncements.length > 0 && !this._currentPopupId) {
          // 获取最高优先级的弹窗公告
          const selectedAnnouncement = popupAnnouncements.sort((a, b) => b.priority - a.priority)[0];
          
          // 检查是否已经显示过弹窗（防止重复显示）
          const lastShownPopupIds = wx.getStorageSync('lastShownPopupIds') || [];
          const currentPopupId = selectedAnnouncement.id;
          
          if (!lastShownPopupIds.includes(currentPopupId)) {
            // 延迟显示弹窗，确保页面加载完成
            setTimeout(() => {
              this._currentPopupId = currentPopupId;
              this.showAnnouncementPopup(selectedAnnouncement);
              // 记录已显示的弹窗ID
              const updatedIds = lastShownPopupIds.concat([currentPopupId]);
              // 最多保存最近10个弹窗ID
              if (updatedIds.length > 10) {
                updatedIds.shift();
              }
              wx.setStorageSync('lastShownPopupIds', updatedIds);
            }, 500);
          }
        }
      }, 300);
      
      return Promise.resolve(mockAnnouncements);
    }
    
    // 正常模式：调用API获取公告
    return apiCall(
      () => API.announcement.getList(),
      null,
      (data) => {
        const announcements = data.data || [];
        this.setData({
          announcements: announcements,
          announcementsLoading: false
        });
        
        // 检查是否有需要弹窗显示的公告
        const popupAnnouncements = announcements.filter(item => item.show_popup && item.is_active);
        if (popupAnnouncements.length > 0 && !this._currentPopupId) {
          // 获取最高优先级的弹窗公告
          const selectedAnnouncement = popupAnnouncements.sort((a, b) => b.priority - a.priority)[0];
          
          // 检查是否已经显示过弹窗（防止重复显示）
          const lastShownPopupIds = wx.getStorageSync('lastShownPopupIds') || [];
          const currentPopupId = selectedAnnouncement.id;
          
          if (!lastShownPopupIds.includes(currentPopupId)) {
            // 延迟显示弹窗，确保页面加载完成
            setTimeout(() => {
              this._currentPopupId = currentPopupId;
              this.showAnnouncementPopup(selectedAnnouncement);
              // 记录已显示的弹窗ID
              const updatedIds = lastShownPopupIds.concat([currentPopupId]);
              // 最多保存最近10个弹窗ID
              if (updatedIds.length > 10) {
                updatedIds.shift();
              }
              wx.setStorageSync('lastShownPopupIds', updatedIds);
            }, 500);
          }
        }
      },
      (error) => {
        console.error('加载公告失败:', error);
        this.setData({ announcementsLoading: false });
      }
    );
  },

  /**
   * 显示公告弹窗 - 使用 notice-modal 组件
   */
  showAnnouncementPopup(announcement) {
    // 将所有需要弹窗的公告转换为 notice-modal 格式
    const popupAnnouncements = (this.data.announcements || [])
      .filter(item => item.show_popup && item.is_active)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const noticeList = popupAnnouncements.map(item => ({
      id: item.id,
      content: item.content,
      date: (item.create_time || item.created_at || '').substring(0, 10),
      tag: item.title
    }));

    // 如果没有多条，至少显示当前这条
    if (noticeList.length === 0) {
      noticeList.push({
        id: announcement.id,
        content: announcement.content,
        date: (announcement.create_time || announcement.created_at || '').substring(0, 10),
        tag: announcement.title
      });
    }

    this.setData({
      showNoticeModal: true,
      noticeModalList: noticeList
    });
  },

  /**
   * 关闭公告弹窗
   */
  onNoticeModalClose() {
    this.setData({ showNoticeModal: false });
    this._currentPopupId = null;
  },

  /**
   * 查看公告详情 - 使用 notice-modal 组件
   */
  onAnnouncementTap(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      showNoticeModal: true,
      noticeModalList: [{
        id: item.id,
        content: item.content,
        date: (item.create_time || item.created_at || '').substring(0, 10),
        tag: item.title
      }]
    });
  },

  /**
   * 管理公告（管理员功能）
   */
  onManageAnnouncement() {
    // 检查是否是管理员
    if (!this.data.userInfo || !this.data.userInfo.is_admin) {
      showError('权限不足，需要管理员权限');
      return;
    }

    wx.navigateTo({
      url: '/pages/announcement/manage'
    });
  },

  /**
   * ⭐ 新增：跳转到登录页面
   */
  goToLogin() {
    wx.removeStorageSync('isGuestMode');
    wx.redirectTo({
      url: '/pages/login/index'
    });
  }
});
