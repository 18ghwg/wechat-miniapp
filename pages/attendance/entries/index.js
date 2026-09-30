const { API } = require('../../../utils/api');

const pad = value => String(value).padStart(2, '0');
const dateText = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const money = cents => (Number(cents || 0) / 100).toFixed(2);
const SCENES = [{ value: 'company', label: '公司上班' }, { value: 'business_trip', label: '出差' }];
const DAY_TYPES = [
  { value: '', label: '按日历自动判断' },
  { value: 'workday', label: '工作日' },
  { value: 'rest_day', label: '休息日' },
  { value: 'legal_holiday', label: '法定节假日' }
];
const UNITS = [
  { value: 'day', label: '天' },
  { value: 'hour', label: '小时' },
  { value: 'times', label: '次' }
];
const COMP_TIME_TYPES = [
  { value: 'use', label: '使用调休' },
  { value: 'adjustment_credit', label: '手动增加' },
  { value: 'adjustment_debit', label: '手动扣减' },
  { value: 'expire', label: '到期失效' }
];
const assertSuccess = (response, fallback) => {
  if (!response || response.code !== 200) throw new Error((response && response.msg) || fallback);
  return response;
};

const localDateTimeValue = value => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  const [year, month, day, hour, minute] = parts;
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59) return null;
  return date.getTime();
};

function defaultOvertimeForm() {
  const today = dateText(new Date());
  return { id: 0, workDate: today, startTime: '18:00', endDate: today, endTime: '20:00', sceneIndex: 0, dayTypeIndex: 0, remark: '' };
}

function defaultAllowanceForm() {
  return { id: 0, workDate: dateText(new Date()), itemIndex: 0, itemKey: '', itemName: '', quantity: '1', unitIndex: 0, unitAmount: '', custom: false };
}

function defaultCompTimeForm() {
  return { id: 0, workDate: dateText(new Date()), entryTypeIndex: 0, hours: '1', remark: '' };
}

const { enableShareMenu } = require('../../../utils/share');

Page({
  data: {
    loading: true,
    saving: false,
    activeTab: 'overtime',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    sessions: [],
    allowances: [],
    compTimeEntries: [],
    compTimeBalance: 0,
    compTimeBalanceText: '0小时',
    overtimeHours: 0,
    overtimeTotal: '0.00',
    allowanceTotal: '0.00',
    allowancePreviewText: '0.00',
    showOvertimeForm: false,
    showAllowanceForm: false,
    showCompTimeForm: false,
    overtimeForm: defaultOvertimeForm(),
    allowanceForm: defaultAllowanceForm(),
    compTimeForm: defaultCompTimeForm(),
    scenes: SCENES,
    dayTypes: DAY_TYPES,
    units: UNITS,
    compTimeTypes: COMP_TIME_TYPES,
    allowanceItems: [{ id: 'custom', name: '自定义项目', unit: 'day', fixed_cents: 0 }]
  },

  onLoad(options = {}) {
    enableShareMenu('加班与补贴记录');
    if (options.tab === 'allowance') this.setData({ activeTab: 'allowance' });
    if (options.tab === 'comp_time') this.setData({ activeTab: 'comp_time' });
    this.loadData();
  },
  onPullDownRefresh() { this.loadData().finally(() => wx.stopPullDownRefresh()); },
  onShareAppMessage() { return { title: '加班与补贴记录', path: '/pages/attendance/entries/index' }; },
  onShareTimeline() { return { title: '加班与补贴记录' }; },

  loadData() {
    this.setData({ loading: true });
    const params = { year: this.data.year, month: this.data.month };
    return API.attendance.getAutomaticAttendanceEntries(params).then(res => {
      assertSuccess(res, '读取考勤规则计算结果失败');
      const computed = res.data || {};
      const sessions = (computed.sessions || [])
        .map(item => this.decorateSession(item))
        .sort((left, right) => String(right.work_date || '').localeCompare(String(left.work_date || '')));
      const allowances = (computed.allowances || []).map(item => Object.assign({}, item, { amountText: money(item.total_amount_cents), unitAmountText: money(item.unit_amount_cents), unitLabel: this.unitLabel(item.unit) }));
      const compTimeData = computed.comp_time || {};
      const compTimeEntries = (compTimeData.items || []).map(item => this.decorateCompTime(item));
      this.setData({
        sessions,
        allowances,
        compTimeEntries,
        compTimeBalance: Number(compTimeData.balance_minutes || 0),
        compTimeBalanceText: this.durationText(Math.abs(Number(compTimeData.balance_minutes || 0))),
        overtimeHours: this.durationHours(sessions.reduce((sum, item) => sum + Number(item.recognized_minutes || 0), 0)),
        overtimeTotal: money(sessions.reduce((sum, item) => sum + Number(item.amount_cents || 0), 0)),
        allowanceTotal: money(allowances.reduce((sum, item) => sum + Number(item.total_amount_cents || 0), 0)),
        loading: false
      });
    }).catch(err => {
      this.setData({ loading: false });
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    });
  },

  decorateSession(item) {
    const start = String(item.start_time || '').replace('T', ' ').slice(0, 16);
    const end = String(item.end_time || '').replace('T', ' ').slice(0, 16);
    const settlementTags = (item.settlement_tags || []).map(label => ({
      label,
      className: label === '三倍' ? 'triple-tag' : (label === '双倍' ? 'double-tag' : (label === '法定节假日' ? 'holiday-tag' : 'workday-tag'))
    }));
    const bands = (item.bands || []).filter(band => Number(band.minutes || 0) > 0).map(band => ({
      name: band.name || '加班计价',
      hoursText: this.durationText(band.minutes),
      rateText: money(band.rate_cents_per_hour),
      amountText: money(band.amount_cents)
    }));
    return Object.assign({}, item, {
      startText: start,
      endText: end,
      durationText: this.durationText(item.duration_minutes),
      recognizedText: this.durationText(item.recognized_minutes || 0),
      sceneText: item.scene === 'business_trip' ? '出差' : '公司上班',
      dayTypeText: (DAY_TYPES.find(entry => entry.value === item.day_type_override) || DAY_TYPES[0]).label,
      amountText: money(item.amount_cents),
      settlementTags,
      bands,
      settlementText: Number(item.comp_credit_minutes || 0) > 0
        ? `调休 +${this.durationText(item.comp_credit_minutes)}`
        : `计薪 ${this.durationText(item.paid_minutes || 0)}`
    });
  },

  decorateCompTime(item) {
    const typeLabels = { earn: '加班自动入账', use: '使用调休', adjustment_credit: '手动增加', adjustment_debit: '手动扣减', expire: '到期失效' };
    const signed = Number(item.signed_minutes || 0);
    return Object.assign({}, item, {
      typeText: typeLabels[item.entry_type] || item.entry_type,
      durationText: this.durationText(Math.abs(signed)),
      signedText: `${signed >= 0 ? '+' : '-'}${this.durationText(Math.abs(signed))}`,
      credit: signed >= 0,
      editable: item.entry_type !== 'earn'
    });
  },

  durationText(minutes) {
    return `${this.durationHours(minutes)}小时`;
  },
  durationHours(minutes) { return Number((Number(minutes || 0) / 60).toFixed(2)); },
  unitLabel(unit) { return (UNITS.find(item => item.value === unit) || { label: unit }).label; },
  noop() {},
  switchTab(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); },
  changeMonth(e) {
    const offset = Number(e.currentTarget.dataset.offset || 0);
    const date = new Date(this.data.year, this.data.month - 1 + offset, 1);
    this.setData({ year: date.getFullYear(), month: date.getMonth() + 1 }, () => this.loadData());
  },

  openOvertimeForm() { wx.showToast({ title: '加班场次由考勤规则自动计算', icon: 'none' }); },
  editOvertime(e) {
    const item = this.data.sessions.find(entry => entry.id === Number(e.currentTarget.dataset.id));
    if (!item) return;
    const start = String(item.start_time).replace('T', ' ').slice(0, 16).split(' ');
    const end = String(item.end_time).replace('T', ' ').slice(0, 16).split(' ');
    wx.showToast({ title: '加班场次由考勤规则自动计算', icon: 'none' });
  },
  closeOvertimeForm() { if (!this.data.saving) this.setData({ showOvertimeForm: false }); },
  onOvertimeDate(e) {
    const field = e.currentTarget.dataset.field;
    const patch = { [`overtimeForm.${field}`]: e.detail.value };
    if (field === 'workDate' && this.data.overtimeForm.endDate === this.data.overtimeForm.workDate) patch['overtimeForm.endDate'] = e.detail.value;
    this.setData(patch);
  },
  onOvertimeTime(e) { this.setData({ [`overtimeForm.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  onOvertimePicker(e) { this.setData({ [`overtimeForm.${e.currentTarget.dataset.field}`]: Number(e.detail.value) }); },
  onOvertimeRemark(e) { this.setData({ 'overtimeForm.remark': e.detail.value }); },
  saveOvertime() { this.submitOvertime(false); },
  submitOvertime(confirmOverlap) {
	if (this.data.saving) return Promise.resolve();
    const form = this.data.overtimeForm;
	const startValue = localDateTimeValue(`${form.workDate} ${form.startTime}`);
	const endValue = localDateTimeValue(`${form.endDate} ${form.endTime}`);
	if (startValue === null || endValue === null || endValue <= startValue || endValue-startValue > 24*60*60*1000) {
	  wx.showToast({ title: '结束时间须晚于开始时间，且单场不超过24小时', icon: 'none' });
	  return Promise.resolve();
	}
    const payload = {
      work_date: form.workDate,
      start_time: `${form.workDate} ${form.startTime}`,
      end_time: `${form.endDate} ${form.endTime}`,
      scene: SCENES[form.sceneIndex].value,
      day_type_override: DAY_TYPES[form.dayTypeIndex].value,
      remark: form.remark,
      confirm_overlap: !!confirmOverlap
    };
    this.setData({ saving: true });
    const action = form.id ? API.attendance.updateOvertimeSession(form.id, payload) : API.attendance.createOvertimeSession(payload);
	return action.then(res => {
      if (res.code === 409 && res.data && res.data.requires_confirmation) {
        this.setData({ saving: false });
        const overlaps = ((res.data || {}).overlaps || []).slice(0, 3).map(item => `${String(item.start_time).slice(11, 16)}-${String(item.end_time).slice(11, 16)}`).join('、');
        wx.showModal({ title: '发现重叠时段', content: overlaps ? `与 ${overlaps} 重叠。确认仍要保存吗？` : res.msg, confirmText: '仍要保存', success: result => { if (result.confirm) this.submitOvertime(true); } });
        return;
      }
      assertSuccess(res, '保存加班场次失败');
      this.setData({ saving: false, showOvertimeForm: false });
      wx.showToast({ title: '场次已保存', icon: 'success' });
      this.loadData();
    }).catch(err => {
      this.setData({ saving: false });
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    });
  },

  openAllowanceForm() { wx.showToast({ title: '补贴由考勤规则自动计算', icon: 'none' }); },
  editAllowance(e) {
    const item = this.data.allowances.find(entry => entry.id === Number(e.currentTarget.dataset.id));
    if (!item) return;
    wx.showToast({ title: '补贴由考勤规则自动计算', icon: 'none' });
  },
  closeAllowanceForm() { if (!this.data.saving) this.setData({ showAllowanceForm: false }); },
  onAllowanceDate(e) { this.setData({ 'allowanceForm.workDate': e.detail.value }); },
  onAllowanceItem(e) {
    const index = Number(e.detail.value);
    const item = this.data.allowanceItems[index];
    const custom = item.id === 'custom';
    this.setData({
      'allowanceForm.itemIndex': index,
      'allowanceForm.custom': custom,
      'allowanceForm.itemKey': custom ? '' : item.id,
      'allowanceForm.itemName': custom ? '' : item.name,
      'allowanceForm.unitIndex': Math.max(0, UNITS.findIndex(entry => entry.value === item.unit)),
      'allowanceForm.unitAmount': custom ? '' : money(item.fixed_cents)
    }, () => this.updateAllowancePreview());
  },
  onAllowanceInput(e) { this.setData({ [`allowanceForm.${e.currentTarget.dataset.field}`]: e.detail.value }, () => this.updateAllowancePreview()); },
  onAllowanceUnit(e) { this.setData({ 'allowanceForm.unitIndex': Number(e.detail.value) }); },
  calculateAllowancePreview(form) { return (Number(form.quantity || 0) * Number(form.unitAmount || 0)).toFixed(2); },
  updateAllowancePreview() { this.setData({ allowancePreviewText: this.calculateAllowancePreview(this.data.allowanceForm) }); },
  saveAllowance() {
	if (this.data.saving) return Promise.resolve();
    const form = this.data.allowanceForm;
    const itemKey = form.itemKey || `custom_${Date.now()}`;
    if (!form.itemName.trim() || Number(form.quantity) <= 0 || Number(form.unitAmount) < 0) {
      wx.showToast({ title: '请完整填写补贴项目', icon: 'none' });
      return;
    }
    const payload = {
      work_date: form.workDate,
      item_key: itemKey,
      item_name: form.itemName.trim(),
      quantity: Number(form.quantity),
      unit: UNITS[form.unitIndex].value,
      unit_amount_cents: Math.round(Number(form.unitAmount) * 100)
    };
    this.setData({ saving: true });
    const action = form.id ? API.attendance.updateDailyAllowance(form.id, payload) : API.attendance.createDailyAllowance(payload);
	return action.then(res => {
      assertSuccess(res, '保存补贴失败');
      this.setData({ saving: false, showAllowanceForm: false });
      wx.showToast({ title: '补贴已保存', icon: 'success' });
      this.loadData();
    }).catch(err => {
      this.setData({ saving: false });
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    });
  },

  openCompTimeForm() { wx.showToast({ title: '调休由考勤规则自动计算', icon: 'none' }); },
  editCompTime(e) {
    const item = this.data.compTimeEntries.find(entry => entry.id === Number(e.currentTarget.dataset.id));
    if (!item) return;
    wx.showToast({ title: '调休由考勤规则自动计算', icon: 'none' });
  },
  closeCompTimeForm() { if (!this.data.saving) this.setData({ showCompTimeForm: false }); },
  onCompTimeDate(e) { this.setData({ 'compTimeForm.workDate': e.detail.value }); },
  onCompTimeType(e) { this.setData({ 'compTimeForm.entryTypeIndex': Number(e.detail.value) }); },
  onCompTimeInput(e) { this.setData({ [`compTimeForm.${e.currentTarget.dataset.field}`]: e.detail.value }); },
  saveCompTime() {
	if (this.data.saving) return Promise.resolve();
    const form = this.data.compTimeForm;
    const minutes = Math.round(Number(form.hours || 0) * 60);
    if (minutes <= 0) {
      wx.showToast({ title: '调休时长必须大于 0 小时', icon: 'none' });
      return;
    }
    const payload = {
      work_date: form.workDate,
      entry_type: COMP_TIME_TYPES[form.entryTypeIndex].value,
      minutes,
      remark: String(form.remark || '').trim()
    };
    this.setData({ saving: true });
    const action = form.id ? API.attendance.updateCompTimeEntry(form.id, payload) : API.attendance.createCompTimeEntry(payload);
	return action.then(res => {
      assertSuccess(res, '保存调休流水失败');
      this.setData({ saving: false, showCompTimeForm: false });
      wx.showToast({ title: '调休流水已保存', icon: 'success' });
      this.loadData();
    }).catch(err => {
      this.setData({ saving: false });
      wx.showToast({ title: err.message || '保存失败', icon: 'none' });
    });
  },

  deleteEntry(e) {
    const type = e.currentTarget.dataset.type;
    const id = Number(e.currentTarget.dataset.id);
    wx.showModal({ title: '确认删除', content: `删除后本月税前工资会重新计算，是否继续？`, confirmColor: '#D64545', success: result => {
      if (!result.confirm) return;
      let action = API.attendance.deleteDailyAllowance(id);
      if (type === 'overtime') action = API.attendance.deleteOvertimeSession(id);
      if (type === 'comp_time') action = API.attendance.deleteCompTimeEntry(id);
      action.then(res => { assertSuccess(res, '删除失败'); wx.showToast({ title: '已删除', icon: 'success' }); this.loadData(); }).catch(err => wx.showToast({ title: err.message || '删除失败', icon: 'none' }));
    }});
  }
});
