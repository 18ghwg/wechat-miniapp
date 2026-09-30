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

describe('DIY attendance entries validation', () => {
  let page;
  let createOvertimeSession;
  let createCompTimeEntry;
  let getAutomaticAttendanceEntries;

  beforeEach(() => {
    jest.resetModules();
    createOvertimeSession = jest.fn().mockResolvedValue({ code: 200, data: {} });
    createCompTimeEntry = jest.fn().mockResolvedValue({ code: 200, data: {} });
    getAutomaticAttendanceEntries = jest.fn().mockResolvedValue({ code: 200, data: {} });
    jest.doMock('../utils/api', () => ({
      API: {
        attendance: {
          createOvertimeSession,
          updateOvertimeSession: jest.fn(),
          listOvertimeSessions: jest.fn(),
          listDailyAllowances: jest.fn(),
          listCompTimeLedger: jest.fn(),
          getRuleDocument: jest.fn()
          ,createCompTimeEntry,
          getAutomaticAttendanceEntries
        }
      }
    }));
    global.wx = { showToast: jest.fn(), showModal: jest.fn() };
    global.Page = jest.fn(config => { page = createPageInstance(config); });
    require('../pages/attendance/entries/index.js');
  });

  test('rejects an overtime session whose end is not after its start', async () => {
    page.data.overtimeForm = {
      id: 0,
      workDate: '2026-09-21',
      startTime: '20:00',
      endDate: '2026-09-21',
      endTime: '19:00',
      sceneIndex: 0,
      dayTypeIndex: 0,
      remark: ''
    };

    await page.submitOvertime(false);

    expect(createOvertimeSession).not.toHaveBeenCalled();
    expect(wx.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('结束时间') }));
  });

  test('ignores duplicate overtime saves while one request is pending', async () => {
    let resolveSave;
    createOvertimeSession.mockReturnValueOnce(new Promise(resolve => { resolveSave = resolve; }));
    page.data.overtimeForm = {
      id: 0,
      workDate: '2026-09-21',
      startTime: '18:00',
      endDate: '2026-09-21',
      endTime: '20:00',
      sceneIndex: 0,
      dayTypeIndex: 0,
      remark: ''
    };

    const first = page.submitOvertime(false);
    const second = page.submitOvertime(false);

    expect(createOvertimeSession).toHaveBeenCalledTimes(1);
    await second;
    resolveSave({ code: 200, data: {} });
    await first;
    expect(page.data.saving).toBe(false);
  });

  test('comp time input uses hours while API payload keeps minutes', async () => {
    page.loadData = jest.fn().mockResolvedValue();
    page.data.compTimeForm = {
      id: 0,
      workDate: '2026-09-24',
      entryTypeIndex: 0,
      hours: '1.5',
      remark: ''
    };

    await page.saveCompTime();

    expect(createCompTimeEntry).toHaveBeenCalledWith(expect.objectContaining({ minutes: 90 }));
  });

  test('decorates a daily overtime result with effective hours, pay, tags and pricing bands', () => {
    const item = page.decorateSession({
      id: '2026-09-05',
      work_date: '2026-09-05',
      scene: 'business_trip',
      day_type_override: 'rest_day',
      recognized_minutes: 630,
      paid_minutes: 630,
      amount_cents: 30080,
      settlement_tags: ['双倍'],
      bands: [
        { name: '每日前 8 小时', minutes: 480, rate_cents_per_hour: 3060, amount_cents: 24480 },
        { name: '每日超 8 小时', minutes: 150, rate_cents_per_hour: 2240, amount_cents: 5600 }
      ]
    });

    expect(item.recognizedText).toBe('10.5小时');
    expect(item.amountText).toBe('300.80');
    expect(item.settlementTags).toEqual([{ label: '双倍', className: 'double-tag' }]);
    expect(item.bands).toEqual([
      { name: '每日前 8 小时', hoursText: '8小时', rateText: '30.60', amountText: '244.80' },
      { name: '每日超 8 小时', hoursText: '2.5小时', rateText: '22.40', amountText: '56.00' }
    ]);
  });

  test('loads overtime details in reverse chronological order', async () => {
    getAutomaticAttendanceEntries.mockResolvedValueOnce({
      code: 200,
      data: {
        sessions: [
          { id: '2026-09-01', work_date: '2026-09-01', recognized_minutes: 60 },
          { id: '2026-09-19', work_date: '2026-09-19', recognized_minutes: 60 },
          { id: '2026-09-05', work_date: '2026-09-05', recognized_minutes: 60 }
        ],
        allowances: [],
        comp_time: { items: [], balance_minutes: 0 }
      }
    });

    await page.loadData();

    expect(page.data.sessions.map(item => item.work_date)).toEqual([
      '2026-09-19',
      '2026-09-05',
      '2026-09-01'
    ]);
  });
});
