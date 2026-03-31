// 天气设置 - 统一入口页面
const { showError } = require('../../../utils/api');

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    
    // 设置项列表
    settingItems: [
      {
        id: 'notification',
        title: '天气通知设置',
        iconPath: '/assets/icons/bell.png',
        desc: '设置天气预报和预警通知开关',
        path: '/pages/admin/weather-notification-settings/index'
      },
      {
        id: 'severity',
        title: '天气严重程度',
        iconPath: '/assets/icons/settings.png',
        desc: '自定义各种天气的严重程度',
        path: '/pages/admin/weather-severity-settings/index'
      }
    ]
  },

  onLoad() {
    console.log('🔍 天气设置 - 页面加载');
    
    // 记录功能使用
    const featureUsage = require('../../../utils/feature-usage');
    featureUsage.recordFeatureUsage('weather-settings', '天气设置', '🌤️');
    
    this.checkPermission();
  },

  onShow() {
    // 每次显示页面时重新检查权限
    this.checkPermission();
  },

  // 检查用户权限
  checkPermission() {
    // 使用与用户中心一致的用户信息获取方式
    const userInfo = wx.getStorageSync('userInfo');
    console.log('🔍 天气设置 - 权限检查:', userInfo);
    
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
      userInfo: userInfo,
      isAdmin: isAdmin
    });

    if (!isAdmin) {
      console.log('❌ 非管理员用户，权限不足');
      wx.showModal({
        title: '权限不足',
        content: '只有管理员才能访问天气设置',
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
    
    // 方法1：检查 is_admin 字段（Web绑定用户）
    if (userInfo.is_admin === true || userInfo.is_admin === 1) {
      return true;
    }
    
    // 方法2：检查 user_level 字段（小程序用户）
    if (userInfo.user_level === 'admin' || userInfo.user_level === 'Admin' || userInfo.user_level === 'ADMIN') {
      return true;
    }
    
    // 方法3：检查 user_level 数值（兼容旧版本）
    if (typeof userInfo.user_level === 'number' && userInfo.user_level >= 10) {
      return true;
    }
    
    return false;
  },

  // 导航到设置页面
  goToSetting(e) {
    const item = e.currentTarget.dataset.item;
    console.log('🎯 导航到设置页面:', item.title);
    
    wx.navigateTo({
      url: item.path,
      success: () => {
        console.log('✅ 页面跳转成功');
      },
      fail: (err) => {
        console.error('❌ 页面跳转失败:', err);
        showError(`页面跳转失败: ${err.errMsg || '未知错误'}`);
      }
    });
  }
});
