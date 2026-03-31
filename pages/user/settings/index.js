// 用户设置页面 - 马卡龙风格
// 需求 7.1, 7.2, 7.3: 设置页面转换为分组的 cartoon-card 列表样式
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 设置项
    settings: {
      pushNotification: true,
      notificationSound: true,
      themeIndex: 0,
      fontSizeIndex: 1,
      dataSharing: false
    },
    
    // 主题选项
    themeOptions: ['跟随系统', '浅色模式', '深色模式'],
    tempThemeIndex: 0,
    showThemePicker: false,
    
    // 字体大小选项
    fontSizeOptions: ['小', '标准', '大', '超大'],
    fontSizePreview: [24, 28, 32, 36],
    tempFontSizeIndex: 1,
    showFontSizePicker: false,
    
    // 版本信息
    appVersion: '1.0.0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadSettings();
    this.getAppVersion();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时重新加载设置
    this.loadSettings();
  },

  /**
   * 加载设置
   */
  loadSettings() {
    try {
      const savedSettings = wx.getStorageSync('userSettings');
      if (savedSettings) {
        this.setData({
          settings: { ...this.data.settings, ...savedSettings }
        });
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  },

  /**
   * 保存设置
   */
  saveSettings() {
    try {
      wx.setStorageSync('userSettings', this.data.settings);
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  },

  /**
   * 获取应用版本
   */
  getAppVersion() {
    const accountInfo = wx.getAccountInfoSync();
    const version = accountInfo.miniProgram.version || '开发版';
    this.setData({ appVersion: version });
  },

  /**
   * 推送通知开关变化
   */
  onPushNotificationChange(e) {
    const value = e.detail.value;
    const newSettings = { ...this.data.settings, pushNotification: value };
    
    // 如果关闭推送通知，同时关闭通知声音
    if (!value) {
      newSettings.notificationSound = false;
    }
    
    this.setData({ settings: newSettings });
    this.saveSettings();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: value ? '已开启推送通知' : '已关闭推送通知',
      theme: 'success',
      direction: 'column'
    });
  },

  /**
   * 通知声音开关变化
   */
  onNotificationSoundChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.notificationSound': value
    });
    this.saveSettings();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: value ? '已开启通知声音' : '已关闭通知声音',
      theme: 'success',
      direction: 'column'
    });
  },

  /**
   * 数据共享开关变化
   */
  onDataSharingChange(e) {
    const value = e.detail.value;
    this.setData({
      'settings.dataSharing': value
    });
    this.saveSettings();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: value ? '已开启数据共享' : '已关闭数据共享',
      theme: 'success',
      direction: 'column'
    });
  },

  /**
   * 打开主题选择器
   */
  onThemePickerTap() {
    this.setData({
      showThemePicker: true,
      tempThemeIndex: this.data.settings.themeIndex
    });
  },

  /**
   * 关闭主题选择器
   */
  closeThemePicker() {
    this.setData({ showThemePicker: false });
  },

  /**
   * 选择主题
   */
  onThemeSelect(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ tempThemeIndex: index });
  },

  /**
   * 确认主题选择
   */
  confirmTheme() {
    const index = this.data.tempThemeIndex;
    this.setData({
      'settings.themeIndex': index,
      showThemePicker: false
    });
    this.saveSettings();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: `已切换为${this.data.themeOptions[index]}`,
      theme: 'success',
      direction: 'column'
    });
  },

  /**
   * 打开字体大小选择器
   */
  onFontSizePickerTap() {
    this.setData({
      showFontSizePicker: true,
      tempFontSizeIndex: this.data.settings.fontSizeIndex
    });
  },

  /**
   * 关闭字体大小选择器
   */
  closeFontSizePicker() {
    this.setData({ showFontSizePicker: false });
  },

  /**
   * 选择字体大小
   */
  onFontSizeSelect(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ tempFontSizeIndex: index });
  },

  /**
   * 确认字体大小选择
   */
  confirmFontSize() {
    const index = this.data.tempFontSizeIndex;
    this.setData({
      'settings.fontSizeIndex': index,
      showFontSizePicker: false
    });
    this.saveSettings();
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: `字体大小已设为${this.data.fontSizeOptions[index]}`,
      theme: 'success',
      direction: 'column'
    });
  },

  /**
   * 跳转到反馈页面
   */
  onFeedbackTap() {
    wx.navigateTo({
      url: '/pages/feedback/index',
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '反馈页面暂未开放',
          theme: 'warning',
          direction: 'column'
        });
      }
    });
  },

  /**
   * 跳转到隐私政策页面
   */
  onPrivacyTap() {
    wx.navigateTo({
      url: '/pages/privacy/index',
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '隐私政策页面暂未开放',
          theme: 'warning',
          direction: 'column'
        });
      }
    });
  },

  /**
   * 跳转到服务条款页面
   */
  onTermsTap() {
    wx.navigateTo({
      url: '/pages/terms/index',
      fail: () => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '服务条款页面暂未开放',
          theme: 'warning',
          direction: 'column'
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadSettings();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '用户设置',
      path: '/pages/user/settings/index'
    };
  }
});
