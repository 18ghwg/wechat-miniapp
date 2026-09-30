function createPageInstance(config) {
  const instance = {
    data: JSON.parse(JSON.stringify(config.data)),
    setData(updates) {
      Object.keys(updates).forEach(key => {
        const parts = key.split('.');
        let target = this.data;
        for (let index = 0; index < parts.length - 1; index += 1) {
          target[parts[index]] = target[parts[index]] || {};
          target = target[parts[index]];
        }
        target[parts[parts.length - 1]] = updates[key];
      });
    }
  };
  Object.keys(config).forEach(key => {
    if (key !== 'data') instance[key] = config[key];
  });
  return instance;
}

function ruleDocument() {
  const baseRule = {
    minimum: { operator: '>=', minutes: 0 },
    deductions: [],
    rounding: { mode: 'floor', step_minutes: 30, scope: 'day' },
    cap_order: 'round_then_cap',
    pricing_mode: 'progressive',
    gap_confirmed: false,
    overlap_policy: 'deduplicate',
    night_day_basis: 'actual_date',
    bands: [{ id: 'fixed', selector: 'cumulative_range', settlement: 'paid', min_minutes: 0, min_inclusive: true, rate: { mode: 'fixed', cents_per_hour: 3000 }, priority: 10 }]
  };
  return {
    schema_version: 1,
    attendance: {
      default_scene: 'company',
      scenes: {
        company: { mode: 'fixed', standard_minutes: 480, break_minutes: 60, flexible_metric: 'period_sum', shortfall_policy: 'ignore', missing_punch_policy: 'pending', allow_daily_mode_override: true, normal_work_periods: [{ id: 'old', name: '旧班次', start_minute: 480, end_minute: 960, ends_next_day: false }] },
        business_trip: { mode: 'flexible', standard_minutes: 480, break_minutes: 0, flexible_metric: 'period_sum', shortfall_policy: 'ignore', missing_punch_policy: 'pending', allow_daily_mode_override: true, normal_work_periods: [] }
      },
      shift_templates: {},
      weekly_schedule: {},
      day_overrides: [{ date: '2026-09-01', day_type: 'workday' }]
    },
    day_rules: { workday: JSON.parse(JSON.stringify(baseRule)), rest_day: JSON.parse(JSON.stringify(baseRule)), legal_holiday: JSON.parse(JSON.stringify(baseRule)) },
    payroll: { base_salary_cents: 880000, standard_monthly_days: 21.75, standard_daily_minutes: 480, custom_items: [{ id: 'meal', name: '餐补', unit: 'day', value_mode: 'fixed', fixed_cents: 2000, quantity_source: 'automatic', quantity_variable: 'work_days', include_in_pretax: true, include_in_overtime_base: false, effective_from: '2026-09-01' }] }
  };
}

describe('attendance rule quick presets', () => {
  let page;
  let saveRuleDraft;

  beforeEach(() => {
    jest.resetModules();
    saveRuleDraft = jest.fn(document => Promise.resolve({ code: 200, data: { id: 9, version: 1, document } }));
    jest.doMock('../utils/api', () => ({ API: { attendance: { saveRuleDraft, getRuleDocument: jest.fn() } } }));
    global.wx = {
      showToast: jest.fn(),
      showModal: jest.fn(),
      getStorageSync: jest.fn(() => true),
      setStorageSync: jest.fn(),
      pageScrollTo: jest.fn()
    };
    global.Page = jest.fn(config => { page = createPageInstance(config); });
    require('../pages/attendance/rules/index.js');
    page.data.document = ruleDocument();
    page.data.meta = { status: 'legacy_v1', setup_state: 'unconfigured', needs_setup: true };
  });

  test('standard double-rest preset creates five fixed workdays and preserves payroll rules', async () => {
    await page.saveAttendancePlan('standard_double');

    const saved = saveRuleDraft.mock.calls[0][0];
    expect(Object.keys(saved.attendance.weekly_schedule)).toHaveLength(5);
    expect(saved.attendance.scenes.company).toEqual(expect.objectContaining({ mode: 'fixed', standard_minutes: 480, break_minutes: 60 }));
    expect(saved.attendance.scenes.company.normal_work_periods[0]).toEqual(expect.objectContaining({ start_minute: 540, end_minute: 1080 }));
    expect(saved.attendance.day_overrides).toEqual([]);
    expect(saved.payroll.base_salary_cents).toBe(880000);
    expect(saved.payroll.custom_items[0].name).toBe('餐补');
    expect(saved.day_rules.workday.bands[0].rate.cents_per_hour).toBe(3000);
    expect(page.data.selectedPlanKey).toBe('standard_double');
    expect(page.data.meta.setup_state).toBe('draft_unpublished');
  });

  test('single-rest preset includes Saturday while flexible preset removes fixed clock times', async () => {
    await page.saveAttendancePlan('standard_single');
    let saved = saveRuleDraft.mock.calls[0][0];
    expect(saved.attendance.weekly_schedule.saturday.shift_template_id).toBe('preset_standard_single');

    await page.saveAttendancePlan('flexible_double');
    saved = saveRuleDraft.mock.calls[1][0];
    expect(Object.keys(saved.attendance.weekly_schedule)).toHaveLength(5);
    expect(saved.attendance.scenes.company.mode).toBe('flexible');
    expect(saved.attendance.scenes.company.normal_work_periods).toEqual([]);
    expect(saved.attendance.shift_templates.preset_flexible_double.normal_work_periods).toEqual([]);
  });
});
