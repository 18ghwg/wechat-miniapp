const DEFAULT_OVERTIME_RULE = {
  thresholdHours: 11.5,
  deductionLteHours: 1,
  deductionGtHours: 1.5,
  roundStepHours: 0.5,
  standardWorkHours: 8
};

function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseTimeToMinutes(timeText) {
  if (!timeText || typeof timeText !== 'string') return null;
  const match = timeText.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function calculateIntervalHours(checkInTime, checkOutTime) {
  const checkInMinutes = parseTimeToMinutes(checkInTime);
  const checkOutMinutes = parseTimeToMinutes(checkOutTime);

  if (checkInMinutes === null || checkOutMinutes === null) {
    return null;
  }

  let diffMinutes = checkOutMinutes - checkInMinutes;
  if (diffMinutes < 0) {
    diffMinutes += 24 * 60;
  }

  return Math.round((diffMinutes / 60) * 100) / 100;
}

function parseDateTimeToMinutes(dateText, timeText) {
  if (!dateText || !timeText) return null;
  const dateMatch = String(dateText).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMinutes = parseTimeToMinutes(timeText);
  if (!dateMatch || timeMinutes === null) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return Math.floor(date.getTime() / 60000) + timeMinutes;
}

function calculateDateTimeIntervalHours(checkInDate, checkInTime, checkOutDate, checkOutTime) {
  const startMinutes = parseDateTimeToMinutes(checkInDate, checkInTime);
  const endMinutes = parseDateTimeToMinutes(checkOutDate, checkOutTime);

  if (startMinutes === null || endMinutes === null || endMinutes < startMinutes) {
    return null;
  }

  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
}

function floorToStep(value, step) {
  const safeStep = toFiniteNumber(step, DEFAULT_OVERTIME_RULE.roundStepHours);
  if (safeStep <= 0) return Math.max(value, 0);
  return Math.floor(Math.max(value, 0) / safeStep) * safeStep;
}

function applyOvertimeDeductionRule(rawHours, rule = DEFAULT_OVERTIME_RULE) {
  const raw = Math.max(toFiniteNumber(rawHours, 0), 0);
  if (raw <= 0) {
    return {
      rawHours: 0,
      deductionHours: 0,
      effectiveHours: 0
    };
  }

  const threshold = toFiniteNumber(rule.thresholdHours, DEFAULT_OVERTIME_RULE.thresholdHours);
  const deduction = raw > threshold
    ? toFiniteNumber(rule.deductionGtHours, DEFAULT_OVERTIME_RULE.deductionGtHours)
    : toFiniteNumber(rule.deductionLteHours, DEFAULT_OVERTIME_RULE.deductionLteHours);
  const effectiveHours = floorToStep(raw - deduction, rule.roundStepHours);

  return {
    rawHours: Math.round(raw * 100) / 100,
    deductionHours: Math.round(deduction * 100) / 100,
    effectiveHours: Math.round(effectiveHours * 100) / 100
  };
}

function getDateWeekday(dateText) {
  const parts = String(dateText || '').split('-').map(item => Number(item));
  if (parts.length !== 3 || parts.some(item => !Number.isFinite(item))) {
    return null;
  }
  return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
}

function isRestOvertimeDay(dateText, holidayInfo = {}, workRestMode = 'double_rest') {
  const weekday = getDateWeekday(dateText);
  const isSaturday = weekday === 6;
  const isLegalHoliday = !!holidayInfo.is_legal_holiday || holidayInfo.work_type === 'legal_holiday';
  const isAdjustedWorkday = !!holidayInfo.is_adjusted_workday || holidayInfo.work_type === 'adjusted_workday';
  const isRestDay = !!holidayInfo.is_rest_day || holidayInfo.work_type === 'rest_day';

  if (isLegalHoliday) return true;
  if (isAdjustedWorkday) return false;
  if (isRestDay && !(workRestMode === 'single_rest' && isSaturday)) return true;

  return false;
}

function calculateOvertimeFromTimes(options = {}) {
  const {
    dateText,
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    holidayInfo = {},
    workRestMode = 'double_rest',
    rule = DEFAULT_OVERTIME_RULE
  } = options;
  const intervalHours = checkInDate || checkOutDate
    ? calculateDateTimeIntervalHours(checkInDate || dateText, checkInTime, checkOutDate || dateText, checkOutTime)
    : calculateIntervalHours(checkInTime, checkOutTime);

  if (intervalHours === null) {
    return {
      valid: false,
      intervalHours: 0,
      rawHours: 0,
      deductionHours: 0,
      effectiveHours: 0,
      mode: 'invalid'
    };
  }

  const isRestDay = isRestOvertimeDay(dateText, holidayInfo, workRestMode);
  const standardWorkHours = toFiniteNumber(rule.standardWorkHours, DEFAULT_OVERTIME_RULE.standardWorkHours);
  const rawHours = isRestDay ? intervalHours : Math.max(intervalHours - standardWorkHours, 0);
  const deductionResult = applyOvertimeDeductionRule(rawHours, rule);

  return {
    valid: true,
    intervalHours,
    rawHours: deductionResult.rawHours,
    deductionHours: deductionResult.deductionHours,
    effectiveHours: deductionResult.effectiveHours,
    mode: isRestDay ? 'rest' : 'workday'
  };
}

module.exports = {
  DEFAULT_OVERTIME_RULE,
  parseTimeToMinutes,
  calculateIntervalHours,
  calculateDateTimeIntervalHours,
  applyOvertimeDeductionRule,
  isRestOvertimeDay,
  calculateOvertimeFromTimes
};
