/**
 * Mock数据工具
 * 为游客模式提供模拟数据，让用户可以完整体验功能
 */

/**
 * Mock用户信息
 */
const mockUserInfo = {
  openid: 'mock_openid_guest',
  nickname: '体验用户',
  avatarUrl: '/static/default-avatar.png',
  avatar_url: '/static/default-avatar.png',
  real_name: '张三',
  realName: '张三',
  role: 'user',
  isGuest: true
};

/**
 * Mock电费数据
 */
const mockElectricData = {
  // 当前余额
  balance: 156.80,
  // 本月用电量
  currentMonthUsage: 328.5,
  // 上月用电量
  lastMonthUsage: 285.2,
  // 历史记录
  history: [
    {
      date: '2025-10',
      usage: 328.5,
      cost: 143.20,
      balance: 156.80,
      avgDailyUsage: 10.6
    },
    {
      date: '2025-09',
      usage: 285.2,
      cost: 125.50,
      balance: 300.00,
      avgDailyUsage: 9.5
    },
    {
      date: '2025-08',
      usage: 312.8,
      cost: 137.80,
      balance: 425.50,
      avgDailyUsage: 10.1
    },
    {
      date: '2025-07',
      usage: 345.6,
      cost: 152.10,
      balance: 563.30,
      avgDailyUsage: 11.2
    },
    {
      date: '2025-06',
      usage: 298.4,
      cost: 131.20,
      balance: 715.40,
      avgDailyUsage: 9.9
    },
    {
      date: '2025-05',
      usage: 268.9,
      cost: 118.30,
      balance: 846.60,
      avgDailyUsage: 8.7
    }
  ],
  // 图表数据
  chartData: {
    months: ['5月', '6月', '7月', '8月', '9月', '10月'],
    usage: [268.9, 298.4, 345.6, 312.8, 285.2, 328.5],
    cost: [118.30, 131.20, 152.10, 137.80, 125.50, 143.20]
  },
  // 绑定的账号信息
  boundAccounts: [
    {
      id: 'mock_account_1',
      accountNumber: '1234****5678',
      userName: '张三',
      address: '示例市示例区示例路123号',
      bindTime: '2025-05-01'
    }
  ]
};

/**
 * Mock考勤数据
 */
const mockAttendanceData = {
  // 当前月份统计
  currentMonth: {
    year: 2025,
    month: 10,
    totalDays: 20,
    attendedDays: 18,
    leaveDays: 2,
    absentDays: 0,
    attendanceRate: '90%'
  },
  // 考勤记录
  records: [
    {
      id: 'mock_record_1',
      date: '2025-10-14',
      status: 'attended',
      statusText: '已出勤',
      imageUrl: '/static/mock-attendance.png',
      remark: '正常出勤',
      submitTime: '2025-10-14 09:00:00'
    },
    {
      id: 'mock_record_2',
      date: '2025-10-13',
      status: 'attended',
      statusText: '已出勤',
      imageUrl: '/static/mock-attendance.png',
      remark: '正常出勤',
      submitTime: '2025-10-13 09:15:00'
    },
    {
      id: 'mock_record_3',
      date: '2025-10-12',
      status: 'attended',
      statusText: '已出勤',
      imageUrl: '/static/mock-attendance.png',
      remark: '正常出勤',
      submitTime: '2025-10-12 08:55:00'
    },
    {
      id: 'mock_record_4',
      date: '2025-10-11',
      status: 'leave',
      statusText: '请假',
      imageUrl: '',
      remark: '事假',
      submitTime: '2025-10-11 08:00:00'
    },
    {
      id: 'mock_record_5',
      date: '2025-10-10',
      status: 'attended',
      statusText: '已出勤',
      imageUrl: '/static/mock-attendance.png',
      remark: '正常出勤',
      submitTime: '2025-10-10 09:05:00'
    }
  ],
  // 月度统计
  monthlyStats: [
    { month: '2025-10', rate: '90%', attended: 18, total: 20 },
    { month: '2025-09', rate: '95%', attended: 21, total: 22 },
    { month: '2025-08', rate: '100%', attended: 23, total: 23 },
    { month: '2025-07', rate: '91%', attended: 20, total: 22 },
    { month: '2025-06', rate: '96%', attended: 21, total: 22 },
    { month: '2025-05', rate: '100%', attended: 21, total: 21 }
  ]
};

/**
 * Mock使用记录
 */
const mockUsageHistory = [
  {
    id: 1,
    feature: '电费查询',
    action: '查询余额',
    time: '2025-10-14 14:30:25',
    result: '成功'
  },
  {
    id: 2,
    feature: '考勤管理',
    action: '查看考勤记录',
    time: '2025-10-14 10:15:10',
    result: '成功'
  },
  {
    id: 3,
    feature: '电费查询',
    action: '查看历史记录',
    time: '2025-10-13 16:20:30',
    result: '成功'
  },
  {
    id: 4,
    feature: '个人中心',
    action: '查看个人信息',
    time: '2025-10-13 09:05:15',
    result: '成功'
  }
];

/**
 * 检查是否为游客模式
 */
function isGuestMode() {
  return wx.getStorageSync('isGuestMode') === true;
}

/**
 * 获取用户信息（游客返回mock数据）
 */
function getUserInfo() {
  if (isGuestMode()) {
    return mockUserInfo;
  }
  // 返回真实用户信息
  return {
    openid: wx.getStorageSync('openid'),
    nickname: wx.getStorageSync('nickname'),
    avatarUrl: wx.getStorageSync('avatarUrl'),
    realName: wx.getStorageSync('realName'),
    role: wx.getStorageSync('role'),
    isGuest: false
  };
}

/**
 * 获取电费数据（游客返回mock数据）
 */
function getElectricData() {
  if (isGuestMode()) {
    return Promise.resolve({
      success: true,
      data: mockElectricData,
      message: '这是演示数据，登录后可查询真实电费'
    });
  }
  // 返回真实数据获取Promise
  return null; // 调用真实API
}

/**
 * 获取考勤数据（游客返回mock数据）
 */
function getAttendanceData() {
  if (isGuestMode()) {
    return Promise.resolve({
      success: true,
      data: mockAttendanceData,
      message: '这是演示数据，登录后可查看真实考勤'
    });
  }
  // 返回真实数据获取Promise
  return null; // 调用真实API
}

/**
 * 获取使用记录（游客返回mock数据）
 */
function getUsageHistory() {
  if (isGuestMode()) {
    return Promise.resolve({
      success: true,
      data: mockUsageHistory,
      message: '这是演示数据'
    });
  }
  // 返回真实数据获取Promise
  return null; // 调用真实API
}

/**
 * 显示游客模式提示
 */
function showGuestModeTip(page = '') {
  const tips = {
    'electric': '当前为体验模式，显示的是演示数据。\n登录后可查询真实电费信息。',
    'attendance': '当前为体验模式，显示的是演示数据。\n登录后可管理真实考勤记录。',
    'submit': '体验模式下无法提交数据。\n请登录后使用完整功能。',
    'default': '当前为体验模式，部分功能需要登录后使用。'
  };
  
  wx.showModal({
    title: '💡 体验模式提示',
    content: tips[page] || tips['default'],
    showCancel: true,
    confirmText: '立即登录',
    cancelText: '继续体验',
    success: (res) => {
      if (res.confirm) {
        // 跳转到登录页
        wx.redirectTo({
          url: '/pages/login/index'
        });
      }
    }
  });
}

module.exports = {
  isGuestMode,
  getUserInfo,
  getElectricData,
  getAttendanceData,
  getUsageHistory,
  showGuestModeTip,
  mockUserInfo,
  mockElectricData,
  mockAttendanceData,
  mockUsageHistory
};

