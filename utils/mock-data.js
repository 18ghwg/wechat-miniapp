/**
 * 未登录预览状态工具。
 *
 * 保留历史文件名以避免扩大改动范围，但游客模式只提供空状态，
 * 不会再生成或返回任何模拟业务数据。
 */

let loginPromptVisible = false;

function isGuestMode() {
  const openid = wx.getStorageSync('openid');
  return !openid || wx.getStorageSync('isGuestMode') === true;
}

function getUserInfo() {
  if (isGuestMode()) {
    return {
      openid: '',
      nickname: '',
      avatarUrl: '',
      avatar_url: '',
      realName: '',
      real_name: '',
      role: '',
      isGuest: true
    };
  }

  const userInfo = wx.getStorageSync('userInfo') || {};
  return Object.assign({}, userInfo, {
    openid: wx.getStorageSync('openid'),
    isGuest: false
  });
}

function getElectricData() {
  if (!isGuestMode()) {
    return null;
  }

  return Promise.resolve({
    success: true,
    data: {
      balance: null,
      currentMonthUsage: null,
      lastMonthUsage: null,
      history: [],
      chartData: { months: [], usage: [], cost: [] },
      boundAccounts: []
    },
    message: '登录后可查询本人电费数据'
  });
}

function getAttendanceData() {
  if (!isGuestMode()) {
    return null;
  }

  return Promise.resolve({
    success: true,
    data: {
      currentMonth: null,
      records: [],
      monthlyStats: []
    },
    message: '登录后可查看本人考勤数据'
  });
}

function getUsageHistory() {
  if (!isGuestMode()) {
    return null;
  }

  return Promise.resolve({
    success: true,
    data: [],
    message: '登录后可查看使用记录'
  });
}

function promptLogin(message = '该操作需要登录，是否前往微信一键登录？') {
  if (!isGuestMode()) {
    return false;
  }

  if (loginPromptVisible) {
    return true;
  }

  loginPromptVisible = true;
  wx.showModal({
    title: '请先登录',
    content: message,
    showCancel: true,
    confirmText: '微信登录',
    cancelText: '继续预览',
    success: (res) => {
      if (res.confirm) {
        wx.reLaunch({ url: '/pages/login/index' });
      }
    },
    complete: () => {
      loginPromptVisible = false;
    }
  });

  return true;
}

function showGuestModeTip(page = '') {
  const tips = {
    electric: '查询电费需要先完成微信登录。',
    attendance: '查看或编辑考勤数据需要先完成微信登录。',
    submit: '提交数据需要先完成微信登录。',
    default: '该操作需要先完成微信登录。'
  };

  return promptLogin(tips[page] || tips.default);
}

module.exports = {
  isGuestMode,
  getUserInfo,
  getElectricData,
  getAttendanceData,
  getUsageHistory,
  promptLogin,
  showGuestModeTip
};
