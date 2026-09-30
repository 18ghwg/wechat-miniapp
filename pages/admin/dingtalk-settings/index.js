const { API, showError, showSuccess } = require('../../../utils/api');

Page({
  data: {
    loading: true,
    saving: false,
    guideVisible: false,
    settings: {
      configured: false,
      is_enabled: false,
      is_verified: false,
      can_sync: false,
      verified_at: '',
      last_error: '',
      has_app_secret: false,
      corp_id: '',
      app_key: '',
      app_secret: '',
      ding_user_id: '',
      api_base: 'https://oapi.dingtalk.com',
      timeout_seconds: 20
    }
  },

  onLoad() {
    if (!this.checkLogin()) return;
    this.setData({ guideVisible: true });
    this.loadSettings();
  },

  onPullDownRefresh() {
    this.loadSettings();
  },

  checkLogin() {
    if (!wx.getStorageSync('openid')) {
      wx.showModal({
        title: '请先登录',
        content: '登录后可配置本人钉钉企业账号',
        showCancel: false,
        success: () => wx.navigateTo({ url: '/pages/login/index' })
      });
      return false;
    }
    return true;
  },

  loadSettings() {
    this.setData({ loading: true });
    API.attendance.getDingtalkSettings()
      .then(res => {
        const settings = Object.assign({}, this.data.settings, res.data || {});
        settings.app_secret = '';
        this.setData({
          settings,
          loading: false
        });
        wx.stopPullDownRefresh();
      })
      .catch(err => {
        showError(err.message || '加载失败');
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      });
  },

  onSwitchChange(e) {
    this.setData({ 'settings.is_enabled': !!e.detail.value });
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    if (!field) return;
    this.setData({ [`settings.${field}`]: e.detail.value });
  },

  onSave() {
    if (this.data.saving) return;
    const settings = this.data.settings;
    if (!settings.corp_id || !settings.app_key || (!settings.app_secret && !settings.has_app_secret) || !settings.ding_user_id) {
      showError('请完整填写企业和本人钉钉身份信息');
      return;
    }

    const timeout = Number(settings.timeout_seconds || 20);
    if (!timeout || timeout < 1 || timeout > 120) {
      showError('超时时间需为 1-120 秒');
      return;
    }
    this.setData({ saving: true });
    const payload = {
      is_enabled: !!settings.is_enabled,
      corp_id: settings.corp_id || '',
      app_key: settings.app_key || '',
      ding_user_id: settings.ding_user_id || '',
      api_base: settings.api_base || 'https://oapi.dingtalk.com',
      timeout_seconds: timeout
    };
    if (settings.app_secret) payload.app_secret = settings.app_secret;

    API.attendance.saveDingtalkSettings(payload)
      .then(res => {
        const nextSettings = Object.assign({}, this.data.settings, res.data || {});
        nextSettings.app_secret = '';
        this.setData({
          settings: nextSettings,
          saving: false
        });
        showSuccess('验证通过');
      })
      .catch(err => {
        this.setData({ saving: false });
        showError(err.message || '保存失败');
      });
  },

  onRefresh() {
    this.loadSettings();
  },

  openGuide() {
    this.setData({ guideVisible: true });
  },

  onOpenOfficialDoc(e) {
    const urls = {
      enterprise: 'https://www.dingtalk.com/',
      corpId: 'https://open.dingtalk.com/document/orgapp/obtain-the-identity-information-of-the-enterprise',
      app: 'https://open.dingtalk.com/document/orgapp/create-an-internal-app',
      credentials: 'https://open.dingtalk.com/document/orgapp/obtain-the-appkey-and-appsecret',
      userId: 'https://open.dingtalk.com/document/orgapp/obtain-the-userid-of-a-user',
      attendance: 'https://open.dingtalk.com/document/orgapp/query-the-punch-records-of-a-user',
      org: 'https://open.dingtalk.com/document/orgapp',
      token: 'https://open.dingtalk.com/document/orgapp/obtain-the-access_token-of-an-internal-app'
    };
    const url = urls[e.currentTarget.dataset.doc];
    if (!url) return;
    wx.setClipboardData({
      data: url,
      success: () => showSuccess('官方文档链接已复制'),
      fail: () => showError('复制失败，请稍后重试')
    });
  },

  closeGuide() {
    this.setData({ guideVisible: false });
  },

  preventTouchMove() {
    return false;
  }
});
