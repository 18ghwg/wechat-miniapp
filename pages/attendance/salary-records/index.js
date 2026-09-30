const { API, showSuccess, showError } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');

const FILTER_STORAGE_KEY = 'attendance_salary_record_filters_v1';

const SALARY_NUMERIC_FIELDS = [
  { key: 'abroad_business_days', label: '国外出差天数', placeholder: '请输入国外出差天数' },
  { key: 'abroad_allowance', label: '国外补助金额', placeholder: '请输入国外补助金额' },
  { key: 'domestic_business_days', label: '国内出差天数', placeholder: '请输入国内出差天数' },
  { key: 'holiday_overtime_days', label: '节假日加班天数', placeholder: '请输入节假日加班天数' },
  { key: 'holiday_double_hours', label: '节假日双倍小时', placeholder: '请输入节假日双倍小时' },
  { key: 'holiday_triple_hours', label: '节假日三倍小时', placeholder: '请输入节假日三倍小时' },
  { key: 'holiday_overtime_pay', label: '节假日加班费', placeholder: '系统自动计算' },
  { key: 'weekend_overtime_day_count', label: '周六日加班天数', placeholder: '请输入周六日加班天数' },
  { key: 'weekend_overtime_days', label: '周六日加班小时', placeholder: '请输入周六日加班小时' },
  { key: 'workday_overtime_hours', label: '非周六日加班小时数', placeholder: '请输入非周六日加班小时数' },
  { key: 'meal_allowance', label: '餐补', placeholder: '请输入餐补' },
  { key: 'base_salary', label: '底薪', placeholder: '请输入底薪' },
  { key: 'compensatory_days', label: '调休天数', placeholder: '请输入调休天数' }
];

function createDefaultSalaryForm() {
  return {
    abroad_business_days: '0',
    abroad_allowance: '0',
    domestic_business_days: '0',
    domestic_allowance: '0',
    holiday_overtime_days: '0',
    holiday_double_hours: '0',
    holiday_triple_hours: '0',
    holiday_overtime_hours: '0',
    holiday_double_base_hours: '0',
    holiday_double_extra_hours: '0',
    holiday_triple_base_hours: '0',
    holiday_triple_extra_hours: '0',
    holiday_extra_hours: '0',
    holiday_overtime_pay: '0',
    weekend_overtime_days: '0',
    weekend_overtime_day_count: '0',
    weekend_base_hours: '0',
    weekend_extra_hours: '0',
    weekend_overtime_pay: '0',
    workday_overtime_hours: '0',
    workday_overtime_pay: '0',
    overtime_days: '0',
    overtime_hours: '0',
    overtime_pay: '0',
    meal_allowance: '0',
    base_salary: '7000',
    compensatory_days: '0',
    total_salary: '7000.00'
  };
}

function createEditingFields(editForm) {
  return SALARY_NUMERIC_FIELDS.map((item) => ({
    ...item,
    value: editForm[item.key] || ''
  }));
}

function createReadonlyFields(summary) {
  const safeSummary = summary || {};
  return [
    {
      key: 'domestic_allowance',
      label: '国内出差补助',
      value: `¥${safeSummary.domestic_allowance_display || '%N%'}`,
      helper: '根据国内出差天数和配置的国内出差补贴/天自动计算'
    },
    {
      key: 'weekend_overtime_pay',
      label: '周六日加班费',
      value: `¥${safeSummary.weekend_overtime_pay_display || '%N%'}`,
      helper: '周六日每天最多8小时按双倍，超出8小时外按固定小时单价'
    },
    {
      key: 'workday_overtime_pay',
      label: '非周六日小时加班费',
      value: `¥${safeSummary.workday_overtime_pay_display || '%N%'}`,
      helper: '根据非周六日加班小时数自动计算'
    }
  ];
}

function formatAmount(value) {
  return (Math.round((Number(value) || 0) * 100) / 100).toFixed(2);
}

function toAmount(value) {
  return Number(value) || 0;
}

function parseStrictNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatAmountOrNaN(value) {
  return Number.isFinite(value) ? formatAmount(value) : '%N%';
}

function formatRawValueOrNaN(value) {
  if (value === '' || value === null || value === undefined) {
    return '%N%';
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? String(value) : '%N%';
}

function sumStrict(values = []) {
  if (!values.every((item) => Number.isFinite(item))) {
    return NaN;
  }
  return values.reduce((sum, item) => sum + item, 0);
}

function computeTotal(payroll) {
  return ['abroad_allowance', 'domestic_allowance', 'overtime_pay', 'meal_allowance', 'base_salary']
    .reduce((sum, key) => sum + (parseFloat(payroll[key]) || 0), 0);
}

function calculateMultiplierOvertime(hours, dayCount, multiplierUnitPrice, fixedUnitPrice, multiplier) {
  const normalizedHours = Math.max(toAmount(hours), 0);
  const normalizedDayCount = Math.max(toAmount(dayCount), 0);
  const normalizedMultiplierUnitPrice = Math.max(Number(multiplierUnitPrice) || 0, 0);
  const normalizedFixedUnitPrice = Math.max(Number(fixedUnitPrice) || 0, 0);
  const baseHours = Math.min(normalizedHours, normalizedDayCount * 8);
  const extraHours = Math.max(normalizedHours - baseHours, 0);
  const amount = baseHours * normalizedMultiplierUnitPrice * multiplier + extraHours * normalizedFixedUnitPrice;
  return { baseHours, extraHours, amount };
}

function inferOvertimeDayCount(hours) {
  return toAmount(hours) > 0 ? 1 : 0;
}

function computeOvertimePay(payroll, overtimePayPerDay = 0, overtimePayPerHour = 0) {
  const holidayAmount = toAmount(payroll.holiday_overtime_pay);
  const weekendCalc = calculateMultiplierOvertime(
    payroll.weekend_overtime_days,
    payroll.weekend_overtime_day_count || inferOvertimeDayCount(payroll.weekend_overtime_days),
    overtimePayPerDay,
    overtimePayPerHour,
    2
  );
  const overtimeDaysAmount = weekendCalc.amount;
  const overtimeHoursAmount = toAmount(payroll.workday_overtime_hours) * (Number(overtimePayPerHour) || 0);
  return holidayAmount + overtimeDaysAmount + overtimeHoursAmount;
}

function computeDomesticAllowance(payroll = {}, domesticAllowancePerTripDay = 0) {
  return toAmount(payroll.domestic_business_days) * (Number(domesticAllowancePerTripDay) || 0);
}

function applyDerivedFields(payroll = {}, overtimePayPerDay = 0, overtimePayPerHour = 0, domesticAllowancePerTripDay = 0) {
  const nextPayroll = {
    ...payroll
  };
  nextPayroll.domestic_allowance = formatAmount(computeDomesticAllowance(nextPayroll, domesticAllowancePerTripDay));
  const holidayDoubleCalc = calculateMultiplierOvertime(
    nextPayroll.holiday_double_hours,
    nextPayroll.holiday_overtime_days || inferOvertimeDayCount(toAmount(nextPayroll.holiday_double_hours) + toAmount(nextPayroll.holiday_triple_hours)),
    overtimePayPerDay,
    overtimePayPerHour,
    2
  );
  const holidayTripleCalc = calculateMultiplierOvertime(
    nextPayroll.holiday_triple_hours,
    nextPayroll.holiday_overtime_days || inferOvertimeDayCount(toAmount(nextPayroll.holiday_double_hours) + toAmount(nextPayroll.holiday_triple_hours)),
    overtimePayPerDay,
    overtimePayPerHour,
    3
  );
  nextPayroll.holiday_double_base_hours = formatAmount(holidayDoubleCalc.baseHours);
  nextPayroll.holiday_double_extra_hours = formatAmount(holidayDoubleCalc.extraHours);
  nextPayroll.holiday_triple_base_hours = formatAmount(holidayTripleCalc.baseHours);
  nextPayroll.holiday_triple_extra_hours = formatAmount(holidayTripleCalc.extraHours);
  nextPayroll.holiday_extra_hours = formatAmount(holidayDoubleCalc.extraHours + holidayTripleCalc.extraHours);
  nextPayroll.holiday_overtime_hours = formatAmount(toAmount(nextPayroll.holiday_double_hours) + toAmount(nextPayroll.holiday_triple_hours));
  nextPayroll.holiday_overtime_pay = formatAmount(holidayDoubleCalc.amount + holidayTripleCalc.amount);
  const weekendCalc = calculateMultiplierOvertime(
    nextPayroll.weekend_overtime_days,
    nextPayroll.weekend_overtime_day_count || inferOvertimeDayCount(nextPayroll.weekend_overtime_days),
    overtimePayPerDay,
    overtimePayPerHour,
    2
  );
  nextPayroll.weekend_base_hours = formatAmount(weekendCalc.baseHours);
  nextPayroll.weekend_extra_hours = formatAmount(weekendCalc.extraHours);
  nextPayroll.weekend_overtime_pay = formatAmount(weekendCalc.amount);
  nextPayroll.workday_overtime_pay = formatAmount(toAmount(nextPayroll.workday_overtime_hours) * (Number(overtimePayPerHour) || 0));
  nextPayroll.overtime_days = String(toAmount(nextPayroll.weekend_overtime_days));
  nextPayroll.overtime_hours = String(toAmount(nextPayroll.workday_overtime_hours));
  nextPayroll.overtime_pay = formatAmount(computeOvertimePay(nextPayroll, overtimePayPerDay, overtimePayPerHour));
  nextPayroll.total_salary = computeTotal(nextPayroll).toFixed(2);
  return nextPayroll;
}

function buildEditingSummary(payroll = {}, recordMeta = null) {
  const overtimePayPerDay = parseStrictNumber(recordMeta && recordMeta.overtimePayPerDay);
  const overtimePayPerHour = parseStrictNumber(recordMeta && recordMeta.overtimePayPerHour);
  const domesticAllowancePerTripDay = parseStrictNumber(recordMeta && recordMeta.domesticAllowancePerTripDay);

  const baseSalary = parseStrictNumber(payroll.base_salary);
  const abroadAllowance = parseStrictNumber(payroll.abroad_allowance);
  const domesticBusinessDays = parseStrictNumber(payroll.domestic_business_days);
  const holidayOvertimePay = parseStrictNumber(payroll.holiday_overtime_pay);
  const holidayOvertimeDays = parseStrictNumber(payroll.holiday_overtime_days);
  const holidayDoubleHours = parseStrictNumber(payroll.holiday_double_hours);
  const holidayTripleHours = parseStrictNumber(payroll.holiday_triple_hours);
  const holidayDoubleBaseHours = parseStrictNumber(payroll.holiday_double_base_hours);
  const holidayTripleBaseHours = parseStrictNumber(payroll.holiday_triple_base_hours);
  const holidayExtraHours = parseStrictNumber(payroll.holiday_extra_hours);
  const weekendOvertimeDayCount = parseStrictNumber(payroll.weekend_overtime_day_count);
  const weekendOvertimeDays = parseStrictNumber(payroll.weekend_overtime_days);
  const weekendBaseHours = parseStrictNumber(payroll.weekend_base_hours);
  const weekendExtraHours = parseStrictNumber(payroll.weekend_extra_hours);
  const workdayOvertimeHours = parseStrictNumber(payroll.workday_overtime_hours);
  const mealAllowance = parseStrictNumber(payroll.meal_allowance);

  const domesticAllowance = Number.isFinite(domesticBusinessDays) && Number.isFinite(domesticAllowancePerTripDay)
    ? domesticBusinessDays * domesticAllowancePerTripDay
    : NaN;
  const weekendCalc = calculateMultiplierOvertime(
    weekendOvertimeDays,
    payroll.weekend_overtime_day_count || inferOvertimeDayCount(Number.isFinite(weekendOvertimeDays) ? weekendOvertimeDays : 0),
    overtimePayPerDay,
    overtimePayPerHour,
    2
  );
  const weekendOvertimePay = Number.isFinite(weekendOvertimeDays) && Number.isFinite(overtimePayPerHour)
    ? weekendCalc.amount
    : NaN;
  const workdayOvertimePay = Number.isFinite(workdayOvertimeHours) && Number.isFinite(overtimePayPerHour)
    ? workdayOvertimeHours * overtimePayPerHour
    : NaN;
  const overtimePay = sumStrict([holidayOvertimePay, weekendOvertimePay, workdayOvertimePay]);
  const totalAmount = sumStrict([abroadAllowance, domesticAllowance, overtimePay, mealAllowance, baseSalary]);

  return {
    total_amount: totalAmount,
    total_amount_display: formatAmountOrNaN(totalAmount),
    base_salary_display: formatAmountOrNaN(baseSalary),
    overtime_amount_display: formatAmountOrNaN(overtimePay),
    meal_allowance_amount_display: formatAmountOrNaN(mealAllowance),
    abroad_allowance_display: formatAmountOrNaN(abroadAllowance),
    domestic_allowance_display: formatAmountOrNaN(domesticAllowance),
    weekend_overtime_pay_display: formatAmountOrNaN(weekendOvertimePay),
    workday_overtime_pay_display: formatAmountOrNaN(workdayOvertimePay),
    overtime_pay_display: formatAmountOrNaN(overtimePay),
    holiday_overtime_pay_display: formatRawValueOrNaN(payroll.holiday_overtime_pay),
    holiday_overtime_days_display: formatRawValueOrNaN(payroll.holiday_overtime_days),
    holiday_double_hours_display: formatRawValueOrNaN(payroll.holiday_double_hours),
    holiday_triple_hours_display: formatRawValueOrNaN(payroll.holiday_triple_hours),
    holiday_double_base_hours_display: formatAmountOrNaN(holidayDoubleBaseHours),
    holiday_triple_base_hours_display: formatAmountOrNaN(holidayTripleBaseHours),
    holiday_extra_hours_display: formatAmountOrNaN(holidayExtraHours),
    weekend_overtime_day_count_display: formatAmountOrNaN(weekendOvertimeDayCount),
    weekend_overtime_days_display: formatRawValueOrNaN(payroll.weekend_overtime_days),
    weekend_base_hours_display: formatAmountOrNaN(weekendBaseHours),
    weekend_extra_hours_display: formatAmountOrNaN(weekendExtraHours),
    workday_overtime_hours_display: formatRawValueOrNaN(payroll.workday_overtime_hours)
  };
}

function normalizeSalaryForm(salary = {}) {
  const form = createDefaultSalaryForm();
  SALARY_NUMERIC_FIELDS.forEach((field) => {
    const rawValue = salary[field.key];
    form[field.key] = rawValue === undefined || rawValue === null ? '0' : String(rawValue);
  });
  form.domestic_business_days = salary.domestic_business_days === undefined || salary.domestic_business_days === null ? '0' : String(salary.domestic_business_days);
  form.domestic_allowance = salary.domestic_allowance === undefined || salary.domestic_allowance === null ? '0' : String(salary.domestic_allowance);
  form.holiday_double_hours = salary.holiday_double_hours === undefined || salary.holiday_double_hours === null ? '0' : String(salary.holiday_double_hours);
  form.holiday_triple_hours = salary.holiday_triple_hours === undefined || salary.holiday_triple_hours === null ? '0' : String(salary.holiday_triple_hours);
  form.holiday_overtime_days = salary.holiday_overtime_days === undefined || salary.holiday_overtime_days === null ? String(inferOvertimeDayCount(toAmount(form.holiday_double_hours) + toAmount(form.holiday_triple_hours))) : String(salary.holiday_overtime_days);
  form.holiday_overtime_hours = salary.holiday_overtime_hours === undefined || salary.holiday_overtime_hours === null ? '0' : String(salary.holiday_overtime_hours);
  form.holiday_double_base_hours = salary.holiday_double_base_hours === undefined || salary.holiday_double_base_hours === null ? '0' : String(salary.holiday_double_base_hours);
  form.holiday_double_extra_hours = salary.holiday_double_extra_hours === undefined || salary.holiday_double_extra_hours === null ? '0' : String(salary.holiday_double_extra_hours);
  form.holiday_triple_base_hours = salary.holiday_triple_base_hours === undefined || salary.holiday_triple_base_hours === null ? '0' : String(salary.holiday_triple_base_hours);
  form.holiday_triple_extra_hours = salary.holiday_triple_extra_hours === undefined || salary.holiday_triple_extra_hours === null ? '0' : String(salary.holiday_triple_extra_hours);
  form.holiday_extra_hours = salary.holiday_extra_hours === undefined || salary.holiday_extra_hours === null ? '0' : String(salary.holiday_extra_hours);
  form.weekend_overtime_day_count = salary.weekend_overtime_day_count === undefined || salary.weekend_overtime_day_count === null ? String(inferOvertimeDayCount(form.weekend_overtime_days)) : String(salary.weekend_overtime_day_count);
  form.weekend_base_hours = salary.weekend_base_hours === undefined || salary.weekend_base_hours === null ? '0' : String(salary.weekend_base_hours);
  form.weekend_extra_hours = salary.weekend_extra_hours === undefined || salary.weekend_extra_hours === null ? '0' : String(salary.weekend_extra_hours);
  form.overtime_pay = salary.overtime_pay === undefined || salary.overtime_pay === null ? '0' : String(salary.overtime_pay);
  return applyDerivedFields(
    form,
    salary.overtime_pay_per_day,
    salary.overtime_pay_per_hour,
    salary.domestic_allowance_per_trip_day
  );
}

function normalizeRecord(record = {}) {
  const salary = record.salary || {};
  const operatorTimeText = record.operator_name
    ? `操作人：${record.operator_name} · ${record.operated_at || '--'}`
    : '';
  const syncStatusDisplayText = `同步状态：${record.sync_status_text || '未知'}${record.sync_error ? ` · ${record.sync_error}` : ''}`;
  return {
    ...record,
    badgeType: record.status_badge_type || 'normal',
    operatorTimeText,
    syncStatusDisplayText,
    summary: {
      total_amount: Number(record.summary && record.summary.total_amount) || 0,
      total_amount_display: record.summary && record.summary.total_amount_display
        ? record.summary.total_amount_display
        : formatAmount(record.summary && record.summary.total_amount),
      overtime_days: Number(record.summary && record.summary.overtime_days) || 0,
      holiday_overtime_days: Number(record.summary && record.summary.holiday_overtime_days) || 0,
      weekend_overtime_days: Number(record.summary && record.summary.weekend_overtime_days) || 0,
      workday_overtime_hours: Number(record.summary && record.summary.workday_overtime_hours) || 0,
      trip_days: Number(record.summary && record.summary.trip_days) || 0,
      compensatory_days: Number(record.summary && record.summary.compensatory_days) || 0
    },
    salary,
    domesticAllowancePerTripDay: Number(salary.domestic_allowance_per_trip_day) || 0,
    overtimePayPerDay: Number(salary.overtime_pay_per_day) || 0,
    overtimePayPerHour: Number(salary.overtime_pay_per_hour) || 0,
    salaryForm: normalizeSalaryForm(salary)
  };
}

function buildMonthOptions(records = []) {
  const monthSet = new Set();
  records.forEach((item) => {
    if (item && item.month) {
      monthSet.add(item.month);
    }
  });
  return ['全部月份'].concat(Array.from(monthSet).sort().reverse());
}

function buildYearOptions(records = []) {
  const yearSet = new Set();
  records.forEach((item) => {
    if (item && item.year) {
      yearSet.add(String(item.year));
    }
  });
  return ['全部年份'].concat(Array.from(yearSet).sort().reverse());
}

function ensureOption(options = [], value = '', defaultValue = '') {
  const nextOptions = Array.isArray(options) ? options.slice() : [];
  if (defaultValue && nextOptions.indexOf(defaultValue) === -1) {
    nextOptions.unshift(defaultValue);
  }
  if (value && value !== defaultValue && nextOptions.indexOf(value) === -1) {
    nextOptions.push(value);
  }
  return nextOptions;
}

function createDefaultSavedFilterValues() {
  return {
    userName: '',
    year: '全部年份',
    month: '全部月份',
    status: '全部记录',
    source: '全部来源',
    syncStatus: '全部同步状态'
  };
}

function formatIssueTypeSummary(summary = {}) {
  const details = Array.isArray(summary.issue_type_details) ? summary.issue_type_details : [];
  if (!details.length) {
    return '暂无异常类型';
  }
  return details
    .slice(0, 3)
    .map((item) => `${item.label || item.code} ${item.count}`)
    .join(' · ');
}

function formatReconcileSummaryText(summary = {}) {
  return `已检查 ${summary.checked_total || 0} 条，异常 ${summary.inconsistent_total || 0} 条，正常 ${summary.normal_total || 0} 条，已修正 ${summary.repaired_total || 0} 条`;
}

function formatScopeDisplayText(targetName = '', isAdmin = false) {
  if (targetName) {
    return targetName;
  }
  return isAdmin ? '全部' : '--';
}

function buildPaginationViewModel(pagination = null) {
  if (!pagination || !pagination.pages || pagination.pages <= 1) {
    return {
      showPagination: false,
      paginationText: '',
      prevPageButtonClass: 'pagination-btn pagination-btn-disabled',
      nextPageButtonClass: 'pagination-btn pagination-btn-disabled'
    };
  }

  return {
    showPagination: true,
    paginationText: `${pagination.page} / ${pagination.pages}`,
    prevPageButtonClass: pagination.has_prev ? 'pagination-btn' : 'pagination-btn pagination-btn-disabled',
    nextPageButtonClass: pagination.has_next ? 'pagination-btn' : 'pagination-btn pagination-btn-disabled'
  };
}

Page({
  data: {
    loading: true,
    testMode: false,
    isAdmin: false,
    targetName: '',
    pagination: null,
    currentPage: 1,
    perPage: 20,
    yearIndex: 0,
    yearOptions: ['全部年份'],
    monthIndex: 0,
    monthOptions: ['全部月份'],
    sourceIndex: 0,
    sourceOptions: ['全部来源', '手动生成', '自动生成', 'Excel已有'],
    syncStatusIndex: 0,
    syncStatusOptions: ['全部同步状态', '已同步', '同步失败', '未同步', '已跳过'],
    filterIndex: 0,
    filterOptions: ['全部记录', '已手动锁定', '自动生成', '手动生成', '已生成', '未生成', '同步失败'],
    allUsers: [],
    selectedUserIndex: 0,
    selectedUserName: '',
    selectedUserDisplayText: '全部人员',
    scopeLabelText: '查看范围',
    scopeDisplayText: '--',
    reconcileLoading: false,
    reconcileSummary: null,
    reconcileSummaryText: '',
    reconcileIssueSummaryText: '',
    reconcileBtnDisabledClass: '',
    reconcileCheckButtonText: '对账检查',
    reconcileAutoRepairButtonText: '自动修正异常',
    savedFilterValues: createDefaultSavedFilterValues(),
    records: [],
    filteredRecords: [],
    hasRecords: false,
    showEmptyState: false,
    showPagination: false,
    paginationText: '',
    prevPageButtonClass: 'pagination-btn pagination-btn-disabled',
    nextPageButtonClass: 'pagination-btn pagination-btn-disabled',
    showEditPopup: false,
    submitting: false,
    saveButtonText: '保存工资条',
    editingRecordId: '',
    editingRecordTitle: '',
    editingRecordMeta: null,
    editForm: createDefaultSalaryForm(),
    editingFields: createEditingFields(createDefaultSalaryForm()),
    readonlyFields: createReadonlyFields(null),
    editingSummary: null
  },

  onLoad() {
    this.bootstrap();

    testModeManager.setupPageHotReload(this, function hotReload() {
      this.bootstrap();
    });
  },

  onPullDownRefresh() {
    this.bootstrap().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async bootstrap() {
    const savedFilterValues = this.restoreFilterState();
    this.setData({
      loading: true,
      testMode: testModeManager.isTestMode(),
      savedFilterValues,
      reconcileSummary: null,
      reconcileSummaryText: '',
      reconcileIssueSummaryText: ''
    });

    try {
      const userRes = await API.user.getInfo();
      const userInfo = userRes && userRes.data ? userRes.data : {};
      const isAdmin = !!userInfo.is_admin;
      const savedFilterValues = this.data.savedFilterValues || createDefaultSavedFilterValues();

      this.setData({
        isAdmin,
        targetName: userInfo.real_name || userInfo.nickname || '',
        scopeLabelText: isAdmin ? '当前筛选' : '查看范围',
        scopeDisplayText: formatScopeDisplayText(userInfo.real_name || userInfo.nickname || '', isAdmin),
        filterIndex: this.normalizeSelectedIndex(this.data.filterOptions, savedFilterValues.status, 0),
        sourceIndex: this.normalizeSelectedIndex(this.data.sourceOptions, savedFilterValues.source, 0),
        syncStatusIndex: this.normalizeSelectedIndex(this.data.syncStatusOptions, savedFilterValues.syncStatus, 0)
      });

      if (isAdmin) {
        await this.loadUserOptions();
      } else {
        this.setData({
          allUsers: [],
          selectedUserIndex: 0,
          selectedUserName: ''
        });
      }

      this.applySavedUserSelection();
      await this.loadRecords();
    } catch (error) {
      this.setData({ loading: false });
      showError(error && error.message ? error.message : '加载工资条记录失败');
    }
  },

  async loadUserOptions() {
    try {
      const res = await API.attendance.getKaoqinUsers();
      const users = (res && res.data) ? res.data : [];
      const normalizedUsers = [{ name: '全部人员', id: 'all' }].concat(Array.isArray(users) ? users : []);
      const savedUserName = this.data.savedFilterValues.userName || '';
      const selectedUserIndex = normalizedUsers.findIndex((item) => item.name === savedUserName);
      this.setData({
        allUsers: normalizedUsers,
        selectedUserIndex: selectedUserIndex >= 0 ? selectedUserIndex : 0,
        selectedUserName: selectedUserIndex > 0 ? normalizedUsers[selectedUserIndex].name : '',
        selectedUserDisplayText: selectedUserIndex > 0 ? normalizedUsers[selectedUserIndex].name : '全部人员'
      });
    } catch (error) {
      this.setData({
        allUsers: [],
        selectedUserIndex: 0,
        selectedUserName: '',
        selectedUserDisplayText: '全部人员'
      });
    }
  },

  restoreFilterState() {
    try {
      const saved = wx.getStorageSync(FILTER_STORAGE_KEY);
      if (!saved || typeof saved !== 'object') {
        return createDefaultSavedFilterValues();
      }
      return {
        ...createDefaultSavedFilterValues(),
        ...saved
      };
    } catch (error) {
      return createDefaultSavedFilterValues();
    }
  },

  persistFilterState() {
    const values = this.getCurrentFilterValues();
    this.setData({ savedFilterValues: values });
    try {
      wx.setStorageSync(FILTER_STORAGE_KEY, values);
    } catch (error) {
      // Ignore cache failures and keep page usable.
    }
  },

  getCurrentFilterValues() {
    return {
      userName: this.data.selectedUserName || '',
      year: this.data.yearOptions[this.data.yearIndex] || '全部年份',
      month: this.data.monthOptions[this.data.monthIndex] || '全部月份',
      status: this.data.filterOptions[this.data.filterIndex] || '全部记录',
      source: this.data.sourceOptions[this.data.sourceIndex] || '全部来源',
      syncStatus: this.data.syncStatusOptions[this.data.syncStatusIndex] || '全部同步状态'
    };
  },

  applySavedUserSelection() {
    if (!this.data.isAdmin) {
      return;
    }
    const savedUserName = this.data.savedFilterValues.userName || '';
    if (!savedUserName) {
      return;
    }
    const selectedUserIndex = this.data.allUsers.findIndex((item) => item.name === savedUserName);
    if (selectedUserIndex >= 0) {
      const selectedUserName = this.data.allUsers[selectedUserIndex].id !== 'all'
        ? this.data.allUsers[selectedUserIndex].name
        : '';
      this.setData({
        selectedUserIndex,
        selectedUserName,
        selectedUserDisplayText: selectedUserName || '全部人员'
      });
    }
  },

  applySavedFilterIndexes(yearOptions = [], monthOptions = []) {
    const savedFilterValues = this.data.savedFilterValues || createDefaultSavedFilterValues();
    return {
      yearIndex: this.normalizeSelectedIndex(yearOptions, savedFilterValues.year, 0),
      monthIndex: this.normalizeSelectedIndex(monthOptions, savedFilterValues.month, 0),
      filterIndex: this.normalizeSelectedIndex(this.data.filterOptions, savedFilterValues.status, 0),
      sourceIndex: this.normalizeSelectedIndex(this.data.sourceOptions, savedFilterValues.source, 0),
      syncStatusIndex: this.normalizeSelectedIndex(this.data.syncStatusOptions, savedFilterValues.syncStatus, 0)
    };
  },

  buildListParams() {
    const params = {
      page: this.data.currentPage,
      per_page: this.data.perPage
    };

    if (this.data.isAdmin && this.data.selectedUserName) {
      params.name = this.data.selectedUserName;
    }

    const currentFilterValues = this.getCurrentFilterValues();
    const savedFilterValues = this.data.savedFilterValues || createDefaultSavedFilterValues();
    const selectedYear = currentFilterValues.year !== '全部年份' ? currentFilterValues.year : savedFilterValues.year;
    const selectedMonth = currentFilterValues.month !== '全部月份' ? currentFilterValues.month : savedFilterValues.month;
    const selectedSource = currentFilterValues.source;
    const selectedStatus = currentFilterValues.status;
    const selectedSyncStatus = currentFilterValues.syncStatus;

    if (selectedYear && selectedYear !== '全部年份') {
      params.year = Number(selectedYear);
    }
    if (selectedMonth && selectedMonth !== '全部月份') {
      const monthParts = String(selectedMonth).split('-');
      if (monthParts.length === 2) {
        params.year = Number(monthParts[0]);
        params.month = Number(monthParts[1]);
      }
    }
    if (selectedStatus && selectedStatus !== '全部记录') {
      const statusMap = {
        '已手动锁定': 'manual_locked',
        '自动生成': 'auto_generated',
        '手动生成': 'manual_generated',
        '已生成': 'generated',
        '未生成': 'not_generated',
        '同步失败': 'sync_failed'
      };
      params.status = statusMap[selectedStatus] || '';
    }
    if (selectedSource && selectedSource !== '全部来源') {
      const sourceMap = {
        '手动生成': 'manual',
        '自动生成': 'auto',
        'Excel已有': 'excel'
      };
      params.source = sourceMap[selectedSource] || '';
    }
    if (selectedSyncStatus && selectedSyncStatus !== '全部同步状态') {
      const syncStatusMap = {
        '已同步': 'synced',
        '同步失败': 'sync_failed',
        '未同步': 'not_synced',
        '已跳过': 'skipped'
      };
      params.sync_status = syncStatusMap[selectedSyncStatus] || '';
    }
    return params;
  },

  buildReconcileParams() {
    return {
      ...this.buildListParams(),
      only_abnormal: true,
      repair_mode: 'check'
    };
  },

  async runReconcile(repairMode = 'check') {
    const params = {
      ...this.buildListParams(),
      only_abnormal: true,
      repair_mode: repairMode
    };
    const res = await API.attendance.reconcileSalarySheetRecords(params);
    if (!res || res.code !== 200) {
      throw new Error((res && res.msg) || '对账失败');
    }
    const payload = res.data || {};
    const summary = payload.summary || null;
    this.setData({
      reconcileSummary: summary,
      reconcileSummaryText: summary ? formatReconcileSummaryText(summary) : '',
      reconcileIssueSummaryText: formatIssueTypeSummary(summary || {})
    });
    await this.loadRecords();
    return summary;
  },

  async loadRecords() {
    try {
      const params = this.buildListParams();
      const res = await API.attendance.getSalarySheetRecords(params);
      if (!res || res.code !== 200) {
        throw new Error((res && res.msg) || '获取工资条记录失败');
      }

      const payload = res.data || {};
      const records = Array.isArray(payload.records)
        ? payload.records.map(normalizeRecord)
        : [];
      const savedFilterValues = this.data.savedFilterValues || createDefaultSavedFilterValues();
      const yearOptions = ensureOption(buildYearOptions(records), savedFilterValues.year, '全部年份');
      const monthOptions = ensureOption(buildMonthOptions(records), savedFilterValues.month, '全部月份');
      const savedIndexes = this.applySavedFilterIndexes(yearOptions, monthOptions);
      // 小程序只展示当前用户自己的工资条记录。
      const isAdmin = false;
      const targetName = payload.target_name || this.data.targetName || '';
      const paginationViewModel = buildPaginationViewModel(payload.pagination || null);

      this.setData({
        loading: false,
        records,
        pagination: payload.pagination || null,
        yearOptions,
        yearIndex: savedIndexes.yearIndex,
        monthOptions,
        monthIndex: savedIndexes.monthIndex,
        filterIndex: savedIndexes.filterIndex,
        sourceIndex: savedIndexes.sourceIndex,
        syncStatusIndex: savedIndexes.syncStatusIndex,
        targetName,
        isAdmin,
        scopeLabelText: isAdmin ? '当前筛选' : '查看范围',
        scopeDisplayText: formatScopeDisplayText(targetName, isAdmin),
        hasRecords: records.length > 0,
        showEmptyState: records.length === 0,
        showPagination: paginationViewModel.showPagination,
        paginationText: paginationViewModel.paginationText,
        prevPageButtonClass: paginationViewModel.prevPageButtonClass,
        nextPageButtonClass: paginationViewModel.nextPageButtonClass
      }, () => {
        this.applyFilter();
      });
    } catch (error) {
      this.setData({
        loading: false,
        records: [],
        pagination: null,
        yearOptions: ['全部年份'],
        yearIndex: 0,
        monthOptions: ['全部月份'],
        monthIndex: 0,
        syncStatusIndex: 0,
        filteredRecords: [],
        hasRecords: false,
        showEmptyState: true,
        showPagination: false,
        paginationText: '',
        prevPageButtonClass: 'pagination-btn pagination-btn-disabled',
        nextPageButtonClass: 'pagination-btn pagination-btn-disabled',
        scopeDisplayText: formatScopeDisplayText(this.data.targetName || '', this.data.isAdmin)
      });
      showError(error && error.message ? error.message : '获取工资条记录失败');
    }
  },

  applyFilter() {
    this.setData({
      filteredRecords: this.data.records,
      hasRecords: this.data.records.length > 0,
      showEmptyState: this.data.records.length === 0
    });
  },

  normalizeSelectedIndex(options = [], currentValue = '', fallbackIndex = 0) {
    const matchedIndex = options.findIndex((item) => item === currentValue);
    return matchedIndex >= 0 ? matchedIndex : fallbackIndex;
  },

  onYearChange(e) {
    this.setData(
      {
        yearIndex: Number(e.detail.value) || 0,
        monthIndex: 0,
        currentPage: 1
      },
      () => {
        this.persistFilterState();
        this.loadRecords();
      }
    );
  },

  onMonthChange(e) {
    this.setData(
      {
        monthIndex: Number(e.detail.value) || 0,
        currentPage: 1
      },
      () => {
        this.persistFilterState();
        this.loadRecords();
      }
    );
  },

  onFilterChange(e) {
    this.setData(
      {
        filterIndex: Number(e.detail.value) || 0,
        currentPage: 1
      },
      () => {
        this.persistFilterState();
        this.loadRecords();
      }
    );
  },

  onSourceChange(e) {
    this.setData(
      {
        sourceIndex: Number(e.detail.value) || 0,
        currentPage: 1
      },
      () => {
        this.persistFilterState();
        this.loadRecords();
      }
    );
  },

  onSyncStatusChange(e) {
    this.setData(
      {
        syncStatusIndex: Number(e.detail.value) || 0,
        currentPage: 1
      },
      () => {
        this.persistFilterState();
        this.loadRecords();
      }
    );
  },

  onUserChange(e) {
    const index = Number(e.detail.value) || 0;
    const selectedUser = this.data.allUsers[index];
    this.setData({
      selectedUserIndex: index,
      selectedUserName: selectedUser && selectedUser.id !== 'all' ? selectedUser.name : '',
      selectedUserDisplayText: selectedUser && selectedUser.id !== 'all' ? selectedUser.name : '全部人员',
      currentPage: 1
    }, () => {
      this.persistFilterState();
      this.loadRecords();
    });
  },

  onPageChange(e) {
    const { page } = e.currentTarget.dataset;
    if (!page || page === this.data.currentPage) {
      return;
    }
    this.setData({
      currentPage: Number(page)
    }, () => {
      this.loadRecords();
    });
  },

  async onReconcileTap() {
    if (!this.data.isAdmin || this.data.reconcileLoading) {
      return;
    }

    this.setData({
      reconcileLoading: true,
      reconcileBtnDisabledClass: 'reconcile-btn-disabled',
      reconcileCheckButtonText: '处理中...',
      reconcileAutoRepairButtonText: '处理中...'
    });
    wx.showLoading({ title: '对账中...' });

    try {
      const summary = await this.runReconcile('check');
      if (summary) {
        showSuccess(`已检查 ${summary.checked_total || 0} 条，发现 ${summary.inconsistent_total || 0} 条异常`);
      } else {
        showSuccess('对账检查已完成');
      }
    } catch (error) {
      showError(error && error.message ? error.message : '对账失败');
    } finally {
      wx.hideLoading();
      this.setData({
        reconcileLoading: false,
        reconcileBtnDisabledClass: '',
        reconcileCheckButtonText: '对账检查',
        reconcileAutoRepairButtonText: '自动修正异常'
      });
    }
  },

  async onAutoRepairTap() {
    if (!this.data.isAdmin || this.data.reconcileLoading) {
      return;
    }

    this.setData({
      reconcileLoading: true,
      reconcileBtnDisabledClass: 'reconcile-btn-disabled',
      reconcileCheckButtonText: '处理中...',
      reconcileAutoRepairButtonText: '处理中...'
    });
    wx.showLoading({ title: '修正中...' });

    try {
      const summary = await this.runReconcile('auto');
      if (summary) {
        showSuccess(`已修正 ${summary.repaired_total || 0} 条，剩余异常 ${summary.inconsistent_total || 0} 条`);
      } else {
        showSuccess('自动修正已完成');
      }
    } catch (error) {
      showError(error && error.message ? error.message : '自动修正失败');
    } finally {
      wx.hideLoading();
      this.setData({
        reconcileLoading: false,
        reconcileBtnDisabledClass: '',
        reconcileCheckButtonText: '对账检查',
        reconcileAutoRepairButtonText: '自动修正异常'
      });
    }
  },

  openEditPopup(e) {
    const record = e.currentTarget.dataset.record;

    if (!record || !record.id) {
      showError('未找到工资条记录');
      return;
    }

    const editForm = normalizeSalaryForm(record.salary || {});
    const editingSummary = buildEditingSummary(editForm, record);
    this.setData({
      showEditPopup: true,
      editingRecordId: record.id,
      editingRecordTitle: `${record.employee_name} ${record.title}`,
      editingRecordMeta: record,
      editForm,
      editingFields: createEditingFields(editForm),
      readonlyFields: createReadonlyFields(editingSummary),
      editingSummary
    });
  },

  closeEditPopup() {
    this.setData({
      showEditPopup: false,
      submitting: false,
      saveButtonText: '保存工资条',
      editingRecordId: '',
      editingRecordTitle: '',
      editingRecordMeta: null,
      editForm: createDefaultSalaryForm(),
      editingFields: createEditingFields(createDefaultSalaryForm()),
      readonlyFields: createReadonlyFields(null),
      editingSummary: null
    });
  },

  stopPropagation() {},

  onEditInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    const editForm = {
      ...this.data.editForm,
      [field]: value
    };
    const calculatedForm = applyDerivedFields(
      editForm,
      this.data.editingRecordMeta && this.data.editingRecordMeta.overtimePayPerDay,
      this.data.editingRecordMeta && this.data.editingRecordMeta.overtimePayPerHour,
      this.data.editingRecordMeta && this.data.editingRecordMeta.domesticAllowancePerTripDay
    );
    const editingSummary = buildEditingSummary(calculatedForm, this.data.editingRecordMeta);
    const nextState = {
      editForm: calculatedForm,
      editingFields: createEditingFields(calculatedForm),
      readonlyFields: createReadonlyFields(editingSummary),
      editingSummary
    };

    this.setData(nextState);
  },

  validateSalaryForm() {
    for (const meta of SALARY_NUMERIC_FIELDS) {
      const raw = this.data.editForm[meta.key];
      if (raw === '' || raw === null || raw === undefined) {
        showError(`请填写${meta.label}`);
        return false;
      }

      if (Number.isNaN(Number(raw)) || Number(raw) < 0) {
        showError(`${meta.label}必须是大于等于0的数字`);
        return false;
      }
    }
    return true;
  },

  async saveEdit() {
    const { editingRecordMeta, editForm, submitting } = this.data;
    if (submitting) {
      return;
    }

    if (!editingRecordMeta || !editingRecordMeta.employee_name) {
      showError('缺少工资条记录信息');
      return;
    }

    if (!this.validateSalaryForm()) {
      return;
    }

    const calculatedForm = applyDerivedFields(
      editForm,
      editingRecordMeta.overtimePayPerDay,
      editingRecordMeta.overtimePayPerHour,
      editingRecordMeta.domesticAllowancePerTripDay
    );
    const salary = {};
    SALARY_NUMERIC_FIELDS.forEach((field) => {
      salary[field.key] = Number(editForm[field.key] || 0);
    });
    salary.abroad_business_days = Number(editForm.abroad_business_days || 0);
    salary.domestic_business_days = Number(editForm.domestic_business_days || 0);
    salary.holiday_overtime_days = Number(editForm.holiday_overtime_days || 0);
    salary.holiday_double_hours = Number(editForm.holiday_double_hours || 0);
    salary.holiday_triple_hours = Number(editForm.holiday_triple_hours || 0);
    salary.holiday_overtime_hours = Number(calculatedForm.holiday_overtime_hours || 0);
    salary.holiday_double_base_hours = Number(calculatedForm.holiday_double_base_hours || 0);
    salary.holiday_double_extra_hours = Number(calculatedForm.holiday_double_extra_hours || 0);
    salary.holiday_triple_base_hours = Number(calculatedForm.holiday_triple_base_hours || 0);
    salary.holiday_triple_extra_hours = Number(calculatedForm.holiday_triple_extra_hours || 0);
    salary.holiday_extra_hours = Number(calculatedForm.holiday_extra_hours || 0);
    salary.holiday_overtime_pay = Number(calculatedForm.holiday_overtime_pay || 0);
    salary.weekend_overtime_days = Number(editForm.weekend_overtime_days || 0);
    salary.weekend_overtime_day_count = Number(calculatedForm.weekend_overtime_day_count || 0);
    salary.weekend_base_hours = Number(calculatedForm.weekend_base_hours || 0);
    salary.weekend_extra_hours = Number(calculatedForm.weekend_extra_hours || 0);
    salary.weekend_overtime_pay = Number(calculatedForm.weekend_overtime_pay || 0);
    salary.workday_overtime_hours = Number(editForm.workday_overtime_hours || 0);
    salary.workday_overtime_pay = Number(calculatedForm.workday_overtime_pay || 0);
    salary.domestic_allowance = Number(calculatedForm.domestic_allowance || 0);
    salary.overtime_pay = Number(calculatedForm.overtime_pay || 0);
    salary.overtime_days = Number(calculatedForm.overtime_days || 0);
    salary.overtime_hours = Number(calculatedForm.overtime_hours || 0);
    salary.work_rest_mode = (editingRecordMeta.salary && editingRecordMeta.salary.work_rest_mode) || 'double_rest';

    this.setData({
      submitting: true,
      saveButtonText: '保存中...'
    });
    wx.showLoading({ title: '工资条保存中...' });

    try {
      const res = await API.attendance.saveSalarySheet({
        name: editingRecordMeta.employee_name,
        year: editingRecordMeta.year,
        month: editingRecordMeta.month_number,
        salary
      });

      if (!res || res.code !== 200) {
        if (res && res.data && res.data.need_netdisk_info) {
          showError(res.msg || '请先完善工资条配置');
          return;
        }
        throw new Error((res && res.msg) || '保存失败');
      }

      const lockedTip = res.data && res.data.manual_locked ? ' 本月自动任务已锁定，不会重复生成。' : '';
      this.closeEditPopup();
      await this.loadRecords();
      showSuccess(`${res.msg || '工资条已保存'}${lockedTip}`);
    } catch (error) {
      showError(error && error.message ? error.message : '保存失败');
    } finally {
      wx.hideLoading();
      this.setData({
        submitting: false,
        saveButtonText: '保存工资条'
      });
    }
  },

  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.navigateTo({
          url: '/pages/attendance/netdisk/index'
        });
      }
    });
  }
});
