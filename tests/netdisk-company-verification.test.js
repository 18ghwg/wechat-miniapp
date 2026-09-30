const {
  isAllowedCompanyName,
  getCompanyNetdiskVerificationKey
} = require('../utils/company-netdisk-access');

describe('company netdisk access verification', () => {
  test.each([
    'LXT',
    'lxt',
    ' LXT ',
    '南京力禧特',
    '力禧特',
    '南京力禧特光电科技有限公司'
  ])('accepts the allowed company name: %s', (companyName) => {
    expect(isAllowedCompanyName(companyName)).toBe(true);
  });

  test.each(['', '南京力禧', '力禧特科技', '其他公司'])('rejects other company names: %s', (companyName) => {
    expect(isAllowedCompanyName(companyName)).toBe(false);
  });

  test('creates a verification key scoped to the current user', () => {
    expect(getCompanyNetdiskVerificationKey('openid-a', { id: 1 }))
      .not.toBe(getCompanyNetdiskVerificationKey('openid-b', { id: 1 }));
    expect(getCompanyNetdiskVerificationKey('', { id: 24 }))
      .toBe('company_netdisk_verified_v1:24');
  });

  test('keeps salary settings visible while gating only netdisk controls', () => {
    const fs = require('fs');
    const path = require('path');
    const template = fs.readFileSync(
      path.join(__dirname, '../pages/attendance/netdisk/index.wxml'),
      'utf8'
    );

    expect(template).toContain('class="salary-config-container page-enter"');
    expect(template).toContain('<block wx:if="{{companyVerified}}">');
    expect(template).toContain('<text class="section-title">个人工资信息</text>');
    expect(template).toContain('工资条设置可直接查看和维护，不受公司验证影响');
    expect(template).not.toContain('南京力禧特光电科技有限公司');
  });
});

describe('netdisk settings verification gate', () => {
  let pageConfig;
  let page;
  let storage;
  let apiCallMock;
  let setupPageHotReloadMock;
  let getNetdiskInfoMock;
  let updateNetdiskInfoMock;
  let showErrorMock;
  let showSuccessMock;

  function createPageInstance(config) {
    const instance = {
      data: JSON.parse(JSON.stringify(config.data)),
      setData(updates, callback) {
        Object.keys(updates).forEach((key) => {
          if (!key.includes('.')) {
            this.data[key] = updates[key];
            return;
          }
          const parts = key.split('.');
          let target = this.data;
          parts.slice(0, -1).forEach((part) => {
            target[part] = target[part] || {};
            target = target[part];
          });
          target[parts[parts.length - 1]] = updates[key];
        });
        if (callback) callback();
      }
    };

    Object.keys(config).forEach((key) => {
      if (key !== 'data') instance[key] = config[key];
    });
    return instance;
  }

  beforeEach(() => {
    jest.resetModules();
    storage = {
      openid: 'openid-company-user',
      userInfo: { id: 24, real_name: '孙乐' }
    };
    apiCallMock = jest.fn();
    setupPageHotReloadMock = jest.fn();
    getNetdiskInfoMock = jest.fn(() => Promise.resolve({ data: {} }));
    updateNetdiskInfoMock = jest.fn();
    showErrorMock = jest.fn();
    showSuccessMock = jest.fn();

    jest.doMock('../utils/api', () => ({
      API: {
        user: { getInfo: jest.fn() },
        attendance: {
          getNetdiskInfo: getNetdiskInfoMock,
          updateNetdiskInfo: updateNetdiskInfoMock
        }
      },
      apiCall: apiCallMock,
      showError: showErrorMock,
      showSuccess: showSuccessMock
    }));
    jest.doMock('../utils/testMode', () => ({
      testModeManager: {
        isTestMode: jest.fn(() => false),
        setupPageHotReload: setupPageHotReloadMock
      }
    }));
    jest.doMock('../utils/environment', () => ({ getEnvironmentInfo: jest.fn() }));

    global.wx = {
      getStorageSync: jest.fn((key) => storage[key]),
      setStorageSync: jest.fn((key, value) => { storage[key] = value; }),
      navigateBack: jest.fn(),
      switchTab: jest.fn()
    };
    global.Page = jest.fn((config) => { pageConfig = config; });

    require('../pages/attendance/netdisk/index.js');
    page = createPageInstance(pageConfig);
  });

  test('loads salary settings before company verification succeeds', async () => {
    apiCallMock.mockImplementation((_operation, _loadingText, onSuccess) => {
      onSuccess({ data: { id: 24, real_name: '孙乐', is_admin: false } });
    });
    page.onLoad();
    await Promise.resolve();

    expect(page.data.companyVerified).toBe(false);
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(getNetdiskInfoMock).toHaveBeenCalledWith('孙乐', { salaryOnly: true });
    expect(setupPageHotReloadMock).toHaveBeenCalledTimes(1);

    page.onCompanyVerificationInput({ detail: { value: '其他公司' } });
    page.confirmCompanyVerification();

    expect(page.data.companyVerified).toBe(false);
    expect(page.data.companyVerificationError).toContain('未通过');
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(getNetdiskInfoMock).toHaveBeenCalledTimes(1);
  });

  test('stores successful verification for this user before loading settings', () => {
    page.onLoad();
    page.onCompanyVerificationInput({ detail: { value: '南京力禧特' } });
    page.confirmCompanyVerification();

    const key = 'company_netdisk_verified_v1:openid-company-user';
    expect(storage[key]).toBe(true);
    expect(page.data.companyVerified).toBe(true);
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(setupPageHotReloadMock).toHaveBeenCalledTimes(1);
  });

  test('opens settings immediately when this user has already verified', () => {
    storage['company_netdisk_verified_v1:openid-company-user'] = true;
    page.onLoad();

    expect(page.data.companyVerified).toBe(true);
    expect(apiCallMock).toHaveBeenCalledTimes(1);
  });

  test('saves salary settings without verification and omits netdisk credentials', () => {
    updateNetdiskInfoMock.mockReturnValue({
      data: {
        name: '孙乐',
        is_auto_create_salary: true,
        base_salary: 7500,
        overtime_pay_per_day: 15.3,
        overtime_pay_per_hour: 22.4,
        domestic_allowance_per_trip_day: 100,
        meal_allowance_per_trip_day: 0,
        work_rest_mode: 'double_rest'
      }
    });
    apiCallMock.mockImplementation((operation, _loadingText, onSuccess) => {
      onSuccess(operation());
    });
    page.setData({
      companyVerified: false,
      formData: {
        user_name: '孙乐',
        sony_username: '',
        sony_password: '',
        is_auto_create_salary: true,
        is_upload_to_netdisk: true,
        base_salary: '7500',
        overtime_pay_per_day: '15.3',
        overtime_pay_per_hour: '22.4',
        domestic_allowance_per_trip_day: '100',
        meal_allowance_per_trip_day: '0',
        work_rest_mode: 'double_rest'
      }
    });

    page.saveNetdiskInfo();

    expect(showErrorMock).not.toHaveBeenCalled();
    expect(updateNetdiskInfoMock).toHaveBeenCalledTimes(1);
    const payload = updateNetdiskInfoMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      user_name: '孙乐',
      update_netdisk_credentials: false,
      base_salary: 7500,
      overtime_pay_per_hour: 22.4
    });
    expect(payload).not.toHaveProperty('sony_username');
    expect(payload).not.toHaveProperty('sony_password');
    expect(payload).not.toHaveProperty('is_upload_to_netdisk');
    expect(showSuccessMock).toHaveBeenCalledWith('工资条配置保存成功');
  });
});
