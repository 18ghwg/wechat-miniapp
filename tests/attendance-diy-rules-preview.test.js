function createPageInstance(config) {
  const instance = {
    data: JSON.parse(JSON.stringify(config.data)),
    setData(updates) {
      Object.keys(updates).forEach((key) => {
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
  Object.keys(config).forEach((key) => {
    if (key !== 'data') instance[key] = config[key];
  });
  return instance;
}

const fs = require('fs');
const path = require('path');

describe('DIY attendance rule preview modes', () => {
  let page;
  let previewRule;

  beforeEach(() => {
    jest.resetModules();
    previewRule = jest.fn().mockResolvedValue({
      code: 200,
      data: {
        attendance_status: 'normal',
        overtime_source: 'attendance_derived',
        actual_work_minutes: 720,
        shortfall_minutes: 0,
        amount_cents: 12000,
        pretax_total_cents: 712000,
        salary_items: []
      }
    });
    jest.doMock('../utils/api', () => ({ API: { attendance: { previewRule } } }));
    global.wx = { showToast: jest.fn(), showModal: jest.fn() };
    global.Page = jest.fn((config) => { page = createPageInstance(config); });
    require('../pages/attendance/rules/index.js');
    page.data.document = { schema_version: 1 };
    page.data.previewDate = '2026-09-21';
    page.data.selectedDayType = 'workday';
    page.data.selectedScene = 'business_trip';
  });

  test('automatic mode sends punches without explicit overtime sessions', async () => {
    page.data.previewOvertimeMode = 'auto';
    await page.previewRule();

    expect(previewRule).toHaveBeenCalledWith(page.data.document, expect.objectContaining({
      attendance_periods: [{ start_minute: 480, end_minute: 1200, ends_next_day: false }],
      overtime_sessions: []
    }));
    expect(page.data.preview.attendance_status_text).toBe('正常');
    expect(page.data.preview.overtime_source_text).toBe('按打卡自动推导');
  });

  test('manual mode sends each independent overtime session', async () => {
    page.data.previewOvertimeMode = 'manual';
    page.data.previewSessions = [
      { id: 'one', start: '18:00', hours: '1.5' },
      { id: 'two', start: '21:00', hours: '2' }
    ];
    await page.previewRule();

    expect(previewRule.mock.calls[0][1].overtime_sessions).toEqual([
      { start_minute: 1080, end_minute: 1170, ends_next_day: false },
      { start_minute: 1260, end_minute: 1380, ends_next_day: false }
    ]);
  });

  test('preview ignores duplicate taps while request is pending', async () => {
    let resolvePreview;
    previewRule.mockReturnValueOnce(new Promise(resolve => { resolvePreview = resolve; }));

    const first = page.previewRule();
    const second = page.previewRule();

    expect(page.data.previewing).toBe(true);
    expect(previewRule).toHaveBeenCalledTimes(1);
    await second;
    resolvePreview({ code: 200, data: { salary_items: [] } });
    await first;
    expect(page.data.previewing).toBe(false);
  });

	 test('history version can be inspected without restoring it', () => {
	   page.data.versions = [{
		 version: 3,
		 status: 'archived',
		 effective_from: '2026-08-01',
		 effective_to: '2026-08-31',
		 document: {
		   payroll: { base_salary_cents: 750000, custom_items: [{ id: 'meal' }] },
		   attendance: {
			 scenes: {
			   company: { mode: 'fixed', standard_minutes: 480 },
			   business_trip: { mode: 'flexible', standard_minutes: 480 }
			 },
			 shift_templates: { day: {} },
			 day_overrides: [{ date: '2026-08-03' }]
		   },
		   day_rules: {
			 workday: { minimum: { operator: '>=', minutes: 60 }, deductions: [], bands: [{}] },
			 rest_day: { minimum: { operator: '>=', minutes: 30 }, deductions: [{}], bands: [{}, {}] },
			 legal_holiday: { minimum: { operator: '>', minutes: 0 }, deductions: [], bands: [{}] }
		   }
		 }
	   }];

	   page.viewHistoryVersion({ currentTarget: { dataset: { version: 3 } } });

	   expect(page.data.historyPreview).toEqual(expect.objectContaining({
		 version: 3,
		 baseSalaryText: '7500.00',
		 shiftCount: 1,
		 overrideCount: 1,
		 salaryItemCount: 1
	   }));
	   expect(page.data.historyPreview.dayRules[1]).toEqual(expect.objectContaining({ bandCount: 2, deductionCount: 1 }));
	   expect(page.data.historyPreview.companyText).toBe('固定时间 · 标准 8 小时');
	   expect(page.data.historyPreview.tripText).toBe('自由工时 · 标准 8 小时');
	 });

  test('daily standard work inputs use hours without changing user-entered clock times', () => {
    page.data.selectedScene = 'company';
    page.data.document = {
      attendance: {
        scenes: { company: { mode: 'fixed', standard_minutes: 480, normal_work_periods: [{ id: 'main', start_minute: 480, end_minute: 960, ends_next_day: false }] } },
        shift_templates: { day: { id: 'day', mode: 'fixed', standard_minutes: 480, normal_work_periods: [{ id: 'shift-main', start_minute: 540, end_minute: 1080 }] } },
        weekly_schedule: {},
        day_overrides: []
      }
    };

    page.onSceneNumberInput({ detail: { value: '7.5' } });
    page.onShiftTemplateInput({
      currentTarget: { dataset: { id: 'day', field: 'standard_minutes' } },
      detail: { value: '8' }
    });

    expect(page.data.document.attendance.scenes.company.standard_minutes).toBe(450);
    expect(page.data.document.attendance.scenes.company.normal_work_periods[0]).toEqual(expect.objectContaining({ end_minute: 960, end_text: '16:00', ends_next_day: false }));
    expect(page.data.document.attendance.shift_templates.day.standard_minutes).toBe(480);
    expect(page.data.document.attendance.shift_templates.day.normal_work_periods[0]).toEqual(expect.objectContaining({ end_minute: 1080, end_text: '18:00', ends_next_day: false }));
  });

  test('changing primary start time keeps the user-entered end time', () => {
    page.data.selectedScene = 'company';
    page.data.document = {
      attendance: {
        scenes: { company: { mode: 'fixed', standard_minutes: 480, normal_work_periods: [{ id: 'main', start_minute: 480, end_minute: 960, ends_next_day: false }] } },
        shift_templates: {}, weekly_schedule: {}, day_overrides: []
      }
    };

    page.onWorkPeriodTime({ currentTarget: { dataset: { index: 0, field: 'start_minute' } }, detail: { value: '20:00' } });

    expect(page.data.document.attendance.scenes.company.normal_work_periods[0]).toEqual(expect.objectContaining({ start_minute: 1200, end_minute: 960, end_text: '16:00', ends_next_day: false }));
  });

  test('changing primary end time uses the selected time instead of break-based calculation', () => {
    page.data.selectedScene = 'company';
    page.data.document = {
      attendance: {
        scenes: { company: { mode: 'fixed', standard_minutes: 480, break_minutes: 60, normal_work_periods: [{ id: 'main', start_minute: 510, end_minute: 990 }] } },
        shift_templates: {}, weekly_schedule: {}, day_overrides: []
      }
    };

    page.onWorkPeriodTime({ currentTarget: { dataset: { index: 0, field: 'end_minute' } }, detail: { value: '18:15' } });

    expect(page.data.document.attendance.scenes.company.normal_work_periods[0]).toEqual(expect.objectContaining({ end_text: '18:15', end_minute: 1095 }));
    expect(page.data.document.attendance.scenes.company.break_minutes).toBe(60);
  });

  test('deduction rules display hours while retaining minute values', () => {
    page.data.document = { day_rules: { workday: { deductions: [{ threshold_minutes: 690, deduct_minutes: 60 }] } } };

    page.onDeductionHoursInput({ currentTarget: { dataset: { index: 0, field: 'threshold_minutes' } }, detail: { value: '11.5' } });
    page.onDeductionHoursInput({ currentTarget: { dataset: { index: 0, field: 'deduct_minutes' } }, detail: { value: '1.5' } });

    expect(page.data.document.day_rules.workday.deductions[0]).toEqual({ threshold_minutes: 690, deduct_minutes: 90 });
  });

  test('overtime duration inputs use hours while retaining minute values', () => {
    page.data.document = {
      day_rules: {
        workday: {
          minimum: { minutes: 60 },
          rounding: { step_minutes: 30 },
          bands: [{ min_minutes: 0, max_minutes: null, band_cap_minutes: null }]
        }
      }
    };

    page.onNumberInput({ currentTarget: { dataset: { field: 'minimum_minutes' } }, detail: { value: '1.5' } });
    page.onNumberInput({ currentTarget: { dataset: { field: 'rounding_step' } }, detail: { value: '0.25' } });
    page.onNumberInput({ currentTarget: { dataset: { field: 'daily_cap' } }, detail: { value: '4.5' } });
    page.onBandInput({ currentTarget: { dataset: { index: 0, field: 'min_minutes' } }, detail: { value: '1.5' } });
    page.onBandInput({ currentTarget: { dataset: { index: 0, field: 'max_minutes' } }, detail: { value: '3' } });
    page.onBandInput({ currentTarget: { dataset: { index: 0, field: 'band_cap_minutes' } }, detail: { value: '2.25' } });

    expect(page.data.document.day_rules.workday.minimum.minutes).toBe(90);
    expect(page.data.document.day_rules.workday.rounding.step_minutes).toBe(15);
    expect(page.data.document.day_rules.workday.daily_cap_minutes).toBe(270);
    expect(page.data.document.day_rules.workday.bands[0]).toEqual(expect.objectContaining({
      min_minutes: 90,
      max_minutes: 180,
      band_cap_minutes: 135
    }));
  });

  test('wizard changes steps and opens contextual guidance', () => {
    global.wx.getStorageSync = jest.fn().mockReturnValue(false);
    global.wx.setStorageSync = jest.fn();
    global.wx.pageScrollTo = jest.fn();

    page.changeWizardStep(2);

    expect(page.data.currentStep).toBe(2);
    expect(page.data.wizardScrollIntoView).toBe('wizard-step-2');
    expect(page.data.currentStepTitle).toBe('加班多久、怎么算？');
    expect(page.data.guideOpen).toBe(true);
    expect(page.data.guideItem).toEqual(expect.objectContaining({ target: 'dayTabs' }));
    expect(global.wx.pageScrollTo).toHaveBeenCalledWith({ scrollTop: 0, duration: 200 });

    page.nextGuide();
    expect(page.data.guideItem).toEqual(expect.objectContaining({ target: 'deductionRules' }));

    page.skipGuide();
    expect(page.data.guideOpen).toBe(false);
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('attendance_rules_guide_seen_overtime_v1', true);
  });

  test('advanced settings stay collapsed until opened', () => {
    expect(page.data.advancedOpen).toEqual({ basics: false, schedule: false, overtime: false, payroll: false });

    page.toggleAdvanced({ currentTarget: { dataset: { section: 'overtime' } } });
    expect(page.data.advancedOpen.overtime).toBe(true);

    page.toggleAdvanced({ currentTarget: { dataset: { section: 'overtime' } } });
    expect(page.data.advancedOpen.overtime).toBe(false);
  });

  test('marks unconfigured scene and day-rule tabs for attention', () => {
    page.data.document = {
      attendance: {
        scenes: {
          company: { mode: 'fixed', standard_minutes: 480, normal_work_periods: [{ start_minute: 480, end_minute: 960 }] },
          business_trip: { mode: 'fixed', standard_minutes: 480, normal_work_periods: [] }
        }
      },
      day_rules: {
        workday: { bands: [{ rate: { mode: 'fixed', cents_per_hour: 2240 } }] },
        rest_day: { bands: [] },
        legal_holiday: { bands: [] }
      }
    };

    page.applyDocument(page.data.document);

    expect(page.data.sceneStatuses).toEqual({ company: false, business_trip: true });
    expect(page.data.dayRuleStatuses).toEqual({ workday: false, rest_day: true, legal_holiday: true });
  });

  test('rule editor separates picker questions from their selected answers', () => {
    const wxml = fs.readFileSync(path.join(__dirname, '../pages/attendance/rules/index.wxml'), 'utf8');
    expect(wxml).toContain('class="picker-question"');
    expect(wxml).toContain('class="picker-answer"');
    expect(wxml).toContain('range="{{shiftScopeOptions}}"');
    expect(wxml).toContain('一般只需选单休或双休');
    expect(wxml).toContain('需要特殊时间？展开修改');
  });

  test('shared shift scope is displayed and can be selected', () => {
    page.data.document = {
      attendance: {
        scenes: {},
        shift_templates: { day: { id: 'day', name: '通用班次', scene: 'company', mode: 'fixed' } },
        weekly_schedule: {},
        day_overrides: []
      }
    };

    page.onShiftTemplatePicker({
      currentTarget: { dataset: { id: 'day', field: 'scene' } },
      detail: { value: '0' }
    });

    expect(page.data.document.attendance.shift_templates.day.scene).toBe('');
    expect(page.data.shiftTemplates[0].sceneLabel).toBe('公司和出差通用');
  });

  test('weekly rest shortcut fills workdays and labels empty days as rest', () => {
    page.data.selectedScene = 'company';
    page.data.document = {
      attendance: {
        scenes: { company: { default_shift_template: 'day' } },
        shift_templates: { day: { id: 'day', name: '工作班次', scene: 'company' } },
        weekly_schedule: {},
        day_overrides: []
      }
    };

    page.onWeeklyRestModeChange({ currentTarget: { dataset: { mode: 'double' } } });

    expect(Object.keys(page.data.document.attendance.weekly_schedule).sort()).toEqual(['friday', 'monday', 'thursday', 'tuesday', 'wednesday']);
    expect(page.data.document.attendance.weekly_schedule.friday.shift_template_id).toBe('day');
    expect(page.data.weeklyRows.find(row => row.key === 'saturday').templateLabel).toBe('休息');

    page.onWeeklyRestModeChange({ currentTarget: { dataset: { mode: 'single' } } });

    expect(page.data.document.attendance.weekly_schedule.saturday.shift_template_id).toBe('day');
    expect(page.data.document.attendance.weekly_schedule.sunday).toBeUndefined();
    expect(page.data.weeklyRestMode).toBe('single');
  });

  test('weekly rest shortcut creates one shared default shift when both scenes match', () => {
    const sceneRule = () => ({
      mode: 'fixed',
      standard_minutes: 480,
      break_minutes: 0,
      normal_work_periods: [{ id: 'main', start_minute: 480, end_minute: 960, ends_next_day: false }]
    });
    page.data.selectedScene = 'company';
    page.data.document = {
      attendance: {
        scenes: { company: sceneRule(), business_trip: sceneRule() },
        shift_templates: {},
        weekly_schedule: {},
        day_overrides: []
      }
    };

    page.onWeeklyRestModeChange({ currentTarget: { dataset: { mode: 'double' } } });

    const templates = Object.values(page.data.document.attendance.shift_templates);
    expect(templates).toHaveLength(1);
    expect(templates[0]).toEqual(expect.objectContaining({ name: '默认工作班次', scene: '' }));
    expect(page.data.document.attendance.scenes.company.default_shift_template).toBe(templates[0].id);
    expect(page.data.document.attendance.scenes.business_trip.default_shift_template).toBe(templates[0].id);
    expect(page.data.document.attendance.weekly_schedule.monday.shift_template_id).toBe(templates[0].id);
    expect(global.wx.showToast).not.toHaveBeenCalledWith({ title: '请先添加一个工作班次', icon: 'none' });
  });

  test('weekly rest shortcut creates a scene-only shift when scene schedules differ', () => {
    page.data.selectedScene = 'business_trip';
    page.data.document = {
      attendance: {
        scenes: {
          company: { mode: 'fixed', standard_minutes: 480, normal_work_periods: [{ start_minute: 480, end_minute: 960 }] },
          business_trip: { mode: 'flexible', standard_minutes: 420, normal_work_periods: [] }
        },
        shift_templates: {}, weekly_schedule: {}, day_overrides: []
      }
    };

    page.onWeeklyRestModeChange({ currentTarget: { dataset: { mode: 'single' } } });

    const template = Object.values(page.data.document.attendance.shift_templates)[0];
    expect(template).toEqual(expect.objectContaining({ scene: 'business_trip', mode: 'flexible', standard_minutes: 420 }));
  });

  test('seen guidance stays closed until the user replays it', () => {
    global.wx.getStorageSync = jest.fn().mockReturnValue(true);

    page.showGuideForStep(0);
    expect(page.data.guideOpen).toBe(false);

    page.replayStepGuide();
    expect(page.data.guideOpen).toBe(true);
    expect(page.data.guideItem).toEqual(expect.objectContaining({ target: 'sceneTabs' }));
  });

  test('rounding scope can be changed to each independent session', () => {
    page.data.document = {
      day_rules: { workday: { rounding: { mode: 'floor', step_minutes: 30, scope: 'day' } } }
    };

    page.onRoundingScopeChange({ detail: { value: '1' } });

    expect(page.data.document.day_rules.workday.rounding.scope).toBe('session');
  });

  test('meal preset uses work days while remaining editable', () => {
    const dayRule = () => ({ deductions: [], bands: [], rounding: { mode: 'none', step_minutes: 1, scope: 'day' } });
    page.data.document = {
      payroll: { custom_items: [] },
      attendance: { scenes: {} },
      day_rules: { workday: dayRule(), rest_day: dayRule(), legal_holiday: dayRule() }
    };
    page.data.previewDate = '2026-09-21';
    page.data.salaryPresetIndex = 1;

    page.addSalaryPreset();

    expect(page.data.document.payroll.custom_items).toHaveLength(1);
    expect(page.data.document.payroll.custom_items[0]).toEqual(expect.objectContaining({
      name: '餐补',
      legacy_component: 'meal_allowance',
      legacy_component_label: '替代以前的餐补',
      unit: 'day',
      quantity_source: 'automatic',
      quantity_variable: 'work_days',
      effective_from: '2026-09-21'
    }));
  });

  test('single-tier mode blocks clock-window bands in the editor', () => {
    page.data.document = {
      day_rules: {
        workday: {
          pricing_mode: 'single_tier',
          bands: [{ selector: 'cumulative_range', min_minutes: 0 }]
        }
      }
    };

    page.onBandSelector({ currentTarget: { dataset: { index: 0 } }, detail: { value: '1' } });

    expect(page.data.document.day_rules.workday.bands[0].selector).toBe('cumulative_range');
    expect(global.wx.showToast).toHaveBeenCalledWith({ title: '单档计费仅支持累计时长分段', icon: 'none' });
  });

  test('single-tier mode cannot be selected with existing clock-window bands', () => {
    page.data.document = {
      day_rules: {
        workday: {
          pricing_mode: 'progressive',
          bands: [{ selector: 'clock_window' }]
        }
      }
    };

    page.onRulePicker({ currentTarget: { dataset: { field: 'pricing_mode' } }, detail: { value: '1' } });

    expect(page.data.document.day_rules.workday.pricing_mode).toBe('progressive');
    expect(global.wx.showToast).toHaveBeenCalledWith({ title: '单档计费仅支持累计时长分段', icon: 'none' });
  });

  test('pricing step warns before leaving without an hourly rate', () => {
    page.data.currentStep = 2;
    page.data.document = { day_rules: { workday: { bands: [] } } };
    page.data.pricingNeedsAttention = true;
    page.data.pricingSkipConfirmed = false;

    page.changeWizardStep(3);

    expect(page.data.currentStep).toBe(2);
    expect(global.wx.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: '请先设置加班小时单价',
      confirmText: '去设置',
      cancelText: '暂时跳过'
    }));
  });

  test('pricing setup shows a rate band and explicit skip can continue', () => {
    page.data.currentStep = 2;
    page.data.document = { day_rules: { workday: { bands: [] } } };
    page.data.pricingSkipByDayType = { workday: false };
    page.data.pricingNeedsAttention = true;

    page.startPricingSetup();

    expect(page.data.document.day_rules.workday.bands).toHaveLength(1);
    expect(page.data.document.day_rules.workday.bands[0].rate).toEqual({ mode: 'fixed', cents_per_hour: 0 });
    expect(page.data.pricingNeedsAttention).toBe(true);

    global.wx.showModal.mockImplementationOnce(({ success }) => success({ confirm: true }));
    page.skipPricingSetupAndContinue();

    expect(page.data.pricingSkipConfirmed).toBe(true);
    expect(page.data.pricingNeedsAttention).toBe(false);
    expect(page.data.currentStep).toBe(3);
  });

  test('skipping an empty pricing section keeps a zero-rate placeholder for validation', () => {
    page.data.currentStep = 2;
    page.data.document = { day_rules: { workday: { bands: [] } } };
    page.data.pricingSkipByDayType = { workday: false };
    page.data.pricingNeedsAttention = true;
    global.wx.showModal.mockImplementationOnce(({ success }) => success({ confirm: true }));

    page.skipPricingSetupAndContinue();

    expect(page.data.document.day_rules.workday.bands).toHaveLength(1);
    expect(page.data.document.day_rules.workday.bands[0].rate.cents_per_hour).toBe(0);
    expect(page.data.currentStep).toBe(3);
  });
});
