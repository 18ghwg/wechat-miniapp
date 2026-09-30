describe('mini program update manager', () => {
  let callbacks;
  let modalOptions;
  let applyUpdate;

  beforeEach(() => {
    callbacks = {};
    modalOptions = [];
    applyUpdate = jest.fn();

    global.wx = {
      canIUse: jest.fn(() => true),
      getAccountInfoSync: jest.fn(() => ({ miniProgram: { version: '1.1.15' } })),
      getUpdateManager: jest.fn(() => ({
        onCheckForUpdate: jest.fn((callback) => { callbacks.check = callback; }),
        onUpdateReady: jest.fn((callback) => { callbacks.ready = callback; }),
        onUpdateFailed: jest.fn((callback) => { callbacks.failed = callback; }),
        applyUpdate
      })),
      showModal: jest.fn((options) => { modalOptions.push(options); })
    };

    jest.resetModules();
  });

  afterEach(() => {
    delete global.wx;
  });

  test('applies the downloaded release after the user confirms', () => {
    const { checkForUpdate } = require('../utils/update-manager');
    checkForUpdate();

    callbacks.check({ hasUpdate: true });
    callbacks.ready();

    expect(modalOptions[0]).toEqual(expect.objectContaining({
      title: '发现新版本',
      confirmText: '立即更新'
    }));
    expect(modalOptions[0].content).toContain('1.1.15');
    modalOptions[0].success({ confirm: true });
    expect(applyUpdate).toHaveBeenCalledTimes(1);
  });

  test('does not apply the update when the user postpones it', () => {
    const { checkForUpdate } = require('../utils/update-manager');
    checkForUpdate();
    callbacks.ready();
    modalOptions[0].success({ confirm: false });

    expect(applyUpdate).not.toHaveBeenCalled();
  });

  test('reports a failed download', () => {
    const { checkForUpdate } = require('../utils/update-manager');
    checkForUpdate();
    callbacks.failed();

    expect(modalOptions[0]).toEqual(expect.objectContaining({
      title: '更新失败',
      showCancel: false
    }));
  });

  test('skips the check when the platform does not support UpdateManager', () => {
    global.wx.canIUse.mockReturnValue(false);
    const { checkForUpdate } = require('../utils/update-manager');

    expect(checkForUpdate()).toBeNull();
    expect(global.wx.getUpdateManager).not.toHaveBeenCalled();
  });
});
