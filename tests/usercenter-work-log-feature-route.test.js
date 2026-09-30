describe('usercenter work log frequent feature route', () => {
  let pageConfig;
  let pageInstance;
  let wxMock;
  let userInfoCache;

  function createPageInstance(config) {
    const instance = {
      data: JSON.parse(JSON.stringify(config.data)),
      setData(updates) {
        Object.keys(updates).forEach((key) => {
          this.data[key] = updates[key];
        });
      },
      getTabBar() {
        return { init: jest.fn() };
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

    jest.doMock('../utils/api', () => ({
      API: {},
      apiCall: jest.fn(),
      showError: jest.fn(),
      showSuccess: jest.fn()
    }));

    jest.doMock('../utils/avatar-generator', () => ({}));
    jest.doMock('../utils/testMode', () => ({
      testModeManager: {
        isTestMode: jest.fn(() => false),
        fetchGlobalTestModeFromServer: jest.fn(() => Promise.resolve()),
        setTestMode: jest.fn(() => Promise.resolve(true))
      }
    }));
    jest.doMock('../utils/mock-data', () => ({
      isGuestMode: jest.fn(() => false)
    }));
    jest.doMock('../utils/feature-usage', () => ({
      recordFeatureUsage: jest.fn(),
      getFrequentFeatures: jest.fn(() => Promise.resolve([]))
    }));
    userInfoCache = {
      clear: jest.fn(),
      get: jest.fn()
    };
    jest.doMock('../utils/user-info-cache', () => ({ userInfoCache }));
    jest.doMock('../utils/miniprogram-info', () => ({
      miniprogramInfo: {
        getAppName: jest.fn(() => 'test-app')
      }
    }));
    jest.doMock('../utils/system-info', () => ({
      isDevtools: jest.fn(() => false)
    }));

    wxMock = {
      navigateTo: jest.fn(),
      switchTab: jest.fn(),
      showToast: jest.fn(),
      getStorageSync: jest.fn(() => ''),
      removeStorageSync: jest.fn(),
      showShareMenu: jest.fn(),
      stopPullDownRefresh: jest.fn(),
      reLaunch: jest.fn()
    };

    global.wx = wxMock;
    global.Page = jest.fn((config) => {
      pageConfig = config;
    });

    require('../pages/usercenter/index.js');
    pageInstance = createPageInstance(pageConfig);
  });

  test('navigates work-log frequent feature to work log page', () => {
    pageInstance.navigateToFeature({
      currentTarget: {
        dataset: {
          featureKey: 'work-log',
          featureName: '工作日志'
        }
      }
    });

    expect(wxMock.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
      url: '/pages/work-log/index'
    }));
    expect(wxMock.switchTab).not.toHaveBeenCalled();
    expect(wxMock.showToast).not.toHaveBeenCalledWith(expect.objectContaining({
      title: '功能暂不可用'
    }));
  });

  test('keeps unknown frequent feature unavailable', () => {
    pageInstance.navigateToFeature({
      currentTarget: {
        dataset: {
          featureKey: 'unknown-feature',
          featureName: '未知功能'
        }
      }
    });

    expect(wxMock.navigateTo).not.toHaveBeenCalled();
    expect(wxMock.showToast).toHaveBeenCalledWith(expect.objectContaining({
      title: '功能暂不可用'
    }));
  });

  test('exposes DingTalk settings in the normal account menu', () => {
    expect(pageInstance.data.accountMenuItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'dingtalkConfig' })
    ]));

    pageInstance.handleAccountAction({
      currentTarget: { dataset: { action: 'dingtalkConfig' } }
    });

    expect(wxMock.navigateTo).toHaveBeenCalledWith(expect.objectContaining({
      url: '/pages/admin/dingtalk-settings/index'
    }));
  });

  test('opens feedback from the normal account menu', () => {
    expect(pageInstance.data.accountMenuItems).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'feedback' })
    ]));
    pageInstance.handleAccountAction({ currentTarget: { dataset: { action: 'feedback' } } });
    expect(wxMock.navigateTo).toHaveBeenCalledWith(expect.objectContaining({ url: '/pages/feedback/index' }));
  });

  test('applies configured labels and hides disabled account entries', () => {
    const items = pageInstance.applyUserCenterMenuConfig({
      items: [
        { key: 'workLog', label: '每日工作记录', enabled: true },
        { key: 'bindWeb', label: '账号绑定', enabled: true },
        { key: 'expense', label: '报销管理', enabled: false }
      ]
    });

    expect(items.slice(0, 3).map(item => item.action)).toEqual(['workLog', 'bindWeb', 'updateInfo']);
    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'bindWeb', label: '账号绑定' }),
      expect.objectContaining({ action: 'workLog', label: '每日工作记录' })
    ]));
    expect(items).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'expense' })
    ]));
    expect(pageInstance.data.accountMenuItems).toEqual(items);
  });

  test('keeps safe defaults when the backend menu config is absent', () => {
    const items = pageInstance.applyUserCenterMenuConfig(null);

    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({ action: 'bindWeb', label: 'Web账号管理' }),
      expect.objectContaining({ action: 'deleteAccount', label: '账号注销' })
    ]));
  });

  test('clears the in-memory user cache when logging out', () => {
    jest.useFakeTimers();

    pageInstance.logout();
    jest.advanceTimersByTime(1000);

    expect(userInfoCache.clear).toHaveBeenCalledTimes(1);
    expect(wxMock.removeStorageSync).toHaveBeenCalledWith('openid');
    expect(wxMock.removeStorageSync).toHaveBeenCalledWith('userInfo');
    expect(wxMock.reLaunch).toHaveBeenCalledWith({ url: '/pages/login/index' });

    jest.useRealTimers();
  });
});
