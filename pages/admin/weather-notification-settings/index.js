// pages/admin/weather-notification-settings/index.js
const { API, request, apiCall, showError, showSuccess } = require('../../../utils/api');
const { getEnvironmentInfo } = require('../../../utils/environment');

Page({
  data: {
    loading: true,
    settings: {
      is_enabled: true,
      send_today_weather: true,
      send_8hour_forecast: true,
      send_daily_forecast: true,
      enable_weather_alert: true,
      enable_official_warning: true,  // 官方天气灾害预警开关
      alert_severity_threshold: 2,
      enable_night_quiet_mode: true,
      quiet_hours_buffer: 30,
      send_morning_summary: true,
      extreme_weather_threshold: 4,
      location_id: null,  // 地区ID
      location_name: null  // 地区名称
    },
    testMode: false,
    isAdmin: false,
    // 严重程度选项
    severityOptions: [
      { value: 1, label: '1级-轻度' },
      { value: 2, label: '2级-一般' },
      { value: 3, label: '3级-较重' },
      { value: 4, label: '4级-严重' },
      { value: 5, label: '5级-极严重' }
    ],
    severityIndex: 1, // 默认2级
    extremeIndex: 3, // 默认4级
    
    // 地区搜索
    locationSearchInput: '',  // 搜索输入框
    locationSearchResults: [],  // 搜索结果列表
    showLocationResults: false,  // 是否显示搜索结果
    searchingLocation: false,  // 是否正在搜索
    searchTimer: null  // 搜索防抖定时器
  },

  onLoad: function() {
    this.checkPermission();
    this.loadSettings();
  },

  onShow: function() {
    // 每次显示页面时重新检查权限
    this.checkPermission();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    console.log('下拉刷新 - 重新加载设置');
    this.loadSettings();
    setTimeout(function() {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 检查用户权限
  checkPermission: function() {
    // 使用与用户中心一致的用户信息获取方式
    const userInfo = wx.getStorageSync('userInfo');
    console.log('🔍 天气通知设置 - 权限检查:', userInfo);
    
    if (!userInfo) {
      console.log('❌ 未获取到用户信息');
      wx.showModal({
        title: '权限不足',
        content: '请先登录',
        showCancel: false,
        success: function() {
          wx.reLaunch({ url: '/pages/login/index' });
        }
      });
      return false;
    }
    
    // 使用与用户中心一致的管理员判断逻辑
    const isAdmin = this.isAdminUser(userInfo);
    console.log('🔍 管理员权限检查结果:', isAdmin);
    
    this.setData({
      isAdmin: isAdmin
    });

    if (!isAdmin) {
      console.log('❌ 非管理员用户，权限不足');
      wx.showModal({
        title: '权限不足',
        content: '只有管理员才能访问天气通知设置',
        showCancel: false,
        success: function() {
          wx.navigateBack();
        }
      });
      return false;
    }
    
    console.log('✅ 权限检查通过');
    return true;
  },

  // 判断是否为管理员（与用户中心保持一致）
  isAdminUser: function(userInfo) {
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
      return userInfo.permissions.some(function(perm) {
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

  // 加载天气通知设置
  loadSettings: function() {
    if (!this.checkPermission()) {
      return;
    }

    var that = this;
    this.setData({ loading: true });

    // ✅ 使用API封装，自动添加签名
    API.weatherNotification.getSettings()
      .then(function(data) {
        console.log('获取天气通知设置成功:', data);
        
        const settings = data.data || that.data.settings;
        
        // 更新picker索引
        const severityIndex = (settings.alert_severity_threshold || 2) - 1;
        const extremeIndex = (settings.extreme_weather_threshold || 4) - 1;
        
        // 设置地区搜索输入框
        let locationSearchInput = '';
        if (settings.location_name) {
          locationSearchInput = settings.location_name;
        }
        
        that.setData({
          settings: settings,
          testMode: data.test_mode || false,
          loading: false,
          severityIndex: severityIndex,
          extremeIndex: extremeIndex,
          locationSearchInput: locationSearchInput
        });
      })
      .catch(function(err) {
        console.error('获取天气通知设置失败:', err);
        showError(err.message || '获取设置失败');
        that.setData({ loading: false });
      });
  },

  // 开关总控制
  onMainSwitchChange: function(e) {
    const enabled = e.detail.value;
    this.setData({
      'settings.is_enabled': enabled
    });
    
    // 如果关闭主开关，也关闭所有子开关
    if (!enabled) {
      this.setData({
        'settings.send_today_weather': false,
        'settings.send_8hour_forecast': false,
        'settings.send_daily_forecast': false,
        'settings.enable_weather_alert': false,
        'settings.enable_official_warning': false,  // 同时关闭官方预警
        'settings.enable_night_quiet_mode': false,
        'settings.send_morning_summary': false
      });
    }
  },

  // 子开关变更
  onSubSwitchChange: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`settings.${field}`]: value
    });

    // 如果开启任何子开关，自动开启主开关
    if (value && !this.data.settings.is_enabled) {
      this.setData({
        'settings.is_enabled': true
      });
    }
  },

  // 预警严重程度选择
  onSeverityChange: function(e) {
    const index = e.detail.value;
    const value = this.data.severityOptions[index].value;
    this.setData({
      severityIndex: index,
      'settings.alert_severity_threshold': value
    });
  },

  // 极端天气阈值选择
  onExtremeChange: function(e) {
    const index = e.detail.value;
    const value = this.data.severityOptions[index].value;
    this.setData({
      extremeIndex: index,
      'settings.extreme_weather_threshold': value
    });
  },

  // 缓冲时间输入
  onBufferTimeInput: function(e) {
    let value = parseInt(e.detail.value);
    
    // 验证范围
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 120) {
      value = 120;
    }
    
    this.setData({
      'settings.quiet_hours_buffer': value
    });
  },

  // 地区搜索输入
  onLocationInput: function(e) {
    var that = this;
    const query = e.detail.value.trim();
    
    this.setData({
      locationSearchInput: query
    });
    
    // 如果输入为空，清空搜索结果
    if (!query) {
      this.setData({
        showLocationResults: false,
        locationSearchResults: []
      });
      return;
    }
    
    // 防抖搜索
    if (this.data.searchTimer) {
      clearTimeout(this.data.searchTimer);
    }
    
    const timer = setTimeout(function() {
      that.searchLocation(query);
    }, 500);  // 500ms 防抖
    
    this.setData({
      searchTimer: timer
    });
  },

  // 搜索地区
  searchLocation: function(query) {
    var that = this;
    
    if (!query || query.length < 1) {
      return;
    }
    
    this.setData({
      searchingLocation: true
    });
    
    // ✅ 使用API封装，自动添加签名
    API.location.searchCity(query, 10)
      .then(function(data) {
        console.log('城市搜索结果:', data);
        
        that.setData({
          locationSearchResults: data.data || [],
          showLocationResults: true,
          searchingLocation: false
        });
      })
      .catch(function(err) {
        console.error('城市搜索失败:', err);
        that.setData({
          locationSearchResults: [],
          showLocationResults: false,
          searchingLocation: false
        });
      });
  },

  // 选择地区
  onLocationSelect: function(e) {
    const index = e.currentTarget.dataset.index;
    const location = this.data.locationSearchResults[index];
    
    console.log('选择地区:', location);
    
    this.setData({
      locationSearchInput: location.name,
      'settings.location_id': location.id,
      'settings.location_name': location.name,
      showLocationResults: false,
      locationSearchResults: []
    });
  },

  // 输入框获得焦点
  onLocationFocus: function() {
    console.log('输入框获得焦点');
    // 如果有搜索结果，显示
    if (this.data.locationSearchResults.length > 0) {
      this.setData({
        showLocationResults: true
      });
    }
  },

  // 输入框失去焦点
  onLocationBlur: function() {
    var that = this;
    console.log('输入框失去焦点');
    // 延迟隐藏，让点击事件能够触发
    setTimeout(function() {
      that.setData({
        showLocationResults: false
      });
    }, 200);
  },

  // 保存设置
  saveSettings: function() {
    if (!this.checkPermission()) {
      return;
    }

    var that = this;
    wx.showLoading({ title: '保存中...', mask: true });

    console.log('保存天气通知设置:', this.data.settings);

    // ✅ 使用API封装，自动添加签名
    API.weatherNotification.saveSettings(this.data.settings)
      .then(function(data) {
        console.log('保存天气通知设置成功:', data);
        wx.hideLoading();
        
        const message = that.data.testMode 
          ? '设置保存成功（测试模式）' 
          : data.message || '设置保存成功';
        
        showSuccess(message);
        
        // 刷新设置
        setTimeout(function() {
          that.loadSettings();
        }, 500);
      })
      .catch(function(err) {
        console.error('保存失败:', err);
        wx.hideLoading();
        showError(err.message || '保存失败');
      });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});
