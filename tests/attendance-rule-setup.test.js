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

describe('attendance rule setup reminder', () => {
  let page;
  let getRuleDocument;

  beforeEach(() => {
    jest.resetModules();
    getRuleDocument = jest.fn();
    jest.doMock('../utils/api', () => ({
      API: { attendance: { getRuleDocument } },
      apiCall: jest.fn(),
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));
    jest.doMock('../utils/testMode', () => ({ testModeManager: { isTestMode: jest.fn(() => false) } }));
    jest.doMock('../utils/mock-data', () => ({ isGuestMode: jest.fn(() => false), showGuestModeTip: jest.fn() }));
    jest.doMock('../utils/feature-usage', () => ({ recordFeatureUsage: jest.fn() }));
    jest.doMock('../utils/user-info-cache', () => ({ userInfoCache: { clear: jest.fn(), get: jest.fn() } }));
    jest.doMock('../utils/performance-monitor', () => ({
      performanceMonitor: { mark: jest.fn(), measure: jest.fn() },
      PERF_TYPES: { PAGE_LOAD: 'PAGE_LOAD', API_CALL: 'API_CALL' }
    }));
    jest.doMock('../utils/miniprogram-info', () => ({ miniprogramInfo: { getAppName: jest.fn(() => 'test-app') } }));
    jest.doMock('../utils/system-info', () => ({ isDevtools: jest.fn(() => false) }));

    global.wx = { navigateTo: jest.fn(), showToast: jest.fn(), showModal: jest.fn() };
    global.Page = jest.fn(config => { page = createPageInstance(config); });
    require('../pages/attendance/index.js');
  });

  test('shows an actionable reminder when no rule has been configured', async () => {
    getRuleDocument.mockResolvedValue({
      code: 200,
      data: { meta: { status: 'legacy_v1', setup_state: 'unconfigured', needs_setup: true } }
    });

    await page.loadAttendanceRuleSetup(false);

    expect(page.data.ruleSetup).toEqual(expect.objectContaining({
      needsSetup: true,
      state: 'unconfigured',
      actionText: '选择考勤方案'
    }));
    page.goToAttendanceRuleSetup();
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: '/pages/attendance/rules/index?setup=1' });
  });

  test('shows publish guidance for a draft without a published version', async () => {
    getRuleDocument.mockResolvedValue({
      code: 200,
      data: { meta: { status: 'draft', setup_state: 'draft_unpublished', needs_setup: true } }
    });

    await page.loadAttendanceRuleSetup(false);

    expect(page.data.ruleSetup).toEqual(expect.objectContaining({
      needsSetup: true,
      title: '考勤规则还没有发布',
      actionText: '继续配置并发布'
    }));
  });

  test('does not disturb users who already have a published rule', async () => {
    getRuleDocument.mockResolvedValue({
      code: 200,
      data: { meta: { status: 'draft', setup_state: 'published_with_draft', needs_setup: false } }
    });

    await page.loadAttendanceRuleSetup(false);

    expect(page.data.ruleSetup.needsSetup).toBe(false);
  });
});
