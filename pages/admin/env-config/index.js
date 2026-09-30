const { API, showError, showSuccess } = require('../../../utils/api');

Page({
  data: {
    groups: [],       // [{group, items: [{key, label, hint, value, editing, editValue}]}]
    loading: true,
    saving: false,
    isAdmin: false,
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = !!(userInfo && (userInfo.is_admin || userInfo.user_level === 'admin'));
    if (!isAdmin) {
      showError('权限不足');
      wx.navigateBack();
      return;
    }
    this.setData({ isAdmin });
    this.loadConfig();
  },

  loadConfig() {
    this.setData({ loading: true });
    API.admin.getEnvConfig()
      .then(res => {
        const groups = (res.data.groups || []).map(g => ({
          group: g.group,
          items: g.items.map(item => ({
            key: item.key,
            label: item.label || item.key,
            hint: item.hint || '',
            value: item.value,
            editing: false,
            editValue: item.value,
          }))
        }));
        this.setData({ groups, loading: false });
      })
      .catch(err => {
        showError(err.message || '加载失败');
        this.setData({ loading: false });
      });
  },

  // 点击某一项进入编辑
  onEditItem(e) {
    const { groupIndex, itemIndex } = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    const group = this.data.groups[groupIndex];
    const item = group && Array.isArray(group.items) ? group.items[itemIndex] : null;
    if (!item) return;
    const key = `groups[${groupIndex}].items[${itemIndex}].editing`;
    const valKey = `groups[${groupIndex}].items[${itemIndex}].editValue`;
    const current = item.value;
    this.setData({ [key]: true, [valKey]: current });
  },

  // 输入框变化
  onInputChange(e) {
    const { groupIndex, itemIndex } = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    const group = this.data.groups[groupIndex];
    const item = group && Array.isArray(group.items) ? group.items[itemIndex] : null;
    if (!item) return;
    const key = `groups[${groupIndex}].items[${itemIndex}].editValue`;
    this.setData({ [key]: e && e.detail ? e.detail.value : '' });
  },

  // 取消编辑
  onCancelEdit(e) {
    const { groupIndex, itemIndex } = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    const group = this.data.groups[groupIndex];
    const item = group && Array.isArray(group.items) ? group.items[itemIndex] : null;
    if (!item) return;
    this.setData({
      [`groups[${groupIndex}].items[${itemIndex}].editing`]: false,
      [`groups[${groupIndex}].items[${itemIndex}].editValue`]: item.value,
    });
  },

  // 保存单项
  onSaveItem(e) {
    const { groupIndex, itemIndex } = e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    const group = this.data.groups[groupIndex];
    const item = group && Array.isArray(group.items) ? group.items[itemIndex] : null;
    if (!item) return;
    const newValue = item.editValue;

    if (newValue === item.value) {
      this.setData({ [`groups[${groupIndex}].items[${itemIndex}].editing`]: false });
      return;
    }

    this.setData({ saving: true });
    API.admin.updateEnvConfig({ [item.key]: newValue })
      .then(() => {
        this.setData({
          [`groups[${groupIndex}].items[${itemIndex}].value`]: newValue,
          [`groups[${groupIndex}].items[${itemIndex}].editing`]: false,
          saving: false,
        });
        showSuccess('已保存，热更新生效');
      })
      .catch(err => {
        showError(err.message || '保存失败');
        this.setData({ saving: false });
      });
  },

  onRefresh() {
    this.loadConfig();
  },
});
