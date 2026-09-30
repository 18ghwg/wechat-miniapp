const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const mockData = require('../../../utils/mock-data');

const SALARY_NUMERIC_FIELDS = [
  { key: 'abroad_business_days', label: '国外出差天数' },
  { key: 'abroad_allowance', label: '国外补助金额' },
  { key: 'domestic_business_days', label: '国内出差天数' },
  { key: 'holiday_overtime_pay', label: '节假日加班费' },
  { key: 'weekend_overtime_days', label: '周六日加班小时' },
  { key: 'workday_overtime_hours', label: '普通加班小时数' },
  { key: 'meal_allowance', label: '餐补' },
  { key: 'base_salary', label: '底薪' },
  { key: 'compensatory_days', label: '调休天数' }
];

const SALARY_FIELD_CARD_CONFIG = [
  { key: 'abroad_allowance', label: '国外出差补助', inputKind: 'readonly', showInfo: true },
  { key: 'domestic_allowance', label: '国内出差补助', inputKind: 'readonly', showInfo: true },
  { key: 'holiday_overtime_pay', label: '节假日加班费', inputKind: 'editable', showInfo: true, calculator: 'holiday' },
  { key: 'weekend_overtime_pay', label: '周六日加班费', inputKind: 'readonly', showInfo: true },
  { key: 'workday_overtime_pay', label: '普通加班费', inputKind: 'derived', showInfo: true, calculator: 'workday' },
  { key: 'meal_allowance', label: '餐补', inputKind: 'editable', showInfo: true, calculator: 'meal' },
  { key: 'base_salary', label: '底薪', inputKind: 'editable', showInfo: true },
  { key: 'compensatory_days', label: '调休天数', inputKind: 'editable' }
];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function safeObject(value) {
  return isPlainObject(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value) {
  return value === null || value === undefined ? '' : String(value);
}

function getFirstChar(value) {
  const text = safeString(value).trim();
  return text ? text.charAt(0) : '?';
}

function buildSelectedEmployeeState(selectedEmployees) {
  const safeSelectedEmployees = safeArray(selectedEmployees).filter(Boolean);
  return {
    selectedEmployees: safeSelectedEmployees,
    selectedEmployeeCount: safeSelectedEmployees.length,
    selectedEmployeeName: safeSelectedEmployees[0] || ''
  };
}

function formatCount(value, unit = '') {
  const normalized = Number(value) || 0;
  const text = Number.isInteger(normalized) ? String(normalized) : formatCurrency(normalized);
  return `${text}${unit}`;
}

function hasCalcInput(value) {
  return value !== null && value !== undefined;
}

function parseFormulaNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return NaN;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatFormulaCurrency(value) {
  return Number.isFinite(value) ? formatCurrency(value) : '%N%';
}

function formatFormulaCount(value, unit = '') {
  if (!Number.isFinite(value)) {
    return `%N%${unit}`;
  }
  const text = Number.isInteger(value) ? String(value) : formatCurrency(value);
  return `${text}${unit}`;
}

function createDefaultSalaryCalcState() {
  return {
    abroadDaysInput: null,
    abroadUnitPriceInput: null,
    domesticDaysInput: null,
    domesticUnitPriceInput: null,
    weekendHoursInput: null,
    weekendDayCountInput: null,
    weekendUnitPriceInput: null,
    holidayDayCountInput: null,
    holidayDoubleHours: null,
    holidayTripleHours: null,
    workdayHoursInput: null,
    workdayUnitPriceInput: null,
    mealDaysInput: null,
    mealUnitPriceInput: null
  };
}

function calculateMultiplierOvertime(hours, dayCount, multiplierUnitPrice, fixedUnitPrice, multiplier) {
  const normalizedHours = Math.max(parseFormulaNumber(hours) || 0, 0);
  const normalizedDayCount = Math.max(parseFormulaNumber(dayCount) || 0, 0);
  const normalizedMultiplierUnitPrice = Math.max(parseFormulaNumber(multiplierUnitPrice) || 0, 0);
  const normalizedFixedUnitPrice = Math.max(parseFormulaNumber(fixedUnitPrice) || 0, 0);
  const baseHours = Math.min(normalizedHours, normalizedDayCount * 8);
  const extraHours = Math.max(normalizedHours - baseHours, 0);
  const amount = Math.round((baseHours * normalizedMultiplierUnitPrice * multiplier + extraHours * normalizedFixedUnitPrice) * 100) / 100;
  return { baseHours, extraHours, amount };
}

function inferOvertimeDayCount(hours) {
  return toAmount(hours) > 0 ? 1 : 0;
}

function buildHolidayCalculatorMeta(form = {}, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const multiplierUnitPrice = parseFormulaNumber(salaryContext.overtimePayPerDay);
  const fixedUnitPrice = parseFormulaNumber(salaryContext.overtimePayPerHour);
  const dayCountValue = hasCalcInput(calcState.holidayDayCountInput) ? calcState.holidayDayCountInput : String(form.holiday_overtime_days ?? '');
  const doubleHoursValue = hasCalcInput(calcState.holidayDoubleHours) ? calcState.holidayDoubleHours : String(form.holiday_double_hours ?? '');
  const tripleHoursValue = hasCalcInput(calcState.holidayTripleHours) ? calcState.holidayTripleHours : String(form.holiday_triple_hours ?? '');
  const inputHolidayDays = parseFormulaNumber(dayCountValue);
  const doubleHours = parseFormulaNumber(doubleHoursValue);
  const tripleHours = parseFormulaNumber(tripleHoursValue);
  const inferredHolidayDays = inferOvertimeDayCount((Number(doubleHours) || 0) + (Number(tripleHours) || 0));
  const holidayDays = Number.isFinite(inputHolidayDays) && inputHolidayDays > 0 ? inputHolidayDays : inferredHolidayDays;
  const doubleCalc = calculateMultiplierOvertime(doubleHours, holidayDays, multiplierUnitPrice, fixedUnitPrice, 2);
  const tripleCalc = calculateMultiplierOvertime(tripleHours, holidayDays, multiplierUnitPrice, fixedUnitPrice, 3);
  const amount = [multiplierUnitPrice, fixedUnitPrice, doubleHours, tripleHours].every(Number.isFinite) && holidayDays > 0
    ? Math.round((doubleCalc.amount + tripleCalc.amount) * 100) / 100
    : NaN;
  const formulaText = `节假日加班费 = ${formatFormulaCount(holidayDays, '天')}内每天最多8小时：${formatFormulaCount(doubleCalc.baseHours, 'h')}×2 + ${formatFormulaCount(tripleCalc.baseHours, 'h')}×3，基数单价¥${formatFormulaCurrency(multiplierUnitPrice)}/小时；超8小时外：${formatFormulaCount(doubleCalc.extraHours + tripleCalc.extraHours, 'h')}×固定单价¥${formatFormulaCurrency(fixedUnitPrice)}/小时 = ¥${formatFormulaCurrency(amount)}`;
  return {
    unitPriceText: `基数单价¥${formatFormulaCurrency(multiplierUnitPrice)}/小时，固定单价¥${formatFormulaCurrency(fixedUnitPrice)}/小时`,
    dayCountValue,
    doubleHoursValue,
    tripleHoursValue,
    previewText: formulaText,
    amount
  };
}

function buildTripCalculatorMeta(type, form = {}, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const isDomestic = type === 'domestic';
  const daysKey = isDomestic ? 'domestic_business_days' : 'abroad_business_days';
  const daysStateKey = isDomestic ? 'domesticDaysInput' : 'abroadDaysInput';
  const unitStateKey = isDomestic ? 'domesticUnitPriceInput' : 'abroadUnitPriceInput';
  const configUnitPrice = isDomestic
    ? Number(salaryContext.domesticAllowancePerTripDay) || 0
    : (Number(form.abroad_business_days) ? (Number(form.abroad_allowance) || 0) / (Number(form.abroad_business_days) || 1) : 0);
  const daysInput = hasCalcInput(calcState[daysStateKey]) ? calcState[daysStateKey] : String(form[daysKey] ?? '');
  const unitPriceInput = hasCalcInput(calcState[unitStateKey]) ? calcState[unitStateKey] : String(configUnitPrice || 0);
  const currentDays = parseFormulaNumber(daysInput);
  const currentUnitPrice = parseFormulaNumber(unitPriceInput);
  const amount = Number.isFinite(currentDays) && Number.isFinite(currentUnitPrice)
    ? Math.round(currentDays * currentUnitPrice * 100) / 100
    : NaN;

  return {
    isDomestic,
    daysStateKey,
    unitStateKey,
    daysInput,
    unitPriceInput,
    configUnitPriceText: `配置单价：¥${formatCurrency(configUnitPrice)}/天`,
    amountText: `¥${formatFormulaCurrency(amount)}`,
    previewText: `${isDomestic ? '国内出差补助' : '国外出差补助'} = ${formatFormulaCurrency(currentUnitPrice)}(单价) × ${formatFormulaCount(currentDays, '天')} = ¥${formatFormulaCurrency(amount)}`
  };
}

function buildWorkdayCalculatorMeta(form = {}, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const configUnitPrice = Number(salaryContext.overtimePayPerHour) || 0;
  const hoursInput = hasCalcInput(calcState.workdayHoursInput) ? calcState.workdayHoursInput : String(form.workday_overtime_hours ?? '');
  const unitPriceInput = hasCalcInput(calcState.workdayUnitPriceInput) ? calcState.workdayUnitPriceInput : String(configUnitPrice || 0);
  const hours = parseFormulaNumber(hoursInput);
  const unitPrice = parseFormulaNumber(unitPriceInput);
  const amount = Number.isFinite(hours) && Number.isFinite(unitPrice)
    ? Math.round(hours * unitPrice * 100) / 100
    : NaN;
  const previewText = `普通加班费 = ${formatFormulaCurrency(unitPrice)}(小时单价)×${formatFormulaCount(hours)}(加班小时数) = ¥${formatFormulaCurrency(amount)}`;
  return {
    unitPriceText: `配置单价：¥${formatCurrency(configUnitPrice)}/小时`,
    unitPriceInput,
    hoursValue: Number.isFinite(hours) ? String(hours) : '%N%',
    editableHoursValue: hoursInput,
    previewText,
    amountText: `¥${formatFormulaCurrency(amount)}`
  };
}

function buildWeekendCalculatorMeta(form = {}, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const configMultiplierUnitPrice = Number(salaryContext.overtimePayPerDay) || 0;
  const configFixedUnitPrice = Number(salaryContext.overtimePayPerHour) || 0;
  const hoursInput = hasCalcInput(calcState.weekendHoursInput) ? calcState.weekendHoursInput : String(form.weekend_overtime_days ?? '');
  const dayCountInput = hasCalcInput(calcState.weekendDayCountInput) ? calcState.weekendDayCountInput : String(form.weekend_overtime_day_count ?? '');
  const unitPriceInput = hasCalcInput(calcState.weekendUnitPriceInput) ? calcState.weekendUnitPriceInput : String(configMultiplierUnitPrice || 0);
  const hours = parseFormulaNumber(hoursInput);
  const inputDayCount = parseFormulaNumber(dayCountInput);
  const multiplierUnitPrice = parseFormulaNumber(unitPriceInput);
  const fixedUnitPrice = parseFormulaNumber(configFixedUnitPrice);
  const weekendDayCount = Number.isFinite(inputDayCount) && inputDayCount > 0 ? inputDayCount : inferOvertimeDayCount(Number(hours) || 0);
  const overtimeCalc = calculateMultiplierOvertime(hours, weekendDayCount, multiplierUnitPrice, fixedUnitPrice, 2);
  const amount = Number.isFinite(hours) && Number.isFinite(multiplierUnitPrice) && Number.isFinite(fixedUnitPrice) && weekendDayCount > 0
    ? overtimeCalc.amount
    : NaN;
  return {
    hoursInput,
    dayCountInput,
    unitPriceInput,
    configUnitPriceText: `双倍/三倍加班单价：¥${formatCurrency(configMultiplierUnitPrice)}/小时；日常加班小时单价：¥${formatCurrency(configFixedUnitPrice)}/小时`,
    amountText: `¥${formatFormulaCurrency(amount)}`,
    previewText: `周六日加班费 = ${formatFormulaCount(weekendDayCount, '天')}内每天最多8小时：${formatFormulaCount(overtimeCalc.baseHours, '小时')}×2倍×基数单价 + ${formatFormulaCount(overtimeCalc.extraHours, '小时')}×固定单价 = ¥${formatFormulaCurrency(amount)}`
  };
}

function buildMealCalculatorMeta(form = {}, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const tripDays = (Number(form.abroad_business_days) || 0) + (Number(form.domestic_business_days) || 0);
  const configUnitPrice = Number(salaryContext.mealAllowancePerTripDay) || 0;
  const daysInput = hasCalcInput(calcState.mealDaysInput) ? calcState.mealDaysInput : String(tripDays);
  const unitPriceInput = hasCalcInput(calcState.mealUnitPriceInput) ? calcState.mealUnitPriceInput : String(configUnitPrice || 0);
  const days = parseFormulaNumber(daysInput);
  const unitPrice = parseFormulaNumber(unitPriceInput);
  const amount = Number.isFinite(days) && Number.isFinite(unitPrice)
    ? Math.round(days * unitPrice * 100) / 100
    : NaN;
  return {
    daysInput,
    unitPriceInput,
    configUnitPriceText: `配置单价：¥${formatCurrency(configUnitPrice)}/出差天`,
    amountText: `¥${formatFormulaCurrency(amount)}`,
    previewText: `餐补 = ${formatFormulaCurrency(unitPrice)}(单价) × ${formatFormulaCount(days, '天')} = ¥${formatFormulaCurrency(amount)}`,
    amount
  };
}

function buildSalaryFieldInfo(field, form = {}, salaryContext = {}, calcState = {}) {
  field = safeObject(field);
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  const tripDays = (Number(form.abroad_business_days) || 0) + (Number(form.domestic_business_days) || 0);
  const domesticRate = Number(salaryContext.domesticAllowancePerTripDay) || 0;
  const abroadDays = Number(form.abroad_business_days) || 0;
  const domesticDays = Number(form.domestic_business_days) || 0;
  const weekendHours = Number(form.weekend_overtime_days) || 0;

  switch (field.key) {
    case 'abroad_allowance':
      return {
        title: '国外出差补助计算',
        lines: [
          '支持直接输入国外出差天数和补助单价后自动计算金额。'
        ],
        calculator: buildTripCalculatorMeta('abroad', form, salaryContext, calcState)
      };
    case 'domestic_allowance':
      return {
        title: '国内出差补助计算',
        lines: [
          '支持直接输入国内出差天数和补助单价后自动计算金额。'
        ],
        calculator: buildTripCalculatorMeta('domestic', form, salaryContext, calcState)
      };
    case 'holiday_overtime_pay':
      return {
        title: '节假日加班费计算',
        lines: [
          '可在下方输入双倍小时和三倍小时。每天最多8小时按2倍/3倍计算，超出8小时外按固定小时单价计算。'
        ],
        calculator: buildHolidayCalculatorMeta(form, salaryContext, calcState)
      };
    case 'weekend_overtime_pay':
      return {
        title: '周六日加班费计算',
        lines: [
          `当前周六日加班：${formatCount(weekendHours, '小时')}`,
          `当前加班小时单价：¥${formatCurrency(salaryContext.overtimePayPerHour)}/小时`,
          '周六日每天最多8小时按双倍计算，超出8小时外按固定小时单价计算。'
        ],
        calculator: buildWeekendCalculatorMeta(form, salaryContext, calcState)
      };
    case 'workday_overtime_pay':
      return {
        title: '普通加班费计算',
        lines: [
          '普通加班费指非周六日、非节假日的加班费。',
          '可直接录入加班小时数和小时单价，系统自动按计算公式展示金额。'
        ],
        calculator: buildWorkdayCalculatorMeta(form, salaryContext, calcState)
      };
    case 'meal_allowance':
      return {
        title: '餐补计算',
        lines: [
          '支持直接输入出差天数和餐补单价后自动计算金额。'
        ],
        calculator: buildMealCalculatorMeta(form, salaryContext, calcState)
      };
    case 'base_salary':
      return {
        title: '底薪说明',
        lines: [
          '底薪支持直接手动调整。',
          `当前录入底薪：¥${formatCurrency(form.base_salary)}`
        ]
      };
    case 'overtime_pay':
      return {
        title: '加班费合计计算',
        lines: [
          `节假日加班费：¥${formatCurrency(form.holiday_overtime_pay)}`,
          `周六日加班费：¥${formatCurrency(form.weekend_overtime_pay)}`,
          `普通加班费：¥${formatCurrency(form.workday_overtime_pay)}`,
          `加班费合计 = ¥${formatCurrency(form.overtime_pay)}`
        ]
      };
    case 'total_salary':
      return {
        title: '工资合计计算',
        lines: [
          `国外补助：¥${formatCurrency(form.abroad_allowance)}`,
          `国内出差补助：¥${formatCurrency(form.domestic_allowance)}`,
          `加班费合计：¥${formatCurrency(form.overtime_pay)}`,
          `餐补：¥${formatCurrency(form.meal_allowance)}`,
          `底薪：¥${formatCurrency(form.base_salary)}`,
          `工资合计 = ¥${formatCurrency(form.total_salary)}`
        ]
      };
    default:
      return {
        title: '',
        lines: []
      };
  }
}

function flattenSalaryCalculator(calculator = null) {
  calculator = safeObject(calculator);
  return {
    hasCalculator: Object.keys(calculator).length > 0,
    calcDaysInput: safeString(calculator.daysInput),
    calcDaysStateKey: safeString(calculator.daysStateKey),
    calcUnitPriceInput: safeString(calculator.unitPriceInput),
    calcUnitStateKey: safeString(calculator.unitStateKey),
    calcPreviewText: safeString(calculator.previewText),
    calcConfigUnitPriceText: safeString(calculator.configUnitPriceText),
    calcUnitPriceText: safeString(calculator.unitPriceText),
    calcDoubleHoursValue: safeString(calculator.doubleHoursValue),
    calcTripleHoursValue: safeString(calculator.tripleHoursValue),
    calcHolidayDayCountValue: safeString(calculator.dayCountValue),
    calcEditableHoursValue: safeString(calculator.editableHoursValue),
    calcHoursInput: safeString(calculator.hoursInput),
    calcDayCountInput: safeString(calculator.dayCountInput)
  };
}

function createSalaryFields(form, salaryContext = {}, calcState = {}) {
  form = safeObject(form);
  salaryContext = safeObject(salaryContext);
  calcState = safeObject(calcState);
  return SALARY_FIELD_CARD_CONFIG.map((field) => {
    const info = buildSalaryFieldInfo(field, form, salaryContext, calcState);
    const calculator = info.calculator || null;
    const isReadonlyAmount = field.inputKind === 'derived' || field.inputKind === 'readonly';
    const displayValue = isReadonlyAmount
      ? `¥${formatCurrency(form[field.key])}`
      : String(form[field.key] ?? '0');
    const helper = field.key === 'workday_overtime_pay'
      ? `当前已录入 ${formatCount(form.workday_overtime_hours, '小时')}，金额自动换算`
      : '';
    return {
      key: field.key,
      label: field.label,
      value: displayValue,
      showInfo: !!field.showInfo,
      infoTitle: info.title,
      infoLines: info.lines || [],
      calculatorType: field.calculator || '',
      calculator,
      ...flattenSalaryCalculator(calculator),
      inputKind: field.inputKind,
      helper
    };
  });
}

function createDefaultSalaryForm() {
  return {
    abroad_business_days: '0',
    abroad_allowance: '0',
    domestic_business_days: '0',
    domestic_allowance: '0',
    holiday_overtime_days: '0',
    holiday_overtime_pay: '0',
    holiday_overtime_hours: '0',
    holiday_double_hours: '0',
    holiday_triple_hours: '0',
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

function toAmount(value) {
  return Number(value) || 0;
}

function formatCurrency(value) {
  return (Math.round((Number(value) || 0) * 100) / 100).toFixed(2);
}

const SALARY_ALERT_FIELD_META = {
  abroad_allowance: { kind: 'currency' },
  domestic_allowance: { kind: 'currency' },
  holiday_overtime_pay: { kind: 'currency' },
  holiday_overtime_hours: { kind: 'hour', unit: '小时' },
  weekend_overtime_days: { kind: 'hour', unit: '小时' },
  weekend_overtime_pay: { kind: 'currency' },
  workday_overtime_hours: { kind: 'hour', unit: '小时' },
  workday_overtime_pay: { kind: 'currency' },
  meal_allowance: { kind: 'currency' },
  base_salary: { kind: 'currency' },
  compensatory_days: { kind: 'day', unit: '天' },
  total_salary: { kind: 'currency' }
};

function formatSalaryAlertValue(value, meta = {}) {
  const kind = meta.kind || 'currency';
  if (kind === 'currency') {
    return `¥${formatCurrency(value)}`;
  }

  const normalized = Number(value) || 0;
  const text = Number.isInteger(normalized) ? String(normalized) : formatCurrency(normalized);
  return `${text}${meta.unit || ''}`;
}

function formatSalaryAlertDiffValue(value, meta = {}) {
  const diff = Number(value) || 0;
  const sign = diff > 0 ? '+' : (diff < 0 ? '-' : '');
  const absValue = Math.abs(diff);
  if ((meta.kind || 'currency') === 'currency') {
    return `${sign}¥${formatCurrency(absValue)}`;
  }

  const text = Number.isInteger(absValue) ? String(absValue) : formatCurrency(absValue);
  return `${sign}${text}${meta.unit || ''}`;
}

function getSalaryMismatchSummary(recalculation = null) {
  recalculation = safeObject(recalculation);
  const storageMismatch = safeObject(recalculation.storage_mismatch);
  if (safeArray(storageMismatch.items).length) {
    return {
      type: 'storage',
      title: '工资条差异提醒',
      text: storageMismatch.message || '数据库与 Excel 工资条存在以下差异：',
      items: safeArray(storageMismatch.items)
    };
  }

  const attendanceMismatch = safeObject(recalculation.mismatch);
  if (safeArray(attendanceMismatch.items).length) {
    return {
      type: 'attendance',
      title: '工资条差异提醒',
      text: attendanceMismatch.message || '工资条与最新考勤统计存在以下差异：',
      items: safeArray(attendanceMismatch.items)
    };
  }

  return {
    type: '',
    title: '',
    text: '',
    items: []
  };
}

function buildSalaryMismatchItems(recalculation = null) {
  const summary = getSalaryMismatchSummary(recalculation);
  return safeArray(summary.items).filter(isPlainObject).slice(0, 6).map((item) => {
    const meta = SALARY_ALERT_FIELD_META[item.key] || { kind: 'currency' };
    const diff = Number(item.diff) || 0;
    const isHigher = diff > 0;
    const leftValue = Object.prototype.hasOwnProperty.call(item, 'db_value') ? item.db_value : item.actual;
    const rightValue = Object.prototype.hasOwnProperty.call(item, 'excel_value') ? item.excel_value : item.expected;
    const leftLabel = summary.type === 'storage' ? '数据库' : '工资条';
    const rightLabel = summary.type === 'storage' ? 'Excel' : '最新统计';
    return {
      key: item.key,
      label: item.label,
      leftLabel,
      rightLabel,
      leftValueText: formatSalaryAlertValue(leftValue, meta),
      rightValueText: formatSalaryAlertValue(rightValue, meta),
      dbValueText: formatSalaryAlertValue(leftValue, meta),
      excelValueText: formatSalaryAlertValue(rightValue, meta),
      diffValueText: formatSalaryAlertDiffValue(diff, meta),
      arrowDirection: isHigher ? 'up' : 'down',
      arrowColor: isHigher ? 'up' : 'down',
      isCurrency: meta.kind === 'currency'
    };
  });
}

function buildSalaryAlert(recalculation = null) {
  const summary = getSalaryMismatchSummary(recalculation);
  const alertItems = buildSalaryMismatchItems(recalculation);
  const allItems = safeArray(summary.items).filter(isPlainObject);
  const overflowCount = allItems.length > alertItems.length ? allItems.length - alertItems.length : 0;

  return {
    title: alertItems.length ? summary.title : '',
    text: alertItems.length ? summary.text : '',
    items: alertItems,
    overflowText: overflowCount > 0 ? `其余 ${overflowCount} 项差异请继续下滑查看工资条明细` : ''
  };
}

function buildSalaryAlertText(recalculation = null) {
  const alert = buildSalaryAlert(recalculation);
  const alertItems = safeArray(alert.items);
  if (!alertItems.length) {
    return '';
  }
  const lines = [alert.text];
  alertItems.forEach((item) => {
    lines.push(`${item.label}：${item.leftLabel} ${item.leftValueText}，${item.rightLabel} ${item.rightValueText}，差额 ${item.diffValueText}`);
  });
  if (alert.overflowText) {
    lines.push(alert.overflowText);
  }
  return lines.join('\n');
}

function buildSalaryModalView(salaryContext = {}) {
  salaryContext = safeObject(salaryContext);
  const name = safeString(salaryContext.name);
  const year = safeString(salaryContext.year);
  const month = safeString(salaryContext.month);
  return {
    salaryModalTitle: `${name} ${year}年${month}月工资条`,
    salaryModalSubtitle: safeString(salaryContext.sourceText),
    salaryLockBadgeText: safeString(salaryContext.lockBadgeText),
    salaryLockBadgeType: safeString(salaryContext.lockBadgeType || 'normal'),
    salaryLockInfoText: safeString(salaryContext.lockInfoText)
  };
}

function inferSalaryRateConfig(salary = {}) {
  salary = safeObject(salary);
  const domesticDays = Number(salary.domestic_business_days) || 0;
  const domesticAllowance = Number(salary.domestic_allowance) || 0;
  const mealDays = (Number(salary.abroad_business_days) || 0) + domesticDays;
  const mealAllowance = Number(salary.meal_allowance) || 0;
  const weekendHours = Number(salary.weekend_overtime_days) || 0;
  const weekendPay = Number(salary.weekend_overtime_pay) || 0;
  const workdayHours = Number(salary.workday_overtime_hours) || 0;
  const workdayPay = Number(salary.workday_overtime_pay) || 0;

  const domesticAllowancePerTripDay = Number(salary.domestic_allowance_per_trip_day)
    || (domesticDays > 0 ? domesticAllowance / domesticDays : 0);
  const mealAllowancePerTripDay = Number(salary.meal_allowance_per_trip_day)
    || (mealDays > 0 ? mealAllowance / mealDays : 0);
  const overtimePayPerHour = Number(salary.overtime_pay_per_hour)
    || (workdayHours > 0 ? workdayPay / workdayHours : 0)
    || (weekendHours > 0 ? weekendPay / weekendHours / 2 : 0);

  return {
    domesticAllowancePerTripDay,
    overtimePayPerDay: Number(salary.overtime_pay_per_day) || 0,
    overtimePayPerHour,
    mealAllowancePerTripDay,
    workRestMode: salary.work_rest_mode || 'double_rest'
  };
}

Page({
  data: {
    attendanceData: [],        // 考勤数据列表
    loading: false,            // 加载状态
    
    // 筛选条件
    filterName: '',            // 筛选姓名（保留兼容性）
    currentYear: new Date().getFullYear(),   // 当前年份
    currentMonth: new Date().getMonth() + 1, // 当前月份
    yearOptions: [],           // 年份选项
    monthOptions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    yearIndex: 0,              // 年份选择索引
    monthIndex: new Date().getMonth(), // 月份选择索引
    
    // 员工多选相关
    selectedEmployees: [],     // 已选择的员工列表
    selectedEmployeeCount: 0,
    selectedEmployeeName: '',
    employeeList: [],          // 所有员工列表
    employeeLoading: false,    // 员工列表加载状态
    showEmployeePopup: false,  // 显示员工选择弹窗
    
    // 用户权限
    isAdmin: false,            // 是否是管理员
    realName: '',              // 当前用户真实姓名
    
    // 统计数据
    statisticsData: {
      attendanceDays: 0,       // 出勤天数 (公司上班+国内出差+国外出差)
      companyDays: 0,          // 公司上班天数
      domesticTripDays: 0,     // 国内出差天数
      foreignTripDays: 0,      // 国外出差天数
      restDays: 0,             // 休息天数
      compensatoryDays: 0,     // 调休天数
      workDays: 0,             // 工作日天数
      totalDays: 0,            // 总记录天数
      attendanceRate: 0,       // 出勤率
      totalSubsidy: 0          // 总补贴
    },
    salaryOverview: {
      visible: false,
      loading: false,
      title: '',
      desc: '',
      totalSalary: '0.00',
      baseSalary: '0.00',
      overtimePay: '0.00',
      tripAllowance: '0.00',
      mealAllowance: '0.00'
    },
    
    // 弹窗相关
    showDeleteModal: false,
    deleteRecordId: null,
    // ⭐ 删除进度弹窗相关
    isDeleting: false,
    deleteProgress: 0,
    deleteCurrentStep: '',
    showDeleteResult: false,
    deleteResultSuccess: true,
    deleteResultMsg: '',
    deleteSteps: {
      db_deleted: false,
      db_msg: '',
      excel_cleared: false,
      excel_msg: '',
      nas_uploaded: false,
      nas_msg: ''
    },
    // ⭐ 编辑弹窗相关
    showEditModal: false,
    editForm: {
      id: '',
      type: 'office',
      date: '',
      time: '',
      location: '',
      baseName: '',
      subsidy: ''
    },
    // ⭐ 保存结果弹窗相关
    showResultModal: false,
    resultSuccess: true,
    resultTitle: '',
    resultMsg: '',
    // ⭐ 工资条编辑相关
    showSalaryModal: false,
    salarySaving: false,
    salaryContext: {
      name: '',
      year: '',
      month: '',
      source: '',
      sourceText: '',
      overtimePayPerDay: 0,
      overtimePayPerHour: 0,
      domesticAllowancePerTripDay: 0,
      mealAllowancePerTripDay: 0,
      lockInfo: null,
      lockInfoText: '',
      lockBadgeText: '',
      lockBadgeType: ''
    },
    salaryForm: createDefaultSalaryForm(),
    salaryFields: createSalaryFields(createDefaultSalaryForm(), {}, createDefaultSalaryCalcState()),
    salaryModalTitle: '',
    salaryModalSubtitle: '',
    salaryLockBadgeText: '',
    salaryLockBadgeType: 'normal',
    salaryLockInfoText: '',
    salaryExpandedInfoKey: '',
    showSalaryInfoPopup: false,
    salaryInfoPopup: {
      key: '',
      title: '',
      lines: [],
      field: null
    },
    salaryCalcState: createDefaultSalaryCalcState(),
    salaryAlertTitle: '',
    salaryAlertText: '',
    salaryAlertItems: [],
    salaryAlertOverflowText: '',
    // ⭐ 游客模式相关
    isGuest: false, // 是否为游客模式
    showGuestBanner: false // 是否显示游客模式横幅
  },

  onLoad(options) {
    // ⭐ 检查游客模式
    const isGuest = mockData.isGuestMode();
    this.setData({ 
      isGuest: isGuest,
      showGuestBanner: isGuest 
    });
    
    this.initYearOptions();
    this.loadUserInfo();
    this.loadAttendanceData();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('考勤历史页面-测试模式热加载');
      this.loadUserInfo();
      this.loadEmployeeList();
      this.loadAttendanceData();
    });
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadAttendanceData();
  },

  onPullDownRefresh() {
    if (mockData.showGuestModeTip('attendance')) {
      wx.stopPullDownRefresh();
      return;
    }
    this.loadAttendanceData();
  },

  // 初始化年份选项
  initYearOptions() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      yearOptions.push(i.toString());
    }
    
    const yearIndex = yearOptions.findIndex(year => parseInt(year) === currentYear);
    
    this.setData({
      yearOptions,
      yearIndex: yearIndex >= 0 ? yearIndex : 2
    });
  },

  // 加载用户信息
  loadUserInfo() {
    try {
      // 未登录预览不构造用户身份。
      if (mockData.isGuestMode()) {
        console.log('考勤历史-未登录预览：用户信息为空');
        this.setData({
          isAdmin: false,
          realName: '',
          employeeList: [],
          selectedEmployees: []
        });
        return;
      }
      
      // 检查是否为测试模式
      if (testModeManager.isTestMode()) {
        // 测试模式：模拟管理员权限
        console.log('考勤历史-测试模式：模拟管理员权限');
        
        // 初始化测试用户信息
        const testUserInfo = {
          id: 'test_user_001',
          openid: 'test_openid_001',
          nickname: '微信用户d_001', // 与testMode.js保持一致
          avatar_url: '/images/default-avatar.png',
          real_name: '', // 测试未完善真实姓名的场景
          is_web_bound: false,
          web_username: null,
          web_user_level: null,
          user_level: 'admin',
          is_admin: true,
          is_active: true,
          register_time: '2025-09-25 10:00:00',
          last_login: '2025-09-25 12:00:00',
          permissions: [
            { code: 'electric_query', name: '电费查询', is_granted: true },
            { code: 'attendance', name: '考勤管理', is_granted: true },
            { code: 'admin', name: '管理员权限', is_granted: true }
          ]
        };
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', testUserInfo);
        
        this.setData({
          isAdmin: true,
          realName: '' // 测试未完善真实姓名的场景
        });
        
        console.log('考勤历史-测试模式：用户信息已初始化', testUserInfo);
        this.loadEmployeeList();
        return; // 确保测试模式下不执行后续的API调用
      }
      
      // 先尝试从本地存储获取用户信息
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo && localUserInfo.is_admin !== undefined) {
        console.log('从本地存储获取用户信息:', localUserInfo);
        this.setData({
          isAdmin: localUserInfo.is_admin || false,
          realName: localUserInfo.real_name || ''
        });
        
        if (localUserInfo.is_admin) {
          console.log('本地存储显示管理员权限，加载员工列表');
          this.loadEmployeeList();
        }
      }

      // 正常模式：调用API获取用户信息
      apiCall(
        () => API.user.getInfo(),
        '',
        (result) => {
          console.log('考勤历史-用户信息API返回结果:', result);
          if (result && result.data) {
            console.log('考勤历史-用户权限信息:', {
              is_admin: result.data.is_admin,
              real_name: result.data.real_name,
              user_level: result.data.user_level,
              web_user_level: result.data.web_user_level,
              is_web_bound: result.data.is_web_bound,
              web_username: result.data.web_username
            });
            
            // 详细的权限判断日志
            console.log('考勤历史-权限判断详情:', {
              微信用户级别: result.data.user_level,
              Web用户级别: result.data.web_user_level,
              是否绑定Web: result.data.is_web_bound,
              Web用户名: result.data.web_username,
              最终管理员权限: result.data.is_admin
            });
            
            // 更新本地存储
            wx.setStorageSync('userInfo', result.data);
            
            this.setData({
              isAdmin: result.data.is_admin || false,
              realName: result.data.real_name || ''
            });
            
            // 如果是管理员，加载员工列表
            if (result.data.is_admin) {
              console.log('考勤历史-检测到管理员权限，开始加载员工列表');
              this.loadEmployeeList();
            } else {
              console.log('考勤历史-普通用户权限，不加载员工列表');
            }
          }
        },
        (error) => {
          // 移除console.error以避免触发全局错误恢复机制
          // 如果API失败但本地有管理员信息，继续使用本地信息
          if (!localUserInfo || !localUserInfo.is_admin) {
            this.setData({
              isAdmin: false,
              realName: ''
            });
          }
        }
      );
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.setData({
        isAdmin: false,
        realName: ''
      });
    }
  },

  // 加载员工列表（管理员功能 - 从WorkKaoQinUsers表获取）
  loadEmployeeList() {
    if (!this.data.isAdmin) {
      console.log('非管理员用户，跳过员工列表加载');
      return;
    }

    console.log('开始加载员工列表...');
    this.setData({ employeeLoading: true });

    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('测试模式：使用模拟员工数据');
      const mockEmployees = [
        { name: '张三', label: '张三', id: 1, selected: false },
        { name: '李四', label: '李四', id: 2, selected: false },
        { name: '王五', label: '王五', id: 3, selected: false },
        { name: '赵六', label: '赵六', id: 4, selected: false },
        { name: '测试管理员', label: '测试管理员', id: 5, selected: false }
      ];
      
      setTimeout(() => {
        this.setData({
          employeeList: mockEmployees,
          employeeLoading: false
        });
        console.log('测试模式：员工列表加载完成', mockEmployees);
      }, 300);
      return;
    }

    apiCall(
      () => API.attendance.getKaoqinUsers(),
      null,
      (result) => {
        console.log('WorkKaoQinUsers员工列表API返回结果:', result);
        if (result && Array.isArray(result)) {
          // 初始化每个员工的选中状态
          const employeeList = result.map(emp => (Object.assign({}, emp, {
            selected: this.data.selectedEmployees.indexOf(emp.name) >= 0
          })));
          
          this.setData({
            employeeList: employeeList,
            employeeLoading: false
          });
          console.log('员工列表加载成功，数量:', result.length);
        } else if (result && result.data && Array.isArray(result.data)) {
          // 初始化每个员工的选中状态
          const employeeList = result.data.map(emp => (Object.assign({}, emp, {
            selected: this.data.selectedEmployees.indexOf(emp.name) >= 0
          })));
          
          this.setData({
            employeeList: employeeList,
            employeeLoading: false
          });
          console.log('员工列表加载成功，数量:', result.data.length);
        } else {
          this.setData({
            employeeList: [],
            employeeLoading: false
          });
          console.log('员工列表为空或格式错误');
        }
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        this.setData({
          employeeList: [],
          employeeLoading: false
        });
        
        if (error.message && !error.message.includes('403')) {
          showError(`获取员工列表失败: ${error.message}`);
        }
      }
    );
  },

  // 加载考勤数据
  loadAttendanceData() {
    try {
      this.setData({ loading: true });

      // 未登录预览只显示空状态。
      if (mockData.isGuestMode()) {
        console.log('考勤历史-未登录预览：保持为空');
        this.setData({
          attendanceData: [],
          statisticsData: this.calculateStatistics([]),
          loading: false
        });
        this.resetSalaryOverview({
          visible: true,
          desc: '登录后可查看本人工资概览'
        });
        if (wx.stopPullDownRefresh) {
          wx.stopPullDownRefresh();
        }
        return;
      }

      // 检查是否为测试模式
      if (testModeManager.isTestMode()) {
        // 测试模式：使用mock数据
        console.log('考勤历史-测试模式：使用mock数据');
        setTimeout(() => {
          const baseMockData = testModeManager.getMockAttendanceData();
          
          // 扩展mock数据：为多个员工生成数据
          const employees = ['张三', '李四', '王五', '赵六', '测试管理员'];
          const expandedMockData = [];
          
          employees.forEach((employee, employeeIndex) => {
            baseMockData.forEach((item, itemIndex) => {
              const workStatuses = ['公司上班', '国内出差', '国外出差', '休息'];
              const randomStatus = workStatuses[Math.floor(Math.random() * workStatuses.length)];
              
              expandedMockData.push(Object.assign({}, item, {
                id: employeeIndex * baseMockData.length + itemIndex + 1,
                RealName: employee,
                WorkStatus: randomStatus,
                CheckInTime: randomStatus === '休息' ? null : '09:00:00',
                CheckOutTime: randomStatus === '休息' ? null : '18:00:00',
                WorkHours: randomStatus === '休息' ? 0 : 8,
                Subsidy: randomStatus.includes('出差') ? 100 : 0,
                // 确保有CreateTime字段
                CreateTime: item.CreateTime || item.WorkDate + ' ' + (randomStatus === '休息' ? '00:00:00' : '18:00:00')
              }));
            });
          });
          
          console.log('测试模式考勤数据扩展完成:', expandedMockData.length, '条记录', employees.length, '个员工');
          
          // 转换mock数据字段格式以匹配页面期望
          const convertedData = expandedMockData.map(item => (Object.assign({}, item, {
            // 字段映射：将mock数据的字段名转换为页面期望的字段名
            work_date: item.WorkDate,
            work_status: item.WorkStatus, 
            check_in_time: item.CheckInTime,
            check_out_time: item.CheckOutTime,
            work_hours: item.WorkHours,
            business_trip_subsidy: item.Subsidy,
            real_name: item.RealName,
            create_time: item.CreateTime,
            
            // 模板专用字段映射
            name: item.RealName,           // 模板中使用 {{item.name}}
            submit_time: item.CreateTime,  // 模板中使用 {{item.submit_time}}
            
            // 状态相关字段
            status_type: item.WorkStatus === '公司上班' ? 'work' : 
                        item.WorkStatus === '休息' ? 'rest' : 'trip',
            weekday: this.getWeekday(item.WorkDate)
          })));
          
          console.log('测试模式考勤数据字段转换完成:', convertedData.length, '条记录');
          
          // 根据当前筛选条件过滤数据
          let filteredData = convertedData;
          const selectedEmployees = safeArray(this.data.selectedEmployees);
          if (selectedEmployees.length > 0) {
            filteredData = filteredData.filter(item => 
              selectedEmployees.includes(item.RealName || item.real_name)
            );
          }
          
          // 计算统计数据
          const stats = this.calculateStatistics(filteredData);
          
          console.log('测试模式考勤数据处理完成:', {
            原始数据条数: expandedMockData.length,
            转换后数据条数: convertedData.length,
            筛选后数据条数: filteredData.length,
            统计数据: stats,
            样本记录: filteredData[0],
            '样本记录的关键字段': {
              name: filteredData[0] ? filteredData[0].name : undefined,
              submit_time: filteredData[0] ? filteredData[0].submit_time : undefined,
              work_date: filteredData[0] ? filteredData[0].work_date : undefined,
              work_status: filteredData[0] ? filteredData[0].work_status : undefined,
              weekday: filteredData[0] ? filteredData[0].weekday : undefined,
              status_type: filteredData[0] ? filteredData[0].status_type : undefined,
              business_trip_subsidy: filteredData[0] ? filteredData[0].business_trip_subsidy : undefined
            }
          });
          
          this.setData({
            attendanceData: filteredData,
            statisticsData: stats,
            loading: false
          });
          console.log('测试模式数据已设置到页面状态');
          
          if (wx.stopPullDownRefresh) {
            wx.stopPullDownRefresh();
          }
        }, 800);
        return;
      }

      const params = {
        year: this.data.currentYear,
        month: this.data.currentMonth
      };
      
      // 只有管理员才能搜索其他人的考勤记录
      const selectedEmployees = safeArray(this.data.selectedEmployees);
      if (this.data.isAdmin && selectedEmployees.length > 0) {
        if (selectedEmployees.length === 1) {
          // 单个员工查询（兼容旧接口）
          params.name = selectedEmployees[0];
        } else {
          // 多个员工查询
          params.names = selectedEmployees.join(',');
        }
      } else if (this.data.isAdmin && this.data.filterName) {
        // 兼容旧版本的单个姓名查询
        params.name = this.data.filterName;
      }

      // 使用apiCall方法处理API调用
      apiCall(
        () => API.attendance.getHistory(params),
        '加载中...',
        (result) => this.handleAttendanceSuccess(result),
        (error) => this.handleAttendanceError(error)
      );

    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.handleAttendanceError(error);
    }
  },

  // 处理Mock考勤数据
  handleMockAttendanceData() {
    setTimeout(() => {
      const mockData = [
        {
          id: 'attendance_1',
          employee_name: '测试管理员',
          work_date: '2025-09-23',
          work_status: '公司上班',
          submit_time: '2025-09-23 09:00:00',
          location: '测试公司',
          business_trip_subsidy: 0
        },
        {
          id: 'attendance_2',
          employee_name: '测试管理员',
          work_date: '2025-09-22',
          work_status: '国内出差',
          submit_time: '2025-09-22 10:30:00',
          location: '北京',
          business_trip_subsidy: 200
        },
        {
          id: 'attendance_3',
          employee_name: '测试管理员',
          work_date: '2025-09-21',
          work_status: '休息',
          submit_time: '2025-09-21 12:00:00',
          location: '家中',
          business_trip_subsidy: 0
        }
      ];

      // Mock数据按日期倒序排序后再处理
      const sortedMockData = mockData.sort((a, b) => {
        const dateA = new Date(a.work_date);
        const dateB = new Date(b.work_date);
        return dateB.getTime() - dateA.getTime();
      });
      console.log('Mock考勤数据按日期倒序排序完成');
      
      this.handleAttendanceSuccess(sortedMockData);
    }, 500);
  },

  // 处理考勤数据成功返回
  handleAttendanceSuccess(result) {
    try {
      let attendanceList = [];
      let updateData = { loading: false };
      
      // 处理后端返回的数据结构
      if (result && result.data && Array.isArray(result.data)) {
        attendanceList = result.data;
        
        // 小程序统一保持普通用户视图，不使用业务接口提升管理员展示权限。
        updateData.isAdmin = false;
        
        if (result.real_name) {
          updateData.realName = result.real_name;
        }
      } else if (result && Array.isArray(result)) {
        attendanceList = result;
      }
      
      if (attendanceList.length > 0) {
        // 处理数据格式
        const processedData = attendanceList.map(item => {
          console.log('处理考勤记录:', {
            id: item.id,
            put_date_原始: item.put_date,
            submit_time_原始: item.submit_time,
            create_time_原始: item.create_time,
            put_date_类型: typeof item.put_date,
            work_date_原始: item.work_date,
            name_原始: item.name
          });
          
          // 字段映射：后端字段 -> 前端字段
          const submitTime = item.put_date || item.submit_time || item.create_time;
          
          return Object.assign({}, item, {
            id: item.id || Math.random().toString(36).substr(2, 9),
            work_date: this.formatDate(item.work_date),
            weekday: this.getWeekday(item.work_date),
            submit_time: this.formatDateTime(submitTime),
            status_type: this.getStatusType(item.work_status),
            business_trip_subsidy: item.business_trip_subsidy || 0,
            // 统一字段命名
            employee_name: item.name || item.employee_name || item.real_name,
            real_name: item.name || item.real_name || item.employee_name,
            display_name: item.name || item.real_name || item.employee_name || '',
            avatar_text: getFirstChar(item.name || item.real_name || item.employee_name)
          });
        });

        // 按考勤日期倒序排序（最新的日期在前）
        processedData.sort((a, b) => {
          const dateA = new Date(a.work_date.replace(/\//g, '-'));
          const dateB = new Date(b.work_date.replace(/\//g, '-'));
          return dateB.getTime() - dateA.getTime();
        });

        console.log('考勤数据按日期倒序排序完成，总条数:', processedData.length);
        if (processedData.length > 0) {
          console.log('第一条记录日期:', processedData[0].work_date);
          console.log('最后一条记录日期:', processedData[processedData.length - 1].work_date);
        }

        // 计算统计数据
        const statistics = this.calculateStatistics(processedData);

        updateData.attendanceData = processedData;
        updateData.statisticsData = statistics;
      } else {
        updateData.attendanceData = [];
        updateData.statisticsData = {
          attendanceDays: 0,
          companyDays: 0,
          domesticTripDays: 0,
          foreignTripDays: 0,
          restDays: 0,
          totalDays: 0,
          workDays: 0,
          attendanceRate: 0,
          totalSubsidy: 0
        };
      }
      
      this.setData(updateData);
      
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.handleAttendanceError(error);
    }
  },

  // 处理考勤数据错误
  handleAttendanceError(error) {
    // 移除console.error以避免触发全局错误恢复机制
    console.log('考勤历史查询错误:', error);
    
    // 特殊处理：用户姓名未完善的情况，优先处理避免错误冒泡
    if (error.need_complete_name || (error.message && error.message.includes('请先完善真实姓名'))) {
      console.log('用户需要完善真实姓名才能查看考勤历史');
      wx.showModal({
        title: '信息不完整',
        content: '您还未完善真实姓名，无法查看考勤记录。\n\n请先前往个人信息页面完善您的真实姓名。',
        showCancel: true,
        cancelText: '稍后完善',
        confirmText: '立即完善',
        success: (res) => {
          if (res.confirm) {
            // 跳转到用户中心页面（使用switchTab因为是Tab页面）
            wx.switchTab({
              url: '/pages/usercenter/index'
            });
          } else {
            // 返回上一页
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
      
      this.setData({ 
        loading: false,
        attendanceData: []
      });
      return; // 显式返回，确保错误被正确处理
    }
    
    // 处理其他错误
    console.warn('考勤历史查询其他错误:', error.message || error);
    // 使用已导入的showError函数
    showError(`加载失败: ${error.message || '网络错误'}`);

    this.setData({ 
      loading: false,
      attendanceData: []
    });
  },

  // 姓名输入
  onNameChange(e) {
    this.setData({
      filterName: e.detail.value
    });
  },

  // 年份选择
  onYearChange(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const index = e && e.detail ? Number(e.detail.value) : -1;
    const year = parseInt(this.data.yearOptions[index]);
    if (isNaN(year)) return;
    
    this.setData({
      yearIndex: index,
      currentYear: year
    });
    this.loadAttendanceData();
  },

  // 月份选择
  onMonthChange(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const index = e && e.detail ? Number(e.detail.value) : -1;
    const month = parseInt(this.data.monthOptions[index]);
    if (isNaN(month)) return;
    
    this.setData({
      monthIndex: index,
      currentMonth: month
    });
    this.loadAttendanceData();
  },

  // 执行筛选
  onFilter() {
    this.loadAttendanceData();
  },

  // 重置筛选
  onReset() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const yearIndex = this.data.yearOptions.findIndex(year => parseInt(year) === currentYear);
    
    this.setData({
      filterName: '',
      ...buildSelectedEmployeeState([]),  // 清空员工选择
      currentYear,
      currentMonth,
      yearIndex: yearIndex >= 0 ? yearIndex : 2,
      monthIndex: currentDate.getMonth()
    });
    
    this.loadAttendanceData();
  },

  // 编辑考勤项
  onEditItem(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const item = e.currentTarget.dataset.item;
    if (!item) return;
    const typeMap = {
      '公司上班': 'office', '国内出差': 'domestic',
      '国外出差': 'international', '休息': 'rest', '调休': 'compensatory', '加班': 'office'
    };
    this.setData({
      showEditModal: true,
      editForm: {
        id: item.id,
        name: item.name || item.real_name || item.employee_name || '',
        type: typeMap[item.work_status] || 'office',
        date: item.work_date || '',
        time: item.submit_time ? (item.submit_time.split(' ')[1] || '').substring(0, 5) : '',
        location: item.location || item.business_trip_location || '',
        baseName: item.comment || item.base_name || '',
        subsidy: item.business_trip_subsidy ? String(item.business_trip_subsidy) : ''
      }
    });
  },

  onCloseEditModal() {
    this.setData({ showEditModal: false });
  },

  onStopPropagation() {},

  onEditModalChange(e) {
    if (!e.detail.visible) this.setData({ showEditModal: false });
  },

  onEditTypeChange(e) {
    this.setData({ 'editForm.type': e.currentTarget.dataset.type });
  },

  onEditDateChange(e) {
    this.setData({ 'editForm.date': e.detail.value });
  },

  onEditTimeChange(e) {
    this.setData({ 'editForm.time': e.detail.value });
  },

  onEditLocationChange(e) {
    this.setData({ 'editForm.location': e.detail.value });
  },

  onEditBaseNameChange(e) {
    this.setData({ 'editForm.baseName': e.detail.value });
  },

  onEditSubsidyChange(e) {
    this.setData({ 'editForm.subsidy': e.detail.value });
  },

  onSaveEdit() {
    const form = this.data.editForm;
    if (!form.id) return;
    const typeToStatus = {
      office: '公司上班', domestic: '国内出差',
      international: '国外出差', rest: '休息', compensatory: '调休'
    };
    
    const workStatus = typeToStatus[form.type] || '公司上班';
    
    // 根据工作状态生成 comment
    let comment = '';
    if (workStatus === '国内出差' || workStatus === '国外出差') {
      // 出差类型：comment 是出差地点（基地名）
      comment = form.baseName || '';
    } else {
      // 公司上班或休息：comment 就是工作状态本身
      comment = workStatus;
    }
    
    const payload = {
      name: form.name,
      work_status: workStatus,
      work_date: form.date,
      put_date: form.date && form.time ? `${form.date} ${form.time}:00` : undefined,
      business_trip_location: form.baseName || '',
      comment: comment,
      business_trip_subsidy: parseFloat(form.subsidy) || 0
    };
    apiCall(
      () => API.attendance.update(form.id, payload),
      null,
      (res) => {
        const salaryRecalculation = res && res.data && res.data.salary_recalculation;
        const storageMismatchText = buildSalaryAlertText(salaryRecalculation);
        this.setData({
          showEditModal: false,
          showResultModal: true,
          resultSuccess: true,
          resultTitle: '更新成功',
          resultMsg: `${res && res.msg ? res.msg : '打卡记录已成功同步至服务器'}${storageMismatchText ? `\n${storageMismatchText}` : ''}`
        });
        this.loadAttendanceData();

        // 通知主考勤页面刷新日历和漏打卡状态
        const pages = getCurrentPages();
        const attendancePage = pages.find(p => p.route === 'pages/attendance/index');
        if (attendancePage) {
          attendancePage._needRefreshCalendar = true;
        }
      },
      (err) => {
        this.setData({
          showResultModal: true,
          resultSuccess: false,
          resultTitle: '更新失败',
          resultMsg: err && err.message ? err.message : '操作失败，请重试'
        });
      }
    );
  },

  onCloseResultModal() {
    this.setData({ showResultModal: false, resultTitle: '' });
  },

  // 删除考勤项 - 打开自定义删除弹窗
  onDeleteItem(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const item = e.currentTarget.dataset.item;
    this.setData({
      showDeleteModal: true,
      deleteRecordId: item.id
    });
  },

  onCloseDeleteModal() {
    this.setData({ showDeleteModal: false, deleteRecordId: null });
  },

  // 确认删除 - 带进度弹窗
  async onConfirmDelete() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const recordId = this.data.deleteRecordId;
    if (!recordId) return;

    this.setData({
      showDeleteModal: false,
      isDeleting: true,
      deleteProgress: 10,
      deleteCurrentStep: '正在删除数据库记录...'
    });

    try {
      const res = await API.attendance.delete(recordId);
      // res = { code, msg, data: responseData }
      // responseData = { steps: { db_deleted, db_msg, excel_cleared, excel_msg, nas_uploaded, nas_msg } }
      const steps = (res.data && res.data.steps) ? res.data.steps : {
        db_deleted: true, db_msg: '数据库记录已删除',
        excel_cleared: true, excel_msg: 'Excel考勤表已清除',
        nas_uploaded: true, nas_msg: '已同步到公盘'
      };
      const msg = res.msg || '操作完成';

      // 动画式推进进度
      this.setData({ deleteProgress: 40, deleteCurrentStep: '正在清除Excel考勤表...' });
      await new Promise(r => setTimeout(r, 400));
      this.setData({ deleteProgress: 70, deleteCurrentStep: '正在同步到公司公盘...' });
      await new Promise(r => setTimeout(r, 400));

      const uploadStepOk = steps.nas_uploaded || ((steps.nas_msg || '').includes('已关闭网盘上传'));
      const allSuccess = steps.db_deleted && steps.excel_cleared && uploadStepOk;
      this.setData({
        isDeleting: false,
        deleteProgress: 100,
        deleteRecordId: null,
        showDeleteResult: true,
        deleteResultSuccess: allSuccess,
        deleteResultMsg: msg,
        deleteSteps: steps
      });
      this.loadAttendanceData();

      // 通知主考勤页面刷新日历和漏打卡状态
      const pages = getCurrentPages();
      const attendancePage = pages.find(p => p.route === 'pages/attendance/index');
      if (attendancePage) {
        attendancePage._needRefreshCalendar = true;
      }
    } catch (error) {
      this.setData({
        isDeleting: false,
        deleteRecordId: null,
        showDeleteResult: true,
        deleteResultSuccess: false,
        deleteResultMsg: (error && error.message) ? error.message : '删除失败',
        deleteSteps: {
          db_deleted: false, db_msg: '删除失败',
          excel_cleared: false, excel_msg: '',
          nas_uploaded: false, nas_msg: ''
        }
      });
    }
    this.resetSalaryOverview();
  },

  createEmptySalaryOverview(overrides = {}) {
    overrides = safeObject(overrides);
    return Object.assign({
      visible: false,
      loading: false,
      hasData: false,
      title: '',
      desc: '',
      totalSalary: '0.00',
      baseSalary: '0.00',
      overtimePay: '0.00',
      tripAllowance: '0.00',
      mealAllowance: '0.00'
    }, overrides);
  },

  resetSalaryOverview(overrides = {}) {
    this.setData({
      salaryOverview: this.createEmptySalaryOverview(overrides)
    });
  },

  buildSalaryOverviewData(name, salary = {}) {
    salary = safeObject(salary);
    const abroadAllowance = Number(salary.abroad_allowance) || 0;
    const domesticAllowance = Number(salary.domestic_allowance) || 0;
    const tripAllowance = abroadAllowance + domesticAllowance;
    return {
      visible: true,
      loading: false,
      hasData: true,
      title: `${name}当月工资概览`,
      desc: '显示当前年月工资条的简要金额信息',
      totalSalary: formatCurrency(salary.total_salary),
      baseSalary: formatCurrency(salary.base_salary),
      overtimePay: formatCurrency(salary.overtime_pay),
      tripAllowance: formatCurrency(tripAllowance),
      mealAllowance: formatCurrency(salary.meal_allowance)
    };
  },

  syncSalaryOverviewWithForm(name, salaryForm = {}) {
    if (!name) {
      return;
    }
    this.setData({
      salaryOverview: this.buildSalaryOverviewData(name, salaryForm)
    });
  },

  async refreshSalaryOverview() {
    const targetInfo = this.getSalaryTargetInfo();
    if (!targetInfo.ok) {
      this.resetSalaryOverview({
        visible: true,
        desc: targetInfo.msg || '当前筛选下暂无法展示工资概览'
      });
      return;
    }

    if (mockData.isGuestMode()) {
      this.resetSalaryOverview({
        visible: true,
        desc: '登录后可查看本人工资概览'
      });
      return;
    }

    if (testModeManager.isTestMode()) {
      const mockSalary = this.normalizeSalaryForm(this.buildMockSalarySheet(targetInfo.name), {
        domesticAllowancePerTripDay: 100,
        overtimePayPerDay: 250,
        overtimePayPerHour: 30
      });
      this.setData({
        salaryOverview: this.buildSalaryOverviewData(targetInfo.name, mockSalary)
      });
      return;
    }

    this.setData({
      salaryOverview: this.createEmptySalaryOverview({
        visible: true,
        loading: true,
        title: `${targetInfo.name}当月工资概览`,
        desc: '工资概览加载中...'
      })
    });

    try {
      const res = await API.attendance.getSalarySheet({
        name: targetInfo.name,
        year: this.data.currentYear,
        month: this.data.currentMonth
      });

      if (res && res.code === 200 && res.data && res.data.salary) {
        this.setData({
          salaryOverview: this.buildSalaryOverviewData(targetInfo.name, res.data.salary)
        });
        return;
      }

      this.resetSalaryOverview({
        visible: true,
        title: `${targetInfo.name}当月工资概览`,
        desc: res && res.msg ? res.msg : '暂未生成当月工资条'
      });
    } catch (error) {
      this.resetSalaryOverview({
        visible: true,
        title: `${targetInfo.name}当月工资概览`,
        desc: error && error.message ? error.message : '工资概览加载失败'
      });
    }
  },

  // 关闭删除结果弹窗
  onCloseDeleteResult() {
    this.setData({ showDeleteResult: false });
  },

  getSalaryTargetInfo() {
    const selectedEmployees = safeArray(this.data.selectedEmployees);
    const uniqueNames = Array.from(new Set(
      safeArray(this.data.attendanceData)
        .map(item => {
          item = safeObject(item);
          return item.name || item.real_name || item.employee_name;
        })
        .filter(Boolean)
    ));

    if (this.data.isAdmin) {
      if (selectedEmployees.length > 1) {
        return { ok: false, msg: '请先只选择一位员工，再编辑当月工资条' };
      }
      if (selectedEmployees.length === 1) {
        return { ok: true, name: selectedEmployees[0] };
      }
      if (uniqueNames.length === 1) {
        return { ok: true, name: uniqueNames[0] };
      }
      return { ok: false, msg: '管理员请先选择一位员工后再编辑工资条' };
    }

    if (this.data.realName) {
      return { ok: true, name: this.data.realName };
    }
    if (uniqueNames.length === 1) {
      return { ok: true, name: uniqueNames[0] };
    }
    return { ok: false, msg: '未识别到当前用户姓名，请先完善真实姓名' };
  },

  createSalaryContext(name, source) {
    const sourceTextMap = {
      db: '已从数据库工资条快照读取',
      excel: '已从 Excel 读取现有工资条',
      attendance: '已按当月考勤统计生成默认值',
      mock: '当前为演示数据，保存不会写入后端'
    };
    return {
      name,
      year: this.data.currentYear,
      month: this.data.currentMonth,
      source: source || 'attendance',
      sourceText: sourceTextMap[source || 'attendance'] || sourceTextMap.attendance,
      lockInfo: null,
      lockInfoText: '',
      lockBadgeText: '',
      lockBadgeType: ''
    };
  },

  buildSalaryLockMeta(lockInfo) {
    if (!isPlainObject(lockInfo)) {
      return {
        lockInfo: null,
        lockInfoText: '',
        lockBadgeText: '',
        lockBadgeType: ''
      };
    }

    const sourceTextMap = {
      manual: '手动生成',
      auto: '自动生成',
      attendance: '按考勤统计生成',
      excel: '来自 Excel'
    };

    const sourceText = sourceTextMap[lockInfo.last_source] || '未知来源';
    const generatedAt = lockInfo.generated_at || '';
    const lines = [`最后来源：${sourceText}`];
    if (generatedAt) {
      lines.push(`最后生成时间：${generatedAt}`);
    }
    if (lockInfo.manual_locked) {
      lines.push('本月已手动锁定，定时任务不会重复覆盖');
    }

    return {
      lockInfo,
      lockInfoText: lines.join('  ·  '),
      lockBadgeText: lockInfo.manual_locked ? '已手动锁定' : sourceText,
      lockBadgeType: lockInfo.manual_locked ? 'manual' : 'normal'
    };
  },

  calculateSalaryTotal(form = {}) {
    form = safeObject(form);
    const total = ['abroad_allowance', 'domestic_allowance', 'overtime_pay', 'meal_allowance', 'base_salary']
      .reduce((sum, key) => sum + (parseFloat(form[key]) || 0), 0);
    return total;
  },

  refreshSalaryEditor(form = this.data.salaryForm, overrides = {}) {
    overrides = safeObject(overrides);
    form = safeObject(form);
    const salaryContext = safeObject(overrides.salaryContext || this.data.salaryContext);
    const salaryCalcState = safeObject(overrides.salaryCalcState || this.data.salaryCalcState);
    return {
      salaryForm: form,
      salaryFields: createSalaryFields(form, salaryContext, salaryCalcState)
    };
  },

  computeOvertimePay(form = {}, overtimePayPerDay = 0, overtimePayPerHour = 0) {
    form = safeObject(form);
    const holidayAmount = toAmount(form.holiday_overtime_pay);
    const weekendCalc = calculateMultiplierOvertime(
      toAmount(form.weekend_overtime_days),
      toAmount(form.weekend_overtime_day_count) || inferOvertimeDayCount(form.weekend_overtime_days),
      Number(overtimePayPerDay) || 0,
      Number(overtimePayPerHour) || 0,
      2
    );
    const weekendAmount = weekendCalc.amount;
    const overtimeHoursAmount = toAmount(form.workday_overtime_hours) * (Number(overtimePayPerHour) || 0);
    return holidayAmount + weekendAmount + overtimeHoursAmount;
  },

  computeDomesticAllowance(form = {}, domesticAllowancePerTripDay = 0) {
    form = safeObject(form);
    return toAmount(form.domestic_business_days) * (Number(domesticAllowancePerTripDay) || 0);
  },

  applySalaryDerivedFields(form = {}, overtimePayPerDay = 0, overtimePayPerHour = 0, domesticAllowancePerTripDay = 0) {
    const nextForm = Object.assign({}, safeObject(form));
    nextForm.domestic_allowance = this.computeDomesticAllowance(nextForm, domesticAllowancePerTripDay).toFixed(2);
    const weekendCalc = calculateMultiplierOvertime(
      toAmount(nextForm.weekend_overtime_days),
      toAmount(nextForm.weekend_overtime_day_count) || inferOvertimeDayCount(nextForm.weekend_overtime_days),
      Number(overtimePayPerDay) || 0,
      Number(overtimePayPerHour) || 0,
      2
    );
    nextForm.weekend_base_hours = String(weekendCalc.baseHours);
    nextForm.weekend_extra_hours = String(weekendCalc.extraHours);
    nextForm.weekend_overtime_pay = weekendCalc.amount.toFixed(2);
    nextForm.workday_overtime_pay = (toAmount(nextForm.workday_overtime_hours) * (Number(overtimePayPerHour) || 0)).toFixed(2);
    nextForm.overtime_days = String(toAmount(nextForm.weekend_overtime_days));
    nextForm.overtime_hours = String(toAmount(nextForm.workday_overtime_hours));
    nextForm.overtime_pay = this.computeOvertimePay(nextForm, overtimePayPerDay, overtimePayPerHour).toFixed(2);
    nextForm.total_salary = this.calculateSalaryTotal(nextForm).toFixed(2);
    return nextForm;
  },

  normalizeSalaryForm(salary = {}, config = {}) {
    salary = safeObject(salary);
    config = safeObject(config);
    const form = createDefaultSalaryForm();
    SALARY_NUMERIC_FIELDS.forEach((field) => {
      const rawValue = salary[field.key];
      form[field.key] = rawValue === undefined || rawValue === null ? '0' : String(rawValue);
    });
    form.holiday_overtime_hours = salary.holiday_overtime_hours === undefined || salary.holiday_overtime_hours === null ? '0' : String(salary.holiday_overtime_hours);
    form.holiday_double_hours = salary.holiday_double_hours === undefined || salary.holiday_double_hours === null ? '0' : String(salary.holiday_double_hours);
    form.holiday_triple_hours = salary.holiday_triple_hours === undefined || salary.holiday_triple_hours === null ? '0' : String(salary.holiday_triple_hours);
    form.holiday_overtime_days = salary.holiday_overtime_days === undefined || salary.holiday_overtime_days === null ? String(inferOvertimeDayCount(toAmount(form.holiday_double_hours) + toAmount(form.holiday_triple_hours))) : String(salary.holiday_overtime_days);
    form.weekend_overtime_day_count = salary.weekend_overtime_day_count === undefined || salary.weekend_overtime_day_count === null ? String(inferOvertimeDayCount(form.weekend_overtime_days)) : String(salary.weekend_overtime_day_count);
    form.weekend_base_hours = salary.weekend_base_hours === undefined || salary.weekend_base_hours === null ? '0' : String(salary.weekend_base_hours);
    form.weekend_extra_hours = salary.weekend_extra_hours === undefined || salary.weekend_extra_hours === null ? '0' : String(salary.weekend_extra_hours);
    form.domestic_business_days = salary.domestic_business_days === undefined || salary.domestic_business_days === null ? '0' : String(salary.domestic_business_days);
    form.domestic_allowance = salary.domestic_allowance === undefined || salary.domestic_allowance === null ? '0' : String(salary.domestic_allowance);
    form.overtime_pay = salary.overtime_pay === undefined || salary.overtime_pay === null ? '0' : String(salary.overtime_pay);
    return this.applySalaryDerivedFields(form, config.overtimePayPerDay, config.overtimePayPerHour, config.domesticAllowancePerTripDay);
  },

  buildMockSalarySheet(name) {
    const records = (this.data.attendanceData || []).filter((item) => {
      const recordName = item.name || item.real_name || item.employee_name;
      return recordName === name;
    });

    const abroadBusinessDays = records.filter(item => item.work_status === '国外出差').length;
    const domesticBusinessDays = records.filter(item => item.work_status === '国内出差').length;
    const overtimeDays = records.filter(item => item.work_status === '加班').length;
    const compensatoryDays = records.filter(item => item.work_status === '调休').length;
    const abroadAllowance = records
      .filter(item => item.work_status === '国外出差')
      .reduce((sum, item) => sum + (parseFloat(item.business_trip_subsidy) || 0), 0);
    const domesticAllowance = records
      .filter(item => item.work_status === '国内出差')
      .reduce((sum, item) => sum + (parseFloat(item.business_trip_subsidy) || 0), 0);
    const overtimeHours = 0;
    const overtimePay = 0;
    const mealAllowance = (abroadBusinessDays + domesticBusinessDays) * 20;
    const baseSalary = 7000;

      return {
        abroad_business_days: abroadBusinessDays,
        abroad_allowance: abroadAllowance,
        domestic_business_days: domesticBusinessDays,
        domestic_allowance: domesticAllowance,
        holiday_overtime_days: 0,
        holiday_overtime_hours: 0,
        holiday_double_hours: 0,
        holiday_triple_hours: 0,
        holiday_overtime_pay: 0,
        weekend_overtime_days: overtimeDays,
        weekend_overtime_pay: 0,
      workday_overtime_hours: 0,
      workday_overtime_pay: 0,
      overtime_days: overtimeDays,
      overtime_hours: overtimeHours,
      overtime_pay: overtimePay,
      meal_allowance: mealAllowance,
      base_salary: baseSalary,
      compensatory_days: compensatoryDays
    };
  },

  promptNetdiskInfo(userName, message) {
    wx.showModal({
      title: '需要完善网盘信息',
      content: message || '保存工资条前，请先完善工资条配置。',
      cancelText: '稍后处理',
      confirmText: '去完善',
      success: (res) => {
        if (res.confirm) {
          const query = userName ? `?user_name=${encodeURIComponent(userName)}` : '';
          wx.navigateTo({
            url: `/pages/attendance/netdisk/index${query}`
          });
        }
      }
    });
  },

  async onOpenSalarySheet() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const targetInfo = this.getSalaryTargetInfo();
    if (!targetInfo.ok) {
      showError(targetInfo.msg);
      return;
    }

    const context = this.createSalaryContext(targetInfo.name, 'attendance');

    if (testModeManager.isTestMode()) {
      const normalizedMockSalary = this.normalizeSalaryForm(this.buildMockSalarySheet(targetInfo.name), {
        domesticAllowancePerTripDay: 100,
        overtimePayPerDay: 250,
        overtimePayPerHour: 30
      });
      const lockMeta = this.buildSalaryLockMeta({
        last_source: 'mock',
        manual_locked: false,
        generated_at: ''
      });
      const salaryContext = Object.assign(this.createSalaryContext(targetInfo.name, 'mock'), {
        domesticAllowancePerTripDay: 100,
        overtimePayPerDay: 250,
        overtimePayPerHour: 30,
        mealAllowancePerTripDay: 20
      }, lockMeta);
      const salaryCalcState = createDefaultSalaryCalcState();
      this.setData({
        showSalaryModal: true,
        salarySaving: false,
        salaryContext,
        ...buildSalaryModalView(salaryContext),
        salaryForm: normalizedMockSalary,
        salaryFields: createSalaryFields(
          normalizedMockSalary,
          salaryContext,
          salaryCalcState
        ),
        salaryExpandedInfoKey: '',
        salaryCalcState,
        salaryAlertTitle: '',
        salaryAlertText: '',
        salaryAlertItems: [],
        salaryAlertOverflowText: ''
      });
      this.syncSalaryOverviewWithForm(targetInfo.name, normalizedMockSalary);
      return;
    }

    wx.showLoading({ title: '工资条加载中...' });
    try {
      const res = await API.attendance.getSalarySheet({
        name: targetInfo.name,
        year: this.data.currentYear,
        month: this.data.currentMonth
      });

      if (!res || res.code !== 200) {
        if (res && res.data && res.data.need_netdisk_info) {
          this.promptNetdiskInfo(targetInfo.name, res.msg);
          return;
        }
        showError(res && res.msg ? res.msg : '获取工资条失败');
        return;
      }

      const payload = safeObject(res.data);
      const salary = safeObject(payload.salary);
      const source = payload.source || 'attendance';
      const salaryRecalculation = isPlainObject(payload.salary_recalculation) ? payload.salary_recalculation : null;
      const rateConfig = inferSalaryRateConfig(salary);
      const normalizedSalary = this.normalizeSalaryForm(salary, {
        domesticAllowancePerTripDay: rateConfig.domesticAllowancePerTripDay,
        overtimePayPerDay: rateConfig.overtimePayPerDay,
        overtimePayPerHour: rateConfig.overtimePayPerHour
      });
      const salaryAlert = buildSalaryAlert(salaryRecalculation);
      const lockMeta = this.buildSalaryLockMeta(salary.lock_info);
      const salaryContext = Object.assign({
        name: payload.name || context.name,
        year: payload.year || context.year,
        month: payload.month || context.month,
        source,
        sourceText: this.createSalaryContext(targetInfo.name, source).sourceText,
        domesticAllowancePerTripDay: rateConfig.domesticAllowancePerTripDay,
        overtimePayPerDay: rateConfig.overtimePayPerDay,
        overtimePayPerHour: rateConfig.overtimePayPerHour,
        mealAllowancePerTripDay: rateConfig.mealAllowancePerTripDay,
        workRestMode: rateConfig.workRestMode
      }, lockMeta);
      const salaryCalcState = createDefaultSalaryCalcState();
      this.setData({
        showSalaryModal: true,
        salarySaving: false,
        salaryContext,
        ...buildSalaryModalView(salaryContext),
        salaryForm: normalizedSalary,
        salaryFields: createSalaryFields(normalizedSalary, salaryContext, salaryCalcState),
        salaryExpandedInfoKey: '',
        salaryCalcState,
        salaryAlertTitle: salaryAlert.title,
        salaryAlertText: salaryAlert.text,
        salaryAlertItems: salaryAlert.items,
        salaryAlertOverflowText: salaryAlert.overflowText
      });
      this.syncSalaryOverviewWithForm(payload.name || context.name, normalizedSalary);
    } catch (error) {
      showError(error && error.message ? error.message : '获取工资条失败');
    } finally {
      wx.hideLoading();
    }
  },

  onCloseSalaryModal() {
    if (this.data.salarySaving) {
      return;
    }
    this.setData({
      showSalaryModal: false,
      salarySaving: false,
      salaryModalTitle: '',
      salaryModalSubtitle: '',
      salaryLockBadgeText: '',
      salaryLockBadgeType: 'normal',
      salaryLockInfoText: '',
      salaryExpandedInfoKey: '',
      showSalaryInfoPopup: false,
      salaryInfoPopup: {
        key: '',
        title: '',
        lines: [],
        field: null
      },
      salaryCalcState: createDefaultSalaryCalcState(),
      salaryAlertTitle: '',
      salaryAlertText: '',
      salaryAlertItems: [],
      salaryAlertOverflowText: ''
    });
  },

  buildSalaryInfoPopup(fieldKey, salaryFields = this.data.salaryFields) {
    if (!fieldKey) {
      return null;
    }
    if (fieldKey === 'overtime_pay') {
      return {
        key: fieldKey,
        title: '加班费合计计算',
        lines: [
          `节假日加班费：¥${this.data.salaryForm.holiday_overtime_pay}`,
          `节假日加班天数：${this.data.salaryForm.holiday_overtime_days}天，双倍${this.data.salaryForm.holiday_double_hours}h，三倍${this.data.salaryForm.holiday_triple_hours}h，超8小时外${this.data.salaryForm.holiday_extra_hours}h`,
          `周六日加班费：¥${this.data.salaryForm.weekend_overtime_pay}`,
          `周六日加班天数：${this.data.salaryForm.weekend_overtime_day_count}天，2倍小时：${this.data.salaryForm.weekend_base_hours}h，超8小时外：${this.data.salaryForm.weekend_extra_hours}h`,
          `普通加班费：¥${this.data.salaryForm.workday_overtime_pay}`,
          `加班费合计：¥${this.data.salaryForm.overtime_pay}`
        ],
        field: null
      };
    }
    if (fieldKey === 'total_salary') {
      return {
        key: fieldKey,
        title: '工资合计计算',
        lines: [],
        field: null
      };
    }
    const fieldInfo = (salaryFields || []).find((item) => item.key === fieldKey);
    if (!fieldInfo) {
      return null;
    }
    return {
      key: fieldKey,
      title: fieldInfo.infoTitle || fieldInfo.label || '计算说明',
      lines: fieldInfo.infoLines || [],
      field: fieldInfo
    };
  },

  onToggleSalaryFieldInfo(e) {
    const fieldKey = e.currentTarget.dataset.field;
    if (!fieldKey) {
      return;
    }
    const salaryInfoPopup = this.buildSalaryInfoPopup(fieldKey);
    if (!salaryInfoPopup) {
      return;
    }
    this.setData({
      salaryExpandedInfoKey: fieldKey,
      showSalaryInfoPopup: true,
      salaryInfoPopup
    });
  },

  onCloseSalaryInfoPopup() {
    this.setData({
      showSalaryInfoPopup: false,
      salaryExpandedInfoKey: '',
      salaryInfoPopup: {
        key: '',
        title: '',
        lines: [],
        field: null
      }
    });
  },

  onSalaryCalcInputChange(e) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }
    const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
      [field]: e.detail.value
    });
    const nextEditor = this.refreshSalaryEditor(this.data.salaryForm, { salaryCalcState });
    const nextState = Object.assign({
      salaryCalcState
    }, nextEditor);
    if (this.data.showSalaryInfoPopup && this.data.salaryInfoPopup && this.data.salaryInfoPopup.key) {
      nextState.salaryInfoPopup = this.buildSalaryInfoPopup(this.data.salaryInfoPopup.key, nextEditor.salaryFields);
    }
    this.setData(nextState);
  },

  onApplyHolidayOvertimeCalc() {
    const calculator = buildHolidayCalculatorMeta(
      this.data.salaryForm,
      this.data.salaryContext,
      this.data.salaryCalcState
    );
    if (!Number.isFinite(calculator.amount)) {
      showError('请先填写可计算的节假日加班小时数');
      return;
    }
    const holidayDoubleHours = parseFormulaNumber(calculator.doubleHoursValue);
    const holidayTripleHours = parseFormulaNumber(calculator.tripleHoursValue);
    const holidayDayCount = parseFormulaNumber(calculator.dayCountValue);
    const nextForm = Object.assign({}, this.data.salaryForm, {
      holiday_overtime_pay: formatCurrency(calculator.amount),
      holiday_overtime_days: String(holidayDayCount),
      holiday_double_hours: String(holidayDoubleHours),
      holiday_triple_hours: String(holidayTripleHours),
      holiday_overtime_hours: String(holidayDoubleHours + holidayTripleHours)
    });
    const normalizedForm = this.applySalaryDerivedFields(
      nextForm,
      this.data.salaryContext.overtimePayPerDay,
      this.data.salaryContext.overtimePayPerHour,
      this.data.salaryContext.domesticAllowancePerTripDay
    );
    const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
      holidayDayCountInput: null,
      holidayDoubleHours: null,
      holidayTripleHours: null
    });
    this.setData(Object.assign({
      salaryCalcState
    }, this.refreshSalaryEditor(normalizedForm, { salaryCalcState })));
    this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
    this.onCloseSalaryInfoPopup();
  },

  async saveSalaryRateConfig(overrides = {}) {
    const { name } = this.data.salaryContext;
    const salaryContext = this.data.salaryContext || {};
    const userName = name || (this.data.realName || '');
    if (!userName) {
      showError('未识别到当前工资配置所属用户');
      return false;
    }

    let netdiskInfo = null;
    try {
      const res = await API.attendance.getNetdiskInfo(userName);
      netdiskInfo = res && res.data ? res.data : null;
    } catch (error) {
      showError('读取工资配置失败，无法保存新单价');
      return false;
    }

    const payload = {
      user_name: userName,
      sony_username: netdiskInfo ? netdiskInfo.sony_username || '' : '',
      sony_password: netdiskInfo ? netdiskInfo.sony_password || '' : '',
      is_auto_create_salary: netdiskInfo ? !!netdiskInfo.is_auto_create_salary : false,
      is_upload_to_netdisk: netdiskInfo ? netdiskInfo.is_upload_to_netdisk !== false : true,
      base_salary: Number(netdiskInfo && netdiskInfo.base_salary !== undefined ? netdiskInfo.base_salary : this.data.salaryForm.base_salary || 0),
      overtime_pay_per_day: Number(overrides.overtime_pay_per_day !== undefined ? overrides.overtime_pay_per_day : (netdiskInfo && netdiskInfo.overtime_pay_per_day !== undefined ? netdiskInfo.overtime_pay_per_day : salaryContext.overtimePayPerDay || 0)),
      overtime_pay_per_hour: Number(overrides.overtime_pay_per_hour !== undefined ? overrides.overtime_pay_per_hour : (netdiskInfo && netdiskInfo.overtime_pay_per_hour !== undefined ? netdiskInfo.overtime_pay_per_hour : salaryContext.overtimePayPerHour || 0)),
      domestic_allowance_per_trip_day: Number(overrides.domestic_allowance_per_trip_day !== undefined ? overrides.domestic_allowance_per_trip_day : (netdiskInfo && netdiskInfo.domestic_allowance_per_trip_day !== undefined ? netdiskInfo.domestic_allowance_per_trip_day : salaryContext.domesticAllowancePerTripDay || 0)),
      meal_allowance_per_trip_day: Number(overrides.meal_allowance_per_trip_day !== undefined ? overrides.meal_allowance_per_trip_day : (netdiskInfo && netdiskInfo.meal_allowance_per_trip_day !== undefined ? netdiskInfo.meal_allowance_per_trip_day : salaryContext.mealAllowancePerTripDay || 20)),
      work_rest_mode: netdiskInfo && netdiskInfo.work_rest_mode ? netdiskInfo.work_rest_mode : (salaryContext.workRestMode || 'double_rest')
    };

    try {
      const saveRes = await API.attendance.updateNetdiskInfo(payload);
      if (!saveRes || saveRes.code !== 200) {
        showError(saveRes && saveRes.msg ? saveRes.msg : '保存新单价失败');
        return false;
      }
      const saved = saveRes.data || {};
      const nextSalaryContext = Object.assign({}, this.data.salaryContext, {
        domesticAllowancePerTripDay: Number(saved.domestic_allowance_per_trip_day !== undefined ? saved.domestic_allowance_per_trip_day : payload.domestic_allowance_per_trip_day),
        overtimePayPerDay: Number(saved.overtime_pay_per_day !== undefined ? saved.overtime_pay_per_day : payload.overtime_pay_per_day),
        overtimePayPerHour: Number(saved.overtime_pay_per_hour !== undefined ? saved.overtime_pay_per_hour : payload.overtime_pay_per_hour),
        mealAllowancePerTripDay: Number(saved.meal_allowance_per_trip_day !== undefined ? saved.meal_allowance_per_trip_day : payload.meal_allowance_per_trip_day)
      });
      const normalizedForm = this.applySalaryDerivedFields(
        Object.assign({}, this.data.salaryForm),
        nextSalaryContext.overtimePayPerDay,
        nextSalaryContext.overtimePayPerHour,
        nextSalaryContext.domesticAllowancePerTripDay
      );
      this.setData(Object.assign({
        salaryContext: nextSalaryContext
      }, buildSalaryModalView(nextSalaryContext), this.refreshSalaryEditor(normalizedForm, { salaryContext: nextSalaryContext })));
      this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
      showSuccess('新的工资单价已保存到配置');
      return true;
    } catch (error) {
      showError(error && error.message ? error.message : '保存新单价失败');
      return false;
    }
  },

  promptRateChange(fieldLabel, nextRate, configRate, saveHandler) {
    if (Math.abs((Number(nextRate) || 0) - (Number(configRate) || 0)) < 0.009) {
      return;
    }
    wx.showModal({
      title: '检测到单价变更',
      content: `${fieldLabel}当前输入单价为 ¥${formatCurrency(nextRate)}，与配置单价 ¥${formatCurrency(configRate)} 不一致。取消则仅本次使用，确认则存入系统配置。`,
      cancelText: '本次使用',
      confirmText: '存入配置',
      success: async (res) => {
        if (res.confirm) {
          await saveHandler();
        }
      },
      fail: (error) => {
        console.error('单价变更确认弹窗打开失败', error);
        showError('单价确认弹窗打开失败，请重试');
      }
    });
  },

  confirmRateChangeBeforeApply(fieldLabel, nextRate, configRate, applyHandler, saveHandler) {
    if (Math.abs((Number(nextRate) || 0) - (Number(configRate) || 0)) < 0.009) {
      applyHandler();
      return;
    }

    wx.showModal({
      title: '检测到单价变更',
      content: `${fieldLabel}当前输入单价为 ¥${formatCurrency(nextRate)}，与配置单价 ¥${formatCurrency(configRate)} 不一致。取消则仅本次使用，确认则存入系统配置。`,
      cancelText: '本次使用',
      confirmText: '存入配置',
      success: async (res) => {
        applyHandler();
        if (res.confirm) {
          await saveHandler();
        }
      },
      fail: (error) => {
        console.error('单价变更确认弹窗打开失败', error);
        showError('单价确认弹窗打开失败，请重试');
      }
    });
  },

  getSalaryConfigRates() {
    const salaryContext = this.data.salaryContext || {};
    return {
      domesticAllowancePerTripDay: Number(salaryContext.domesticAllowancePerTripDay || 0),
      mealAllowancePerTripDay: Number(salaryContext.mealAllowancePerTripDay || 0),
      overtimePayPerDay: Number(salaryContext.overtimePayPerDay || 0),
      overtimePayPerHour: Number(salaryContext.overtimePayPerHour || 0)
    };
  },

  onApplyTripAllowanceCalc(e) {
    const type = e.currentTarget.dataset.type;
    const calculator = buildTripCalculatorMeta(type, this.data.salaryForm, this.data.salaryContext, this.data.salaryCalcState);
    if (!calculator) {
      return;
    }
    const isDomestic = type === 'domestic';
    const nextDays = parseFormulaNumber(calculator.daysInput);
    const nextRate = parseFormulaNumber(calculator.unitPriceInput);
    if (!Number.isFinite(nextDays) || !Number.isFinite(nextRate)) {
      showError('请先填写可计算的出差天数和补助单价');
      return;
    }
    const configRates = this.getSalaryConfigRates();
    const nextForm = Object.assign({}, this.data.salaryForm, isDomestic ? {
      domestic_business_days: String(nextDays),
      domestic_allowance: formatCurrency(nextDays * nextRate)
    } : {
      abroad_business_days: String(nextDays),
      abroad_allowance: formatCurrency(nextDays * nextRate)
    });
    const nextContext = Object.assign({}, this.data.salaryContext, isDomestic ? {
      domesticAllowancePerTripDay: nextRate
    } : {});
    const normalizedForm = this.applySalaryDerivedFields(
      nextForm,
      nextContext.overtimePayPerDay,
      nextContext.overtimePayPerHour,
      nextContext.domesticAllowancePerTripDay
    );
    const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
      [calculator.daysStateKey]: null,
      [calculator.unitStateKey]: null
    });
    this.setData(Object.assign({
      salaryContext: nextContext,
      salaryCalcState
    }, buildSalaryModalView(nextContext), this.refreshSalaryEditor(normalizedForm, { salaryContext: nextContext, salaryCalcState })));
    this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
    this.onCloseSalaryInfoPopup();

    if (isDomestic) {
      this.promptRateChange(
        '国内出差补助单价',
        nextRate,
        configRates.domesticAllowancePerTripDay,
        () => this.saveSalaryRateConfig({ domestic_allowance_per_trip_day: nextRate })
      );
    }
  },

  onApplyWeekendCalc() {
    const calculator = buildWeekendCalculatorMeta(this.data.salaryForm, this.data.salaryContext, this.data.salaryCalcState);
    const nextHours = parseFormulaNumber(calculator.hoursInput);
    const nextDayCount = parseFormulaNumber(calculator.dayCountInput);
    const nextRate = parseFormulaNumber(calculator.unitPriceInput);
    if (!Number.isFinite(nextHours) || !Number.isFinite(nextDayCount) || !Number.isFinite(nextRate) || nextDayCount <= 0) {
      showError('请先填写可计算的周六日加班天数、小时和小时单价');
      return;
    }
    const configRates = this.getSalaryConfigRates();
    this.confirmRateChangeBeforeApply(
      '加班小时单价',
      nextRate,
      configRates.overtimePayPerHour,
      () => {
        const nextContext = Object.assign({}, this.data.salaryContext, {
          overtimePayPerHour: nextRate
        });
        const nextForm = Object.assign({}, this.data.salaryForm, {
          weekend_overtime_days: String(nextHours),
          weekend_overtime_day_count: String(nextDayCount)
        });
        const normalizedForm = this.applySalaryDerivedFields(
          nextForm,
          nextContext.overtimePayPerDay,
          nextContext.overtimePayPerHour,
          nextContext.domesticAllowancePerTripDay
        );
        const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
          weekendHoursInput: null,
          weekendDayCountInput: null,
          weekendUnitPriceInput: null
        });
        this.setData(Object.assign({
          salaryContext: nextContext,
          salaryCalcState
        }, buildSalaryModalView(nextContext), this.refreshSalaryEditor(normalizedForm, { salaryContext: nextContext, salaryCalcState })));
        this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
        this.onCloseSalaryInfoPopup();
      },
      () => this.saveSalaryRateConfig({ overtime_pay_per_hour: nextRate })
    );
  },

  onApplyWorkdayCalc() {
    const calculator = buildWorkdayCalculatorMeta(this.data.salaryForm, this.data.salaryContext, this.data.salaryCalcState);
    const unitPrice = parseFormulaNumber(calculator.unitPriceInput);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      showError('当前未配置普通加班小时单价');
      return;
    }
    const derivedHours = parseFormulaNumber(calculator.editableHoursValue);
    if (!Number.isFinite(derivedHours)) {
      showError('请先填写可计算的普通加班小时数');
      return;
    }
    const configRates = this.getSalaryConfigRates();
    this.confirmRateChangeBeforeApply(
      '普通加班小时单价',
      unitPrice,
      configRates.overtimePayPerHour,
      () => {
        const nextContext = Object.assign({}, this.data.salaryContext, {
          overtimePayPerHour: unitPrice
        });
        const nextForm = Object.assign({}, this.data.salaryForm, {
          workday_overtime_hours: String(derivedHours)
        });
        const normalizedForm = this.applySalaryDerivedFields(
          nextForm,
          nextContext.overtimePayPerDay,
          nextContext.overtimePayPerHour,
          nextContext.domesticAllowancePerTripDay
        );
        const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
          workdayHoursInput: null,
          workdayUnitPriceInput: null
        });
        this.setData(Object.assign({
          salaryContext: nextContext,
          salaryCalcState
        }, buildSalaryModalView(nextContext), this.refreshSalaryEditor(normalizedForm, { salaryContext: nextContext, salaryCalcState })));
        this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
        this.onCloseSalaryInfoPopup();
      },
      () => this.saveSalaryRateConfig({ overtime_pay_per_hour: unitPrice })
    );
  },

  onApplyMealAllowanceCalc() {
    const calculator = buildMealCalculatorMeta(this.data.salaryForm, this.data.salaryContext, this.data.salaryCalcState);
    const nextDays = parseFormulaNumber(calculator.daysInput);
    const nextRate = parseFormulaNumber(calculator.unitPriceInput);
    if (!Number.isFinite(nextDays) || !Number.isFinite(nextRate)) {
      showError('请先填写可计算的餐补天数和单价');
      return;
    }
    const configRates = this.getSalaryConfigRates();
    this.confirmRateChangeBeforeApply(
      '餐补单价',
      nextRate,
      configRates.mealAllowancePerTripDay,
      () => {
        const nextContext = Object.assign({}, this.data.salaryContext, {
          mealAllowancePerTripDay: nextRate
        });
        const nextForm = Object.assign({}, this.data.salaryForm, {
          meal_allowance: formatCurrency(nextDays * nextRate)
        });
        const normalizedForm = this.applySalaryDerivedFields(
          nextForm,
          nextContext.overtimePayPerDay,
          nextContext.overtimePayPerHour,
          nextContext.domesticAllowancePerTripDay
        );
        const salaryCalcState = Object.assign({}, this.data.salaryCalcState, {
          mealDaysInput: null,
          mealUnitPriceInput: null
        });
        this.setData(Object.assign({
          salaryContext: nextContext,
          salaryCalcState
        }, buildSalaryModalView(nextContext), this.refreshSalaryEditor(normalizedForm, { salaryContext: nextContext, salaryCalcState })));
        this.syncSalaryOverviewWithForm(this.data.salaryContext.name, normalizedForm);
        this.onCloseSalaryInfoPopup();
      },
      () => this.saveSalaryRateConfig({ meal_allowance_per_trip_day: nextRate })
    );
  },

  onSalaryFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }
    if (field === 'overtime_pay') {
      return;
    }
    const value = e.detail.value;
    const nextForm = Object.assign({}, this.data.salaryForm, {
      [field]: value
    });
    this.setData(this.refreshSalaryEditor(nextForm));
    this.syncSalaryOverviewWithForm(this.data.salaryContext.name, nextForm);
  },

  validateSalaryForm() {
    for (const field of SALARY_NUMERIC_FIELDS) {
      const value = this.data.salaryForm[field.key];
      if (value === '' || value === null || value === undefined) {
        showError(`请填写${field.label}`);
        return false;
      }
      const numericValue = Number(value);
      if (Number.isNaN(numericValue) || numericValue < 0) {
        showError(`${field.label}必须是大于等于0的数字`);
        return false;
      }
    }
    return true;
  },

  async onSaveSalarySheet() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    if (this.data.salarySaving) {
      return;
    }

    if (!this.validateSalaryForm()) {
      return;
    }

    const normalizedForm = this.applySalaryDerivedFields(
      this.data.salaryForm,
      this.data.salaryContext.overtimePayPerDay,
      this.data.salaryContext.overtimePayPerHour,
      this.data.salaryContext.domesticAllowancePerTripDay
    );
    const salaryPayload = {};
    SALARY_NUMERIC_FIELDS.forEach((field) => {
      salaryPayload[field.key] = Number(normalizedForm[field.key] || 0);
    });
    salaryPayload.holiday_overtime_pay = Number(normalizedForm.holiday_overtime_pay || 0);
    salaryPayload.weekend_overtime_pay = Number(normalizedForm.weekend_overtime_pay || 0);
    salaryPayload.workday_overtime_pay = Number(normalizedForm.workday_overtime_pay || 0);
    salaryPayload.abroad_business_days = Number(normalizedForm.abroad_business_days || 0);
    salaryPayload.domestic_business_days = Number(normalizedForm.domestic_business_days || 0);
    salaryPayload.weekend_overtime_days = Number(normalizedForm.weekend_overtime_days || 0);
    salaryPayload.workday_overtime_hours = Number(normalizedForm.workday_overtime_hours || 0);
    salaryPayload.domestic_allowance = Number(normalizedForm.domestic_allowance || 0);
    salaryPayload.overtime_days = Number(normalizedForm.overtime_days || 0);
    salaryPayload.overtime_hours = Number(normalizedForm.overtime_hours || 0);
    salaryPayload.overtime_pay = Number(normalizedForm.overtime_pay || 0);
    salaryPayload.holiday_overtime_days = Number(normalizedForm.holiday_overtime_days || 0);
    salaryPayload.holiday_overtime_hours = Number(normalizedForm.holiday_overtime_hours || 0);
    salaryPayload.holiday_double_hours = Number(normalizedForm.holiday_double_hours || 0);
    salaryPayload.holiday_triple_hours = Number(normalizedForm.holiday_triple_hours || 0);
    salaryPayload.weekend_overtime_day_count = Number(normalizedForm.weekend_overtime_day_count || 0);
    salaryPayload.weekend_base_hours = Number(normalizedForm.weekend_base_hours || 0);
    salaryPayload.weekend_extra_hours = Number(normalizedForm.weekend_extra_hours || 0);
    salaryPayload.overtime_pay_per_day = Number(this.data.salaryContext.overtimePayPerDay || 0);
    salaryPayload.overtime_pay_per_hour = Number(this.data.salaryContext.overtimePayPerHour || 0);
    salaryPayload.domestic_allowance_per_trip_day = Number(this.data.salaryContext.domesticAllowancePerTripDay || 0);
    salaryPayload.meal_allowance_per_trip_day = Number(this.data.salaryContext.mealAllowancePerTripDay || 0);
    salaryPayload.work_rest_mode = this.data.salaryContext.workRestMode || 'double_rest';

    if (testModeManager.isTestMode()) {
      this.setData({
        showSalaryModal: false,
        showResultModal: true,
        resultSuccess: true,
        resultTitle: '工资条已保存',
        resultMsg: '当前为演示模式，工资条未写入后端，仅模拟保存成功。'
      });
      return;
    }

    this.setData({ salarySaving: true });
    wx.showLoading({ title: '工资条保存中...' });
    try {
      const { name, year, month } = this.data.salaryContext;
      const res = await API.attendance.saveSalarySheet({
        name,
        year,
        month,
        salary: salaryPayload
      });

      if (res && res.code === 200) {
        const lockedTip = res.data && res.data.manual_locked ? '本月自动任务已锁定，不会重复生成。' : '';
        this.syncSalaryOverviewWithForm(name, this.data.salaryForm);
        this.setData({
          showSalaryModal: false,
          showResultModal: true,
          resultSuccess: true,
          resultTitle: '工资条已保存',
          resultMsg: `${res.msg || '工资条已成功保存'}${lockedTip ? `\n${lockedTip}` : ''}`,
          salaryAlertTitle: '',
          salaryAlertText: '',
          salaryAlertItems: [],
          salaryAlertOverflowText: ''
        });
        return;
      }

      if (res && res.data && res.data.need_netdisk_info) {
        this.promptNetdiskInfo(name, res.msg);
        return;
      }

      this.setData({
        showResultModal: true,
        resultSuccess: false,
        resultTitle: '保存失败',
        resultMsg: res && res.msg ? res.msg : '工资条保存失败'
      });
    } catch (error) {
      this.setData({
        showResultModal: true,
        resultSuccess: false,
        resultTitle: '保存失败',
        resultMsg: error && error.message ? error.message : '工资条保存失败'
      });
    } finally {
      wx.hideLoading();
      this.setData({ salarySaving: false });
    }
  },

  // 跳转到提交页面
  goToSubmit() {
    // 跳转回考勤主页并打开打卡弹窗
    wx.navigateBack();
  },

  // 计算统计数据
  calculateStatistics(data) {
    const statistics = {
      attendanceDays: 0,       // 出勤天数 (公司上班+国内出差+国外出差)
      companyDays: 0,          // 公司上班天数
      domesticTripDays: 0,     // 国内出差天数
      foreignTripDays: 0,      // 国外出差天数
      restDays: 0,             // 休息天数
      compensatoryDays: 0,     // 调休天数
      totalDays: data.length,  // 总记录天数
      workDays: 0,
      attendanceRate: 0,
      totalSubsidy: 0
    };

    data.forEach(item => {
      // 统计不同状态的天数
      if (item.work_status === '公司上班') {
        statistics.companyDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '国内出差') {
        statistics.domesticTripDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '国外出差') {
        statistics.foreignTripDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '休息') {
        statistics.restDays++;
      } else if (item.work_status === '调休') {
        statistics.compensatoryDays++;
      }
      
      // 统计总补贴
      if (item.business_trip_subsidy) {
        statistics.totalSubsidy += parseFloat(item.business_trip_subsidy);
      }
    });

    // 计算工作日天数（这里简化处理，实际应该排除周末和节假日）
    statistics.workDays = this.getWorkDaysInMonth(this.data.currentYear, this.data.currentMonth);
    
    // 计算出勤率（出勤天数已经包含了所有工作相关天数）
    if (statistics.workDays > 0) {
      statistics.attendanceRate = Math.round((statistics.attendanceDays / statistics.workDays) * 100);
    }

    return statistics;
  },

  // 获取空统计数据
  getEmptyStatistics() {
    return {
      totalDays: 0,
      normalDays: 0,
      tripDays: 0,
      leaveDays: 0,
      workDays: 0,
      attendanceDays: 0,
      attendanceRate: 0,
      totalSubsidy: 0
    };
  },

  // 获取月份工作日天数
  getWorkDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // 排除周末（周六=6，周日=0）
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    return workDays;
  },

  // 格式化日期 - iOS兼容版本
  formatDate(dateStr) {
    if (!dateStr) return '未知';
    
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      const date = new Date(processedDateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('formatDate: 无法解析日期字符串:', dateStr);
        return dateStr;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('formatDate: 日期格式化错误:', error, '原始字符串:', dateStr);
      return dateStr;
    }
  },

  // 格式化日期时间 - iOS兼容版本 - 增强调试
  formatDateTime(dateStr) {
    if (!dateStr) return '未知';
    
    // console.log('formatDateTime: 开始处理时间:', {
    //   原始输入: dateStr,
    //   输入类型: typeof dateStr,
    //   输入长度: typeof dateStr === 'string' ? dateStr.length : 'N/A'
    // });
    
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      // console.log('formatDateTime: processDateForIOS处理后:', {
      //   处理后结果: processedDateStr,
      //   结果类型: typeof processedDateStr
      // });
      
      const date = new Date(processedDateStr);
      
      // console.log('formatDateTime: Date对象创建:', {
      //   Date对象: date,
      //   是否有效: !isNaN(date.getTime()),
      //   时间戳: date.getTime()
      // });
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('formatDateTime: 无法解析日期字符串:', dateStr, '处理后:', processedDateStr);
        return `解析失败: ${dateStr}`;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day} ${hour}:${minute}`;
      // console.log('formatDateTime: 格式化完成:', dateStr, '->', formatted);
      
      return formatted;
    } catch (error) {
      console.error('formatDateTime: 日期时间格式化错误:', error, '原始字符串:', dateStr);
      return `错误: ${dateStr}`;
    }
  },

  // iOS日期格式处理工具函数 - 增强版
  processDateForIOS(dateStr) {
    if (!dateStr) return dateStr;
    
    // 如果是数字或数字字符串，当作时间戳处理
    if (typeof dateStr === 'number' || (typeof dateStr === 'string' && /^\d+$/.test(dateStr))) {
      const timestamp = parseInt(dateStr);
      // 检查是否是毫秒时间戳（长度为13位）或秒时间戳（长度为10位）
      if (timestamp > 0) {
        const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
        if (!isNaN(date.getTime())) {
          // console.log('processDateForIOS: 时间戳转换成功:', dateStr, '->', date.toISOString());
          return date;
        }
      }
    }
    
    // 如果不是字符串，直接返回
    if (typeof dateStr !== 'string') return dateStr;
    
    // 去除首尾空格
    dateStr = dateStr.trim();
    
    // 处理ISO 8601格式 (例如: "2025-09-29T12:34:56.789Z" 或 "2025-09-29T12:34:56+08:00")
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      // console.log('processDateForIOS: 检测到ISO格式:', dateStr);
      return dateStr; // ISO格式可以直接被Date()解析
    }
    
    // 检查是否是标准的 "yyyy-MM-dd HH:mm:ss" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // 将中间的空格替换为/以兼容iOS
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})/, '$1/$2/$3 $4');
      // console.log('processDateForIOS: 标准格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是 "yyyy-MM-dd HH:mm" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/, '$1/$2/$3 $4:00');
      // console.log('processDateForIOS: 无秒格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是纯日期 "yyyy-MM-dd" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');
      // console.log('processDateForIOS: 纯日期格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是缺少前导0的日期格式 "yyyy-M-d" 或 "yyyy-MM-d" 或 "yyyy-M-dd"
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      // 补充前导0，然后转换
      const parts = dateStr.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      const normalized = `${year}-${month}-${day}`;
      const converted = `${year}/${month}/${day}`;
      // console.log('processDateForIOS: 缺少前导0日期格式转换:', dateStr, '->', normalized, '->', converted);
      return converted;
    }
    
    // 检查是否是带时间但缺少前导0的格式 "yyyy-M-d HH:mm:ss" 等
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}(:\d{2})?$/)) {
      // 先规范化日期部分，再转换
      const [datePart, timePart] = dateStr.split(' ');
      const parts = datePart.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      const normalizedTime = timePart.includes(':') && timePart.split(':').length === 2 ? timePart + ':00' : timePart;
      const converted = `${year}/${month}/${day} ${normalizedTime}`;
      // console.log('processDateForIOS: 缺少前导0日期时间格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是其他常见格式 
    // 格式: "yyyy/MM/dd HH:mm:ss"
    if (dateStr.match(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // console.log('processDateForIOS: 斜杠格式已兼容:', dateStr);
      return dateStr;
    }
    
    // 如果都不匹配，记录警告并返回原值
    // console.warn('processDateForIOS: 未识别的日期格式:', dateStr, typeof dateStr);
    return dateStr;
  },

  // 获取星期几 - iOS兼容版本
  getWeekday(dateStr) {
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      const date = new Date(processedDateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('getWeekday: 无法解析日期字符串:', dateStr);
        return '';
      }
      
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    } catch (error) {
      console.warn('getWeekday: 星期获取错误:', error, '原始字符串:', dateStr);
      return '';
    }
  },

  // 获取状态类型
  getStatusType(status) {
    if (status === '公司上班') {
      return 'attendance';
    } else if (status === '国内出差') {
      return 'domestic-trip';
    } else if (status === '国外出差') {
      return 'foreign-trip';
    } else if (status === '休息') {
      return 'rest';
    } else if (status === '调休') {
      return 'compensatory';
    } else {
      return 'other';
    }
  },

  // ==================== 员工多选相关方法 ====================
  
  // 显示员工选择器
  onShowEmployeeSelector() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    if (!this.data.isAdmin) {
      return;
    }
    
    this.setData({ showEmployeePopup: true });
    
    // 如果员工列表为空，重新加载
    if (this.data.employeeList.length === 0) {
      this.loadEmployeeList();
    }
  },

  // 员工弹窗状态变化
  onEmployeePopupChange(e) {
    this.setData({ showEmployeePopup: e.detail.visible });
  },

  // 切换员工选择状态
  onToggleEmployee(e) {
    const employeeName = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset.name : '';
    if (!employeeName) {
      return;
    }
    const selectedEmployees = safeArray(this.data.selectedEmployees).slice();
    const employeeList = safeArray(this.data.employeeList).slice();
    
    const index = selectedEmployees.indexOf(employeeName);
    if (index >= 0) {
      // 取消选择
      selectedEmployees.splice(index, 1);
      console.log('取消选择员工:', employeeName, '当前选择:', selectedEmployees);
    } else {
      // 添加选择
      selectedEmployees.push(employeeName);
      console.log('添加选择员工:', employeeName, '当前选择:', selectedEmployees);
    }
    
    // 更新员工列表的选中状态
    employeeList.forEach(emp => {
      emp.selected = selectedEmployees.indexOf(emp.name) >= 0;
    });
    
    this.setData({ 
      ...buildSelectedEmployeeState(selectedEmployees),
      employeeList
    });
    console.log('界面数据更新后的selectedEmployees:', this.data.selectedEmployees);
  },

  // 清空所有选择
  onClearAllEmployees() {
    console.log('清空所有员工选择');
    const employeeList = safeArray(this.data.employeeList).map(emp => (Object.assign({}, emp, {
      selected: false
    })));
    this.setData({ 
      ...buildSelectedEmployeeState([]),
      employeeList
    });
    console.log('清空后selectedEmployees:', this.data.selectedEmployees);
  },

  // 全选员工
  onSelectAllEmployees() {
    const allEmployees = safeArray(this.data.employeeList).map(item => item.name).filter(Boolean);
    const employeeList = safeArray(this.data.employeeList).map(emp => (Object.assign({}, emp, {
      selected: true
    })));
    console.log('全选员工:', allEmployees);
    this.setData({ 
      ...buildSelectedEmployeeState(allEmployees),
      employeeList
    });
    console.log('全选后selectedEmployees:', this.data.selectedEmployees);
  },

  /**
   * 关闭游客模式横幅
   */
  closeGuestBanner() {
    this.setData({
      showGuestBanner: false
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 导出（下载JSON）
  onExport() {
    const data = this.data.attendanceData;
    if (!data || data.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }
    wx.showToast({ title: '导出功能需在PC端使用', icon: 'none' });
  },

  // 重置筛选（供空状态按钮和筛选卡片按钮共用）
  onResetFilter() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const yearIndex = this.data.yearOptions.findIndex(year => parseInt(year) === currentYear);

    this.setData({
      filterName: '',
      ...buildSelectedEmployeeState([]),
      currentYear,
      currentMonth,
      yearIndex: yearIndex >= 0 ? yearIndex : 2,
      monthIndex: currentDate.getMonth()
    });

    this.loadAttendanceData();
  },

  // 确认员工选择
  onConfirmEmployeeSelection() {
    console.log('确认员工选择，当前selectedEmployees:', this.data.selectedEmployees);
    this.setData({ showEmployeePopup: false });
    // 选择完成后自动查询
    this.loadAttendanceData();
  }
});
