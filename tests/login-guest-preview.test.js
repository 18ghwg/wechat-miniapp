const fs = require('fs');
const path = require('path');

function createPageInstance(config) {
  const instance = {
    data: JSON.parse(JSON.stringify(config.data)),
    setData(updates, callback) {
      Object.keys(updates).forEach((key) => {
        const parts = key.split('.');
        let target = this.data;
        for (let index = 0; index < parts.length - 1; index += 1) {
          target[parts[index]] = target[parts[index]] || {};
          target = target[parts[index]];
        }
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

describe('WeChat-first login', () => {
  let page;
  let showError;
  let showSuccess;
  let apiCall;
  let authLogin;
  let accountLogin;
  let userInfoCache;

  beforeEach(() => {
    jest.resetModules();
    showError = jest.fn();
    showSuccess = jest.fn();
    authLogin = jest.fn();
    accountLogin = jest.fn();
    userInfoCache = {
      clear: jest.fn(),
      update: jest.fn((userInfo) => {
        global.wx.setStorageSync('userInfo', userInfo);
      })
    };
    apiCall = jest.fn((request, loadingMessage, onSuccess, onFailure) =>
      Promise.resolve()
        .then(request)
        .then(onSuccess)
        .catch(onFailure)
    );
    jest.doMock('../utils/api', () => ({
      API: {
        auth: {
          login: (...args) => authLogin(...args),
          accountLogin: (...args) => accountLogin(...args)
        }
      },
      apiCall,
      showError,
      showSuccess
    }));
    jest.doMock('../utils/miniprogram-info', () => ({
      miniprogramInfo: {
        getAppName: jest.fn(() => '出差日历'),
        getAppDescription: jest.fn(() => '出差日历'),
        getVersion: jest.fn(() => '1.0.0')
      }
    }));
    jest.doMock('../utils/user-info-cache', () => ({ userInfoCache }));
    global.wx = {
      getStorageSync: jest.fn(() => ''),
      getUserProfile: jest.fn(),
      login: jest.fn(),
      showModal: jest.fn(),
      setStorageSync: jest.fn(),
      removeStorageSync: jest.fn(),
      showToast: jest.fn(),
      showLoading: jest.fn(),
      hideLoading: jest.fn(),
      reLaunch: jest.fn()
    };
    global.Page = jest.fn((config) => {
      page = createPageInstance(config);
    });
    require('../pages/login/index.js');
  });

  test('renders WeChat as the primary action before the secondary account form', () => {
    const wxml = fs.readFileSync(
      path.join(__dirname, '../pages/login/index.wxml'),
      'utf8'
    );

    expect(page.data.loginMode).toBe('wechat');
    expect(wxml.indexOf('wechat-login-primary')).toBeGreaterThan(-1);
    expect(wxml.indexOf('wechat-login-primary')).toBeLessThan(wxml.indexOf('account-login-form'));
    expect(wxml).toContain('bindtap="getUserProfile"');
    expect(wxml).toContain('wx:if="{{loginMode === \'account\'}}"');
  });

  test('continues to code login when the user declines profile authorization', () => {
    page.data.agreed = true;
    global.wx.getUserProfile.mockImplementation(({ fail }) => {
      fail({ errMsg: 'getUserProfile:fail auth deny' });
    });
    global.wx.login.mockImplementation(({ fail }) => {
      fail({ errMsg: 'login:fail network error' });
    });

    page.getUserProfile();

    expect(global.wx.login).toHaveBeenCalledTimes(1);
    expect(showError).toHaveBeenCalledWith('微信登录失败，请重试');
    expect(page.data.loginLoading).toBe(false);
  });

  test('requests profile during the tap and falls back to code login when profile fails', async () => {
    jest.useFakeTimers();
    page.data.agreed = true;
    global.wx.getPrivacySetting = jest.fn(({ success }) => {
      success({ needAuthorization: true });
    });
    global.wx.requirePrivacyAuthorize = jest.fn();
    global.wx.getUserProfile.mockImplementation(({ fail }) => {
      fail({ errMsg: 'getUserProfile:fail can only be invoked by user TAP gesture' });
    });
    global.wx.login.mockImplementation(({ success }) => {
      success({ code: 'wechat-code-without-profile' });
    });
    authLogin.mockResolvedValue({
      data: {
        openid: 'openid-without-profile',
        userInfo: { nickname: '微信用户12345', permissions: [] }
      }
    });

    page.getUserProfile();
    for (let index = 0; index < 8; index += 1) {
      await Promise.resolve();
    }

    expect(global.wx.getUserProfile).toHaveBeenCalledTimes(1);
    expect(global.wx.getPrivacySetting).not.toHaveBeenCalled();
    expect(global.wx.requirePrivacyAuthorize).not.toHaveBeenCalled();
    expect(global.wx.login).toHaveBeenCalledTimes(1);
    expect(authLogin).toHaveBeenCalledWith('wechat-code-without-profile', expect.objectContaining({
      nickName: ''
    }));
    jest.advanceTimersByTime(1000);
    jest.useRealTimers();
  });

  test('explains when the WeChat developer tool session must be re-authenticated', () => {
    page.data.agreed = true;
    global.wx.login.mockImplementation(({ fail }) => {
      fail({ errMsg: 'login:fail 需要重新登录, [20260916 12:32:33]' });
    });

    page.onWechatLogin();

    expect(showError).toHaveBeenCalledWith('微信开发者工具登录状态已失效，请重新登录开发者工具后再试');
    expect(page.data.loginLoading).toBe(false);
  });

  test('completes authorization, WeChat login, storage, and home redirect on success', async () => {
    jest.useFakeTimers();
    page.data.agreed = true;
    global.wx.getUserProfile.mockImplementation(({ success }) => {
      success({ userInfo: { nickName: '孙乐', avatarUrl: 'https://example.com/avatar.png' } });
    });
    global.wx.login.mockImplementation(({ success }) => {
      success({ code: 'wechat-code-123' });
    });
    authLogin.mockResolvedValue({
      data: {
        openid: 'openid-123',
        userInfo: { nickname: '孙乐', permissions: [] }
      }
    });

    page.getUserProfile();
    for (let index = 0; index < 8; index += 1) {
      await Promise.resolve();
    }

    expect(global.wx.getUserProfile).toHaveBeenCalledWith(expect.objectContaining({
      desc: expect.stringContaining('昵称')
    }));
    expect(global.wx.login).toHaveBeenCalledTimes(1);
    expect(authLogin).toHaveBeenCalledWith('wechat-code-123', expect.objectContaining({
      nickName: '孙乐',
      nickname: '孙乐'
    }));
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('openid', 'openid-123');
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('userInfo', expect.objectContaining({
      nickname: '孙乐',
      useGeneratedAvatar: true,
      avatarSeed: '3'
    }));
    expect(userInfoCache.update).toHaveBeenCalledWith(expect.objectContaining({
      nickname: '孙乐',
      avatarSeed: '3'
    }));
    expect(page.data.loginLoading).toBe(false);

    jest.advanceTimersByTime(1000);
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/attendance/index' });
    jest.useRealTimers();
  });

  test('updates the in-memory user cache after account login', async () => {
    jest.useFakeTimers();
    page.data.username = 'lisi';
    page.data.password = 'secret';
    page.data.captchaVerified = true;
    page.data.captchaToken = 'captcha-token';
    accountLogin.mockResolvedValue({
      code: 200,
      data: {
        openid: 'account-openid-456',
        userInfo: { nickname: '李四', permissions: [] }
      }
    });

    page.doAccountLogin();
    for (let index = 0; index < 6; index += 1) {
      await Promise.resolve();
    }

    expect(accountLogin).toHaveBeenCalledWith('lisi', 'secret', 'captcha-token');
    expect(global.wx.setStorageSync).toHaveBeenCalledWith('openid', 'account-openid-456');
    expect(userInfoCache.update).toHaveBeenCalledWith(expect.objectContaining({
      nickname: '李四'
    }));
    expect(showSuccess).toHaveBeenCalledWith('登录成功');

    jest.advanceTimersByTime(1000);
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/attendance/index' });
    jest.useRealTimers();
  });

  test('offers existing account binding after a new WeChat registration', async () => {
    let modalOptions;
    page.data.agreed = true;
    global.wx.showModal.mockImplementation((options) => {
      modalOptions = options;
    });
    global.wx.login.mockImplementation(({ success }) => {
      success({ code: 'new-wechat-code' });
    });
    authLogin.mockResolvedValue({
      data: {
        openid: 'new-openid',
        userInfo: { nickname: '微信用户penid', permissions: [], is_web_bound: false },
        is_new_user: true,
        requires_account_binding: true
      }
    });

    page.onWechatLogin();
    for (let index = 0; index < 8; index += 1) {
      await Promise.resolve();
    }

    expect(global.wx.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: '注册成功',
      confirmText: '绑定账号',
      cancelText: '暂不绑定'
    }));
    expect(global.wx.reLaunch).not.toHaveBeenCalled();

    modalOptions.success({ confirm: true });
    expect(global.wx.reLaunch).toHaveBeenCalledWith({
      url: '/pages/user/bind/index?source=new-user'
    });
  });

  test('contains no local test administrator login path', () => {
    const loginSource = fs.readFileSync(
      path.join(__dirname, '../pages/login/index.js'),
      'utf8'
    );
    const testModeSource = fs.readFileSync(
      path.join(__dirname, '../utils/testMode.js'),
      'utf8'
    );

    expect(loginSource).not.toContain('doTestLogin');
    expect(loginSource).not.toContain("setStorageSync('isTestMode'");
    expect(testModeSource).not.toContain("getStorageSync('isTestMode'");
  });
});

describe('guest preview data boundary', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('returns only empty data without an openid', async () => {
    global.wx = {
      getStorageSync: jest.fn((key) => (key === 'isGuestMode' ? true : ''))
    };
    const guestMode = require('../utils/mock-data');

    const user = guestMode.getUserInfo();
    const electric = await guestMode.getElectricData();
    const attendance = await guestMode.getAttendanceData();
    const usage = await guestMode.getUsageHistory();

    expect(user.openid).toBe('');
    expect(user.real_name).toBe('');
    expect(electric.data.history).toEqual([]);
    expect(electric.data.boundAccounts).toEqual([]);
    expect(electric.data.chartData).toEqual({ months: [], usage: [], cost: [] });
    expect(attendance.data.records).toEqual([]);
    expect(attendance.data.monthlyStats).toEqual([]);
    expect(usage.data).toEqual([]);
  });

  test('prompts for WeChat login and routes to the login page after confirmation', () => {
    let modalOptions;
    global.wx = {
      getStorageSync: jest.fn(() => ''),
      showModal: jest.fn((options) => {
        modalOptions = options;
      }),
      reLaunch: jest.fn()
    };
    const guestMode = require('../utils/mock-data');

    expect(guestMode.showGuestModeTip('attendance')).toBe(true);
    expect(global.wx.showModal).toHaveBeenCalledWith(expect.objectContaining({
      title: '请先登录',
      confirmText: '微信登录'
    }));

    modalOptions.success({ confirm: true });
    modalOptions.complete();
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: '/pages/login/index' });
  });
});

describe('attendance guest actions', () => {
  let page;
  let showGuestModeTip;

  beforeEach(() => {
    jest.resetModules();
    showGuestModeTip = jest.fn(() => true);
    jest.doMock('../utils/api', () => ({
      API: { attendance: {} },
      apiCall: jest.fn(),
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));
    jest.doMock('../utils/testMode', () => ({
      testModeManager: { isTestMode: jest.fn(() => false) }
    }));
    jest.doMock('../utils/mock-data', () => ({
      isGuestMode: jest.fn(() => true),
      showGuestModeTip
    }));
    jest.doMock('../utils/feature-usage', () => ({ recordFeatureUsage: jest.fn() }));
    jest.doMock('../utils/user-info-cache', () => ({
      userInfoCache: { clear: jest.fn(), get: jest.fn() }
    }));
    jest.doMock('../utils/performance-monitor', () => ({
      performanceMonitor: { mark: jest.fn(), measure: jest.fn() },
      PERF_TYPES: {}
    }));
    jest.doMock('../utils/miniprogram-info', () => ({
      miniprogramInfo: { getAppName: jest.fn(() => '出差日历') }
    }));
    jest.doMock('../utils/system-info', () => ({ isDevtools: jest.fn(() => false) }));
    global.wx = {
      stopPullDownRefresh: jest.fn(),
      getStorageSync: jest.fn(() => ''),
      showModal: jest.fn()
    };
    global.Page = jest.fn((config) => {
      page = createPageInstance(config);
    });
    require('../pages/attendance/index.js');
  });

  test('keeps user, current attendance and recent records empty', () => {
    page.loadUserInfo();
    page.loadTodayAttendance();
    page.loadRecentAttendance();

    expect(page.data.currentUser).toBeNull();
    expect(page.data.todayAttendance).toBeNull();
    expect(page.data.todayCheckedIn).toBe(false);
    expect(page.data.recentAttendance).toEqual([]);
  });

  test('routes the main check-in action through the login prompt', () => {
    page.onOpenCheckInModal();

    expect(showGuestModeTip).toHaveBeenCalledWith('submit');
    expect(page.data.showCheckinModal).toBe(false);
  });
});
