// pages/admin/df-notification-settings/index.js
const { API, request, apiCall, showError, showSuccess } = require('../../../utils/api');
const { getEnvironmentInfo } = require('../../../utils/environment');

Page({
  data: {
    loading: true,
    settings: {
      is_enabled: true,
      send_basic_info: true,
      send_balance_info: true,
      send_power_stats: true,
      send_year_time_power: true,
      send_month_time_power: true,
      send_recent_5days: true,
      send_recent_3months: true,
      send_stats_info: true,
      send_monthly_chart: false,  // Source: 月用电量图表默认关闭
      send_daily_chart: false,    // Source: 日用电量图表默认关闭
      billing_mode: 'current_month',  // Source: 电费统计模式，默认当月实时统计
      send_arrears_alert: false,  // Source: 欠费通知默认关闭
      arrears_alert_target: ''    // Source: 欠费通知对象默认为空
    },
    // Source: 统计模式选项列表
    billingModeOptions: [
      { value: 'current_month', label: '当月实时统计', desc: '查询N月时，直接使用N月记录的数据' },
      { value: 'previous_month', label: '上月统计模式', desc: '查询N月时，使用N+1月记录中的最大值（适用于数据延迟地区）' }
    ],
    testMode: false,
    isAdmin: false
  },

  onLoad() {
    // 记录功能使用
    const featureUsage = require('../../../utils/feature-usage');
    featureUsage.recordFeatureUsage('df-notification', '电费通知设置', '⚡');
    
    this.checkPermission();
    this.loadSettings();
  },

  onShow() {
    // 每次显示页面时重新检查权限
    this.checkPermission();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新 - 重新加载设置');
    this.loadSettings();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 检查用户权限
  checkPermission() {
    // 使用与用户中心一致的用户信息获取方式
    const userInfo = wx.getStorageSync('userInfo');
    console.log('🔍 电费通知设置 - 权限检查:', userInfo);
    
    if (!userInfo) {
      console.log('❌ 未获取到用户信息');
      wx.showModal({
        title: '权限不足',
        content: '请先登录',
        showCancel: false,
        success: () => {
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
        content: '只有管理员才能访问电费通知设置',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return false;
    }
    
    console.log('✅ 权限检查通过');
    return true;
  },

  // 判断是否为管理员（与用户中心保持一致）
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

  // 加载电费通知设置
  loadSettings() {
    if (!this.checkPermission()) {
      return;
    }

    this.setData({ loading: true });

    // ✅ 使用API封装，自动添加签名
    API.dfNotification.getSettings()
      .then((data) => {
        console.log('获取电费通知设置成功:', data);
        
        this.setData({
          settings: data.data || this.data.settings,
          testMode: data.test_mode || false,
          loading: false
        });
      })
      .catch((err) => {
        console.error('获取电费通知设置失败:', err);
        showError(err.message || '获取设置失败');
        this.setData({ loading: false });
      });
  },

  // 开关总控制
  onMainSwitchChange(e) {
    const enabled = e.detail.value;
    this.setData({
      'settings.is_enabled': enabled
    });
    
    // 如果关闭主开关，也关闭所有子开关
    if (!enabled) {
      this.setData({
        'settings.send_basic_info': false,
        'settings.send_balance_info': false,
        'settings.send_power_stats': false,
        'settings.send_year_time_power': false,
        'settings.send_month_time_power': false,
        'settings.send_recent_5days': false,
        'settings.send_recent_3months': false,
        'settings.send_stats_info': false
      });
    }
  },

  // 子开关变更
  onSubSwitchChange(e) {
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

  // Source: 统计模式切换（单选框）
  onBillingModeChange(e) {
    const mode = e.detail.value;
    console.log('切换电费统计模式:', mode);
    
    this.setData({
      'settings.billing_mode': mode
    });
    
    // 显示提示
    const modeLabel = this.data.billingModeOptions.find(opt => opt.value === mode)?.label || mode;
    wx.showToast({
      title: `已切换至${modeLabel}`,
      icon: 'none',
      duration: 2000
    });
  },

  // Source: 欠费通知对象输入处理
  onTargetInput(e) {
    const value = e.detail.value;
    console.log('输入欠费通知对象:', value);
    
    this.setData({
      'settings.arrears_alert_target': value
    });
  },

  // 保存设置
  saveSettings() {
    if (!this.checkPermission()) {
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    console.log('保存电费通知设置:', this.data.settings);

    // ✅ 使用API封装，自动添加签名
    API.dfNotification.saveSettings(this.data.settings)
      .then((data) => {
        wx.hideLoading();
        console.log('保存电费通知设置成功:', data);
        
        const message = data.test_mode ? 
          '设置保存成功（测试模式）' : '设置保存成功';
        
        showSuccess(message);
        
        // 更新测试模式状态
        this.setData({
          testMode: data.test_mode || false
        });
      })
      .catch((err) => {
        wx.hideLoading();
        console.error('保存电费通知设置失败:', err);
        showError(err.message || '保存失败');
      });
  },

  // 重置设置
  resetSettings() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置为默认设置吗？所有更改将丢失。',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            settings: {
              is_enabled: true,
              send_basic_info: true,
              send_balance_info: true,
              send_power_stats: true,
              send_year_time_power: true,
              send_month_time_power: true,
              send_recent_5days: true,
              send_recent_3months: true,
              send_stats_info: true,
              send_monthly_chart: false,  // Source: 月用电量图表默认关闭
              send_daily_chart: false,    // Source: 日用电量图表默认关闭
              billing_mode: 'current_month'  // Source: 电费统计模式默认为当月实时统计
            }
          });
          
          showSuccess('已重置为默认设置');
        }
      }
    });
  },

  // 全部开启
  enableAll() {
    this.setData({
      'settings.is_enabled': true,
      'settings.send_basic_info': true,
      'settings.send_balance_info': true,
      'settings.send_power_stats': true,
      'settings.send_year_time_power': true,
      'settings.send_month_time_power': true,
      'settings.send_recent_5days': true,
      'settings.send_recent_3months': true,
      'settings.send_stats_info': true
    });
    
          showSuccess('已全部开启');
  },

  // 全部关闭
  disableAll() {
    wx.showModal({
      title: '确认关闭',
      content: '确定要关闭所有电费通知吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            'settings.is_enabled': false,
            'settings.send_basic_info': false,
            'settings.send_balance_info': false,
            'settings.send_power_stats': false,
            'settings.send_year_time_power': false,
            'settings.send_month_time_power': false,
            'settings.send_recent_5days': false,
            'settings.send_recent_3months': false,
            'settings.send_stats_info': false
          });
          
          showSuccess('已全部关闭');
        }
      }
    });
  },

  // 显示帮助信息
  showHelp() {
    wx.showModal({
      title: '功能说明',
      content: `电费通知设置用于控制查电费任务发送哪些类型的微信群消息：

• 基本信息：户号、户主、地址等
• 账户余额：当前余额、年度电费等
• 用电量统计：年度、月度用电量
• 年度分时用电：峰谷平尖时段
• 当月分时用电：当月各时段用电
• 最近5天详情：每日用电明细
• 最近3个月详情：月度电费账单
• 数据统计：各类记录条数

关闭对应开关后，查电费时将不发送该类型的消息。`,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
