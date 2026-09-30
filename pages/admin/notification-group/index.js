const { API, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const { environmentManager } = require('../../../utils/environment');
const featureUsage = require('../../../utils/feature-usage');

const FEISHU_KEYS = [
  'FEISHU_TASK_NOTIFY_ENABLED',
  'FEISHU_APP_ID',
  'FEISHU_APP_SECRET',
  'FEISHU_TASK_NOTIFY_OPEN_IDS',
  'FEISHU_TASK_NOTIFY_TIMEOUT',
  'FEISHU_TASK_NOTIFY_FORMAT'
];

const FEISHU_GROUP_NAME = '飞书任务通知';

const FIELD_META = {
  FEISHU_TASK_NOTIFY_ENABLED: {
    label: '启用飞书私聊通知',
    hint: '开启后，工资统计、任务通知等将通过飞书智能体私聊发送。'
  },
  FEISHU_APP_ID: {
    label: '飞书 App ID',
    hint: '飞书开放平台应用的 App ID。'
  },
  FEISHU_APP_SECRET: {
    label: '飞书 App Secret',
    hint: '飞书开放平台应用的 App Secret。'
  },
  FEISHU_TASK_NOTIFY_OPEN_IDS: {
    label: '接收人 open_id',
    hint: '多个 open_id 请用英文逗号分隔。'
  },
  FEISHU_TASK_NOTIFY_TIMEOUT: {
    label: '请求超时（秒）',
    hint: '飞书接口调用超时时间，默认 15 秒。'
  },
  FEISHU_TASK_NOTIFY_FORMAT: {
    label: '消息格式',
    hint: '推荐使用 markdown，内容更易读。'
  }
};

const DEFAULT_FIELDS = FEISHU_KEYS.reduce((acc, key) => {
  acc[key] = '';
  return acc;
}, {});

Page({
  data: {
    loading: false,
    saving: false,
    syncingCli: false,
    testingNotify: false,
    testMode: false,
    isAdmin: false,
    settings: [],
    hasFeishuGroup: false,
    summary: {
      enabled: false,
      openIdCount: 0,
      formatLabel: 'markdown'
    },
    formData: {
      ...DEFAULT_FIELDS
    },
    formatOptions: [
      { value: 'markdown', label: 'Markdown' },
      { value: 'text', label: '纯文本' }
    ],
    formatIndex: 0
  },

  onLoad() {
    console.log('飞书通知设置页面加载');
    featureUsage.recordFeatureUsage('notification-group', '飞书通知管理', 'feishu');

    if (!this.checkPermission()) {
      return;
    }

    environmentManager.forceRefresh();
    this.debugEnvironment();
    this.loadSettings();
    testModeManager.setupPageHotReload(this, () => {
      console.log('飞书通知设置页面-测试模式热加载');
      this.loadSettings();
    });
  },

  onShow() {
    this.checkPermission();
  },

  onPullDownRefresh() {
    this.loadSettings();
  },

  checkPermission() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      showError('请先登录');
      wx.reLaunch({ url: '/pages/login/index' });
      return false;
    }

    const isAdmin = this.isAdminUser(userInfo);
    this.setData({ isAdmin });

    if (!isAdmin) {
      showError('权限不足，需要管理员权限');
      wx.navigateBack({ delta: 1 });
      return false;
    }

    return true;
  },

  isAdminUser(userInfo) {
    if (!userInfo) return false;
    if (userInfo.is_admin) return true;
    if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') return true;
    if (Array.isArray(userInfo.permissions)) {
      return userInfo.permissions.some(perm => {
        if (!perm) return false;
        if (typeof perm === 'string') return perm.toLowerCase() === 'admin';
        const code = perm.code || perm.permission_code;
        return code && String(code).toLowerCase() === 'admin';
      });
    }
    return false;
  },

  debugEnvironment() {
    const envInfo = environmentManager.getEnvironmentInfo();
    console.log('🔧 飞书通知设置页面 - 环境信息:', envInfo);
  },

  async loadSettings() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const res = await API.admin.getEnvConfig();
      const groups = Array.isArray(res.data && res.data.groups) ? res.data.groups : [];
      const feishuGroup = groups.find(group => group.group === FEISHU_GROUP_NAME) || { group: FEISHU_GROUP_NAME, items: [] };
      const normalizedItems = FEISHU_KEYS.map(key => {
        const item = (feishuGroup.items || []).find(cfg => cfg.key === key) || {};
        return {
          key,
          label: FIELD_META[key].label,
          hint: FIELD_META[key].hint,
          value: item.value || '',
          editing: false,
          editValue: item.value || ''
        };
      });

      const formData = { ...DEFAULT_FIELDS };
      normalizedItems.forEach(item => {
        formData[item.key] = item.value || '';
      });

      const enabled = this.toBoolean(formData.FEISHU_TASK_NOTIFY_ENABLED);
      const openIds = this.parseOpenIds(formData.FEISHU_TASK_NOTIFY_OPEN_IDS);
      const format = (formData.FEISHU_TASK_NOTIFY_FORMAT || 'markdown').toLowerCase();
      const formatIndex = Math.max(0, this.data.formatOptions.findIndex(opt => opt.value === format));

      this.setData({
        settings: normalizedItems,
        hasFeishuGroup: true,
        formData,
        testMode: res.test_mode || false,
        loading: false,
        formatIndex: formatIndex >= 0 ? formatIndex : 0,
        summary: {
          enabled,
          openIdCount: openIds.length,
          formatLabel: format === 'text' ? '纯文本' : 'Markdown'
        }
      });
    } catch (err) {
      console.error('加载飞书通知设置失败:', err);
      showError(err.message || '加载设置失败');
      this.setData({ loading: false });
    } finally {
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  toBoolean(value) {
    return ['true', '1', 'yes', 'on'].includes(String(value).trim().toLowerCase());
  },

  parseOpenIds(value) {
    return String(value || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  },

  onToggleEnabled(e) {
    const enabled = !!e.detail.value;
    this.setData({
      'formData.FEISHU_TASK_NOTIFY_ENABLED': enabled ? 'true' : 'false',
      summary: Object.assign({}, this.data.summary, { enabled })
    });
  },

  onFieldInput(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    this.setData({
      [`formData.${key}`]: e.detail.value
    });

    if (key === 'FEISHU_TASK_NOTIFY_OPEN_IDS') {
      const openIds = this.parseOpenIds(e.detail.value);
      this.setData({ summary: Object.assign({}, this.data.summary, { openIdCount: openIds.length }) });
    }
  },

  onFormatChange(e) {
    const index = Number(e.detail.value);
    const option = this.data.formatOptions[index];
    if (!option) return;
    this.setData({
      formatIndex: index,
      'formData.FEISHU_TASK_NOTIFY_FORMAT': option.value,
      summary: Object.assign({}, this.data.summary, { formatLabel: option.label })
    });
  },

  validateForm() {
    const { formData } = this.data;
    const timeout = Number(formData.FEISHU_TASK_NOTIFY_TIMEOUT || 15);
    const enabled = this.toBoolean(formData.FEISHU_TASK_NOTIFY_ENABLED);
    if (!Number.isFinite(timeout) || timeout <= 0) return '超时时间必须大于 0';
    if (!enabled) return '';
    if (!formData.FEISHU_APP_ID.trim()) return '请输入飞书 App ID';
    if (!formData.FEISHU_APP_SECRET.trim()) return '请输入飞书 App Secret';
    if (!formData.FEISHU_TASK_NOTIFY_OPEN_IDS.trim()) return '请输入接收人 open_id';
    return '';
  },

  async saveSettings() {
    if (!this.checkPermission()) return;
    const error = this.validateForm();
    if (error) {
      showError(error);
      return;
    }

    this.setData({ saving: true });
    wx.showLoading({ title: '保存中...', mask: true });

    try {
      const payload = {
        FEISHU_TASK_NOTIFY_ENABLED: this.data.formData.FEISHU_TASK_NOTIFY_ENABLED || 'false',
        FEISHU_APP_ID: this.data.formData.FEISHU_APP_ID.trim(),
        FEISHU_APP_SECRET: this.data.formData.FEISHU_APP_SECRET.trim(),
        FEISHU_TASK_NOTIFY_OPEN_IDS: this.data.formData.FEISHU_TASK_NOTIFY_OPEN_IDS.trim(),
        FEISHU_TASK_NOTIFY_TIMEOUT: String(Number(this.data.formData.FEISHU_TASK_NOTIFY_TIMEOUT || 15)),
        FEISHU_TASK_NOTIFY_FORMAT: this.data.formData.FEISHU_TASK_NOTIFY_FORMAT || 'markdown'
      };

      const res = await API.admin.updateEnvConfig(payload);
      showSuccess((res && res.msg) || '保存成功，已热更新');
      this.loadSettings();
    } catch (err) {
      console.error('保存飞书通知设置失败:', err);
      showError(err.message || '保存失败');
    } finally {
      wx.hideLoading();
      this.setData({ saving: false });
    }
  },

  async syncFromCli() {
    if (!this.checkPermission() || this.data.syncingCli) return;

    this.setData({ syncingCli: true });
    wx.showLoading({ title: '同步中...', mask: true });

    try {
      const res = await API.admin.syncFeishuConfigFromCli();
      const data = res.data || {};
      let message = res.msg || '已从飞书 CLI 同步';
      if (data.open_id) {
        message = `${message}：${data.user_name || data.open_id}`;
      }
      showSuccess(message);
      this.loadSettings();
    } catch (err) {
      console.error('同步飞书 CLI 配置失败:', err);
      showError(err.message || '同步失败');
    } finally {
      wx.hideLoading();
      this.setData({ syncingCli: false });
    }
  },

  async sendTestNotification() {
    if (!this.checkPermission() || this.data.testingNotify) return;

    const error = this.validateForm();
    if (error) {
      showError(error);
      return;
    }

    this.setData({ testingNotify: true });
    wx.showLoading({ title: '发送中...', mask: true });

    try {
      const res = await API.admin.testFeishuNotification();
      showSuccess((res && res.msg) || '测试通知已发送');
    } catch (err) {
      console.error('发送飞书测试通知失败:', err);
      showError(err.message || '发送失败');
    } finally {
      wx.hideLoading();
      this.setData({ testingNotify: false });
    }
  },

  async resetSettings() {
    wx.showModal({
      title: '恢复默认',
      content: '将把本页的飞书通知配置清空为默认值，确定继续吗？',
      success: async res => {
        if (!res.confirm) return;
        this.setData({
          formData: Object.assign({}, DEFAULT_FIELDS),
          formatIndex: 0,
          summary: {
            enabled: false,
            openIdCount: 0,
            formatLabel: 'Markdown'
          }
        });
      }
    });
  }
});
