/**
 * 微信小程序版本更新检查。
 *
 * wx.getUpdateManager() 会由微信对比当前包和线上已发布包，
 * 因此 hasUpdate 就是当前用户版本与线上版本不一致的信号。
 */

function isUpdateManagerSupported() {
  try {
    return typeof wx !== 'undefined'
      && typeof wx.canIUse === 'function'
      && wx.canIUse('getUpdateManager')
      && typeof wx.getUpdateManager === 'function';
  } catch (error) {
    return false;
  }
}

function getCurrentVersion() {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.version) || '未知';
  } catch (error) {
    return '未知';
  }
}

function checkForUpdate() {
  if (!isUpdateManagerSupported()) {
    return null;
  }

  let updateManager;
  try {
    updateManager = wx.getUpdateManager();
  } catch (error) {
    console.warn('获取小程序更新管理器失败:', error);
    return null;
  }

  if (!updateManager) {
    return null;
  }

  const currentVersion = getCurrentVersion();
  let updatePromptShown = false;

  if (typeof updateManager.onCheckForUpdate === 'function') {
    updateManager.onCheckForUpdate((result) => {
      if (result && result.hasUpdate) {
        console.log(`检测到线上新版本，当前版本: ${currentVersion}`);
      }
    });
  }

  if (typeof updateManager.onUpdateReady === 'function') {
    updateManager.onUpdateReady(() => {
      if (updatePromptShown || typeof wx.showModal !== 'function') {
        return;
      }

      updatePromptShown = true;
      wx.showModal({
        title: '发现新版本',
        content: currentVersion === '未知'
          ? '线上已发布新版本，点击“立即更新”获取最新版。'
          : `当前版本 v${currentVersion}，线上已发布新版本，点击“立即更新”获取最新版。`,
        confirmText: '立即更新',
        cancelText: '稍后再说',
        success(result) {
          if (result && result.confirm && typeof updateManager.applyUpdate === 'function') {
            updateManager.applyUpdate();
          }
        }
      });
    });
  }

  if (typeof updateManager.onUpdateFailed === 'function') {
    updateManager.onUpdateFailed(() => {
      updatePromptShown = false;
      if (typeof wx.showModal !== 'function') {
        return;
      }

      wx.showModal({
        title: '更新失败',
        content: '新版本下载失败，请检查网络后重试。',
        showCancel: false,
        confirmText: '知道了'
      });
    });
  }

  return updateManager;
}

module.exports = {
  checkForUpdate,
  getCurrentVersion,
  isUpdateManagerSupported
};
