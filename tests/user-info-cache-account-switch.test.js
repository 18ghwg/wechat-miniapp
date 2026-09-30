describe('UserInfoCache account isolation', () => {
  let storage;
  let serverUser;
  let getInfo;

  beforeEach(() => {
    jest.resetModules();
    storage = {};
    serverUser = null;
    getInfo = jest.fn(() => Promise.resolve({ data: serverUser }));

    global.wx = {
      getStorageSync: jest.fn((key) => storage[key]),
      setStorageSync: jest.fn((key, value) => {
        storage[key] = value;
      })
    };

    jest.doMock('../utils/api', () => ({
      API: {
        user: {
          getInfo
        }
      },
      apiCall(request, loadingMessage, onSuccess, onFailure) {
        return Promise.resolve()
          .then(request)
          .then(onSuccess)
          .catch(onFailure);
      }
    }));
  });

  afterEach(() => {
    delete global.wx;
  });

  test('refetches user information after the openid changes', async () => {
    storage.openid = 'openid-zhangsan';
    serverUser = { openid: 'openid-zhangsan', real_name: '张三' };
    const { userInfoCache } = require('../utils/user-info-cache');

    await expect(userInfoCache.get()).resolves.toEqual(expect.objectContaining({
      real_name: '张三'
    }));

    storage.openid = 'openid-lisi';
    storage.userInfo = { openid: 'openid-lisi', real_name: '李四' };
    serverUser = { openid: 'openid-lisi', real_name: '李四' };

    await expect(userInfoCache.get()).resolves.toEqual(expect.objectContaining({
      real_name: '李四'
    }));
    expect(getInfo).toHaveBeenCalledTimes(2);
  });
});
