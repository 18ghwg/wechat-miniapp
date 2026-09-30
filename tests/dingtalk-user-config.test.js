const fs = require('fs');
const path = require('path');

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

describe('DingTalk per-user settings page', () => {
  let page;
  let getSettings;
  let saveSettings;

  beforeEach(() => {
    jest.resetModules();
    getSettings = jest.fn();
    saveSettings = jest.fn();
    jest.doMock('../utils/api', () => ({
      API: {
        attendance: {
          getDingtalkSettings: getSettings,
          saveDingtalkSettings: saveSettings
        }
      },
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));
    global.wx = {
      getStorageSync: jest.fn(() => 'test-openid'),
      stopPullDownRefresh: jest.fn(),
      showModal: jest.fn(),
      navigateTo: jest.fn(),
      setClipboardData: jest.fn()
    };
    global.Page = jest.fn((config) => {
      page = createPageInstance(config);
    });
    require('../pages/admin/dingtalk-settings/index.js');
  });

  test('clears the masked secret returned by the server', async () => {
    getSettings.mockResolvedValue({
      data: {
        configured: true,
        has_app_secret: true,
        app_secret: '********'
      }
    });

    page.loadSettings();
    await Promise.resolve();

    expect(page.data.settings.app_secret).toBe('');
    expect(page.data.settings.has_app_secret).toBe(true);
  });

  test('does not resubmit an unchanged secret', async () => {
    page.data.settings = Object.assign({}, page.data.settings, {
      corp_id: 'corp-id',
      app_key: 'app-key',
      app_secret: '',
      has_app_secret: true,
      ding_user_id: 'ding-user',
      is_enabled: true
    });
    saveSettings.mockResolvedValue({ data: { is_verified: true, can_sync: true } });

    page.onSave();
    await Promise.resolve();

    expect(saveSettings).toHaveBeenCalledTimes(1);
    const payload = saveSettings.mock.calls[0][0];
    expect(payload).not.toHaveProperty('app_secret');
    expect(payload).not.toHaveProperty('overtime_threshold_hours');
    expect(payload).not.toHaveProperty('overtime_deduction_lte_hours');
    expect(payload).not.toHaveProperty('overtime_deduction_gt_hours');
    expect(payload).not.toHaveProperty('overtime_round_step_hours');
    expect(page.data.settings.app_secret).toBe('');
  });

  test('does not render the legacy overtime deduction rule settings', () => {
    const wxml = fs.readFileSync(
      path.join(__dirname, '../pages/admin/dingtalk-settings/index.wxml'),
      'utf8'
    );

    expect(wxml).not.toContain('加班扣除规则');
    expect(wxml).not.toContain('分界线（小时）');
    expect(wxml).not.toContain('不超分界扣除');
    expect(wxml).not.toContain('超出分界扣除');
    expect(wxml).not.toContain('保留步长（小时）');
  });

  test('submits a newly entered secret and clears it after verification', async () => {
    page.data.settings = Object.assign({}, page.data.settings, {
      corp_id: 'corp-id',
      app_key: 'app-key',
      app_secret: 'new-test-secret',
      has_app_secret: false,
      ding_user_id: 'ding-user',
      is_enabled: true
    });
    saveSettings.mockResolvedValue({
      data: { is_verified: true, can_sync: true, has_app_secret: true }
    });

    page.onSave();
    await Promise.resolve();

    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({
      app_secret: 'new-test-secret'
    }));
    expect(page.data.settings.app_secret).toBe('');
  });
});

describe('DingTalk attendance sync availability', () => {
  let page;
  let getSettings;

  beforeEach(() => {
    jest.resetModules();
    getSettings = jest.fn();
    jest.doMock('../utils/api', () => ({
      API: { attendance: { getDingtalkSettings: getSettings } },
      apiCall: jest.fn(),
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));
    jest.doMock('../utils/testMode', () => ({
      testModeManager: { isTestMode: jest.fn(() => false) }
    }));
    jest.doMock('../utils/mock-data', () => ({ isGuestMode: jest.fn(() => false) }));
    jest.doMock('../utils/feature-usage', () => ({ recordFeatureUsage: jest.fn() }));
    jest.doMock('../utils/user-info-cache', () => ({
      userInfoCache: { clear: jest.fn(), get: jest.fn() }
    }));
    jest.doMock('../utils/performance-monitor', () => ({
      performanceMonitor: { mark: jest.fn(), measure: jest.fn() },
      PERF_TYPES: {}
    }));
    jest.doMock('../utils/miniprogram-info', () => ({
      miniprogramInfo: { getAppName: jest.fn(() => 'test-app') }
    }));
    jest.doMock('../utils/system-info', () => ({ isDevtools: jest.fn(() => false) }));
    global.wx = { getStorageSync: jest.fn(() => 'test-openid') };
    global.Page = jest.fn((config) => {
      page = createPageInstance(config);
    });
    require('../pages/attendance/index.js');
  });

  test.each([
    [false, false],
    [true, true]
  ])('maps can_sync=%s to button availability=%s', async (canSync, expected) => {
    getSettings.mockResolvedValue({ data: { can_sync: canSync } });

    page.loadDingtalkSyncAvailability(false);
    await Promise.resolve();

    expect(page.data.canSyncDingtalk).toBe(expected);
  });

  test('sync button is conditionally rendered from canSyncDingtalk', () => {
    const wxml = fs.readFileSync(
      path.join(__dirname, '../pages/attendance/index.wxml'),
      'utf8'
    );

    expect(wxml).toContain('wx:if="{{canSyncDingtalk}}"');
  });
});
