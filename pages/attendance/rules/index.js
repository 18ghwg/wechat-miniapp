const { API } = require('../../../utils/api');

const DAY_TYPES = [
  { key: 'workday', label: '工作日' },
  { key: 'rest_day', label: '休息日' },
  { key: 'legal_holiday', label: '法定节假日' }
];
const OPTIONAL_DAY_TYPES = [{ key: '', label: '自动判断' }].concat(DAY_TYPES);

const SCENES = [
  { key: 'company', label: '公司上班' },
  { key: 'business_trip', label: '出差' }
];
const SHIFT_SCOPES = [
  { value: '', label: '公司和出差通用' },
  { value: 'company', label: '仅公司上班' },
  { value: 'business_trip', label: '仅出差' }
];
const ATTENDANCE_MODES = [{ value: 'fixed', label: '时间固定' }, { value: 'flexible', label: '时间不固定' }];
const OPTIONAL_ATTENDANCE_MODES = [{ value: '', label: '沿用场景设置' }].concat(ATTENDANCE_MODES);
const OPTIONAL_SCENES = [{ value: '', label: '自动判断' }].concat(SCENES);
const WEEKDAYS = [
  { key: 'sunday', dayOfWeek: 0, label: '周日' },
  { key: 'monday', dayOfWeek: 1, label: '周一' },
  { key: 'tuesday', dayOfWeek: 2, label: '周二' },
  { key: 'wednesday', dayOfWeek: 3, label: '周三' },
  { key: 'thursday', dayOfWeek: 4, label: '周四' },
  { key: 'friday', dayOfWeek: 5, label: '周五' },
  { key: 'saturday', dayOfWeek: 6, label: '周六' }
];
const FLEXIBLE_METRICS = [{ value: 'period_sum', label: '把每段打卡时间加起来' }, { value: 'first_last_span', label: '从第一次打卡算到最后一次' }];
const SHORTFALL_POLICIES = [{ value: 'ignore', label: '少于标准工时也照常算' }, { value: 'normal', label: '少于标准工时就不算早退' }];
const MISSING_PUNCH_POLICIES = [{ value: 'pending', label: '提醒我补上打卡' }, { value: 'ignore', label: '先不处理缺卡' }];
const DEDUCTION_METRICS = [{ value: 'attendance_span', label: '当天从上班到下班的时间' }, { value: 'overtime_minutes', label: '加班本身的时长' }];
const PRICING_MODES = [{ value: 'progressive', label: '每一段分别按对应单价算' }, { value: 'single_tier', label: '只用排在最前的一段' }];
const PRICING_SELECTORS = [{ value: 'cumulative_range', label: '按当天加班累计多久' }, { value: 'clock_window', label: '按钟点时段（例如 22:00 后）' }, { value: 'session_ordinal', label: '按当天第几场加班' }];
const SETTLEMENT_MODES = [{ value: 'paid', label: '算进工资' }, { value: 'comp_time', label: '换成调休' }];
const CAP_ORDERS = [{ value: 'round_then_cap', label: '先取整，再限制最高时长' }, { value: 'cap_then_round', label: '先限制最高时长，再取整' }];
const NIGHT_BASES = [{ value: 'actual_date', label: '跨过午夜的部分算到第二天' }, { value: 'shift_start', label: '整场都算到开始那天' }];
const ROUNDING_MODES = [{ value: 'none', label: '保留实际时长' }, { value: 'floor', label: '不满一档就舍去' }, { value: 'ceil', label: '不满一档也进到下一档' }, { value: 'nearest', label: '按最近的一档计算' }];
const ROUNDING_SCOPES = [{ value: 'day', label: '把当天加班合起来取整' }, { value: 'session', label: '每一场加班单独取整' }];
const WEEKLY_REST_MODES = [{ value: 'double', label: '双休' }, { value: 'single', label: '单休' }];
const ATTENDANCE_PLAN_OPTIONS = [
  {
    key: 'standard_double',
    name: '标准双休制',
    description: '周一至周五上班，周六、周日休息',
    summary: '09:00–18:00 · 每天 8 小时 · 午休 1 小时',
    recommended: true,
    mode: 'fixed',
    workDays: [1, 2, 3, 4, 5],
    startMinute: 9 * 60,
    endMinute: 18 * 60,
    standardMinutes: 8 * 60,
    breakMinutes: 60
  },
  {
    key: 'standard_single',
    name: '标准单休制',
    description: '周一至周六上班，周日休息',
    summary: '09:00–18:00 · 每天 8 小时 · 午休 1 小时',
    recommended: false,
    mode: 'fixed',
    workDays: [1, 2, 3, 4, 5, 6],
    startMinute: 9 * 60,
    endMinute: 18 * 60,
    standardMinutes: 8 * 60,
    breakMinutes: 60
  },
  {
    key: 'flexible_double',
    name: '弹性双休制',
    description: '周一至周五上班，不固定上下班钟点',
    summary: '每天累计 8 小时 · 周末双休 · 缺卡提醒',
    recommended: false,
    mode: 'flexible',
    workDays: [1, 2, 3, 4, 5],
    standardMinutes: 8 * 60,
    breakMinutes: 0
  }
];
const UNITS = [{ value: 'month', label: '月' }, { value: 'day', label: '天' }, { value: 'hour', label: '小时' }, { value: 'times', label: '次' }];
const LEGACY_COMPONENTS = [{ value: '', label: '不替代以前的项目' }, { value: 'meal_allowance', label: '替代以前的餐补' }, { value: 'domestic_allowance', label: '替代以前的国内出差补助' }, { value: 'abroad_allowance', label: '替代以前的国外出差补助' }];
const VALUE_MODES = [{ value: 'fixed', label: '我直接填写金额' }, { value: 'formula', label: '按下面的步骤自动计算' }];
const RATE_MODES = [{ value: 'fixed', label: '我直接填写每小时多少钱' }, { value: 'formula', label: '根据工资自动计算' }];
const FORMULA_OPERATORS = ['+', '-', '*', '/'];
const FORMULA_OPERANDS = [{ value: 'number', label: '我填一个数字' }, { value: 'variable', label: '从已有数据中选择' }];
const QUANTITY_SOURCES = [{ value: 'manual', label: '我自己填写数量' }, { value: 'automatic', label: '按打卡记录自动统计' }, { value: 'formula', label: '按我选择的条件计算' }];
const QUANTITY_VARIABLES = [
  { value: 'work_days', label: '当月工作天数' },
  { value: 'trip_days', label: '当月出差天数' },
  { value: 'domestic_trip_days', label: '国内出差天数' },
  { value: 'abroad_trip_days', label: '国外出差天数' },
  { value: 'overtime_hours', label: '当月有效加班小时' }
];
const FORMULA_VARIABLES = [
  { value: 'base_salary', label: '月基本工资' },
  { value: 'standard_monthly_days', label: '月标准出勤天数' },
  { value: 'standard_daily_hours', label: '每日标准工时' },
  { value: 'overtime_base', label: '加班工资基数' },
	{ value: 'work_days', label: '当月工作天数' },
	{ value: 'trip_days', label: '当月出差天数' },
	{ value: 'domestic_trip_days', label: '国内出差天数' },
	{ value: 'abroad_trip_days', label: '国外出差天数' },
	{ value: 'overtime_hours', label: '当月有效加班小时' },
  { value: 'overtime_pay', label: '当月加班费' }
];
const SALARY_PRESETS = [
  { value: 'position_allowance', label: '岗位津贴（按月）' },
  { value: 'meal_allowance', label: '餐补（按工作天）' },
  { value: 'domestic_allowance', label: '国内出差补助（按天）' },
  { value: 'abroad_allowance', label: '国外出差补助（按天）' },
  { value: 'special_allowance', label: '特殊津贴（按条件自动计算）' }
];
const SALARY_PRESET_LEGACY_COMPONENTS = {
  meal_allowance: 'meal_allowance',
  domestic_allowance: 'domestic_allowance',
  abroad_allowance: 'abroad_allowance'
};
const SALARY_PRESET_NAMES = {
  position_allowance: '岗位津贴',
  meal_allowance: '餐补',
  domestic_allowance: '国内出差补助',
  abroad_allowance: '国外出差补助',
  special_allowance: '特殊津贴'
};

function isSalaryPresetAdded(preset, customItems = []) {
  const legacyComponent = SALARY_PRESET_LEGACY_COMPONENTS[preset.value];
  const presetIdPrefix = `${preset.value}_`;
  const defaultName = SALARY_PRESET_NAMES[preset.value];
  return customItems.some(item => {
    if (!item) return false;
    if (item.preset_key === preset.value || String(item.id || '').startsWith(presetIdPrefix)) return true;
    if (legacyComponent && item.legacy_component === legacyComponent) return true;
    return item.name === defaultName && (!item.legacy_component || item.legacy_component === legacyComponent);
  });
}

function selectedSalaryPresetIsAdded(document, salaryPresetIndex) {
  const preset = SALARY_PRESETS[salaryPresetIndex] || SALARY_PRESETS[0];
  return isSalaryPresetAdded(preset, document && document.payroll && document.payroll.custom_items);
}

const PREVIEW_OVERTIME_MODES = [
  { value: 'auto', label: '按打卡自动推导' },
  { value: 'manual', label: '使用独立加班场次' }
];
const WIZARD_STEPS = [
  { key: 'basics', title: '你几点上班、几点下班？', description: '公司上班和出差可以分开设置；上下班时间由你直接填写' },
  { key: 'schedule', title: '你每周怎么安排？', description: '先选单休或双休，有特殊情况再单独调整' },
  { key: 'overtime', title: '加班多久、怎么算？', description: '工作日、休息日和节假日可以分别设置' },
  { key: 'payroll', title: '你的工资和补贴有哪些？', description: '填写税前基本工资，再按需要添加补贴' },
  { key: 'publish', title: '先试算，再决定何时开始', description: '确认结果符合预期后，再让新规则生效' }
];
const STEP_GUIDES = {
  basics: [
    { target: 'sceneTabs', title: '你是在公司上班，还是出差？', body: '两种情况的上班时间和工时要求可能不同，可以分别设置。' },
    { target: 'standardHours', title: '你一天需要工作多久？', body: '按小时填写，例如 8 或 7.5 小时。' },
    { target: 'primaryStart', title: '你通常几点上班、几点下班？', body: '上班和下班时间都由你直接选择，系统不会用休息时长替你推算下班时间。' }
  ],
  schedule: [
    { target: 'shiftTemplates', title: '先选单休或双休', body: '系统会直接使用第一步的时间。只有多班次、倒班或特殊时间才需要额外设置。' },
    { target: 'weeklySchedule', title: '每周哪几天用这个班次？', body: '为常上班的日子选择班次；休息日可以不指定。临时调班可单独设置日期。' }
  ],
  overtime: [
    { target: 'dayTabs', title: '这一天属于哪种日子？', body: '工作日、休息日和法定节假日可以各自使用不同的加班算法。' },
    { target: 'deductionRules', title: '打卡时间跨度多长时要扣休息？', body: '例如：当天从上班到下班超过 11.5 小时，就扣掉 1 小时。这里填写的是上下班打卡的总跨度，不是加班时长。' },
    { target: 'pricingBands', title: '每段加班分别怎么算钱？', body: '可以按加班累计时长、具体钟点或当天第几场来设置单价；不同规则不要重叠。' }
  ],
  payroll: [
    { target: 'baseSalary', title: '你每月的税前基本工资是多少？', body: '填写工资条上的月基本工资，不在这里计算个税和社保。' },
    { target: 'salaryItems', title: '你还会拿到哪些补贴？', body: '餐补、出差补助等可以直接选预设；没有的项目不用添加。' }
  ],
  publish: [
    { target: 'preview', title: '拿一天的打卡记录试试看', body: '选一个常见日期，填上班和下班时间，看看加班和税前金额是不是你预期的结果。' },
    { target: 'publish', title: '你想从哪个月开始使用新规则？', body: '规则按整个月生效。选择本月会用新规则重算本月全部考勤；选择下月则从下月 1 日开始使用。' }
  ]
};
const GUIDE_STORAGE_PREFIX = 'attendance_rules_guide_seen_';
const ATTENDANCE_STATUS_LABELS = {
  normal: '正常',
  shortfall_ignored: '工时不足，已按设置忽略早退',
  missing_punch_pending: '缺卡，待补卡',
  missing_punch_ignored: '缺卡，已按设置忽略',
  no_attendance: '无打卡记录'
};
const OVERTIME_SOURCE_LABELS = {
  attendance_derived: '按打卡自动推导',
  explicit_sessions: '按独立加班场次',
  none: '无加班时段'
};

const clone = value => JSON.parse(JSON.stringify(value));
const minuteText = value => `${String(Math.floor(Number(value || 0) / 60)).padStart(2, '0')}:${String(Number(value || 0) % 60).padStart(2, '0')}`;
const hoursToMinutes = value => Math.min(24 * 60, Math.max(1, Math.round(Number(value || 0) * 60)));
const optionalHoursToMinutes = value => Math.max(0, Math.round(Number(value || 0) * 60));
const formatHours = minutes => Number((Number(minutes || 0) / 60).toFixed(2));
const timeMinute = value => {
  const parts = String(value || '').split(':').map(Number);
  return parts.length === 2 && parts.every(Number.isFinite) ? parts[0] * 60 + parts[1] : 0;
};
const optionIndex = (options, value) => Math.max(0, options.findIndex(item => item.value === value));
const optionLabel = (options, value) => (options.find(item => item.value === value) || { label: value }).label;
const variableLabel = value => (FORMULA_VARIABLES.find(item => item.value === value) || { label: value }).label;
const quantityVariableLabel = value => (QUANTITY_VARIABLES.find(item => item.value === value) || { label: value }).label;
const legacyComponentLabel = value => optionLabel(LEGACY_COMPONENTS, value || '');
const pricingBandNeedsRate = band => {
  if (!band || band.settlement === 'comp_time') return false;
  if (band.rate && band.rate.mode === 'formula') return false;
  return !(band.rate && Number(band.rate.cents_per_hour) > 0);
};
const ruleNeedsPricingRate = rule => {
  const bands = rule && Array.isArray(rule.bands) ? rule.bands : [];
  return !bands.length || bands.some(pricingBandNeedsRate);
};
const assertSuccess = (response, fallback) => {
  if (!response || response.code !== 200) throw new Error((response && response.msg) || fallback);
  return response;
};

function syncPrimaryWorkPeriod(rule, idPrefix) {
  if (!rule || rule.mode !== 'fixed') return;
  rule.normal_work_periods = rule.normal_work_periods || [];
  if (!rule.normal_work_periods.length) {
    rule.normal_work_periods.push({ id: `${idPrefix}_primary`, name: '标准工作时段', start_minute: 8 * 60, end_minute: 16 * 60, ends_next_day: false });
  }
  const period = rule.normal_work_periods[0];
  period.start_minute = Math.max(0, Math.min(1439, Number(period.start_minute || 0)));
  period.end_minute = Math.max(0, Math.min(1439, Number(period.end_minute || 0)));
  if (period.ends_next_day === undefined) period.ends_next_day = period.end_minute <= period.start_minute;
  period.start_text = minuteText(period.start_minute);
  period.end_text = minuteText(period.end_minute);
  period.name = period.name || '标准工作时段';
}

function normalizeFormula(formula, fallbackVariable) {
  const normalized = formula || { start: { kind: 'variable', variable: fallbackVariable }, steps: [] };
  normalized.start = normalized.start || { kind: 'variable', variable: fallbackVariable };
  normalized.steps = normalized.steps || [];
  normalized.start_label = normalized.start.kind === 'number' ? `数字 ${normalized.start.value || 0}` : variableLabel(normalized.start.variable || fallbackVariable);
  normalized.steps.forEach(step => {
    step.operand = step.operand || { kind: 'number', value: 1 };
    step.operand_kind_label = step.operand.kind === 'variable' ? '从已有数据中选择' : '我填一个数字';
    step.operand_label = step.operand.kind === 'variable' ? variableLabel(step.operand.variable) : '我填一个数字';
  });
  return normalized;
}

function formulaFor(document, dayType, target, ownerIndex) {
  if (target === 'band_rate') return document.day_rules[dayType].bands[ownerIndex].rate.formula;
  const item = document.payroll.custom_items[ownerIndex];
  return target === 'item_quantity' ? item.quantity_formula : item.formula;
}

function normalizeDocument(source) {
  const document = clone(source);
  document.attendance = document.attendance || {};
  document.attendance.scenes = document.attendance.scenes || {};
  SCENES.forEach(scene => {
    const rule = document.attendance.scenes[scene.key] || {};
    rule.mode = rule.mode || (scene.key === 'company' ? 'fixed' : 'flexible');
    rule.standard_minutes = Number(rule.standard_minutes || 480);
    rule.break_minutes = rule.break_minutes === undefined ? 0 : Math.max(0, Number(rule.break_minutes || 0));
    rule.flexible_metric = rule.flexible_metric || 'period_sum';
    rule.shortfall_policy = rule.shortfall_policy || 'ignore';
    rule.missing_punch_policy = rule.missing_punch_policy || 'pending';
    rule.normal_work_periods = rule.normal_work_periods || [];
    rule.normal_work_periods.forEach(period => {
      period.start_text = minuteText(period.start_minute);
      period.end_text = minuteText(period.end_minute);
    });
    syncPrimaryWorkPeriod(rule, `scene_${scene.key}`);
    document.attendance.scenes[scene.key] = rule;
  });
  document.attendance.shift_templates = document.attendance.shift_templates || {};
  Object.keys(document.attendance.shift_templates).forEach(key => {
    const template = document.attendance.shift_templates[key] || {};
    template.id = key;
    template.name = template.name || '未命名班次';
    if (template.scene === undefined || template.scene === null) template.scene = 'company';
    template.mode = template.mode || 'fixed';
    template.standard_minutes = Number(template.standard_minutes || 480);
    template.break_minutes = template.break_minutes === undefined ? 0 : Math.max(0, Number(template.break_minutes || 0));
    template.normal_work_periods = template.normal_work_periods || [];
    template.normal_work_periods.forEach(period => {
      period.start_text = minuteText(period.start_minute);
      period.end_text = minuteText(period.end_minute);
    });
    syncPrimaryWorkPeriod(template, `shift_${key}`);
    document.attendance.shift_templates[key] = template;
  });
  document.attendance.weekly_schedule = document.attendance.weekly_schedule || {};
  document.attendance.day_overrides = document.attendance.day_overrides || [];
  DAY_TYPES.forEach(dayType => {
    const rule = document.day_rules[dayType.key];
    rule.deductions = rule.deductions || [];
    rule.bands = rule.bands || [];
    rule.rounding = rule.rounding || { mode: 'none', step_minutes: 1 };
    rule.rounding.scope = rule.rounding.scope || 'day';
    rule.cap_order = rule.cap_order || 'round_then_cap';
    rule.pricing_mode = rule.pricing_mode || 'progressive';
    rule.night_day_basis = rule.night_day_basis || 'actual_date';
    rule.bands.forEach(band => {
      band.selector = band.selector || 'cumulative_range';
      band.selector_label = optionLabel(PRICING_SELECTORS, band.selector);
      band.settlement = band.settlement || 'paid';
      band.settlement_label = optionLabel(SETTLEMENT_MODES, band.settlement);
      band.comp_time_ratio = Number(band.comp_time_ratio || 1);
      band.clock_start_text = minuteText(band.clock_start_minute === null || band.clock_start_minute === undefined ? 18 * 60 : band.clock_start_minute);
      band.clock_end_text = minuteText(band.clock_end_minute === null || band.clock_end_minute === undefined ? 22 * 60 : band.clock_end_minute);
      band.rate = band.rate || { mode: 'fixed', cents_per_hour: 0 };
      band.rate.mode = band.rate.mode || 'fixed';
      if (band.rate.mode === 'formula') band.rate.formula = normalizeFormula(band.rate.formula, 'overtime_base');
    });
  });
  document.payroll.custom_items = (document.payroll.custom_items || []).map(item => {
    const normalized = Object.assign({ legacy_component: '', quantity_source: 'manual', quantity_variable: 'work_days', manual_quantity: 1, include_in_pretax: true, include_in_overtime_base: false }, item);
    if (normalized.value_mode === 'formula') normalized.formula = normalizeFormula(normalized.formula, 'base_salary');
    normalized.quantity_variable_label = quantityVariableLabel(normalized.quantity_variable);
    normalized.legacy_component_label = legacyComponentLabel(normalized.legacy_component);
    if (normalized.quantity_source === 'formula') normalized.quantity_formula = normalizeFormula(normalized.quantity_formula, 'work_days');
    normalized.unit_label = optionLabel(UNITS, normalized.unit);
    normalized.value_mode_label = optionLabel(VALUE_MODES, normalized.value_mode);
    return normalized;
  });
  return document;
}

function ruleStatusText(meta = {}) {
  if (meta.setup_state === 'unconfigured' || meta.status === 'legacy_v1') return '未配置';
  if (meta.setup_state === 'draft_unpublished') return '草稿未发布';
  if (meta.setup_state === 'published_with_draft') return '已发布 · 有新草稿';
  if (meta.status === 'published') return '已发布';
  return '草稿';
}

function buildAttendancePlanDocument(source, planKey) {
  const plan = ATTENDANCE_PLAN_OPTIONS.find(item => item.key === planKey);
  if (!plan) throw new Error('考勤方案不存在');
  const document = normalizeDocument(source);
  const attendance = document.attendance;
  const shiftID = `preset_${plan.key}`;
  const workPeriods = plan.mode === 'fixed' ? [{
    id: `${shiftID}_period`,
    name: '标准工作时段',
    start_minute: plan.startMinute,
    end_minute: plan.endMinute,
    start_text: minuteText(plan.startMinute),
    end_text: minuteText(plan.endMinute),
    ends_next_day: false
  }] : [];

  attendance.default_scene = 'company';
  attendance.scene_priority = attendance.scene_priority || ['manual', 'dingtalk_remark', 'default'];
  attendance.shift_templates = {
    [shiftID]: {
      id: shiftID,
      name: plan.name,
      scene: 'company',
      mode: plan.mode,
      standard_minutes: plan.standardMinutes,
      break_minutes: plan.breakMinutes,
      normal_work_periods: clone(workPeriods)
    }
  };
  attendance.weekly_schedule = {};
  WEEKDAYS.forEach(day => {
    if (plan.workDays.includes(day.dayOfWeek)) {
      attendance.weekly_schedule[day.key] = { day_of_week: day.dayOfWeek, shift_template_id: shiftID, scene: 'company' };
    }
  });
  attendance.day_overrides = [];
  attendance.scenes.company = Object.assign({}, attendance.scenes.company, {
    mode: plan.mode,
    standard_minutes: plan.standardMinutes,
    break_minutes: plan.breakMinutes,
    flexible_metric: 'period_sum',
    shortfall_policy: 'ignore',
    missing_punch_policy: 'pending',
    normal_work_periods: clone(workPeriods),
    default_shift_template: shiftID,
    allow_daily_mode_override: true
  });
  attendance.scenes.business_trip = Object.assign({}, attendance.scenes.business_trip, {
    mode: 'flexible',
    standard_minutes: plan.standardMinutes,
    break_minutes: 0,
    flexible_metric: 'period_sum',
    shortfall_policy: 'ignore',
    missing_punch_policy: 'pending',
    normal_work_periods: [],
    default_shift_template: '',
    allow_daily_mode_override: true
  });
  return normalizeDocument(document);
}

function scheduleView(document) {
  const shiftTemplates = Object.keys(document.attendance.shift_templates || {}).map(key => {
    const template = document.attendance.shift_templates[key];
    const sceneIndex = Math.max(0, SHIFT_SCOPES.findIndex(option => option.value === template.scene));
    return Object.assign({}, template, {
      sceneIndex,
      sceneLabel: SHIFT_SCOPES[sceneIndex].label
    });
  });
  const shiftTemplateOptions = [{ value: '', label: '休息' }].concat(shiftTemplates.map(item => ({ value: item.id, label: item.name })));
  const weeklyRows = WEEKDAYS.map(day => {
    const entry = Object.values(document.attendance.weekly_schedule || {}).find(item => Number(item.day_of_week) === day.dayOfWeek) || {};
    const templateIndex = Math.max(0, shiftTemplateOptions.findIndex(item => item.value === entry.shift_template_id));
    return Object.assign({}, day, { templateIndex, templateLabel: shiftTemplateOptions[templateIndex].label });
  });
  const dayOverrides = (document.attendance.day_overrides || []).map(item => {
    const templateIndex = Math.max(0, shiftTemplateOptions.findIndex(option => option.value === item.shift_template_id));
    const sceneIndex = Math.max(0, OPTIONAL_SCENES.findIndex(option => option.key === item.scene || option.value === item.scene));
    const modeIndex = Math.max(0, OPTIONAL_ATTENDANCE_MODES.findIndex(option => option.value === item.mode));
    const dayTypeIndex = Math.max(0, OPTIONAL_DAY_TYPES.findIndex(option => option.key === item.day_type));
    return Object.assign({}, item, {
      templateIndex,
      templateLabel: shiftTemplateOptions[templateIndex].label,
      sceneIndex,
      sceneLabel: OPTIONAL_SCENES[sceneIndex].label,
      modeIndex,
      modeLabel: OPTIONAL_ATTENDANCE_MODES[modeIndex].label,
      dayTypeIndex,
      dayTypeLabel: OPTIONAL_DAY_TYPES[dayTypeIndex].label
    });
  });
  const sunday = Object.values(document.attendance.weekly_schedule || {}).some(item => Number(item.day_of_week) === 0 && item.shift_template_id);
  const saturday = Object.values(document.attendance.weekly_schedule || {}).some(item => Number(item.day_of_week) === 6 && item.shift_template_id);
  const weeklyRestMode = !sunday && saturday ? 'single' : (!sunday && !saturday ? 'double' : 'custom');
  return { shiftTemplates, shiftTemplateOptions, weeklyRows, dayOverrides, weeklyRestMode };
}

function sceneNeedsAttention(scene) {
  if (!scene) return true;
  if (scene.mode !== 'fixed') return !Number(scene.standard_minutes);
  const period = Array.isArray(scene.normal_work_periods) && scene.normal_work_periods[0];
  return !period || period.start_minute === undefined || period.end_minute === undefined;
}

function dayRuleNeedsAttention(rule) {
  return ruleNeedsPricingRate(rule);
}

function configurationStatus(document) {
  const attendance = (document && document.attendance) || {};
  const scenes = attendance.scenes || {};
  const dayRules = (document && document.day_rules) || {};
  return {
    sceneStatuses: {
      company: sceneNeedsAttention(scenes.company),
      business_trip: sceneNeedsAttention(scenes.business_trip)
    },
    dayRuleStatuses: {
      workday: dayRuleNeedsAttention(dayRules.workday),
      rest_day: dayRuleNeedsAttention(dayRules.rest_day),
      legal_holiday: dayRuleNeedsAttention(dayRules.legal_holiday)
    }
  };
}

function findWeeklyTemplateID(document, sceneKey) {
  const attendance = document.attendance || {};
  const templates = attendance.shift_templates || {};
  const scene = attendance.scenes && attendance.scenes[sceneKey];
  const isCompatible = template => template && (!sceneKey || template.scene === '' || template.scene === sceneKey);
  if (scene && scene.default_shift_template && isCompatible(templates[scene.default_shift_template])) return scene.default_shift_template;
  const scheduledIDs = Object.values(attendance.weekly_schedule || {}).map(item => item.shift_template_id).filter(Boolean);
  const scheduledForScene = scheduledIDs.find(id => templates[id] && templates[id].scene === '')
    || scheduledIDs.find(id => isCompatible(templates[id]));
  if (scheduledForScene) return scheduledForScene;
  return Object.keys(templates).find(id => templates[id].scene === '')
    || Object.keys(templates).find(id => isCompatible(templates[id]))
    || '';
}

function sceneShiftValuesEqual(left, right) {
  if (!left || !right) return false;
  if ((left.mode || 'fixed') !== (right.mode || 'fixed')) return false;
  if (Number(left.standard_minutes || 0) !== Number(right.standard_minutes || 0)) return false;
  if (Number(left.break_minutes || 0) !== Number(right.break_minutes || 0)) return false;
  const leftPeriods = left.normal_work_periods || [];
  const rightPeriods = right.normal_work_periods || [];
  if (leftPeriods.length !== rightPeriods.length) return false;
  return leftPeriods.every((period, index) => {
    const other = rightPeriods[index] || {};
    return Number(period.start_minute || 0) === Number(other.start_minute || 0)
      && Number(period.end_minute || 0) === Number(other.end_minute || 0)
      && !!period.ends_next_day === !!other.ends_next_day;
  });
}

function createDefaultShiftTemplate(document, sceneKey) {
  const attendance = document.attendance || (document.attendance = {});
  const scenes = attendance.scenes || (attendance.scenes = {});
  const source = scenes[sceneKey] || scenes.company || scenes.business_trip;
  if (!source) return '';
  attendance.shift_templates = attendance.shift_templates || {};
  const shared = sceneShiftValuesEqual(scenes.company, scenes.business_trip);
  const id = `shift_default_${Date.now()}`;
  let periods = clone(source.normal_work_periods || []);
  const mode = source.mode || 'fixed';
  if (mode === 'fixed' && !periods.length) {
    periods = [{ id: `${id}_period_1`, name: '标准工作时段', start_minute: 480, end_minute: 960, start_text: '08:00', end_text: '16:00', ends_next_day: false }];
  }
  attendance.shift_templates[id] = {
    id,
    name: '默认工作班次',
    scene: shared ? '' : sceneKey,
    mode,
    standard_minutes: Number(source.standard_minutes || 480),
    break_minutes: Number(source.break_minutes || 0),
    normal_work_periods: periods
  };
  const targetScenes = shared ? ['company', 'business_trip'] : [sceneKey];
  targetScenes.forEach(key => {
    if (scenes[key] && !scenes[key].default_shift_template) scenes[key].default_shift_template = id;
  });
  return id;
}

function historyVersionView(version) {
  const document = version && version.document ? version.document : {};
  const attendance = document.attendance || {};
  const scenes = attendance.scenes || {};
  const payroll = document.payroll || {};
  const dayRules = document.day_rules || {};
  const sceneText = key => {
    const scene = scenes[key] || {};
    const mode = scene.mode === 'flexible' ? '自由工时' : '固定时间';
    return `${mode} · 标准 ${formatHours(scene.standard_minutes)} 小时`;
  };
  return {
    version: version.version,
    status: version.status,
    effectiveText: `${version.effective_from || '未发布'} 至 ${version.effective_to || '长期'}`,
    baseSalaryText: (Number(payroll.base_salary_cents || 0) / 100).toFixed(2),
    companyText: sceneText('company'),
    tripText: sceneText('business_trip'),
    shiftCount: Object.keys(attendance.shift_templates || {}).length,
    overrideCount: (attendance.day_overrides || []).length,
    salaryItemCount: (payroll.custom_items || []).length,
    dayRules: DAY_TYPES.map(item => {
      const rule = dayRules[item.key] || {};
      const minimum = rule.minimum || {};
      return {
        key: item.key,
        label: item.label,
        minimumText: `${minimum.operator || '>='} ${formatHours(minimum.minutes)} 小时`,
        deductionCount: (rule.deductions || []).length,
        bandCount: (rule.bands || []).length,
        dailyCapText: rule.daily_cap_minutes === null || rule.daily_cap_minutes === undefined ? '不限' : `${formatHours(rule.daily_cap_minutes)} 小时`,
        monthlyCapText: rule.monthly_cap_minutes === null || rule.monthly_cap_minutes === undefined ? '不限' : `${formatHours(rule.monthly_cap_minutes)} 小时`
      };
    })
  };
}

const { enableShareMenu } = require('../../../utils/share');

Page({
  data: {
    loading: true,
    saving: false,
    validating: false,
    previewing: false,
    publishing: false,
    historyLoading: false,
    restoringVersion: 0,
    document: null,
    loadError: '',
    meta: {},
    ruleStatusText: '未配置',
    quickSetupVisible: false,
    quickSetupApplied: false,
    applyingPlanKey: '',
    selectedPlanKey: '',
    attendancePlanOptions: ATTENDANCE_PLAN_OPTIONS,
    validation: null,
    selectedDayType: 'workday',
    selectedScene: 'company',
    wizardSteps: WIZARD_STEPS,
    currentStep: 0,
    wizardScrollIntoView: 'wizard-step-0',
    currentStepTitle: WIZARD_STEPS[0].title,
    currentStepDescription: WIZARD_STEPS[0].description,
    advancedOpen: {
      basics: false,
      schedule: false,
      overtime: false,
      payroll: false
    },
    guideOpen: false,
    guideIndex: 0,
    guideCount: 0,
    guideItem: null,
    pricingNeedsAttention: false,
    pricingSkipConfirmed: false,
    pricingSkipByDayType: { workday: false, rest_day: false, legal_holiday: false },
    sceneStatuses: {},
    dayRuleStatuses: {},
    dayTypes: DAY_TYPES,
    optionalDayTypes: OPTIONAL_DAY_TYPES,
    scenes: SCENES,
    shiftScopeOptions: SHIFT_SCOPES,
    optionalScenes: OPTIONAL_SCENES,
    optionalAttendanceModes: OPTIONAL_ATTENDANCE_MODES,
    weekdays: WEEKDAYS,
    shiftTemplates: [],
    shiftTemplatesOpen: false,
    shiftDetailsOpen: {},
    shiftTemplateOptions: [{ value: '', label: '休息' }],
    weeklyRestModeOptions: WEEKLY_REST_MODES,
    weeklyRestMode: 'double',
    weeklyRows: [],
    dayOverrides: [],
    attendanceModeOptions: ATTENDANCE_MODES,
    flexibleMetricOptions: FLEXIBLE_METRICS,
    shortfallPolicyOptions: SHORTFALL_POLICIES,
    missingPunchPolicyOptions: MISSING_PUNCH_POLICIES,
    deductionMetricOptions: DEDUCTION_METRICS,
    pricingModeOptions: PRICING_MODES,
    pricingSelectorOptions: PRICING_SELECTORS,
    settlementModeOptions: SETTLEMENT_MODES,
    capOrderOptions: CAP_ORDERS,
    nightBasisOptions: NIGHT_BASES,
    operatorOptions: ['>', '>=', '=', '<=', '<'],
    operatorIndex: 1,
    roundingOptions: ROUNDING_MODES,
    roundingIndex: 1,
    roundingScopeOptions: ROUNDING_SCOPES,
    unitOptions: UNITS,
    legacyComponentOptions: LEGACY_COMPONENTS,
    valueModeOptions: VALUE_MODES,
    rateModeOptions: RATE_MODES,
    formulaVariableOptions: FORMULA_VARIABLES,
    formulaOperatorOptions: FORMULA_OPERATORS,
    formulaOperandOptions: FORMULA_OPERANDS,
    quantitySourceOptions: QUANTITY_SOURCES,
    quantityVariableOptions: QUANTITY_VARIABLES,
    salaryPresetOptions: SALARY_PRESETS,
    salaryPresetIndex: 0,
    salaryPresetAlreadyAdded: false,
    preview: null,
    previewAmount: '0.00',
    previewPretax: '0.00',
    previewWorkDays: '21.75',
	previewTripDays: '0',
	previewOvertimeModes: PREVIEW_OVERTIME_MODES,
	previewOvertimeMode: 'auto',
	previewSessions: [{ id: 'preview_1', start: '18:00', hours: '2' }],
    previewAttendanceStart: '08:00',
    previewAttendanceEnd: '20:00',
	    previewAttendanceEndsNextDay: false,
	    previewDate: '2026-09-20',
	    effectiveFrom: '',
	    effectiveMonthOptions: [],
	    effectiveMonthIndex: 1,
	versions: [],
	showHistory: false,
	historyPreview: null,
    copySourceIndex: 1,
    copyParts: { minimum: true, deductions: true, rounding: true, limits: true, pricing: true, night: true }
  },

  onLoad(options = {}) {
    enableShareMenu('考勤与工资规则');
    this._setupEntryRequested = options.setup === '1';
    this.loadRule();
  },
  onPullDownRefresh() { this.loadRule().finally(() => wx.stopPullDownRefresh()); },
  onShareAppMessage() { return { title: '考勤与工资规则', path: '/pages/attendance/rules/index' }; },
  onShareTimeline() { return { title: '考勤与工资规则' }; },

  guideStorageKey(stepIndex = this.data.currentStep) { return `${GUIDE_STORAGE_PREFIX}${WIZARD_STEPS[stepIndex].key}_v1`; },
  advancedSectionForTarget(target) {
    const sections = {
      flexibleMetric: 'basics',
      shortfallPolicy: 'basics',
      missingPunchPolicy: 'basics',
      defaultShift: 'basics',
      specialPeriods: 'basics',
      dayOverrides: 'schedule',
      minimumEffective: 'overtime',
      roundingAndLimits: 'overtime',
      pricingBands: 'overtime',
      copyRules: 'overtime',
      salaryDetails: 'payroll'
    };
    return sections[target] || '';
  },
  toggleAdvanced(e) {
    const section = e.currentTarget.dataset.section;
    if (!section || !Object.prototype.hasOwnProperty.call(this.data.advancedOpen, section)) return;
    this.setData({ [`advancedOpen.${section}`]: !this.data.advancedOpen[section] });
  },
  openAdvancedForTarget(target) {
    const section = this.advancedSectionForTarget(target);
    if (section && !this.data.advancedOpen[section]) this.setData({ [`advancedOpen.${section}`]: true });
  },
  scrollGuideTarget(target) {
    if (!target || typeof wx.createSelectorQuery !== 'function' || typeof wx.pageScrollTo !== 'function') return;
    const query = wx.createSelectorQuery();
    query.select(`#guide-${target}`).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(result => {
      const rect = result && result[0];
      const viewport = result && result[1];
      if (!rect || !viewport) return;
      wx.pageScrollTo({ scrollTop: Math.max(0, Number(viewport.scrollTop || 0) + Number(rect.top || 0) - 160), duration: 200 });
    });
  },
  showGuideForStep(stepIndex, force = false) {
    const step = WIZARD_STEPS[stepIndex];
    const guides = STEP_GUIDES[step.key] || [];
    const seen = typeof wx.getStorageSync === 'function' ? wx.getStorageSync(this.guideStorageKey(stepIndex)) : false;
    if (!guides.length || (!force && seen)) {
      this.setData({ guideOpen: false, guideIndex: 0, guideCount: guides.length, guideItem: null });
      return;
    }
    this.openAdvancedForTarget(guides[0].target);
    this.setData({ guideOpen: true, guideIndex: 0, guideCount: guides.length, guideItem: guides[0] });
    if (typeof wx.nextTick === 'function') wx.nextTick(() => this.scrollGuideTarget(guides[0].target));
  },
  completeStepGuide() {
    if (typeof wx.setStorageSync === 'function') wx.setStorageSync(this.guideStorageKey(), true);
    this.setData({ guideOpen: false, guideItem: null });
  },
  nextGuide() {
    const guides = STEP_GUIDES[WIZARD_STEPS[this.data.currentStep].key] || [];
    const nextIndex = this.data.guideIndex + 1;
    if (nextIndex >= guides.length) {
      this.completeStepGuide();
      return;
    }
    this.openAdvancedForTarget(guides[nextIndex].target);
    this.setData({ guideIndex: nextIndex, guideCount: guides.length, guideItem: guides[nextIndex] });
    if (typeof wx.nextTick === 'function') wx.nextTick(() => this.scrollGuideTarget(guides[nextIndex].target));
  },
  skipGuide() { this.completeStepGuide(); },
  replayStepGuide() { this.showGuideForStep(this.data.currentStep, true); },
  changeWizardStep(stepIndex) {
    const normalized = Math.max(0, Math.min(WIZARD_STEPS.length - 1, Number(stepIndex)));
    if (normalized > this.data.currentStep && this.data.currentStep === 2 && this.data.pricingNeedsAttention && !this.data.pricingSkipConfirmed) {
      this.promptBeforeLeavingPricing(normalized);
      return false;
    }
    const step = WIZARD_STEPS[normalized];
    this.setData({ currentStep: normalized, wizardScrollIntoView: `wizard-step-${normalized}`, currentStepTitle: step.title, currentStepDescription: step.description, guideOpen: false, guideItem: null });
    this.showGuideForStep(normalized);
    if (typeof wx.pageScrollTo === 'function') wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    return true;
  },
  onWizardStepTap(e) { this.changeWizardStep(e.currentTarget.dataset.index); },
  previousWizardStep() { this.changeWizardStep(this.data.currentStep - 1); },
  nextWizardStep() { this.changeWizardStep(this.data.currentStep + 1); },

  loadRule() {
    this.setData({ loading: true, loadError: '', pricingSkipByDayType: { workday: false, rest_day: false, legal_holiday: false }, pricingSkipConfirmed: false });
    return API.attendance.getRuleDocument().then(res => {
      assertSuccess(res, '读取规则失败');
      const data = res.data || {};
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const formatMonth = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      const effectiveMonthOptions = [
        { label: `本月（${now.getMonth() + 1}月，整月重算）`, value: formatMonth(currentMonth) },
        { label: `下月（${nextMonth.getMonth() + 1}月，整月生效）`, value: formatMonth(nextMonth) }
      ];
      const effectiveFrom = effectiveMonthOptions[1].value;
      const document = normalizeDocument(data.document);
      const meta = data.meta || {};
      const rule = document.day_rules[this.data.selectedDayType];
      const quickSetupVisible = meta.needs_setup === true || meta.setup_state === 'unconfigured' || meta.setup_state === 'draft_unpublished' || meta.status === 'legacy_v1';
      this.setData(Object.assign({ document, meta, ruleStatusText: ruleStatusText(meta), quickSetupVisible, effectiveFrom, effectiveMonthOptions, effectiveMonthIndex: 1, loading: false, loadError: '', salaryPresetAlreadyAdded: selectedSalaryPresetIsAdded(document, this.data.salaryPresetIndex), operatorIndex: this.data.operatorOptions.indexOf(rule.minimum.operator), roundingIndex: optionIndex(this.data.roundingOptions, rule.rounding.mode) }, scheduleView(document), configurationStatus(document), this.pricingStatus(document)));
      this.showGuideForStep(this.data.currentStep);
    }).catch(err => {
      this.setData({ loading: false, document: null, loadError: err.message || '读取规则失败' });
      wx.showToast({ title: err.message || '读取规则失败', icon: 'none' });
    });
  },

  currentRule() { return this.data.document.day_rules[this.data.selectedDayType]; },
  currentSceneRule() { return this.data.document.attendance.scenes[this.data.selectedScene]; },

  applyAttendancePlan(e) {
    const planKey = e.currentTarget.dataset.key;
    if (!planKey || this.data.applyingPlanKey || this.data.saving) return Promise.resolve();
    const apply = () => this.saveAttendancePlan(planKey);
    if (this.data.meta && this.data.meta.setup_state === 'draft_unpublished' && !this.data.quickSetupApplied) {
      wx.showModal({
        title: '替换当前规则草稿？',
        content: '使用预设方案会替换草稿里的班次、每周安排和特殊日期设置，但会保留工资、补贴和加班计算规则。',
        confirmText: '使用方案',
        success: result => { if (result.confirm) apply(); }
      });
      return Promise.resolve();
    }
    return apply();
  },

  saveAttendancePlan(planKey) {
    let document;
    try {
      document = buildAttendancePlanDocument(this.data.document, planKey);
    } catch (error) {
      wx.showToast({ title: error.message || '生成方案失败', icon: 'none' });
      return Promise.resolve();
    }
    this.setData({ applyingPlanKey: planKey });
    return API.attendance.saveRuleDraft(document).then(res => {
      assertSuccess(res, '保存考勤方案失败');
      const savedDocument = normalizeDocument((res.data && res.data.document) || document);
      const meta = Object.assign({}, this.data.meta, {
        id: res.data && res.data.id,
        version: (res.data && res.data.version) || this.data.meta.version || 1,
        status: 'draft',
        has_draft: true,
        has_published: false,
        needs_setup: true,
        setup_state: 'draft_unpublished'
      });
      this.setData(Object.assign({
        document: savedDocument,
        meta,
        ruleStatusText: ruleStatusText(meta),
        applyingPlanKey: '',
        selectedPlanKey: planKey,
        quickSetupApplied: true
      }, scheduleView(savedDocument), configurationStatus(savedDocument), this.pricingStatus(savedDocument)));
      wx.showModal({
        title: '方案草稿已生成',
        content: '班次和每周安排已经配置完成。建议先检查试算结果，再确认从本月或下月开始使用。',
        confirmText: '去检查发布',
        cancelText: '继续调整',
        success: result => { if (result.confirm) this.goToPublishStep(); }
      });
    }).catch(err => {
      this.setData({ applyingPlanKey: '' });
      wx.showToast({ title: err.message || '保存考勤方案失败', icon: 'none' });
    });
  },

  goToPublishStep() { this.changeWizardStep(4); },

  pricingStatus(document = this.data.document, dayType = this.data.selectedDayType, skipByDayType = this.data.pricingSkipByDayType) {
    const skipped = !!(skipByDayType && skipByDayType[dayType]);
    const rule = document && document.day_rules ? document.day_rules[dayType] : null;
    return { pricingNeedsAttention: ruleNeedsPricingRate(rule) && !skipped, pricingSkipConfirmed: skipped };
  },

  markPricingSkipped() {
    const pricingSkipByDayType = Object.assign({}, this.data.pricingSkipByDayType, { [this.data.selectedDayType]: true });
    this.setData(Object.assign({ pricingSkipByDayType }, this.pricingStatus(this.data.document, this.data.selectedDayType, pricingSkipByDayType)));
  },

  startPricingSetup() {
    const pricingSkipByDayType = Object.assign({}, this.data.pricingSkipByDayType, { [this.data.selectedDayType]: false });
    this.setData(Object.assign({ pricingSkipByDayType }, this.pricingStatus(this.data.document, this.data.selectedDayType, pricingSkipByDayType)));
    if (!(this.currentRule().bands || []).length) this.addPricingBand();
  },

  confirmPricingSkip(nextStep) {
    wx.showModal({
      title: '确认暂不设置？',
      content: '跳过后，这一类加班仍可统计时长，但没有小时单价，加班费会按 0 元处理。之后仍可回来补设置。',
      confirmText: '确定跳过',
      cancelText: '返回设置',
      success: result => {
        if (!result.confirm) return;
        if (!(this.currentRule().bands || []).length) this.addPricingBand();
        this.markPricingSkipped();
        if (nextStep !== undefined) this.changeWizardStep(nextStep);
      }
    });
  },

  skipPricingSetup() { this.confirmPricingSkip(); },
  skipPricingSetupAndContinue() { this.confirmPricingSkip(this.data.currentStep + 1); },
  promptBeforeLeavingPricing(nextStep) {
    wx.showModal({
      title: '请先设置加班小时单价',
      content: '当前分类还没有可用的加班小时单价。请先填写每小时多少钱；如果确定暂时不计算加班费，可以选择跳过。',
      confirmText: '去设置',
      cancelText: '暂时跳过',
      success: result => {
        if (result.confirm) this.startPricingSetup();
        else this.confirmPricingSkip(nextStep);
      }
    });
  },

  applyDocument(document, extra = {}) {
    this.setData(Object.assign({ document, validation: null }, scheduleView(document), configurationStatus(document), this.pricingStatus(document), extra));
  },

  setPath(path, value) {
    const document = clone(this.data.document);
    const parts = path.split('.');
    let target = document;
    parts.slice(0, -1).forEach(key => { target = target[key]; });
    target[parts[parts.length - 1]] = value;
    this.setData(Object.assign({ document, validation: null }, configurationStatus(document), this.pricingStatus(document)));
  },

  setDocument(document) {
    this.setData(Object.assign({ document, validation: null }, configurationStatus(document), this.pricingStatus(document)));
  },

  onDayTypeChange(e) {
    const selectedDayType = DAY_TYPES[Number(e.detail.value)].key;
    const rule = this.data.document.day_rules[selectedDayType];
    this.setData(Object.assign({ selectedDayType, operatorIndex: this.data.operatorOptions.indexOf(rule.minimum.operator), roundingIndex: optionIndex(this.data.roundingOptions, rule.rounding.mode) }, this.pricingStatus(this.data.document, selectedDayType)));
  },
  onDayTypeTab(e) {
    const selectedDayType = e.currentTarget.dataset.dayType;
    const rule = this.data.document.day_rules[selectedDayType];
    this.setData(Object.assign({ selectedDayType, operatorIndex: this.data.operatorOptions.indexOf(rule.minimum.operator), roundingIndex: optionIndex(this.data.roundingOptions, rule.rounding.mode) }, this.pricingStatus(this.data.document, selectedDayType)));
  },
  onSceneChange(e) { this.setData({ selectedScene: SCENES[Number(e.detail.value)].key }); },
  onSceneTab(e) { this.setData({ selectedScene: e.currentTarget.dataset.scene }); },
  onSceneModeTab(e) {
    const document = clone(this.data.document);
    const rule = document.attendance.scenes[this.data.selectedScene];
    rule.mode = e.currentTarget.dataset.mode;
    syncPrimaryWorkPeriod(rule, `scene_${this.data.selectedScene}`);
    this.applyDocument(document);
  },
  onScenePicker(e) {
    const field = e.currentTarget.dataset.field;
    const options = { mode: ATTENDANCE_MODES, flexible_metric: FLEXIBLE_METRICS, shortfall_policy: SHORTFALL_POLICIES, missing_punch_policy: MISSING_PUNCH_POLICIES }[field];
    this.setPath(`attendance.scenes.${this.data.selectedScene}.${field}`, options[Number(e.detail.value)].value);
  },
  onSceneNumberInput(e) {
    const document = clone(this.data.document);
    const rule = document.attendance.scenes[this.data.selectedScene];
    rule.standard_minutes = hoursToMinutes(e.detail.value);
    syncPrimaryWorkPeriod(rule, `scene_${this.data.selectedScene}`);
    this.applyDocument(document);
  },
  addWorkPeriod() {
    const document = clone(this.data.document);
    const periods = document.attendance.scenes[this.data.selectedScene].normal_work_periods;
    const previous = periods[periods.length - 1];
    const start = previous ? previous.end_minute : 8 * 60;
    const end = Math.min(start + 240, 23 * 60 + 59);
    periods.push({ id: `period_${Date.now()}`, name: `工作时段${periods.length + 1}`, start_minute: start, end_minute: end, start_text: minuteText(start), end_text: minuteText(end), ends_next_day: false });
    this.setDocument(document);
  },
  removeWorkPeriod(e) {
    const document = clone(this.data.document);
    document.attendance.scenes[this.data.selectedScene].normal_work_periods.splice(Number(e.currentTarget.dataset.index), 1);
    this.setDocument(document);
  },
  onWorkPeriodInput(e) {
    const document = clone(this.data.document);
    document.attendance.scenes[this.data.selectedScene].normal_work_periods[Number(e.currentTarget.dataset.index)].name = e.detail.value;
    this.setDocument(document);
  },
  onWorkPeriodTime(e) {
    const document = clone(this.data.document);
    const period = document.attendance.scenes[this.data.selectedScene].normal_work_periods[Number(e.currentTarget.dataset.index)];
    period[e.currentTarget.dataset.field] = timeMinute(e.detail.value);
    period[e.currentTarget.dataset.field === 'start_minute' ? 'start_text' : 'end_text'] = e.detail.value;
    if (Number(e.currentTarget.dataset.index) === 0) syncPrimaryWorkPeriod(document.attendance.scenes[this.data.selectedScene], `scene_${this.data.selectedScene}`);
    this.setDocument(document);
  },
  onWorkPeriodNextDay(e) {
    const document = clone(this.data.document);
    document.attendance.scenes[this.data.selectedScene].normal_work_periods[Number(e.currentTarget.dataset.index)].ends_next_day = !!e.detail.value;
    this.setDocument(document);
  },

  onSceneDefaultShift(e) {
    const document = clone(this.data.document);
      document.attendance.scenes[this.data.selectedScene].default_shift_template = this.data.shiftTemplateOptions[Number(e.detail.value)].value;
    this.applyDocument(document);
  },

  addShiftTemplate() {
    const document = clone(this.data.document);
    const id = `shift_${Date.now()}`;
    const sceneRule = document.attendance.scenes[this.data.selectedScene];
    let periods = clone(sceneRule.normal_work_periods || []);
    if (sceneRule.mode === 'fixed' && !periods.length) periods = [{ id: `${id}_period_1`, name: '正常工作时段', start_minute: 480, end_minute: 960, start_text: '08:00', end_text: '16:00', ends_next_day: false }];
    document.attendance.shift_templates[id] = { id, name: `班次${Object.keys(document.attendance.shift_templates).length + 1}`, scene: this.data.selectedScene, mode: sceneRule.mode, standard_minutes: Number(sceneRule.standard_minutes || 480), break_minutes: Number(sceneRule.break_minutes === undefined ? 0 : sceneRule.break_minutes), normal_work_periods: periods };
    this.applyDocument(document);
  },
  toggleShiftTemplates() {
    this.setData({ shiftTemplatesOpen: !this.data.shiftTemplatesOpen });
  },
  removeShiftTemplate(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({ title: '删除班次模板', content: '引用该班次的周排班和单日覆盖会同时清除。', confirmColor: '#D64545', success: result => {
      if (!result.confirm) return;
      const document = clone(this.data.document);
      delete document.attendance.shift_templates[id];
      Object.keys(document.attendance.weekly_schedule).forEach(key => { if (document.attendance.weekly_schedule[key].shift_template_id === id) delete document.attendance.weekly_schedule[key]; });
      document.attendance.day_overrides.forEach(item => { if (item.shift_template_id === id) item.shift_template_id = ''; });
      Object.values(document.attendance.scenes).forEach(scene => { if (scene.default_shift_template === id) scene.default_shift_template = ''; });
      this.applyDocument(document);
    }});
  },
  onShiftTemplateInput(e) {
    const document = clone(this.data.document);
    const template = document.attendance.shift_templates[e.currentTarget.dataset.id];
    const field = e.currentTarget.dataset.field;
    template[field] = field === 'standard_minutes' ? hoursToMinutes(e.detail.value) : e.detail.value;
    if (field === 'standard_minutes') syncPrimaryWorkPeriod(template, `shift_${template.id}`);
    this.applyDocument(document);
  },
  onShiftTemplatePicker(e) {
    const document = clone(this.data.document);
    const template = document.attendance.shift_templates[e.currentTarget.dataset.id];
    const field = e.currentTarget.dataset.field;
    const options = field === 'scene' ? SHIFT_SCOPES : ATTENDANCE_MODES;
    const option = options[Number(e.detail.value)] || options[0];
    template[field] = Object.prototype.hasOwnProperty.call(option, 'value') ? option.value : option.key;
    if (field === 'mode') syncPrimaryWorkPeriod(template, `shift_${template.id}`);
    this.applyDocument(document);
  },
  addTemplatePeriod(e) {
    const document = clone(this.data.document);
    const template = document.attendance.shift_templates[e.currentTarget.dataset.id];
    const previous = template.normal_work_periods[template.normal_work_periods.length - 1];
    const start = previous ? Number(previous.end_minute || 0) : 480;
    const end = Math.min(start + 240, 1439);
    template.normal_work_periods.push({ id: `${template.id}_period_${Date.now()}`, name: `工作时段${template.normal_work_periods.length + 1}`, start_minute: start, end_minute: end, start_text: minuteText(start), end_text: minuteText(end), ends_next_day: false });
    this.applyDocument(document);
  },
  removeTemplatePeriod(e) {
    const document = clone(this.data.document);
    document.attendance.shift_templates[e.currentTarget.dataset.id].normal_work_periods.splice(Number(e.currentTarget.dataset.index), 1);
    this.applyDocument(document);
  },
  onTemplatePeriodInput(e) {
    const document = clone(this.data.document);
    document.attendance.shift_templates[e.currentTarget.dataset.id].normal_work_periods[Number(e.currentTarget.dataset.index)].name = e.detail.value;
    this.applyDocument(document);
  },
  onTemplatePeriodTime(e) {
    const document = clone(this.data.document);
    const period = document.attendance.shift_templates[e.currentTarget.dataset.id].normal_work_periods[Number(e.currentTarget.dataset.index)];
    const field = e.currentTarget.dataset.field;
    period[field] = timeMinute(e.detail.value);
    period[field === 'start_minute' ? 'start_text' : 'end_text'] = e.detail.value;
    if (Number(e.currentTarget.dataset.index) === 0) syncPrimaryWorkPeriod(document.attendance.shift_templates[e.currentTarget.dataset.id], `shift_${e.currentTarget.dataset.id}`);
    this.applyDocument(document);
  },
  onTemplatePeriodNextDay(e) {
    const document = clone(this.data.document);
    document.attendance.shift_templates[e.currentTarget.dataset.id].normal_work_periods[Number(e.currentTarget.dataset.index)].ends_next_day = !!e.detail.value;
    this.applyDocument(document);
  },
  onWeeklyTemplate(e) {
    const document = clone(this.data.document);
    const row = WEEKDAYS[Number(e.currentTarget.dataset.index)];
    const templateID = this.data.shiftTemplateOptions[Number(e.detail.value)].value;
    if (!templateID) delete document.attendance.weekly_schedule[row.key];
    else document.attendance.weekly_schedule[row.key] = { day_of_week: row.dayOfWeek, shift_template_id: templateID };
    this.applyDocument(document);
  },
  onWeeklyRestModeChange(e) {
    const mode = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.mode
      ? e.currentTarget.dataset.mode
      : (WEEKLY_REST_MODES[Number(e.detail && e.detail.value)] && WEEKLY_REST_MODES[Number(e.detail.value)].value);
    if (!mode) return;
    const document = clone(this.data.document);
    const templateID = findWeeklyTemplateID(document, this.data.selectedScene)
      || createDefaultShiftTemplate(document, this.data.selectedScene);
    if (!templateID) return;
    const workDays = mode === 'single' ? new Set([1, 2, 3, 4, 5, 6]) : new Set([1, 2, 3, 4, 5]);
    document.attendance.weekly_schedule = document.attendance.weekly_schedule || {};
    WEEKDAYS.forEach(day => {
      if (workDays.has(day.dayOfWeek)) document.attendance.weekly_schedule[day.key] = { day_of_week: day.dayOfWeek, shift_template_id: templateID };
      else delete document.attendance.weekly_schedule[day.key];
    });
    this.applyDocument(document, { weeklyRestMode: mode });
    wx.showToast({ title: `已切换为${mode === 'single' ? '单休' : '双休'}`, icon: 'success' });
  },
  addDayOverride() {
    const document = clone(this.data.document);
    document.attendance.day_overrides.push({ date: this.data.previewDate, day_type: '', scene: '', mode: '', shift_template_id: '', rule_source: 'manual' });
    this.applyDocument(document);
  },
  removeDayOverride(e) {
    const document = clone(this.data.document);
    document.attendance.day_overrides.splice(Number(e.currentTarget.dataset.index), 1);
    this.applyDocument(document);
  },
  onDayOverrideDate(e) {
    const document = clone(this.data.document);
    document.attendance.day_overrides[Number(e.currentTarget.dataset.index)].date = e.detail.value;
    this.applyDocument(document);
  },
  onDayOverridePicker(e) {
    const document = clone(this.data.document);
    const item = document.attendance.day_overrides[Number(e.currentTarget.dataset.index)];
    const field = e.currentTarget.dataset.field;
    if (field === 'shift_template_id') item[field] = this.data.shiftTemplateOptions[Number(e.detail.value)].value;
    if (field === 'scene') item[field] = OPTIONAL_SCENES[Number(e.detail.value)].value || OPTIONAL_SCENES[Number(e.detail.value)].key || '';
    if (field === 'mode') item[field] = OPTIONAL_ATTENDANCE_MODES[Number(e.detail.value)].value;
    if (field === 'day_type') item[field] = OPTIONAL_DAY_TYPES[Number(e.detail.value)].key;
    this.applyDocument(document);
  },
  onOperatorChange(e) { this.setData({ operatorIndex: Number(e.detail.value) }); this.setPath(`day_rules.${this.data.selectedDayType}.minimum.operator`, this.data.operatorOptions[e.detail.value]); },
  onRoundingChange(e) { this.setData({ roundingIndex: Number(e.detail.value) }); this.setPath(`day_rules.${this.data.selectedDayType}.rounding.mode`, this.data.roundingOptions[e.detail.value].value); },
  onRoundingScopeChange(e) { this.setPath(`day_rules.${this.data.selectedDayType}.rounding.scope`, ROUNDING_SCOPES[Number(e.detail.value)].value); },
  onGapConfirmedChange(e) {
    if (!e.detail.value) {
      this.setPath(`day_rules.${this.data.selectedDayType}.gap_confirmed`, false);
      return;
    }
    wx.showModal({
      title: '确认分段空档',
      content: '计费分段未覆盖的加班时长将固定按 0 元处理。确认保留空档吗？',
      confirmText: '确认空档',
      success: result => {
        if (result.confirm) this.setPath(`day_rules.${this.data.selectedDayType}.gap_confirmed`, true);
        else this.setPath(`day_rules.${this.data.selectedDayType}.gap_confirmed`, false);
      }
    });
  },

  addDeduction() {
    const document = clone(this.data.document);
    const deductions = document.day_rules[this.data.selectedDayType].deductions;
    const priority = deductions.reduce((max, item) => Math.max(max, Number(item.priority || 0)), 0) + 10;
    deductions.push({ id: `deduction_${Date.now()}`, metric: 'attendance_span', operator: '>=', threshold_minutes: 720, deduct_minutes: 60, priority });
    this.setDocument(document);
  },
  removeDeduction(e) {
    const document = clone(this.data.document);
    document.day_rules[this.data.selectedDayType].deductions.splice(Number(e.currentTarget.dataset.index), 1);
    this.setDocument(document);
  },
  onDeductionInput(e) {
    const document = clone(this.data.document);
    document.day_rules[this.data.selectedDayType].deductions[Number(e.currentTarget.dataset.index)][e.currentTarget.dataset.field] = Math.max(0, Number(e.detail.value || 0));
    this.setDocument(document);
  },
  onDeductionHoursInput(e) {
    const document = clone(this.data.document);
    document.day_rules[this.data.selectedDayType].deductions[Number(e.currentTarget.dataset.index)][e.currentTarget.dataset.field] = optionalHoursToMinutes(e.detail.value);
    this.setDocument(document);
  },
  onDeductionPicker(e) {
    const document = clone(this.data.document);
    const field = e.currentTarget.dataset.field;
    const options = field === 'metric' ? DEDUCTION_METRICS.map(item => item.value) : this.data.operatorOptions;
    document.day_rules[this.data.selectedDayType].deductions[Number(e.currentTarget.dataset.index)][field] = options[Number(e.detail.value)];
    this.setDocument(document);
  },

  onRulePicker(e) {
    const field = e.currentTarget.dataset.field;
    const options = { pricing_mode: PRICING_MODES, cap_order: CAP_ORDERS, night_day_basis: NIGHT_BASES }[field];
    const value = options[Number(e.detail.value)].value;
    if (field === 'pricing_mode' && value === 'single_tier') {
      const bands = this.data.document.day_rules[this.data.selectedDayType].bands || [];
      if (bands.some(band => (band.selector || 'cumulative_range') !== 'cumulative_range')) {
        wx.showToast({ title: '单档计费仅支持累计时长分段', icon: 'none' });
        return;
      }
    }
    this.setPath(`day_rules.${this.data.selectedDayType}.${field}`, value);
  },
  addPricingBand() {
    const document = clone(this.data.document);
    const bands = document.day_rules[this.data.selectedDayType].bands;
    let start = 0;
    if (bands.length) {
      const previous = bands[bands.length - 1];
      if ((previous.selector || 'cumulative_range') === 'cumulative_range') {
        if (previous.max_minutes === null || previous.max_minutes === undefined) previous.max_minutes = Number(previous.min_minutes || 0) + 120;
        previous.max_inclusive = false;
        start = Number(previous.max_minutes || 0);
      }
    }
    bands.push({
      id: `band_${Date.now()}`,
      name: `计费段${bands.length + 1}`,
      selector: 'cumulative_range',
      selector_label: '按累计有效时长',
      min_minutes: start,
      max_minutes: null,
      clock_start_minute: 18 * 60,
      clock_end_minute: 22 * 60,
      clock_start_text: '18:00',
      clock_end_text: '22:00',
      min_session: 1,
      max_session: 1,
      min_inclusive: true,
      max_inclusive: true,
      band_cap_minutes: null,
      settlement: 'paid',
      settlement_label: '计入税前工资',
      comp_time_ratio: 1,
      rate: { mode: 'fixed', cents_per_hour: 0 },
      priority: (bands.length + 1) * 10
    });
    this.setDocument(document);
  },
  removePricingBand(e) {
    const document = clone(this.data.document);
    document.day_rules[this.data.selectedDayType].bands.splice(Number(e.currentTarget.dataset.index), 1);
    this.setDocument(document);
  },
  onBandInput(e) {
    const document = clone(this.data.document);
    const band = document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)];
    const field = e.currentTarget.dataset.field;
    const raw = e.detail.value;
    if (field === 'name') band.name = raw;
    else if (field === 'rate') band.rate.cents_per_hour = Math.max(0, Math.round(Number(raw || 0) * 100));
    else if (field === 'priority') band[field] = Number(raw || 0);
    else if (field === 'comp_time_ratio') band[field] = Math.max(0, Number(raw || 0));
    else if (field === 'min_minutes' || field === 'max_minutes' || field === 'band_cap_minutes') band[field] = raw === '' ? null : optionalHoursToMinutes(raw);
    else band[field] = raw === '' ? null : Math.max(0, Number(raw));
    this.setDocument(document);
  },
  onBandSelector(e) {
    const document = clone(this.data.document);
    const band = document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)];
    const option = PRICING_SELECTORS[Number(e.detail.value)];
    if (document.day_rules[this.data.selectedDayType].pricing_mode === 'single_tier' && option.value !== 'cumulative_range') {
      wx.showToast({ title: '单档计费仅支持累计时长分段', icon: 'none' });
      return;
    }
    band.selector = option.value;
    band.selector_label = option.label;
    if (band.selector === 'clock_window') {
      if (band.clock_start_minute === null || band.clock_start_minute === undefined) band.clock_start_minute = 18 * 60;
      if (band.clock_end_minute === null || band.clock_end_minute === undefined) band.clock_end_minute = 22 * 60;
      band.clock_start_text = minuteText(band.clock_start_minute);
      band.clock_end_text = minuteText(band.clock_end_minute);
    }
    if (band.selector === 'session_ordinal') {
      if (!band.min_session) band.min_session = 1;
      if (!band.max_session) band.max_session = band.min_session;
    }
    this.setDocument(document);
  },
  onBandClockTime(e) {
    const document = clone(this.data.document);
    const band = document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)];
    const field = e.currentTarget.dataset.field;
    band[field] = timeMinute(e.detail.value);
    band[field === 'clock_start_minute' ? 'clock_start_text' : 'clock_end_text'] = e.detail.value;
    this.setDocument(document);
  },
  onBandSettlement(e) {
    const document = clone(this.data.document);
    const band = document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)];
    const option = SETTLEMENT_MODES[Number(e.detail.value)];
    band.settlement = option.value;
    band.settlement_label = option.label;
    if (band.settlement === 'comp_time' && !Number(band.comp_time_ratio)) band.comp_time_ratio = 1;
    this.setDocument(document);
  },
  onBandSwitch(e) {
    const document = clone(this.data.document);
    document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)][e.currentTarget.dataset.field] = !!e.detail.value;
    this.setDocument(document);
  },
  onBandRateMode(e) {
    const document = clone(this.data.document);
    const band = document.day_rules[this.data.selectedDayType].bands[Number(e.currentTarget.dataset.index)];
    band.rate.mode = RATE_MODES[Number(e.detail.value)].value;
    if (band.rate.mode === 'formula') band.rate.formula = normalizeFormula(band.rate.formula, 'overtime_base');
    this.setDocument(document);
  },

  toggleShiftDetails(e) {
    const id = e.currentTarget.dataset.id;
    const shiftDetailsOpen = Object.assign({}, this.data.shiftDetailsOpen || {});
    shiftDetailsOpen[id] = !shiftDetailsOpen[id];
    this.setData({ shiftDetailsOpen });
  },

  onCopySource(e) { this.setData({ copySourceIndex: Number(e.detail.value) }); },
  onCopyPart(e) { this.setData({ [`copyParts.${e.currentTarget.dataset.field}`]: !!e.detail.value }); },
  copySelectedParts() {
    const sourceType = DAY_TYPES[this.data.copySourceIndex].key;
    if (sourceType === this.data.selectedDayType) {
      wx.showToast({ title: '请选择其他日期类型', icon: 'none' });
      return;
    }
    const document = clone(this.data.document);
    const source = document.day_rules[sourceType];
    const target = document.day_rules[this.data.selectedDayType];
    const parts = this.data.copyParts;
    if (parts.minimum) target.minimum = clone(source.minimum);
    if (parts.deductions) target.deductions = clone(source.deductions);
    if (parts.rounding) { target.rounding = clone(source.rounding); target.cap_order = source.cap_order; }
    if (parts.limits) { target.session_cap_minutes = source.session_cap_minutes; target.daily_cap_minutes = source.daily_cap_minutes; target.monthly_cap_minutes = source.monthly_cap_minutes; }
    if (parts.pricing) { target.pricing_mode = source.pricing_mode; target.bands = clone(source.bands); target.gap_confirmed = source.gap_confirmed; }
    if (parts.night) target.night_day_basis = source.night_day_basis;
    this.setData({ document, validation: null, operatorIndex: this.data.operatorOptions.indexOf(target.minimum.operator), roundingIndex: optionIndex(this.data.roundingOptions, target.rounding.mode) });
    wx.showToast({ title: '已复制到当前分类', icon: 'success' });
  },

  addCustomItem() {
    const document = clone(this.data.document);
    if (!document.payroll.custom_items) document.payroll.custom_items = [];
    document.payroll.custom_items.push({ id: `item_${Date.now()}`, name: '', legacy_component: '', legacy_component_label: '不替代旧版项目', unit: 'month', unit_label: '月', value_mode: 'fixed', value_mode_label: '固定金额', fixed_cents: 0, quantity_source: 'manual', quantity_variable: 'work_days', quantity_variable_label: '当月工作天数', manual_quantity: 1, include_in_pretax: true, include_in_overtime_base: false, effective_from: this.data.previewDate, effective_to: '' });
    this.setData({ document });
  },

  onSalaryPresetChange(e) {
    const salaryPresetIndex = Number(e.detail.value);
    this.setData({ salaryPresetIndex, salaryPresetAlreadyAdded: selectedSalaryPresetIsAdded(this.data.document, salaryPresetIndex) });
  },

  addSalaryPreset() {
    const preset = SALARY_PRESETS[this.data.salaryPresetIndex] || SALARY_PRESETS[0];
    const document = clone(this.data.document);
    document.payroll.custom_items = document.payroll.custom_items || [];
    if (isSalaryPresetAdded(preset, document.payroll.custom_items)) {
      this.setData({ salaryPresetAlreadyAdded: true });
      wx.showToast({ title: '这个项目已添加', icon: 'none' });
      return;
    }
    const common = {
      id: `${preset.value}_${Date.now()}`,
      preset_key: preset.value,
      legacy_component: '',
      legacy_component_label: '不替代旧版项目',
      unit: 'month',
      value_mode: 'fixed',
      fixed_cents: 0,
      quantity_source: 'manual',
      quantity_variable: 'work_days',
      manual_quantity: 1,
      include_in_pretax: true,
      include_in_overtime_base: false,
      effective_from: this.data.previewDate,
      effective_to: ''
    };
    if (preset.value === 'position_allowance') {
      common.name = '岗位津贴';
    } else if (preset.value === 'meal_allowance') {
      Object.assign(common, { name: '餐补', legacy_component: 'meal_allowance', unit: 'day', quantity_source: 'automatic', quantity_variable: 'work_days' });
    } else if (preset.value === 'domestic_allowance') {
      Object.assign(common, { name: '国内出差补助', legacy_component: 'domestic_allowance', unit: 'day', quantity_source: 'automatic', quantity_variable: 'domestic_trip_days' });
    } else if (preset.value === 'abroad_allowance') {
      Object.assign(common, { name: '国外出差补助', legacy_component: 'abroad_allowance', unit: 'day', quantity_source: 'automatic', quantity_variable: 'abroad_trip_days' });
    } else {
      Object.assign(common, {
        name: '特殊津贴',
        value_mode: 'formula',
        formula: {
          start: { kind: 'variable', variable: 'base_salary' },
          steps: [{ operator: '*', operand: { kind: 'number', value: 0 } }]
        }
      });
    }
    document.payroll.custom_items.push(common);
    this.setData({ document: normalizeDocument(document), validation: null, salaryPresetAlreadyAdded: true });
  },

  removeCustomItem(e) {
    const document = clone(this.data.document);
    document.payroll.custom_items.splice(Number(e.currentTarget.dataset.index), 1);
    this.setData({ document, salaryPresetAlreadyAdded: selectedSalaryPresetIsAdded(document, this.data.salaryPresetIndex) });
  },

  onItemInput(e) {
    const index = Number(e.currentTarget.dataset.index);
    const field = e.currentTarget.dataset.field;
    const document = clone(this.data.document);
    const item = document.payroll.custom_items[index];
    if (!item) return;
    const raw = e.detail.value;
    if (field === 'fixed_cents') item[field] = Number(raw || 0) * 100;
    else if (field === 'manual_quantity') item[field] = Number(raw || 0);
    else item[field] = raw;
    this.setDocument(document);
  },

  onItemPicker(e) {
    const index = Number(e.currentTarget.dataset.index);
    const field = e.currentTarget.dataset.field;
    const document = clone(this.data.document);
    if (field === 'effective_from' || field === 'effective_to') document.payroll.custom_items[index][field] = e.detail.value;
    else {
      let options = field === 'unit' ? UNITS : VALUE_MODES;
      if (field === 'quantity_source') options = QUANTITY_SOURCES;
      if (field === 'quantity_variable') options = QUANTITY_VARIABLES;
      if (field === 'legacy_component') options = LEGACY_COMPONENTS;
      document.payroll.custom_items[index][field] = options[Number(e.detail.value)].value;
      if (field === 'unit') document.payroll.custom_items[index].unit_label = options[Number(e.detail.value)].label;
      if (field === 'value_mode') {
        document.payroll.custom_items[index].value_mode_label = options[Number(e.detail.value)].label;
        if (document.payroll.custom_items[index][field] === 'formula') document.payroll.custom_items[index].formula = normalizeFormula(document.payroll.custom_items[index].formula, 'base_salary');
      }
      if (field === 'quantity_variable') document.payroll.custom_items[index].quantity_variable_label = quantityVariableLabel(document.payroll.custom_items[index][field]);
      if (field === 'legacy_component') document.payroll.custom_items[index].legacy_component_label = legacyComponentLabel(document.payroll.custom_items[index][field]);
      if (field === 'quantity_source' && document.payroll.custom_items[index][field] === 'formula') document.payroll.custom_items[index].quantity_formula = normalizeFormula(document.payroll.custom_items[index].quantity_formula, 'work_days');
    }
    this.setDocument(document);
  },

  onItemSwitch(e) {
    const document = clone(this.data.document);
    document.payroll.custom_items[Number(e.currentTarget.dataset.index)][e.currentTarget.dataset.field] = !!e.detail.value;
    this.setDocument(document);
  },
  clearItemEndDate(e) {
    const document = clone(this.data.document);
    document.payroll.custom_items[Number(e.currentTarget.dataset.index)].effective_to = '';
    this.setDocument(document);
  },

  onFormulaStartPicker(e) {
    const document = clone(this.data.document);
    const formula = formulaFor(document, this.data.selectedDayType, e.currentTarget.dataset.target, Number(e.currentTarget.dataset.ownerIndex));
    const option = FORMULA_VARIABLES[Number(e.detail.value)];
    formula.start = { kind: 'variable', variable: option.value };
    formula.start_label = option.label;
    this.setDocument(document);
  },
  addFormulaStep(e) {
    const document = clone(this.data.document);
    const formula = formulaFor(document, this.data.selectedDayType, e.currentTarget.dataset.target, Number(e.currentTarget.dataset.ownerIndex));
    if (formula.steps.length >= 8) {
      wx.showToast({ title: '单个公式最多 8 步', icon: 'none' });
      return;
    }
    formula.steps.push({ operator: '/', operand: { kind: 'number', value: 1 }, operand_kind_label: '我填一个数字', operand_label: '我填一个数字' });
    this.setDocument(document);
  },
  removeFormulaStep(e) {
    const document = clone(this.data.document);
    const formula = formulaFor(document, this.data.selectedDayType, e.currentTarget.dataset.target, Number(e.currentTarget.dataset.ownerIndex));
    formula.steps.splice(Number(e.currentTarget.dataset.stepIndex), 1);
    this.setDocument(document);
  },
  onFormulaStepPicker(e) {
    const document = clone(this.data.document);
    const formula = formulaFor(document, this.data.selectedDayType, e.currentTarget.dataset.target, Number(e.currentTarget.dataset.ownerIndex));
    const step = formula.steps[Number(e.currentTarget.dataset.stepIndex)];
    const field = e.currentTarget.dataset.field;
    if (field === 'operator') step.operator = FORMULA_OPERATORS[Number(e.detail.value)];
    if (field === 'operand_kind') {
      const kind = FORMULA_OPERANDS[Number(e.detail.value)].value;
      step.operand = kind === 'variable' ? { kind, variable: 'base_salary' } : { kind, value: 1 };
      step.operand_kind_label = kind === 'variable' ? '从已有数据中选择' : '我填一个数字';
      step.operand_label = kind === 'variable' ? variableLabel(step.operand.variable) : '我填一个数字';
    }
    if (field === 'operand_variable') {
      const option = FORMULA_VARIABLES[Number(e.detail.value)];
      step.operand = { kind: 'variable', variable: option.value };
      step.operand_label = option.label;
    }
    this.setDocument(document);
  },
  onFormulaStepNumber(e) {
    const document = clone(this.data.document);
    const formula = formulaFor(document, this.data.selectedDayType, e.currentTarget.dataset.target, Number(e.currentTarget.dataset.ownerIndex));
    const step = formula.steps[Number(e.currentTarget.dataset.stepIndex)];
    step.operand = { kind: 'number', value: Number(e.detail.value || 0) };
    step.operand_kind_label = '我填一个数字';
    step.operand_label = '我填一个数字';
    this.setDocument(document);
  },

  onNumberInput(e) {
    const field = e.currentTarget.dataset.field;
    const raw = e.detail.value;
    const value = raw === '' ? null : Number(raw);
    if (field === 'base_salary_cents') this.setPath('payroll.base_salary_cents', Number.isFinite(value) ? value * 100 : 0);
    else if (field === 'minimum_minutes') this.setPath(`day_rules.${this.data.selectedDayType}.minimum.minutes`, Number.isFinite(value) ? optionalHoursToMinutes(value) : 0);
    else if (field === 'rounding_step') this.setPath(`day_rules.${this.data.selectedDayType}.rounding.step_minutes`, Number.isFinite(value) ? optionalHoursToMinutes(value) : 30);
    else if (field === 'session_cap') this.setPath(`day_rules.${this.data.selectedDayType}.session_cap_minutes`, Number.isFinite(value) ? optionalHoursToMinutes(value) : null);
    else if (field === 'daily_cap') this.setPath(`day_rules.${this.data.selectedDayType}.daily_cap_minutes`, Number.isFinite(value) ? optionalHoursToMinutes(value) : null);
    else if (field === 'monthly_cap') this.setPath(`day_rules.${this.data.selectedDayType}.monthly_cap_minutes`, Number.isFinite(value) ? optionalHoursToMinutes(value) : null);
    else if (field === 'rate') this.setPath(`day_rules.${this.data.selectedDayType}.bands.0.rate.cents_per_hour`, Number.isFinite(value) ? value * 100 : 0);
  },

  saveDraft() {
	if (this.data.saving || this.data.publishing) return Promise.resolve();
    this.setData({ saving: true });
    return API.attendance.saveRuleDraft(this.data.document).then(res => {
      assertSuccess(res, '保存草稿失败');
      this.setData({ saving: false, validation: res.data && res.data.validation });
      wx.showToast({ title: '草稿已保存', icon: 'success' });
    }).catch(err => {
      this.setData({ saving: false });
      wx.showToast({ title: err.message || '保存草稿失败', icon: 'none' });
    });
  },

  validateRule() {
	if (this.data.validating || this.data.saving || this.data.publishing) return Promise.resolve();
	this.setData({ validating: true });
    return API.attendance.validateRule(this.data.document).then(res => {
      assertSuccess(res, '检查规则时出了点问题');
      this.setData({ validating: false, validation: res.data });
      if (res.data && res.data.valid) wx.showToast({ title: '检查完成，没有问题', icon: 'success' });
    }).catch(err => {
	  this.setData({ validating: false });
	  wx.showToast({ title: err.message || '检查规则时出了点问题', icon: 'none' });
	});
  },

  previewRule() {
	if (this.data.previewing) return Promise.resolve();
    const overtimeSessions = [];
	if (this.data.previewOvertimeMode === 'manual') {
	  for (const session of this.data.previewSessions) {
		const minutes = Math.max(0, Math.round(Number(session.hours || 0) * 60));
		if (minutes > 24 * 60) {
		  wx.showToast({ title: '单个预览场次不能超过 24 小时', icon: 'none' });
		  return Promise.resolve();
		}
		if (minutes <= 0) continue;
		const start = timeMinute(session.start);
		overtimeSessions.push({ start_minute: start, end_minute: (start + minutes) % (24 * 60), ends_next_day: start + minutes >= 24 * 60 });
	  }
	  if (!overtimeSessions.length) {
		wx.showToast({ title: '请至少填写一个有效场次', icon: 'none' });
		return Promise.resolve();
	  }
    }
    const attendanceStart = timeMinute(this.data.previewAttendanceStart);
    const attendanceEnd = timeMinute(this.data.previewAttendanceEnd);
    const input = {
      date: this.data.previewDate,
      day_type: this.data.selectedDayType,
      scene: this.data.selectedScene,
      attendance_periods: [{ start_minute: attendanceStart, end_minute: attendanceEnd, ends_next_day: this.data.previewAttendanceEndsNextDay }],
      overtime_sessions: overtimeSessions,
      variables: {
        work_days: Number(this.data.previewWorkDays || 0),
        trip_days: Number(this.data.previewTripDays || 0),
        domestic_trip_days: Number(this.data.previewTripDays || 0),
        abroad_trip_days: 0
      }
    };
	this.setData({ previewing: true });
    return API.attendance.previewRule(this.data.document, input).then(res => {
      if (res && res.code !== 200 && res.data && res.data.issues) this.setData({ validation: res.data });
      assertSuccess(res, '预览计算失败');
      const preview = Object.assign({}, res.data, {
		attendance_status_text: ATTENDANCE_STATUS_LABELS[res.data.attendance_status] || res.data.attendance_status || '未判定',
		overtime_source_text: OVERTIME_SOURCE_LABELS[res.data.overtime_source] || res.data.overtime_source || '未判定',
        salary_items: (res.data.salary_items || []).map(item => Object.assign({}, item, { unit_label: optionLabel(UNITS, item.unit), amount_text: (Number(item.amount_cents || 0) / 100).toFixed(2) }))
      });
      this.setData({ previewing: false, preview, previewAmount: ((preview.amount_cents || 0) / 100).toFixed(2), previewPretax: ((preview.pretax_total_cents || 0) / 100).toFixed(2) });
    }).catch(err => {
	  this.setData({ previewing: false });
	  wx.showToast({ title: err.message || '预览计算失败', icon: 'none' });
	});
  },

  onPreviewOvertimeMode(e) {
	this.setData({ previewOvertimeMode: e.currentTarget.dataset.mode, preview: null });
  },

  addPreviewSession() {
    const previewSessions = clone(this.data.previewSessions);
    const previous = previewSessions[previewSessions.length - 1];
    let start = previous ? timeMinute(previous.start) + Math.round(Number(previous.hours || 0) * 60) : 18 * 60;
    start %= 24 * 60;
    previewSessions.push({ id: `preview_${Date.now()}`, start: minuteText(start), hours: '1' });
    this.setData({ previewSessions, preview: null });
  },
  removePreviewSession(e) {
    const previewSessions = clone(this.data.previewSessions);
    previewSessions.splice(Number(e.currentTarget.dataset.index), 1);
    this.setData({ previewSessions, preview: null });
  },
  onPreviewSessionTime(e) {
    const previewSessions = clone(this.data.previewSessions);
    previewSessions[Number(e.currentTarget.dataset.index)].start = e.detail.value;
    this.setData({ previewSessions, preview: null });
  },
  onPreviewSessionHours(e) {
    const previewSessions = clone(this.data.previewSessions);
    previewSessions[Number(e.currentTarget.dataset.index)].hours = e.detail.value;
    this.setData({ previewSessions, preview: null });
  },
  onPreviewTime(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },
  onPreviewAttendanceNextDay(e) { this.setData({ previewAttendanceEndsNextDay: !!e.detail.value }); },
  onPreviewVariable(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },
  onPreviewDate(e) { this.setData({ previewDate: e.detail.value }); },
	  onEffectiveMonth(e) {
	    const effectiveMonthIndex = Number(e.detail.value);
	    const option = this.data.effectiveMonthOptions[effectiveMonthIndex];
	    if (!option) return;
	    this.setData({ effectiveMonthIndex, effectiveFrom: option.value });
	  },

  publishRule() {
	if (this.data.publishing || this.data.saving || this.data.validating) return;
	    const currentMonth = this.data.effectiveMonthIndex === 0;
	    const monthLabel = this.data.effectiveMonthOptions[this.data.effectiveMonthIndex]?.label || '所选月份';
	    const content = currentMonth
	      ? `${monthLabel}发布后，本月全部考勤记录都会按这套规则重新计算工资，不会和旧规则分段混算。历史工资快照不会自动改写。`
	      : `${monthLabel}发布后，该月全部考勤记录都会统一按这套规则计算工资。历史工资快照不会自动改写。`;
	    wx.showModal({ title: '发布规则', content, success: result => {
      if (!result.confirm) return;
	  this.submitRulePublication(false);
    }});
  },

  submitRulePublication(confirmCurrentMonth) {
	if (this.data.publishing) return Promise.resolve();
    this.setData({ publishing: true });
	return API.attendance.publishRule(this.data.document, this.data.effectiveFrom, confirmCurrentMonth).then(res => {
      if (res && res.code === 409 && res.data && res.data.requires_confirmation) {
        this.setData({ publishing: false });
        const diff = res.data.recalculation_diff || {};
        const delta = diff.delta || {};
        const money = value => `${Number(value || 0) >= 0 ? '+' : ''}${Number(value || 0).toFixed(2)}元`;
        const content = diff.available
          ? `${diff.message || '新规则将重算本月工资'}\n税前工资：${money(delta.total_salary)}\n加班费：${money(delta.overtime_pay)}\n其他补贴：${money(delta.other_allowance)}\n调休获得：${Number(delta.comp_time_earned_hours || 0) >= 0 ? '+' : ''}${Number(delta.comp_time_earned_hours || 0).toFixed(2)}小时`
          : `${diff.message || '暂时无法生成金额差异'}\n仍要让新规则从本月生效吗？`;
        wx.showModal({
          title: '确认本月重算', content, confirmText: '确认发布', confirmColor: '#D64545',
          success: result => { if (result.confirm) this.submitRulePublication(true); }
        });
        return;
      }
      if (res && res.code !== 200 && res.data && res.data.issues) this.setData({ validation: res.data });
      assertSuccess(res, '发布规则失败');
      const meta = Object.assign({}, this.data.meta, res.data || {}, { has_published: true, has_draft: false, needs_setup: false, setup_state: 'published' });
      this.setData({ publishing: false, meta, ruleStatusText: ruleStatusText(meta), quickSetupVisible: false });
      wx.showToast({ title: '已发布', icon: 'success' });
    }).catch(err => {
      this.setData({ publishing: false });
      wx.showToast({ title: err.message || '发布规则失败', icon: 'none' });
    });
  },

  openHistory() {
	if (this.data.historyLoading) return Promise.resolve();
	this.setData({ historyLoading: true });
    return API.attendance.listRuleVersions().then(res => {
      assertSuccess(res, '读取历史版本失败');
	  this.setData({ historyLoading: false, versions: res.data || [], showHistory: true, historyPreview: null });
	}).catch(err => {
	  this.setData({ historyLoading: false });
	  wx.showToast({ title: err.message || '读取历史版本失败', icon: 'none' });
	});
  },
  noop() {},
  closeHistory() { this.setData({ showHistory: false }); },
	viewHistoryVersion(e) {
	  const version = this.data.versions.find(item => Number(item.version) === Number(e.currentTarget.dataset.version));
	  if (version) this.setData({ historyPreview: historyVersionView(version) });
	},
  restoreVersion(e) {
    const version = e.currentTarget.dataset.version;
	if (this.data.restoringVersion) return;
    wx.showModal({ title: '恢复历史规则', content: `将版本 ${version} 恢复为当前草稿，是否继续？`, success: result => {
      if (!result.confirm) return;
	  this.setData({ restoringVersion: Number(version) });
      API.attendance.restoreRule(version).then(res => {
        assertSuccess(res, '恢复历史规则失败');
        const document = normalizeDocument(res.data.document);
		this.setData(Object.assign({ document, meta: { version: res.data.version, status: 'draft' }, showHistory: false, restoringVersion: 0 }, scheduleView(document)));
        wx.showToast({ title: '已恢复为草稿', icon: 'success' });
	  }).catch(err => {
		this.setData({ restoringVersion: 0 });
		wx.showToast({ title: err.message || '恢复历史规则失败', icon: 'none' });
	  });
    }});
  }
});
