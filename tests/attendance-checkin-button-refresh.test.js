describe('attendance checkin button refresh', () => {
  let pageConfig;
  let pageInstance;
  let apiCallMock;
  let submitMock;
  let wxMock;

  function createPageInstance(config) {
    const instance = {
      data: JSON.parse(JSON.stringify(config.data)),
      setData(updates) {
        Object.keys(updates).forEach((key) => {
          if (key.includes('.')) {
            const segments = key.split('.');
            let target = this.data;
            for (let i = 0; i < segments.length - 1; i += 1) {
              const segment = segments[i];
              target[segment] = target[segment] || {};
              target = target[segment];
            }
            target[segments[segments.length - 1]] = updates[key];
          } else {
            this.data[key] = updates[key];
          }
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

    submitMock = jest.fn();
    apiCallMock = jest.fn((requestFn, _loadingText, successCallback) => {
      requestFn();
      successCallback({ code: 200, msg: '打卡成功' });
    });

    jest.doMock('../utils/api', () => ({
      API: {
        attendance: {
          submit: submitMock
        }
      },
      apiCall: apiCallMock,
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));

    jest.doMock('../utils/testMode', () => ({
      testModeManager: {
        isTestMode: jest.fn(() => false)
      }
    }));

    jest.doMock('../utils/mock-data', () => ({
      isGuestMode: jest.fn(() => false),
      showGuestModeTip: jest.fn(() => false)
    }));

    jest.doMock('../utils/feature-usage', () => ({
      recordFeatureUsage: jest.fn()
    }));

    jest.doMock('../utils/user-info-cache', () => ({
      userInfoCache: {
        clear: jest.fn(),
        get: jest.fn()
      }
    }));

    jest.doMock('../utils/performance-monitor', () => ({
      performanceMonitor: {
        mark: jest.fn(),
        measure: jest.fn()
      },
      PERF_TYPES: {
        PAGE_LOAD: 'PAGE_LOAD',
        API_CALL: 'API_CALL'
      }
    }));

    jest.doMock('../utils/miniprogram-info', () => ({
      miniprogramInfo: {
        getAppName: jest.fn(() => 'test-app')
      }
    }));

    jest.doMock('../utils/system-info', () => ({
      isDevtools: jest.fn(() => false)
    }));

    wxMock = {
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      showModal: jest.fn(),
      showToast: jest.fn()
    };

    global.wx = wxMock;
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    require('../pages/attendance/index.js');
    pageInstance = createPageInstance(pageConfig);
    pageInstance.loadTodayAttendance = jest.fn();
    pageInstance.loadRecentAttendance = jest.fn();
    pageInstance.loadCalendarAttendance = jest.fn();
    pageInstance.checkMissedAttendance = jest.fn();
    pageInstance.data.calendarYear = 2026;
    pageInstance.data.calendarMonth = 4;
    pageInstance.data.currentUser = {
      real_name: '张三'
    };
    pageInstance.data.checkinForm = {
      type: 'office',
      date: pageInstance.getDateString(new Date()),
      baseName: '',
      subsidy: ''
    };
  });

  test('marks today as checked in immediately after successful submit', () => {
    pageInstance.onConfirmCheckin();

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(pageInstance.data.todayCheckedIn).toBe(true);
    expect(pageInstance.data.todayAttendance).toMatchObject({
      work_status: '公司上班',
      work_date: pageInstance.getDateString(new Date()),
      name: '张三'
    });
    expect(pageInstance.data.showCheckinModal).toBe(false);
    expect(pageInstance.data.showResultModal).toBe(true);
    expect(pageInstance.data.resultSuccess).toBe(true);
  });
});
