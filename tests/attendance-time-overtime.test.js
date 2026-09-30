const {
  calculateIntervalHours,
  calculateDateTimeIntervalHours,
  calculateOvertimeFromTimes
} = require('../pages/attendance/time-overtime');

describe('attendance time overtime calculation', () => {
  test('calculates workday overtime from check-in and check-out times', () => {
    const result = calculateOvertimeFromTimes({
      dateText: '2026-08-17',
      checkInTime: '09:00',
      checkOutTime: '21:00',
      holidayInfo: { work_type: 'workday' }
    });

    expect(result.valid).toBe(true);
    expect(result.intervalHours).toBe(12);
    expect(result.rawHours).toBe(4);
    expect(result.deductionHours).toBe(1);
    expect(result.effectiveHours).toBe(3);
    expect(result.mode).toBe('workday');
  });

  test('calculates rest day overtime from the full attendance interval', () => {
    const result = calculateOvertimeFromTimes({
      dateText: '2026-08-16',
      checkInTime: '09:00',
      checkOutTime: '20:00',
      holidayInfo: { work_type: 'rest_day', is_rest_day: true }
    });

    expect(result.valid).toBe(true);
    expect(result.intervalHours).toBe(11);
    expect(result.rawHours).toBe(11);
    expect(result.deductionHours).toBe(1);
    expect(result.effectiveHours).toBe(10);
    expect(result.mode).toBe('rest');
  });

  test('supports overnight attendance ranges', () => {
    expect(calculateIntervalHours('22:30', '01:30')).toBe(3);
  });

  test('uses explicit dates for cross-day overtime calculation', () => {
    const result = calculateOvertimeFromTimes({
      dateText: '2026-08-17',
      checkInDate: '2026-08-17',
      checkInTime: '20:30',
      checkOutDate: '2026-08-18',
      checkOutTime: '02:30',
      holidayInfo: { work_type: 'workday' }
    });

    expect(result.valid).toBe(true);
    expect(result.intervalHours).toBe(6);
    expect(result.rawHours).toBe(0);
    expect(result.effectiveHours).toBe(0);
    expect(calculateDateTimeIntervalHours('2026-08-17', '20:30', '2026-08-18', '02:30')).toBe(6);
  });

  test('supports editing an off-duty time on the next calendar date', () => {
    const result = calculateOvertimeFromTimes({
      dateText: '2026-08-19',
      checkInDate: '2026-08-19',
      checkInTime: '09:00',
      checkOutDate: '2026-08-20',
      checkOutTime: '02:00',
      holidayInfo: { work_type: 'workday' }
    });

    expect(result.valid).toBe(true);
    expect(result.intervalHours).toBe(17);
    expect(result.rawHours).toBe(9);
    expect(result.deductionHours).toBe(1);
    expect(result.effectiveHours).toBe(8);
    expect(calculateDateTimeIntervalHours('2026-08-19', '09:00', '2026-08-20', '02:00')).toBe(17);
  });
});
