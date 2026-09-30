const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const featureUsage = require('../../utils/feature-usage');

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMonth(date) {
  return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`;
}

function buildMonthOptions() {
  const now = new Date();
  const options = [];
  for (let i = 0; i < 5; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: formatMonth(date),
      year: date.getFullYear(),
      month: date.getMonth() + 1
    });
  }
  return options;
}

function createDefaultForm() {
  return {
    id: null,
    date: formatDate(new Date()),
    category: '',
    amount: '',
    description: '',
    invoiceNumber: '',
    projectName: '',
    startPoint: '',
    endPoint: ''
  };
}

function mapEntry(entry = {}) {
  return {
    ...entry,
    amountDisplay: Number(entry.amount || 0).toFixed(2)
  };
}

function buildCategoryStats(entries = []) {
  const summary = {};
  entries.forEach((item) => {
    const key = String(item.category || '未分类').trim() || '未分类';
    if (!summary[key]) {
      summary[key] = {
        category: key,
        amount: 0,
        count: 0
      };
    }
    summary[key].amount += Number(item.amount) || 0;
    summary[key].count += 1;
  });

  const stats = Object.values(summary)
    .map((item) => ({
      ...item,
      amountDisplay: item.amount.toFixed(2)
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    stats,
    topCategory: stats[0] || null
  };
}

Page({
  data: {
    loading: false,
    refreshing: false,
    exporting: false,
    loadingProjectOptions: false,
    monthOptions: buildMonthOptions(),
    monthIndex: 0,
    entries: [],
    totalAmount: '0.00',
    pendingCount: 0,
    categoryStats: [],
    topCategory: null,
    projectOptions: [],
    showModal: false,
    editing: false,
    formData: createDefaultForm()
  },

  onLoad() {
    featureUsage.recordFeatureUsage('expense', '报销管理', '💰');
    this.loadEntries();
  },

  onPullDownRefresh() {
    this.loadEntries().finally(() => wx.stopPullDownRefresh());
  },

  getSelectedMonth() {
    return this.data.monthOptions[this.data.monthIndex];
  },

  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  onMonthChange(e) {
    this.setData({
      monthIndex: Number(e.detail.value) || 0
    }, () => this.loadEntries());
  },

  refreshEntries() {
    if (this.data.refreshing || this.data.loading) {
      return;
    }
    this.loadEntries({ silent: true }).then(() => {
      showSuccess('数据已刷新');
    });
  },

  loadEntries(options = {}) {
    const selectedMonth = this.getSelectedMonth();
    const silent = Boolean(options.silent);
    this.setData(silent ? { refreshing: true } : { loading: true });
    return apiCall(
      () => API.reimbursement.list({
        year: selectedMonth.year,
        month: selectedMonth.month
      }),
      null,
      (response) => {
        const rawEntries = (response && response.data) || [];
        const entries = Array.isArray(rawEntries) ? rawEntries.map(mapEntry) : [];
        const total = entries.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const pendingCount = entries.filter((item) => item.status === '审批中').length;
        const { stats, topCategory } = buildCategoryStats(entries);
        this.setData({
          loading: false,
          entries,
          totalAmount: total.toFixed(2),
          pendingCount,
          categoryStats: stats,
          topCategory,
          refreshing: false
        });
      },
      (error) => {
        this.setData({
          loading: false,
          entries: [],
          totalAmount: '0.00',
          pendingCount: 0,
          categoryStats: [],
          topCategory: null,
          refreshing: false
        });
        showError(error.message || '加载报销记录失败');
      }
    );
  },

  openCreateModal() {
    this.setData({
      showModal: true,
      editing: false,
      formData: createDefaultForm()
    }, () => this.loadProjectOptionsForForm());
  },

  openEditModal(e) {
    const entry = e.currentTarget.dataset.entry;
    if (!entry) {
      return;
    }
    this.setData({
      showModal: true,
      editing: true,
      formData: {
        ...createDefaultForm(),
        ...entry,
        amount: String(entry.amount || '')
      }
    }, () => this.loadProjectOptionsForForm());
  },

  closeModal() {
    this.setData({
      showModal: false,
      editing: false,
      projectOptions: [],
      loadingProjectOptions: false,
      formData: createDefaultForm()
    });
  },

  stopPropagation() {},

  onDateChange(e) {
    this.setData({ 'formData.date': e.detail.value }, () => this.loadProjectOptionsForForm());
  },

  loadProjectOptionsForForm() {
    const dateText = this.data.formData.date || formatDate(new Date());
    const parts = dateText.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (!year || !month) {
      return Promise.resolve();
    }

    this.setData({ loadingProjectOptions: true });
    return apiCall(
      () => API.reimbursement.getProjectOptions({ year, month }),
      null,
      (response) => {
        const options = Array.isArray(response && response.data) ? response.data : [];
        this.setData({
          projectOptions: options,
          loadingProjectOptions: false
        });
      },
      () => {
        this.setData({
          projectOptions: [],
          loadingProjectOptions: false
        });
      }
    );
  },

  selectProjectOption(e) {
    const { project } = e.currentTarget.dataset;
    if (!project) {
      return;
    }
    this.setData({ 'formData.projectName': project });
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  validateForm() {
    const formData = this.data.formData;
    if (!formData.date) {
      showError('请选择报销日期');
      return false;
    }
    if (!String(formData.category || '').trim()) {
      showError('请填写费用类型');
      return false;
    }
    if (!(Number(formData.amount) > 0)) {
      showError('报销金额必须大于0');
      return false;
    }
    if (!String(formData.description || '').trim()) {
      showError('请填写费用说明');
      return false;
    }
    return true;
  },

  saveEntry() {
    if (!this.validateForm()) {
      return;
    }

    const formData = this.data.formData;
    const payload = {
      date: formData.date,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      invoiceNumber: formData.invoiceNumber,
      projectName: formData.projectName,
      startPoint: formData.startPoint,
      endPoint: formData.endPoint
    };

    const requestFactory = this.data.editing
      ? () => API.reimbursement.update(formData.id, payload)
      : () => API.reimbursement.create(payload);

    apiCall(
      requestFactory,
      '保存中...',
      () => {
        showSuccess(this.data.editing ? '报销记录已更新' : '报销记录已创建');
        this.closeModal();
        this.loadEntries();
      },
      (error) => {
        showError(error.message || '保存失败');
      }
    );
  },

  deleteEntry(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      return;
    }
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        apiCall(
          () => API.reimbursement.delete(id),
          '删除中...',
          () => {
            showSuccess('报销记录已删除');
            this.loadEntries();
          },
          (error) => {
            showError(error.message || '删除失败');
          }
        );
      }
    });
  },

  exportSheet() {
    const selectedMonth = this.getSelectedMonth();
    this.setData({ exporting: true });
    apiCall(
      () => API.reimbursement.export({
        year: selectedMonth.year,
        month: selectedMonth.month
      }),
      '导出中...',
      (response) => {
        const data = response && response.data ? response.data : {};
        this.setData({ exporting: false });
        showSuccess(`报销表已导出：${data.fileName || '请前往报销表目录查看'}`);
      },
      (error) => {
        this.setData({ exporting: false });
        showError(error.message || '导出失败');
      }
    );
  }
});
