describe('attendance history salary sheet null response handling', () => {
  let pageConfig;
  let pageInstance;
  let getSalarySheetMock;
  let wxMock;

  function createPageInstance(config) {
    const instance = {
      data: JSON.parse(JSON.stringify(config.data)),
      setData(updates) {
        Object.keys(updates).forEach((key) => {
          this.data[key] = updates[key];
        });
      }
    };

    Object.keys(config).forEach((key) => {
      if (key !== 'data') {
        instance[key] = config[key];
      }
    });

    return instance;
  }

  beforeEach(() => {
    jest.resetModules();

    getSalarySheetMock = jest.fn(() => Promise.resolve({
      code: 200,
      msg: '获取工资条成功',
      data: {
        name: '孙乐',
        year: 2026,
        month: 5,
        salary: null,
        salary_recalculation: {
          storage_mismatch: {
            items: [
              null,
              {
                key: 'total_salary',
                label: '工资合计',
                db_value: 7000,
                excel_value: 7100,
                diff: -100
              }
            ]
          }
        }
      }
    }));

    jest.doMock('../utils/api', () => ({
      API: {
        attendance: {
          getSalarySheet: getSalarySheetMock
        }
      },
      apiCall: jest.fn(),
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));

    jest.doMock('../utils/testMode', () => ({
      testModeManager: {
        isTestMode: jest.fn(() => false),
        setupPageHotReload: jest.fn()
      }
    }));

    jest.doMock('../utils/mock-data', () => ({
      isGuestMode: jest.fn(() => false),
      showGuestModeTip: jest.fn(() => false)
    }));

    wxMock = {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      showModal: jest.fn(),
      showToast: jest.fn(),
      getStorageSync: jest.fn(() => ({})),
      setStorageSync: jest.fn(),
      stopPullDownRefresh: jest.fn(),
      navigateBack: jest.fn(),
      switchTab: jest.fn()
    };

    global.wx = wxMock;
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    require('../pages/attendance/history/index.js');
    pageInstance = createPageInstance(pageConfig);
    pageInstance.data.isAdmin = true;
    pageInstance.data.currentYear = 2026;
    pageInstance.data.currentMonth = 5;
    pageInstance.data.selectedEmployees = ['孙乐'];
    pageInstance.data.selectedEmployeeCount = 1;
    pageInstance.data.selectedEmployeeName = '孙乐';
  });

  test('opens salary modal when salary payload and mismatch rows contain null', async () => {
    await expect(pageInstance.onOpenSalarySheet()).resolves.toBeUndefined();

    expect(getSalarySheetMock).toHaveBeenCalledWith({
      name: '孙乐',
      year: 2026,
      month: 5
    });
    expect(pageInstance.data.showSalaryModal).toBe(true);
    expect(pageInstance.data.salaryContext).toMatchObject({
      name: '孙乐',
      year: 2026,
      month: 5
    });
    expect(pageInstance.data.salaryForm.total_salary).toBe('0.00');
    expect(pageInstance.data.salaryAlertItems).toHaveLength(1);
    expect(pageInstance.data.salaryAlertItems[0]).toMatchObject({
      key: 'total_salary',
      label: '工资合计',
      leftLabel: '数据库',
      rightLabel: 'Excel',
      leftValueText: '¥7000.00',
      rightValueText: '¥7100.00',
      diffValueText: '-¥100.00'
    });
    expect(pageInstance.data.salaryModalTitle).toBe('孙乐 2026年5月工资条');
    expect(pageInstance.data.salaryFields.find(item => item.key === 'domestic_allowance')).toMatchObject({
      hasCalculator: true,
      calcDaysStateKey: 'domesticDaysInput'
    });
    expect(wxMock.hideLoading).toHaveBeenCalled();
  });

  test('opens salary modal with recalculation mismatch response shape', async () => {
    getSalarySheetMock.mockResolvedValueOnce({
      code: 200,
      msg: '获取工资条成功',
      data: {
        name: '孙乐',
        year: 2026,
        month: 5,
        source: 'db',
        salary: {
          abroad_allowance: 0,
          abroad_business_days: 0,
          base_salary: 7500,
          compensatory_days: 0,
          domestic_allowance: 2600,
          domestic_business_days: 26,
          holiday_overtime_pay: 0,
          meal_allowance: 520,
          overtime_pay: 0,
          total_salary: 10620,
          weekend_overtime_days: 0,
          weekend_overtime_pay: 0,
          workday_overtime_hours: 0,
          workday_overtime_pay: 0
        },
        salary_recalculation: {
          available: true,
          mismatch: {
            has_mismatch: true,
            message: '工资条与最新考勤统计不一致：工资合计',
            items: [
              null,
              {
                key: 'total_salary',
                label: '工资合计',
                expected: 10100,
                actual: 10620,
                diff: 520
              }
            ]
          }
        }
      }
    });

    await expect(pageInstance.onOpenSalarySheet()).resolves.toBeUndefined();

    expect(pageInstance.data.showSalaryModal).toBe(true);
    expect(pageInstance.data.salaryForm.total_salary).toBe('10620.00');
    expect(pageInstance.data.salaryAlertItems).toHaveLength(1);
    expect(pageInstance.data.salaryAlertItems[0]).toMatchObject({
      key: 'total_salary',
      label: '工资合计',
      leftLabel: '工资条',
      rightLabel: '最新统计',
      leftValueText: '¥10620.00',
      rightValueText: '¥10100.00',
      diffValueText: '+¥520.00'
    });
    expect(pageInstance.data.salaryAlertText).toBe('工资条与最新考勤统计不一致：工资合计');
    expect(wxMock.hideLoading).toHaveBeenCalled();
  });
});
