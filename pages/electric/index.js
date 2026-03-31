const { API, apiCall, showError, showSuccess, formatDateTimeCompatible } = require('../../utils/api');
const { testModeManager } = require('../../utils/testMode');
const featureUsage = require('../../utils/feature-usage');
const { chartOptimizer } = require('../../utils/chart-optimizer');
const { performanceMonitor, PERF_TYPES } = require('../../utils/performance-monitor');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { isDevtools } = require('../../utils/system-info');
const mockData = require('../../utils/mock-data'); // ⭐ 新增：引入mock数据工具

// ===== 性能优化：预编译正则表达式和常量 =====
const PLACEHOLDER_STRINGS = new Set(['', '未查询', '未更新', '未知', 'Unknown']);

// 预编译正则表达式（避免每次调用时重新编译）
const REGEX_CURRENCY = /[¥￥元]/g;
const REGEX_UNIT_DEGREE = /度$/;
const REGEX_UNIT_CLEAN = /[度kWh千瓦时\s]/gi;
const REGEX_CURRENCY_CLEAN = /[¥￥元\s]/g;
const REGEX_DECIMAL_ZEROS = /\.00$/;

// 字段映射配置（减少重复的字段查找）
const FIELD_MAP = {
  roomName: ['RoomName', 'room_name', 'account_number', 'account_name', 'house_name', 'phone_name'],
  ownerName: ['RoomOwnerName', 'room_owner_name', 'account_name', 'consName_dst', 'house_name'],
  balance: ['Balance', 'balance', 'balance_num', 'balance_value'],
  checkTime: ['CheckTime', 'check_time', 'update_time', 'query_time', 'last_update_time'],
  lastDailyUsage: ['LastDailyUsage', 'last_daily_usage', 'today_power', 'latest_day_power', 'last_daily_power'],
  monthUsage: ['MonthUsage', 'month_usage', 'current_month_power'],
  monthCharge: ['MonthCharge', 'month_charge', 'last_month_cost', 'current_month_cost'],
  gridAccount: ['grid_account', 'grid_account_phone', 'phone_name', 'account_phone'],
  lastDailyDate: ['LastDailyDate', 'last_daily_date', 'latest_date', 'work_date', 'daily_date'],
  dailyUsage: ['LastDailyUsage', 'last_daily_usage', 'today_power', 'latest_day_power', 'last_daily_power', 'daily_usage', 'dailyUsage', 'todayUsage', 'today_usage', 'dailyPower', 'daily_power'],
  balanceNum: ['balance_num', 'balance', 'Balance', 'balance_value', 'balanceNum', 'balanceValue', 'cardBalance', 'card_balance']
};

/**
 * 快速获取第一个可用值（优化版）
 * @param {Object} obj - 数据对象
 * @param {Array} fields - 字段名数组
 * @returns {*} 第一个非空值
 */
const getFirstAvailable = (obj, fields) => {
  for (let i = 0; i < fields.length; i++) {
    const value = obj[fields[i]];
    if (value !== undefined && value !== null) {
      const trimmed = typeof value === 'string' ? value.trim() : value;
      if (trimmed !== '') {
        return value;
      }
    }
  }
  return undefined;
};

/**
 * 检查历史记录是否有效
 * @param {Object} raw - 原始数据
 * @returns {boolean} 是否有效
 */
const hasValidHistoryRecord = (raw = {}) => {
  // 使用优化后的getFirstAvailable
  const checkTimeCandidate = getFirstAvailable(raw, FIELD_MAP.checkTime);

  if (checkTimeCandidate === undefined || checkTimeCandidate === null) {
    return false;
  }

  const checkTimeStr = String(checkTimeCandidate).trim();
  if (PLACEHOLDER_STRINGS.has(checkTimeStr)) {
    return false;
  }

  const status = (raw.status || raw.status_text || '').toString().toLowerCase();
  if (status && (status.includes('no_data') || status.includes('无数据'))) {
    return false;
  }

  return true;
};

// ===== 性能优化：提取格式化函数到外部（避免重复创建） =====

/**
 * 格式化金额
 * @param {*} value - 金额值
 * @returns {string} 格式化后的金额字符串
 */
const formatAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return '0.00';
  }

  const stringValue = String(value).trim();
  const sanitized = stringValue.replace(REGEX_CURRENCY, '');
  const numericValue = Number(sanitized);

  if (!Number.isNaN(numericValue)) {
    const fixed = numericValue.toFixed(2);
    return fixed.replace(REGEX_DECIMAL_ZEROS, '');
  }

  return stringValue;
};

/**
 * 格式化用电量
 * @param {*} value - 用电量值
 * @returns {string} 格式化后的用电量字符串
 */
const formatUsage = (value) => {
  if (value === undefined || value === null || value === '') {
    return '--';
  }

  const stringValue = String(value).trim();
  if (!stringValue) {
    return '--';
  }

  if (REGEX_UNIT_DEGREE.test(stringValue)) {
    return stringValue;
  }

  const numericValue = Number(stringValue);
  if (!Number.isNaN(numericValue)) {
    const fixed = numericValue.toFixed(2).replace(REGEX_DECIMAL_ZEROS, '');
    return `${fixed}度`;
  }

  return `${stringValue}度`;
};

/**
 * 解析数值（用于图表）
 * @param {*} value - 原始值
 * @param {RegExp} cleanRegex - 清理正则
 * @returns {number} 解析后的数值
 */
const parseNumericValue = (value, cleanRegex) => {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  const stringValue = String(value).replace(cleanRegex, '');
  const numValue = parseFloat(stringValue);
  return Number.isFinite(numValue) ? numValue : 0;
};

/**
 * 将各种格式的电费历史记录统一转换为前端展示需要的结构（优化版）
 * 
 * 性能优化：
 * 1. 使用预编译的正则表达式
 * 2. 使用字段映射配置减少重复查找
 * 3. 提取格式化函数到外部
 * 4. 简化数据访问逻辑
 * 5. 减少中间变量和函数调用
 * 
 * @param {Object} raw - 原始数据
 * @returns {Object} 标准化后的数据
 */
function normalizeHistoryItem(raw = {}) {
  // 使用配置化的字段映射（减少函数调用）
  const roomName = getFirstAvailable(raw, FIELD_MAP.roomName) || '未知户号';
  const ownerName = getFirstAvailable(raw, FIELD_MAP.ownerName);
  const checkTimeRaw = getFirstAvailable(raw, FIELD_MAP.checkTime);
  const checkTime = checkTimeRaw ? formatDateTimeCompatible(checkTimeRaw) : '未知时间';
  const lastDailyDate = getFirstAvailable(raw, FIELD_MAP.lastDailyDate);
  
  // 特殊处理：gridAccount 可能在嵌套对象中
  let gridAccount = getFirstAvailable(raw, FIELD_MAP.gridAccount);
  if (!gridAccount && raw.grid_account_info) {
    gridAccount = raw.grid_account_info.PhoneName || raw.grid_account_info.phoneName;
  }

  // 格式化显示值
  const balance = formatAmount(getFirstAvailable(raw, FIELD_MAP.balance));
  const lastDailyUsage = formatUsage(getFirstAvailable(raw, FIELD_MAP.lastDailyUsage));
  const monthUsage = formatUsage(getFirstAvailable(raw, FIELD_MAP.monthUsage));
  const monthCharge = formatAmount(getFirstAvailable(raw, FIELD_MAP.monthCharge));

  // 解析数值（用于图表计算）
  const dailyUsageValue = getFirstAvailable(raw, FIELD_MAP.dailyUsage);
  const balanceNumValue = getFirstAvailable(raw, FIELD_MAP.balanceNum);

  return {
    id: raw.id || `${roomName}_${checkTime}`,
    room_name: roomName,
    balance,
    check_time: checkTime,
    last_daily_usage: lastDailyUsage,
    month_usage: monthUsage,
    month_charge: monthCharge,
    grid_account: gridAccount || '',
    owner_name: ownerName || '',
    daily_date: lastDailyDate || (checkTime ? checkTime.split(' ')[0] : ''),
    account_number: roomName,
    daily_usage: parseNumericValue(dailyUsageValue, REGEX_UNIT_CLEAN),
    balance_num: parseNumericValue(balanceNumValue, REGEX_CURRENCY_CLEAN)
  };
}

Page({
  data: {
    pageAnimationClass: '',
    cardAnimationClass: '',
    electricData: null,
    historyData: [],
    queryLoading: false,
    historyLoading: false,
    lastQueryTime: null,
    userInfo: null,
    hasGridAccount: false,  // 是否绑定了国网账号
    checkingBinding: false,  // 正在检查绑定状态
    isAdmin: false,  // 是否是管理员
    accountStats: null,  // 管理员查看的账号 / 户号统计
    userGridAccounts: [],  // 普通用户绑定的国网账号列表
    allAccountsCount: 0,  // 管理员查看的所有账号数量
    
    // 图表相关数据
    usageChartData: {},
    usageChartStats: {},
    usageChartLegend: [],
    balanceChartData: {},
    balanceChartStats: {},
    balanceChartLegend: [],
    showUsageChart: false,  // 是否显示用电量图表
    showBalanceChart: false,  // 是否显示余额图表
    
    // 图表tooltip
    usageTooltip: { show: false, x: 0, y: 0, date: '', value: '', unit: '度' },
    balanceTooltip: { show: false, x: 0, y: 0, date: '', value: '', unit: '元' },
    
    // ⭐ 新增：游客模式
    isGuest: false,  // 是否为游客模式
    showGuestBanner: false,  // 是否显示游客模式横幅
    
    // ⭐ 公告弹窗相关
    showNoticeModal: false,
    noticeModalList: [],
    
    // 账号选择器（由后端数据填充，初始为空）
    electricAccounts: [],
    selectedAccount: {},
    showAccountPicker: false,
    
    // 实体电表数据
    physicalMeters: [],
    physicalMetersLoading: false,
    meterStats: { total: 0, online: 0, offline: 0 }
  },

  // ========== 图表交互数据缓存 ==========
  _usageChartPoints: [],      // 用电量图表的点坐标缓存
  _balanceChartPoints: [],    // 余额图表的点坐标缓存
  _usageChartPadding: null,   // 用电量图表的padding
  _balanceChartPadding: null, // 余额图表的padding

  // ========== 性能优化：权限判断缓存 ==========
  _adminCache: null,           // 权限判断缓存
  _adminCacheUserId: null,     // 缓存对应的用户ID
  _isTestMode: false,          // 测试模式状态缓存
  _isGuestMode: false,         // ⭐ 游客模式状态缓存

  onLoad() {
    // ===== 关键修复：在onLoad时立即缓存测试模式和游客模式状态 =====
    this._isTestMode = testModeManager.isTestMode();
    this._isGuestMode = mockData.isGuestMode();
    console.log(`🔧 电费查询页面加载，测试模式: ${this._isTestMode}, 游客模式: ${this._isGuestMode}`);
    
    // ⭐ 设置游客模式状态到data
    this.setData({ 
      isGuest: this._isGuestMode 
    });
    
    // 记录功能使用（非阻塞）
    setTimeout(() => {
      featureUsage.recordFeatureUsage('electric', '电费查询', '⚡');
    }, 0);
    
    // 只检查绑定状态，不立即加载历史数据
    // 历史数据将在绑定状态检查完成后根据结果决定是否加载
    this.checkUserBinding();
    
    // 加载实体电表数据并启动轮询
    this.loadPhysicalMeters();
    this.startMeterPolling();
    
    // ⭐ 检查是否首次启动，如果是则显示公告弹窗
    this.checkAndShowFirstLaunchAnnouncement();
    
    // 显示分享菜单（包含朋友圈分享）
    wx.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        console.log('✅ 电费查询：分享菜单显示成功');
      },
      fail: (err) => {
        console.warn('⚠️ 电费查询：分享菜单显示失败，但不影响分享功能');
      }
    });
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('电费查询页面-测试模式热加载');
      // 更新测试模式状态
      this._isTestMode = testModeManager.isTestMode();
      // 清除缓存
      this.clearAdminCache();
      this.checkUserBinding();
      this.loadAccountStats();
      this.loadAllAccountsCount();
      this.loadUserGridAccounts();
    });
  },

  onShow() {
    // 触发页面进入动画
    const { triggerPageAnimation } = require('../../utils/page-animation');
    triggerPageAnimation();

    this.getTabBar().init();
    
    // ===== 关键修复：每次显示页面时都重新检测测试模式和游客模式 =====
    const oldTestMode = this._isTestMode;
    const newTestMode = testModeManager.isTestMode();
    const testModeChanged = oldTestMode !== newTestMode;
    
    // ⭐ 新增：检查游客模式变化
    const oldGuestMode = this._isGuestMode || false;
    const newGuestMode = mockData.isGuestMode();
    const guestModeChanged = oldGuestMode !== newGuestMode;
    this._isGuestMode = newGuestMode;
    
    // ⭐ 更新游客模式状态到data
    if (guestModeChanged) {
      this.setData({ isGuest: newGuestMode });
    }
    
    if (testModeChanged || guestModeChanged) {
      if (testModeChanged) {
        console.log(`🔄 电费查询-测试模式状态变化: ${oldTestMode} -> ${newTestMode}`);
      }
      if (guestModeChanged) {
        console.log(`🔄 电费查询-游客模式状态变化: ${oldGuestMode} -> ${newGuestMode}`);
      }
      
      this._isTestMode = newTestMode;
      
      // 清除缓存并强制刷新所有数据
      this.clearAdminCache();
      this.checkUserBinding();
      this.loadAccountStats();
      this.loadAllAccountsCount();
      this.loadUserGridAccounts();
      return;
    }
    
    this.checkUserBinding();
    
    // 重新启动实体电表轮询（页面显示时恢复轮询）
    this.loadPhysicalMeters();
    this.startMeterPolling();
    
    // 调试：输出当前图表显示状态
    console.log('onShow - 当前图表状态:', {
      historyLoading: this.data.historyLoading,
      showUsageChart: this.data.showUsageChart,
      showBalanceChart: this.data.showBalanceChart,
      historyDataLength: this.data.historyData ? this.data.historyData.length : 0
    });
  },

  onHide() {
    // 页面隐藏时停止轮询，避免后台持续请求
    this.stopMeterPolling();
  },

  onUnload() {
    // 页面卸载时停止轮询
    this.stopMeterPolling();
  },
  
  /**
   * 分享给好友
   */
  onShareAppMessage(res) {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `电费查询 - ${appName}`,
      path: '/pages/electric/index',
      imageUrl: ''
    };
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `电费查询 - ${appName}`,
      query: '',
      imageUrl: ''
    };
  },

  onPullDownRefresh() {
    // 下拉刷新时，清除权限缓存并检查绑定状态
    this.clearAdminCache();
    
    // 历史数据将在绑定状态检查完成后根据结果决定是否加载
    this.checkUserBinding();
  },

  /**
   * 统一的管理员权限判断方法（优化版 - 带缓存）
   * 
   * 性能优化：
   * 1. 添加权限判断结果缓存
   * 2. 基于用户ID的缓存失效策略
   * 3. 减少重复的权限检查计算
   * 
   * 权限判断逻辑说明：
   * 1. 管理员用户：
   *    - 可以查看所有的电费历史记录
   *    - 可以查询所有账号的电费数据
   *    - 拥有完整的筛选和管理功能
   * 2. 普通用户：
   *    - 只能查看自己绑定账号的电费记录
   *    - 必须先绑定国网账号才能查询电费
   *    - 没有管理员筛选功能
   * 
   * @param {Object} userInfo 用户信息对象
   * @returns {boolean} 是否为管理员
   */
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }

    // ===== 性能优化：使用缓存 =====
    const userId = userInfo.id || userInfo.openid || userInfo.nickname;
    
    // 如果缓存有效且用户ID匹配，直接返回缓存结果
    if (this._adminCache !== null && this._adminCacheUserId === userId) {
      return this._adminCache;
    }

    // 执行权限判断
    let isAdmin = false;

    // 检查 is_admin 字段
    if (userInfo.is_admin) {
      isAdmin = true;
    } 
    // 检查 user_level 字段
    else if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') {
      isAdmin = true;
    }
    // 检查 permissions 数组中的权限
    else if (Array.isArray(userInfo.permissions)) {
      isAdmin = userInfo.permissions.some((permission) => {
        const code = (permission ? permission.code : undefined) || (permission ? permission.permission_code : undefined);
        return code && String(code).toLowerCase() === 'admin';
      });
    }

    // 缓存结果
    this._adminCache = isAdmin;
    this._adminCacheUserId = userId;
    
    console.log('[性能优化] 权限判断结果已缓存:', { userId, isAdmin });

    return isAdmin;
  },

  /**
   * 清除权限判断缓存
   */
  clearAdminCache() {
    this._adminCache = null;
    this._adminCacheUserId = null;
    console.log('[性能优化] 权限判断缓存已清除');
  },

  /**
   * 加载账号统计信息（仅管理员）
   * @returns {Promise} 返回Promise以支持并发加载
   */
  loadAccountStats() {
    if (!this.data.isAdmin) {
      return Promise.resolve();
    }

    console.log('开始加载账号统计信息');
    
    // 检查是否为测试模式
    if (this._isTestMode) {
      // 测试模式：使用mock数据
      console.log('测试模式：使用mock账号统计数据');
      const mockStats = {
        account_count: 15,
        household_count: 28
      };
      this.setData({ accountStats: mockStats });
      return Promise.resolve(mockStats);
    }

    // 正常模式：调用API获取统计数据
    return apiCall(
      () => API.electric.getAccountStats(),
      null,
      (data) => {
        console.log('账号统计API返回数据:', data);
        const stats = {
          account_count: data.account_count || 0,
          household_count: data.household_count || 0
        };
        this.setData({ accountStats: stats });
      },
      (error) => {
        console.error('加载账号统计失败:', error);
        this.setData({ accountStats: null });
      }
    );
  },

  /**
   * 加载所有账号数量（仅管理员）
   * @returns {Promise} 返回Promise以支持并发加载
   */
  loadAllAccountsCount() {
    if (!this.data.isAdmin) {
      return Promise.resolve();
    }

    console.log('开始加载所有账号数量');

    // 检查是否为测试模式
    if (this._isTestMode) {
      console.log('测试模式：使用mock所有账号数量');
      this.setData({ allAccountsCount: 25 });
      return Promise.resolve();
    }

    return apiCall(
      () => API.grid.getAllAccounts(),
      null,
      (response) => {
        let data = response;
        if (response && response.data) {
          data = response.data;
        }

        const count = data && Array.isArray(data) ? data.length : 0;
        console.log('所有账号数量:', count);
        this.setData({
          allAccountsCount: count
        });
      },
      (error) => {
        console.error('加载所有账号数量失败:', error);
        this.setData({
          allAccountsCount: 0
        });
      }
    );
  },

  /**
   * 加载用户绑定的账号详情（仅普通用户）
   * @returns {Promise} 返回Promise以支持并发加载
   */
  loadUserGridAccounts() {
    if (this.data.isAdmin) {
      return Promise.resolve();
    }

    console.log('开始加载用户绑定的账号详情');

    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 用户绑定账号-游客模式：使用mock数据');
      const mockAccounts = [
        {
          id: 1,
          phone_name: '13812345678',
          phone_display: '138****5678',
          account_name: '演示账号',
          status: '正常',
          add_time: '2025-09-27 10:00:00'
        }
      ];
      this.setData({ userGridAccounts: mockAccounts });
      return Promise.resolve();
    }

    // 检查是否为测试模式
    if (this._isTestMode) {
      console.log('测试模式：使用mock用户绑定账号');
      const mockAccounts = [
        {
          id: 1,
          phone_name: '13812345678',
          phone_display: '138****5678',
          account_name: '我的国网账号',
          status: '正常',
          add_time: '2025-09-27 10:00:00'
        }
      ];
      this.setData({ userGridAccounts: mockAccounts });
      return Promise.resolve();
    }

    return apiCall(
      () => API.grid.getAccounts(),
      null,
      (response) => {
        let data = response;
        if (response && response.data) {
          data = response.data;
        }

        console.log('用户绑定账号API返回数据:', data);

        // 处理账号数据，添加手机号显示格式
        const accounts = Array.isArray(data) ? data.map(account => (Object.assign({}, account, {
          phone_display: this.formatPhoneDisplay(account.phone_name || account.PhoneName)
        }))) : [];

        console.log('处理后的账号数据:', accounts);

        this.setData({
          userGridAccounts: accounts
        });
      },
      (error) => {
        console.error('加载用户绑定账号失败:', error);
        this.setData({
          userGridAccounts: []
        });
      }
    );
  },

  /**
   * 加载实体电表数据（今日用电量已由后端合并在响应里）
   */
  loadPhysicalMeters() {
    // ⭐ 游客模式：不加载实体电表数据
    if (mockData.isGuestMode()) {
      console.log('🎭 实体电表-游客模式：跳过加载');
      this.setData({
        physicalMeters: [],
        physicalMetersLoading: false,
        meterStats: { total: 0, online: 0, offline: 0 }
      });
      return Promise.resolve();
    }

    this.setData({ physicalMetersLoading: true });
    console.log('📡 [实体电表] 发起请求: GET /physical-meters');

    return apiCall(
      () => API.electric.getPhysicalMeters(),
      null,
      (response) => {
        console.log('📡 [实体电表] 接口返回:', JSON.stringify(response.data));
        const meters = (response.data?.meters || []).map(meter => {
          const existing = this.data.physicalMeters.find(m => m.location === meter.location);
          return {
            ...meter,
            expanded: existing ? existing.expanded : false,
            _updating: true
          };
        });
        const stats = response.data?.stats || { total: 0, online: 0, offline: 0 };
        this.setData({
          physicalMeters: meters,
          physicalMetersLoading: false,
          meterStats: stats
        });
        // 500ms 后清除更新闪烁状态
        setTimeout(() => {
          const cleared = this.data.physicalMeters.map(m => ({
            ...m,
            _updating: false
          }));
          this.setData({ physicalMeters: cleared });
        }, 500);

        // 如果没有电表数据，停止轮询
        if (meters.length === 0) {
          this.stopMeterPolling();
        }
      },
      (error) => {
        console.error('📡 [实体电表] 请求失败:', error);
        this.setData({
          physicalMeters: [],
          physicalMetersLoading: false,
          meterStats: { total: 0, online: 0, offline: 0 }
        });
      }
    );
  },

  /**
   * 启动实体电表3秒轮询
   */
  startMeterPolling() {
    this.stopMeterPolling();
    console.log('📡 [实体电表] 启动6秒轮询');
    this._meterPollTimer = setInterval(() => {
      this.loadPhysicalMeters();
    }, 6000);
  },

  /**
   * 停止实体电表轮询
   */
  stopMeterPolling() {
    if (this._meterPollTimer) {
      clearInterval(this._meterPollTimer);
      this._meterPollTimer = null;
      console.log('📡 [实体电表] 停止轮询');
    }
  },

  toggleMeterExpand(e) {
    const { location } = e.currentTarget.dataset;
    const meters = this.data.physicalMeters.map(meter => {
      if (meter.location === location) {
        return { ...meter, expanded: !meter.expanded };
      }
      return meter;
    });
    this.setData({ physicalMeters: meters });
  },

  /**
   * 格式化手机号显示
   */
  formatPhoneDisplay(phone) {
    if (!phone) return '';
    const phoneStr = String(phone);
    if (phoneStr.length === 11) {
      return phoneStr.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return phoneStr;
  },

  /**
   * 检查用户绑定状态
   */
  checkUserBinding() {
    this.setData({ checkingBinding: true });

    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 电费查询-游客模式：使用mock数据');
      this.setData({
        hasGridAccount: true,
        checkingBinding: false
      });
      
      // 并发加载mock数据
      Promise.all([
        this.loadHistoryData(),
        this.loadChartData(),
        this.loadAccountStats(),
        this.loadAllAccountsCount(),
        this.loadUserGridAccounts()
      ]).then(() => {
        console.log('[游客模式] 所有mock数据加载完成');
      }).catch(err => {
        console.error('[游客模式] 数据加载失败', err);
      });
      
      return;
    }

    // 优先检查是否为测试模式
    if (this._isTestMode) {
      console.log('电费绑定检查-测试模式：假设已绑定');
      this.setData({
        hasGridAccount: true,
        checkingBinding: false
      });
      
      // ===== 性能优化：并发加载所有数据 =====
      console.log('[性能优化] 测试模式：并发加载5个数据源');
      Promise.all([
        this.loadHistoryData(),
        this.loadChartData(),
        this.loadAccountStats(),
        this.loadAllAccountsCount(),
        this.loadUserGridAccounts()
      ]).then(() => {
        console.log('[性能优化] 测试模式：所有数据加载完成');
      }).catch(err => {
        console.error('[性能优化] 测试模式：数据加载失败', err);
      });
      
      return;
    }

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = this.isAdminUser(userInfo);
    if (userInfo) {
      this.setData({ 
        userInfo: userInfo,
        isAdmin
      });
      
      // 如果是管理员，直接允许查询
      if (isAdmin) {
        this.setData({ 
          hasGridAccount: true,
          checkingBinding: false 
        });
        
        // ===== 性能优化：管理员并发加载所有数据 =====
        console.log('[性能优化] 管理员：并发加载4个数据源');
        Promise.all([
          this.loadHistoryData(),
          this.loadChartData(),
          this.loadAccountStats(),
          this.loadAllAccountsCount()
        ]).then(() => {
          console.log('[性能优化] 管理员：所有数据加载完成');
        }).catch(err => {
          console.error('[性能优化] 管理员：数据加载失败', err);
        });
        
        return;
      }
    }

    // 检查绑定的国网账号
    apiCall(
      () => API.grid.getAccounts(),
      null,
      (response) => {
        console.log('绑定状态检查API响应:', response);
        
        // 处理不同的响应格式
        let data = response;
        if (response && response.data) {
          data = response.data;
        }
        
        const hasBinding = data && Array.isArray(data) && data.length > 0;
        this.setData({
          hasGridAccount: hasBinding,
          checkingBinding: false
        });
        
        if (hasBinding) {
          // ===== 性能优化：普通用户并发加载数据 =====
          console.log('[性能优化] 普通用户：并发加载3个数据源');
          Promise.all([
            this.loadHistoryData(),
            this.loadChartData(),
            this.loadUserGridAccounts()
          ]).then(() => {
            console.log('[性能优化] 普通用户：所有数据加载完成');
          }).catch(err => {
            console.error('[性能优化] 普通用户：数据加载失败', err);
          });
        } else {
          console.log('用户未绑定国网账号，数据:', data);
          // 清空账号列表
          this.setData({ userGridAccounts: [] });
          // 不加载历史数据，用户界面将显示绑定提示
          // 停止下拉刷新（如果有的话）
          wx.stopPullDownRefresh();
        }
      },
      (error) => {
        console.error('检查绑定状态失败:', error);
        this.setData({
          hasGridAccount: false,
          checkingBinding: false
        });
        
        // 停止下拉刷新（如果有的话）
        wx.stopPullDownRefresh();
        
        // 如果是权限相关错误，显示更友好的提示
        if (error.message && error.message.includes('绑定')) {
          console.log('检测到绑定相关错误，需要引导用户绑定账号');
        }
      }
    );
  },

  /**
   * 查询电费
   */
  onQueryElectric() {
    // 统一的权限检查
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = this.isAdminUser(userInfo);
    
    console.log('查询电费权限检查:', {
      用户信息: userInfo,
      是否管理员: isAdmin,
      页面isAdmin状态: this.data.isAdmin,
      是否绑定账号: this.data.hasGridAccount
    });
    
    // 管理员直接允许查询，普通用户需要绑定账号
    if (!isAdmin && !this.data.hasGridAccount) {
      wx.showModal({
        title: '提示',
        content: '您还没有绑定国网账号，请先绑定国网账号后查询电费',
        showCancel: true,
        confirmText: '去绑定',
        cancelText: '稍后',
        success: (res) => {
          if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/user/bind/index?tab=grid'
                  });
          }
        }
      });
      return;
    }
    
    // 确保页面状态与权限判断一致
    if (this.data.isAdmin !== isAdmin) {
      console.warn('查询时权限状态不一致，更新页面状态');
      this.setData({ isAdmin });
    }

    this.setData({ queryLoading: true });

    // 检查是否为测试模式
    if (this._isTestMode) {
      // 测试模式：使用mock数据
      console.log('电费查询-测试模式：使用mock数据');
      setTimeout(() => {
        const mockElectricData = testModeManager.getMockElectricData();
        const mockData = {
          query_time: new Date().toISOString(),
          households: mockElectricData.map(item => ({
            room_name: item.GridAccount,
            balance: item.LastBalance.toFixed(2),
            balance_num: item.LastBalance,
            last_daily_date: item.LastDailyDate,
            last_daily_usage: item.LastDailyUsage + '度',
            month_usage: (item.LastDailyUsage * 20).toFixed(1) + '度', // 模拟月用量
            month_charge: item.MonthCharge.toFixed(2)
          }))
        };

        this.setData({
          electricData: mockData,
          lastQueryTime: mockData.query_time,
          queryLoading: false
        });
        
        // 刷新历史数据和图表数据
        this.loadHistoryData();
        this.loadChartData();
        
        showSuccess('查询成功(测试模式)');
      }, 1000);
      return;
    }

    apiCall(
      () => API.electric.query(),
      '正在查询电费，可能需要1-2分钟，请耐心等待...',
      (response) => {
        console.log('电费查询API返回数据:', response);

        // 检查API响应结构
        if (response.code && response.code !== 200) {
          // 处理业务错误（如账号无户号等）
          this.setData({ queryLoading: false });
          
          // 检查是否是无户号的特殊情况
          const errorType = response.data && response.data.error_type;
          if (errorType === 'no_households') {
            wx.showModal({
              title: '需要绑定户号',
              content: response.msg || '该国网账号未绑定任何户号，请先登录"网上国网"APP绑定户号后再重试',
              showCancel: true,
              confirmText: '重新绑定',
              cancelText: '确定',
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/user/bind/index?tab=grid'
                  });
                }
              }
            });
          } else {
            showError(response.msg || '查询失败，请稍后重试');
          }
          return;
        }
        
        const queryResult = (response && response.data ? response.data.query_result : undefined) || response;
        const accountStats = (response && response.data ? response.data.account_stats : undefined) || { account_count: 0, household_count: 0 };
        
      // 如果后端统计信息缺失但用户是管理员，清空卡片（避免遗留）
      if (!accountStats && this.data.isAdmin) {
        this.setData({ accountStats: null });
      }

        // 检查后端返回的数据结构
        if (queryResult && queryResult.success !== undefined) {
          // 处理后端返回的格式
          if (queryResult.success) {
            // 转换数据格式以适配前端显示
            const convertedData = {
              query_time: queryResult.update_time || new Date().toISOString(),
              account_count: accountStats.account_count,
              household_count: accountStats.household_count,
              households: (queryResult.accounts || []).map(account => ({
                room_name: account.account_number || account.account_name || 'N/A',
                owner_name: account.account_name || 'N/A',
                balance: `${account.balance || 0}元`,
                balance_num: account.balance || 0,
                last_daily_date: account.latest_date || 'N/A',
                last_daily_usage: `${account.today_power || 0}度`,
                month_usage: `${account.current_month_power || 0}度`,
                month_charge: `${account.last_month_cost || 0}元`,
                // 额外信息
                account_name: account.account_name || 'N/A',
                address: account.address || 'N/A',
                year_total_cost: account.year_total_cost || 0,
                year_total_power: account.year_total_power || 0
              }))
            };
            
            this.setData({
              electricData: convertedData,
              lastQueryTime: convertedData.query_time,
              queryLoading: false,
              accountStats
            });
            
            // 刷新历史数据和图表数据
            this.loadHistoryData();
            this.loadChartData();
            
            showSuccess(`查询成功，获取到${convertedData.household_count || convertedData.account_count || 0}条数据`);
          } else {
            // 查询失败，显示错误信息
            this.setData({ queryLoading: false });
            showError(queryResult.message || '查询失败，请稍后重试');
          }
        } else {
          // 兼容旧格式
          this.setData({
            electricData: queryResult,
            lastQueryTime: queryResult.query_time || new Date().toISOString(),
            queryLoading: false,
            accountStats: {
              account_count: queryResult.account_count || (queryResult.accounts ? queryResult.accounts.length : 0) || 0,
              household_count: queryResult.household_count || (queryResult.households ? queryResult.households.length : 0) || 0
            }
          });
          
          // 刷新历史数据和图表数据
          this.loadHistoryData();
          this.loadChartData();
          
          showSuccess('查询成功');
        }
      },
      (error) => {
        this.setData({ queryLoading: false });
        this.setData({ accountStats: null });
        console.error('电费查询失败:', error);
        
        // 检查是否是无户号的特殊情况
        const errorMessage = error.message || '';
        if (errorMessage.includes('未绑定任何户号') || errorMessage.includes('国网APP检查账号状态')) {
          wx.showModal({
            title: '账号无户号',
            content: errorMessage,
            showCancel: true,
            confirmText: '重新绑定',
            cancelText: '确定',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/user/bind/index?tab=grid'
                });
              }
            }
          });
        } else {
          showError(errorMessage || '查询失败，请检查网络连接后重试');
        }
      }
    );
  },

  /**
   * 加载图表数据（获取当年所有数据用于图表展示）
   */
  loadChartData() {
    console.log('开始加载图表数据（当年所有记录）');

    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 图表数据加载-游客模式：使用mock数据');
      // 游客模式下，图表数据会在 loadHistoryData 中一起处理
      return;
    }

    // 检查是否为测试模式
    if (this._isTestMode) {
      console.log('图表数据加载-测试模式：使用mock数据');
      // 测试模式下，图表数据会在 loadHistoryData 中一起处理
      return;
    }

    // 统一的权限判断逻辑
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = this.isAdminUser(userInfo);
    
    // 获取当前年份
    const currentYear = new Date().getFullYear();
    
    // 请求当年所有数据（不限制条数）
    const params = {
      limit: 1000,  // 设置一个足够大的值，确保获取全年数据
      is_admin_request: isAdmin,
      year: currentYear  // 只获取当年数据
    };

    apiCall(
      () => API.electric.getHistory(params),
      null,
      (result) => {
        const normalizeHistoryList = (data) => {
          if (!data) {
            return [];
          }

          // 直接是数组
          if (Array.isArray(data)) {
            return data.map(normalizeHistoryItem);
          }

          // 新格式：data.data.history（管理员接口返回的格式）
          if (data.data && Array.isArray(data.data.history)) {
            return data.data.history.map(normalizeHistoryItem);
          }

          // 旧格式：data.history
          if (Array.isArray(data.history)) {
            return data.history.map(normalizeHistoryItem);
          }

          // 旧格式：data.data直接是数组
          if (Array.isArray(data.data)) {
            return data.data.map(normalizeHistoryItem);
          }

          return [];
        };

        let chartData = [];
        try {
          chartData = normalizeHistoryList(result);
        } catch (error) {
          console.error('图表数据标准化处理失败:', error);
          chartData = [];
        }

        // 保存图表数据
        this.setData({
          chartData: chartData,
          showUsageChart: chartData.length > 0,
          showBalanceChart: chartData.length > 0
        });
        
        // ===== 性能优化：使用防抖优化图表渲染 =====
        chartOptimizer.debounce('usage_chart', () => {
          this.processUsageChartData();
        }, 200);
        
        chartOptimizer.debounce('balance_chart', () => {
          this.processBalanceChartData();
        }, 250);
      },
      (error) => {
        console.error('加载图表数据失败:', error);
        // 图表数据加载失败不影响页面其他功能，只需要隐藏图表
        this.setData({
          showUsageChart: false,
          showBalanceChart: false
        });
      }
    );
  },

  /**
   * 加载历史数据（最近记录列表，限制5条显示）
   */
  loadHistoryData() {
    this.setData({ historyLoading: true });

    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 电费历史加载-游客模式：使用mock数据');
      setTimeout(() => {
        const mockHistory = [
          {
            id: 'history_1',
            RoomName: '1234****5678',
            Balance: '156.80',
            LastDailyDate: '2025-10-20',
            LastDailyUsage: '10.6',
            MonthUsage: '328.5',
            MonthCharge: '143.20',
            CheckTime: '2025-10-20 18:30:00',
            grid_account: '1234****5678'
          },
          {
            id: 'history_2',
            RoomName: '1234****5678',
            Balance: '300.00',
            LastDailyDate: '2025-09-30',
            LastDailyUsage: '9.5',
            MonthUsage: '285.2',
            MonthCharge: '125.50',
            CheckTime: '2025-09-30 18:30:00',
            grid_account: '1234****5678'
          }
        ];

        const normalizedMockHistory = mockHistory.map(item => normalizeHistoryItem(item));
        
        this.setData({
          historyData: normalizedMockHistory,
          chartData: normalizedMockHistory,
          historyLoading: false,
          showUsageChart: true,
          showBalanceChart: true
        });
        this._buildAccountSelector(normalizedMockHistory);
        wx.stopPullDownRefresh();
        
        // 处理图表数据
        chartOptimizer.debounce('usage_chart', () => {
          this.processUsageChartData();
        }, 200);
        
        chartOptimizer.debounce('balance_chart', () => {
          this.processBalanceChartData();
        }, 250);
      }, 300);
      return;
    }

    // 检查是否为测试模式
     if (this._isTestMode) {
      // 测试模式：使用mock数据
      console.log('电费历史加载-测试模式：使用mock数据');
      setTimeout(() => {
        const mockElectricData = testModeManager.getMockElectricData();
        const mockHistory = mockElectricData.map((item, index) => ({
          id: `history_${index + 1}`,
          RoomName: item.GridPhone, 
          Balance: item.LastBalance.toFixed(2),
          LastDailyDate: item.LastDailyDate,
          LastDailyUsage: item.LastDailyUsage.toString(),
          MonthUsage: (item.LastDailyUsage * 20).toFixed(1), // 模拟月用量
          MonthCharge: item.MonthCharge.toFixed(2),
          CheckTime: item.QueryDate,
          grid_account: item.GridPhone
        }));

        // 对mockHistory数据进行标准化处理
        const normalizedMockHistory = mockHistory.map(item => normalizeHistoryItem(item));
        
        // 限制最近记录只显示前5条数据
        const recentHistoryData = normalizedMockHistory.slice(0, 5);
        console.log(`测试模式：最近记录数据限制为5条，实际显示: ${recentHistoryData.length}条`);

        this.setData({
          historyData: recentHistoryData,           // 列表显示用（限制5条）
          chartData: normalizedMockHistory,         // 图表数据（全部数据）
          historyLoading: false,
          // 直接显示图表
          showUsageChart: normalizedMockHistory.length > 0,
          showBalanceChart: normalizedMockHistory.length > 0
        });
        this._buildAccountSelector(normalizedMockHistory);
        wx.stopPullDownRefresh();
        
        console.log('测试模式：数据设置完成', {
          listDataLength: recentHistoryData.length,           // 列表数据（5条）
          chartDataLength: normalizedMockHistory.length,      // 图表数据（全部）
          showUsageChart: normalizedMockHistory.length > 0,
          showBalanceChart: normalizedMockHistory.length > 0
        });
        
        // ===== 性能优化：测试模式下也使用防抖优化 =====
        chartOptimizer.debounce('usage_chart', () => {
          console.log('测试模式：处理用电量图表数据 - 全部数据条数:', normalizedMockHistory.length);
          this.processUsageChartData();
        }, 200);
        
        chartOptimizer.debounce('balance_chart', () => {
          console.log('测试模式：处理余额图表数据');
          this.processBalanceChartData();
        }, 250);
      }, 300);
      return;
    }

    // 统一的权限判断逻辑
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = this.isAdminUser(userInfo);  // 使用统一的权限判断方法
    
    console.log('历史数据权限检查:', {
      用户信息: userInfo,
      是否管理员: isAdmin,
      当前页面isAdmin状态: this.data.isAdmin,
      权限判断方法: 'isAdminUser'
    });
    
    // 确保页面状态与权限判断一致
    if (this.data.isAdmin !== isAdmin) {
      console.warn('权限状态不一致，更新页面状态');
      this.setData({ isAdmin });
    }
    
    const params = {
      limit: 10,
      is_admin_request: isAdmin  // 传递管理员标识
    };

    apiCall(
      () => API.electric.getHistory(params),
      null,
      (result) => {
        const normalizeHistoryList = (data) => {
          if (!data) {
            return [];
          }

          // 直接是数组
          if (Array.isArray(data)) {
            return data.map(normalizeHistoryItem);
          }

          // 新格式：data.data.history（管理员接口返回的格式）
          if (data.data && Array.isArray(data.data.history)) {
            return data.data.history.map(normalizeHistoryItem);
          }

          // 旧格式：data.history
          if (Array.isArray(data.history)) {
            return data.history.map(normalizeHistoryItem);
          }

          // 旧格式：data.data直接是数组
          if (Array.isArray(data.data)) {
            return data.data.map(normalizeHistoryItem);
          }

          return [];
        };

        let historyData = [];
        try {
          historyData = normalizeHistoryList(result);
        } catch (error) {
          console.error('数据标准化处理失败:', error);
          historyData = [];
        }

        // 限制最近记录只显示前5条数据
        const recentHistoryData = Array.isArray(historyData) ? historyData.slice(0, 5) : [];

        this.setData({
          historyData: recentHistoryData,  // 列表显示用（限制5条）
          historyLoading: false,
          userIsAdmin: isAdmin
        });
        this._buildAccountSelector(historyData);
        wx.stopPullDownRefresh();
      },
      (error) => {
        this.setData({ historyLoading: false });
        wx.stopPullDownRefresh();
        
        console.error('加载历史数据失败:', error);
        
        // 根据用户权限提供不同的错误处理
        const userInfo = wx.getStorageSync('userInfo');
        const isAdminForError = this.isAdminUser(userInfo);
        const errorMessage = error.message || '';
        
        console.log('历史数据加载错误处理:', {
          错误信息: errorMessage,
          错误代码: error.code,
          用户权限: isAdminForError ? '管理员' : '普通用户'
        });
        
        if (errorMessage.includes('绑定国网账号') || errorMessage.includes('bind') || 
            error.code === 'NO_GRID_ACCOUNT' || error.code === 403) {
          
          if (isAdminForError) {
            // 管理员遇到权限错误，可能是系统问题
            showError('系统权限异常，请检查管理员配置或联系技术支持');
          } else {
            // 普通用户需要绑定账号
            this.setData({ hasGridAccount: false });
            
            wx.showModal({
              title: '需要绑定账号',
              content: '您还没有绑定国网账号，请先绑定国网账号后查询电费记录',
              showCancel: true,
              confirmText: '去绑定',
              cancelText: '稍后',
              success: (res) => {
                if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/user/bind/index?tab=grid'
                    });
                }
              }
            });
          }
        } else if (error.code === 'PERMISSION_DENIED') {
          if (isAdminForError) {
            showError('管理员权限异常，请检查系统配置');
          } else {
            showError('权限不足，请联系管理员或绑定国网账号');
          }
        } else {
          showError(errorMessage || '加载失败，请稍后重试');
        }
      }
    );
  },

  /**
   * 查看更多历史
   */
  onViewMoreHistory() {
    wx.navigateTo({
      url: '/pages/electric/history/index'
    });
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    // 刷新时，重新检查绑定状态
    // 历史数据将在绑定状态检查完成后根据结果决定是否加载
    this.setData({ checkingBinding: true });
    this.checkUserBinding();
  },

  /**
   * 跳转到绑定页面
   */
  goToBind() {
                  wx.navigateTo({
                    url: '/pages/user/bind/index?tab=grid'
                  });
  },

  /**
   * 跳转到账号管理页面（管理员功能）
   */
  goToAccountManage() {
    if (!this.data.isAdmin) {
      showError('权限不足');
      return;
    }
    
    wx.navigateTo({
      url: '/pages/electric/account-manage/index'
    });
  },

  // ==================== 账号选择器相关方法 ====================

  /**
   * 切换账号选择器显示状态
   */
  onToggleAccountPicker() {
    this.setData({
      showAccountPicker: !this.data.showAccountPicker
    });
  },

  /**
   * 选择账号
   */
  onSelectAccount(e) {
    const account = e.currentTarget.dataset.account;
    if (!account) return;

    this.setData({
      selectedAccount: account,
      showAccountPicker: false
    });

    console.log('已选择账号:', account);
  },

  /**
   * 从历史数据中提取账号列表，填充账号选择器
   * 使用最新一条记录的余额作为账号余额
   */
  _buildAccountSelector(historyList) {
    if (!historyList || historyList.length === 0) return;

    // 按 account_number 去重，取最新一条
    const accountMap = {};
    historyList.forEach(item => {
      const key = item.account_number || item.room_name;
      if (!key) return;
      if (!accountMap[key]) {
        accountMap[key] = {
          id: key,
          address: item.room_name || key,
          accountNo: item.account_number || key,
          ownerName: item.owner_name || '',
          balance: item.balance_num || 0
        };
      }
    });

    const accounts = Object.values(accountMap);
    if (accounts.length === 0) return;

    const current = this.data.selectedAccount;
    // 如果当前选中账号不在新列表中，默认选第一个
    const stillValid = current && current.id && accounts.find(a => a.id === current.id);
    const selected = stillValid || accounts[0];

    this.setData({
      electricAccounts: accounts,
      selectedAccount: selected
    });
  },

  // ==================== 图表相关方法 ====================

  /**
   * 处理日用电量图表数据
   */
  processUsageChartData() {
    const allData = this.data.chartData || [];
    
    if (!allData || allData.length === 0) {
      this.setData({
        usageChartStats: null,
        usageChartLegend: [],
        usageChartData: {},
        showUsageChart: false
      });
      return;
    }

    // 获取当前日期信息
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    // 计算筛选日期范围：当月数据 + 上月末5天（月初时补充数据）
    const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // 计算上月末5天的起始日期
    const lastMonthEndDate = new Date(currentYear, currentMonth - 1, 0); // 上月最后一天
    const lastMonthEnd5Days = new Date(lastMonthEndDate);
    lastMonthEnd5Days.setDate(lastMonthEndDate.getDate() - 4); // 往前推4天，加上最后一天共5天
    const lastMonthEnd5DaysStr = `${lastMonthEnd5Days.getFullYear()}-${String(lastMonthEnd5Days.getMonth() + 1).padStart(2, '0')}-${String(lastMonthEnd5Days.getDate()).padStart(2, '0')}`;
    
    // 过滤当月 + 上月末5天的有效数据
    const validData = allData.filter(item => {
      const hasDate = item.daily_date && item.daily_date !== '';
      const hasUsage = typeof item.daily_usage === 'number' && item.daily_usage >= 0;
      const hasAccount = item.account_number && item.account_number !== '';
      
      if (!hasDate || !hasUsage || !hasAccount) {
        return false;
      }
      
      // 检查是否是当月数据
      const isCurrentMonth = item.daily_date.startsWith(currentYearMonth);
      
      // 检查是否在上月末5天范围内
      const isInLastMonth5Days = item.daily_date >= lastMonthEnd5DaysStr && item.daily_date < currentYearMonth + '-01';
      
      return isCurrentMonth || isInLastMonth5Days;
    });

    // console.log(`processUsageChartData - 有效数据数量: ${validData.length}`);

    if (validData.length === 0) {
      // console.log('processUsageChartData - 无有效数据，清空图表');
      this.setData({
        usageChartStats: null,
        usageChartLegend: [],
        usageChartData: {},
        showUsageChart: false
      });
      return;
    }

    // 按户号分组数据
    const roomGroups = {};
    validData.forEach(item => {
      const roomName = item.account_number || '未知户号';
      if (!roomGroups[roomName]) {
        roomGroups[roomName] = [];
      }
      
      // 日期转换和验证
      let dateObj;
      try {
        dateObj = new Date(item.daily_date + 'T00:00:00');
        if (isNaN(dateObj.getTime())) {
          // console.log('无效日期:', item.daily_date);
          return;
        }
      } catch (error) {
        // console.log('日期转换失败:', item.daily_date, error);
        return;
      }

      const dataPoint = {
        date: item.daily_date,
        usage: item.daily_usage,
        dateObj: dateObj
      };
      
      roomGroups[roomName].push(dataPoint);
      // console.log(`添加用电量数据点 - 户号: ${roomName}, 日期: ${item.daily_date}, 用电: ${item.daily_usage}`);
    });

    // 为每个户号排序数据（按日期）
    Object.keys(roomGroups).forEach(roomName => {
      roomGroups[roomName].sort((a, b) => a.dateObj - b.dateObj);
    });

    // 生成图例和颜色
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const usageChartLegend = Object.keys(roomGroups).map((roomName, index) => ({
      roomName,
      color: colors[index % colors.length],
      count: roomGroups[roomName].length
    }));

    // 计算统计信息
    const avgDailyUsage = validData.length > 0 
      ? (validData.reduce((sum, item) => sum + item.daily_usage, 0) / validData.length).toFixed(2)
      : '0.00';

    const usageChartStats = {
      roomCount: Object.keys(roomGroups).length,
      dataPoints: validData.length,
      avgDailyUsage
    };

    // console.log('processUsageChartData - 设置用电量图表数据:', { usageChartStats, usageChartLegend, roomGroups });

    // 设置数据并开始绘制图表
    this.setData({
      usageChartData: roomGroups,
      usageChartStats,
      usageChartLegend,
      showUsageChart: true
    });
    
    // console.log('processUsageChartData - 图表数据已设置:', {
    //   showUsageChart: true,
    //   roomGroups: Object.keys(roomGroups),
    //   usageChartStats
    // });

    // 延迟绘制图表，确保DOM更新完成
    setTimeout(() => {
      this.drawUsageChart();
    }, 100);
  },

  /**
   * 处理账户余额图表数据
   */
  processBalanceChartData() {
    const allData = this.data.chartData || [];
    
    if (!allData || allData.length === 0) {
      this.setData({
        balanceChartStats: null,
        balanceChartLegend: [],
        balanceChartData: {},
        showBalanceChart: false
      });
      return;
    }

    // 获取今年信息
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // 过滤今年的有效数据，使用balance_num（账户余额）
    const validData = allData.filter(item => {
      const hasDate = item.check_time && item.check_time !== '';
      const hasAccount = item.account_number && item.account_number !== '';
      
      // 检查是否是今年数据（使用check_time）
      const isCurrentYear = item.check_time && item.check_time.startsWith(currentYear.toString());
      
      // 获取余额数值（已在normalizeHistoryItem中处理，允许负数余额）
      const hasBalance = typeof item.balance_num === 'number' && Number.isFinite(item.balance_num);
      
      return hasDate && hasAccount && isCurrentYear && hasBalance;
    });

    if (validData.length === 0) {
      this.setData({
        balanceChartStats: null,
        balanceChartLegend: [],
        balanceChartData: {},
        showBalanceChart: false
      });
      return;
    }

    // 按户号和月份分组数据，统计账户余额（每月只保留最新记录）
    const roomGroups = {};
    validData.forEach(item => {
      const roomName = item.account_number || '未知户号';
      if (!roomGroups[roomName]) {
        roomGroups[roomName] = {};
      }
      
      // 日期转换和验证（使用check_time）
      let dateObj;
      try {
        const dateStr = item.check_time.split(' ')[0]; // 提取日期部分
        dateObj = new Date(dateStr + 'T00:00:00');
        if (isNaN(dateObj.getTime())) {
          return;
        }
      } catch (error) {
        return;
      }

      // 提取年月信息 (格式：2025-09)
      const yearMonth = item.check_time.substring(0, 7);
      
      // 对于同一个月，取最新的数据（按日期排序取最后一个）
      const existingData = roomGroups[roomName][yearMonth];
      if (!existingData || new Date(existingData.date) < dateObj) {
        roomGroups[roomName][yearMonth] = {
          date: item.check_time.split(' ')[0], // 只保留日期部分
          yearMonth: yearMonth,
          balance: item.balance_num,  // 使用账户余额
          dateObj: dateObj,
          monthObj: new Date(yearMonth + '-01T00:00:00') // 月份的第一天，用于排序
        };
      }
    });

    // 转换数据结构：将对象转为数组并排序
    const finalRoomGroups = {};
    Object.keys(roomGroups).forEach(roomName => {
      const monthlyData = Object.values(roomGroups[roomName]);
      finalRoomGroups[roomName] = monthlyData.sort((a, b) => a.monthObj - b.monthObj);
    });

    // 生成图例和颜色（使用不同的颜色系列）
    const colors = ['#1890ff', '#52c41a', '#fa541c', '#722ed1', '#13c2c2', '#eb2f96', '#f5222d'];
    const balanceChartLegend = Object.keys(finalRoomGroups).map((roomName, index) => ({
      roomName,
      color: colors[index % colors.length],
      count: finalRoomGroups[roomName].length
    }));

    // 计算统计信息
    const totalDataPoints = Object.values(finalRoomGroups).reduce((sum, roomData) => sum + roomData.length, 0);
    const avgBalance = totalDataPoints > 0 
      ? (Object.values(finalRoomGroups).flat().reduce((sum, item) => sum + item.balance, 0) / totalDataPoints).toFixed(2)
      : '0.00';

    const balanceChartStats = {
      roomCount: Object.keys(finalRoomGroups).length,
      dataPoints: totalDataPoints,
      avgBalance  // 改为余额平均值
    };

    // 设置数据并开始绘制图表
    this.setData({
      balanceChartData: finalRoomGroups,
      balanceChartStats,
      balanceChartLegend,
      showBalanceChart: true
    });

    // 延迟绘制图表，确保DOM更新完成
    setTimeout(() => {
      this.drawBalanceChart();
    }, 100);
  },

  // ==================== 马卡龙风格图表配置 ====================
  _chartColors: {
    // 主色调 - 马卡龙配色
    peach: '#FF9F43',      // 橙色马卡龙
    mint: '#B9FBC0',       // 薄荷绿马卡龙
    pink: '#FFB3BA',       // 粉色马卡龙
    lavender: '#E0BBE4',   // 薰衣草马卡龙
    blue: '#98F5E1',       // 蓝色马卡龙
    yellow: '#FFD93D',     // 黄色马卡龙
    // 辅助色
    foreground: '#5E4E3E', // 前景色（文字、边框）
    background: '#fef9f3', // 背景色
    gridLine: 'rgba(94, 78, 62, 0.1)', // 网格线
    axisLine: 'rgba(94, 78, 62, 0.2)', // 坐标轴
  },

  /**
   * 绘制日用电量图表
   */
  drawUsageChart() {
    const chartData = this.data.usageChartData;
    const chartLegend = this.data.usageChartLegend;

    // console.log('drawUsageChart - 用电量图表数据:', chartData);

    if (!chartData || Object.keys(chartData).length === 0) {
      console.log('drawUsageChart - 无图表数据，跳过绘制');
      return;
    }

    this.drawChart('usageChart', chartData, chartLegend, 'usage', '用电量', '度');
  },

  /**
   * 绘制账户余额图表
   */
  drawBalanceChart() {
    const chartData = this.data.balanceChartData;
    const chartLegend = this.data.balanceChartLegend;

    if (!chartData || Object.keys(chartData).length === 0) {
      return;
    }

    this.drawChart('balanceChart', chartData, chartLegend, 'balance', '账户余额', '元');
  },

  /**
   * 通用图表绘制函数（Canvas 2D接口 - 马卡龙风格）
   */
  drawChart(canvasId, chartData, chartLegend, valueKey, valueLabel, unit) {
    const colors = this._chartColors;
    
    // 使用Canvas 2D接口获取canvas节点
    const query = wx.createSelectorQuery().in(this);
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.log(`drawChart - 无法找到Canvas元素: ${canvasId}`);
          if (!this[`${canvasId}RetryCount`]) this[`${canvasId}RetryCount`] = 0;
          if (this[`${canvasId}RetryCount`] < 5) {
            this[`${canvasId}RetryCount`]++;
            setTimeout(() => {
              this.drawChart(canvasId, chartData, chartLegend, valueKey, valueLabel, unit);
            }, 200);
          }
          return;
        }

        this[`${canvasId}RetryCount`] = 0;

        const canvas = res[0].node;
        const canvasInfo = res[0];
        const { width, height } = canvasInfo;

        if (!width || !height || width <= 0 || height <= 0) {
          return;
        }

        const ctx = canvas.getContext('2d');
        const dpr = wx.getWindowInfo().pixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // 清空Canvas - 使用马卡龙背景色
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 计算绘图区域 - 增加边距让图表更舒适
        const padding = {
          top: 30,
          right: 25,
          bottom: 50,
          left: 50
        };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        if (chartWidth <= 0 || chartHeight <= 0) {
          return;
        }

        // 收集所有数据点
        const allDates = [];
        const allValues = [];
        Object.values(chartData).forEach(roomData => {
          roomData.forEach(point => {
            const dateField = (valueKey === 'balance' || valueKey === 'monthCharge') ? point.monthObj : point.dateObj;
            allDates.push(dateField);
            allValues.push(point[valueKey]);
          });
        });

        if (allDates.length === 0) {
          return;
      }

        // 计算日期和数值范围
        const minDate = new Date(Math.min.apply(Math, allDates));
        const maxDate = new Date(Math.max.apply(Math, allDates));
        const maxValue = Math.max.apply(Math, allValues);
        const minValue = Math.min.apply(Math, allValues);

        // 绘制马卡龙风格坐标轴
        this.drawMacaronAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, valueLabel, unit, chartData, colors);

        // 马卡龙配色数组
        const macaronColors = [colors.peach, colors.mint, colors.pink, colors.lavender, colors.blue, colors.yellow];

        // 收集所有点的坐标用于触摸交互
        const allPoints = [];

        // 绘制各户号的曲线（马卡龙风格）
        Object.entries(chartData).forEach(([roomName, roomData], index) => {
          const color = macaronColors[index % macaronColors.length];
          const points = this.drawMacaronLine(ctx, canvas, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, color, valueKey, colors);
          if (points) {
            allPoints.push(...points);
          }
        });

        // 保存点坐标和padding用于触摸交互
        if (canvasId === 'usageChart') {
          this._usageChartPoints = allPoints;
          this._usageChartPadding = padding;
        } else if (canvasId === 'balanceChart') {
          this._balanceChartPoints = allPoints;
          this._balanceChartPadding = padding;
        }
      });
  },

  /**
   * 绘制马卡龙风格坐标轴
   */
  drawMacaronAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, valueLabel, unit, chartData, colors) {
    // 绘制水平网格线（虚线风格）
    const ySteps = 4;
    const valueRange = maxValue - minValue || 1;
    
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;

    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 绘制Y轴标签（马卡龙风格字体）
    ctx.fillStyle = colors.foreground;
    ctx.font = 'bold 11px "PingFang SC", sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (valueRange * i / ySteps);
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      const decimals = (valueLabel === '账户余额' || valueLabel === '余额') ? 0 : 1;
      ctx.fillText(value.toFixed(decimals), padding.left - 8, y + 4);
    }

    // 绘制X轴日期标签
    const dateRange = maxDate.getTime() - minDate.getTime();
    if (dateRange > 0) {
      const isMonthlyChart = (valueLabel === '账户余额' || valueLabel === '余额' || valueLabel === '月消费');
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px "PingFang SC", sans-serif';
      ctx.fillStyle = colors.foreground;
      
      if (isMonthlyChart && chartData) {
        const allMonths = new Set();
        Object.values(chartData).forEach(roomData => {
          roomData.forEach(point => {
            allMonths.add(point.yearMonth);
          });
        });
        
        const sortedMonths = Array.from(allMonths).sort();
        sortedMonths.forEach((yearMonth) => {
          const monthDate = new Date(yearMonth + '-01T00:00:00');
          const x = padding.left + ((monthDate.getTime() - minDate.getTime()) / dateRange * chartWidth);
          // 只显示月份
          const monthStr = yearMonth.split('-')[1] + '月';
          ctx.fillText(monthStr, x, padding.top + chartHeight + 20);
        });
      } else {
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
          const dateTime = minDate.getTime() + (dateRange * i / xSteps);
          const date = new Date(dateTime);
          const x = padding.left + (chartWidth * i / xSteps);
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
          ctx.fillText(dateStr, x, padding.top + chartHeight + 20);
        }
      }
    }
  },

  /**
   * 绘制马卡龙风格曲线（带渐变填充）- 返回点坐标用于触摸交互
   */
  drawMacaronLine(ctx, canvas, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, color, valueKey, colors) {
    if (!roomData || roomData.length === 0) return [];

    const dateRange = maxDate.getTime() - minDate.getTime() || 1;
    const valueRange = maxValue - minValue || 1;

    // 按日期排序数据点
    const sortedData = [...roomData].sort((a, b) => {
      const dateA = (valueKey === 'balance' || valueKey === 'monthCharge') ? a.monthObj : a.dateObj;
      const dateB = (valueKey === 'balance' || valueKey === 'monthCharge') ? b.monthObj : b.dateObj;
      return dateA.getTime() - dateB.getTime();
    });

    // 计算所有点的坐标，同时保存原始数据用于tooltip显示
    const points = sortedData.map(point => {
      const dateField = (valueKey === 'balance' || valueKey === 'monthCharge') ? point.monthObj : point.dateObj;
      const x = padding.left + ((dateField.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point[valueKey] - minValue) / valueRange * chartHeight);
      
      // 格式化日期显示
      const month = String(dateField.getMonth() + 1).padStart(2, '0');
      const day = String(dateField.getDate()).padStart(2, '0');
      const dateStr = `${month}-${day}`;
      
      return { 
        x, 
        y, 
        value: point[valueKey],
        date: dateStr,
        valueKey: valueKey
      };
    });

    if (points.length === 0) return [];

    // 绘制渐变填充区域
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, color + '50');
    gradient.addColorStop(1, color + '05');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制折线
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // 绘制数据点
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // 返回点坐标用于触摸交互
    return points;
  },

  /**
   * 绘制坐标轴（保留旧方法兼容）
   */
  drawAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, valueLabel, unit, chartData) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    const ySteps = 5;
    const valueRange = maxValue - minValue || 1;
    ctx.fillStyle = '#666666';
    ctx.font = '10px sans-serif';

    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (valueRange * i / ySteps);
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      
      ctx.beginPath();
      ctx.moveTo(padding.left - 5, y);
      ctx.lineTo(padding.left, y);
      ctx.stroke();

      // 绘制标签（根据数值类型决定小数位数）
      const decimals = (valueLabel === '账户余额' || valueLabel === '余额') ? 1 : 1;
      ctx.fillText(value.toFixed(decimals), padding.left - 50, y + 3);
    }

    // 绘制X轴日期标签
    const dateRange = maxDate.getTime() - minDate.getTime();
    if (dateRange > 0) {
      const isMonthlyChart = (valueLabel === '账户余额' || valueLabel === '余额' || valueLabel === '月消费');
      
      if (isMonthlyChart && chartData) {
        // 月度图表：直接在每个数据点的位置显示月份标签
        const allMonths = new Set();
        Object.values(chartData).forEach(roomData => {
          roomData.forEach(point => {
            allMonths.add(point.yearMonth);
          });
        });
        
        const sortedMonths = Array.from(allMonths).sort();
        
        sortedMonths.forEach((yearMonth, index) => {
          // 计算该月份在X轴上的位置（使用月份第一天）
          const monthDate = new Date(yearMonth + '-01T00:00:00');
          const x = padding.left + ((monthDate.getTime() - minDate.getTime()) / dateRange * chartWidth);
          
          // 绘制刻度线
          ctx.strokeStyle = '#e0e0e0';
          ctx.beginPath();
          ctx.moveTo(x, padding.top + chartHeight);
          ctx.lineTo(x, padding.top + chartHeight + 5);
          ctx.stroke();
          
          // 绘制月份标签
          ctx.fillStyle = '#666666';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';  // 文本居中对齐
          ctx.fillText(yearMonth, x, padding.top + chartHeight + 20);
        });
      } else {
        // 日用电量图表：固定等分显示
        const xSteps = 4;
        
        for (let i = 0; i <= xSteps; i++) {
          const dateTime = minDate.getTime() + (dateRange * i / xSteps);
          const date = new Date(dateTime);
          const x = padding.left + (chartWidth * i / xSteps);
          
          // 绘制刻度线
          ctx.beginPath();
          ctx.moveTo(x, padding.top + chartHeight);
          ctx.lineTo(x, padding.top + chartHeight + 5);
          ctx.stroke();

          // 绘制日期标签（月/日格式）
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
          ctx.fillText(dateStr, x - 20, padding.top + chartHeight + 20);
        }
      }
    }
  },

  /**
   * 绘制单条曲线
   */
  drawLine(ctx, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, color, valueKey) {
    if (!roomData || roomData.length === 0) return;

    const dateRange = maxDate.getTime() - minDate.getTime() || 1;
    const valueRange = maxValue - minValue || 1;

    // 绘制趋势线
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    roomData.forEach((point, index) => {
      // 根据图表类型选择正确的日期字段
      const dateField = (valueKey === 'balance' || valueKey === 'monthCharge') ? point.monthObj : point.dateObj;
      const x = padding.left + ((dateField.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point[valueKey] - minValue) / valueRange * chartHeight);

      const displayDate = (valueKey === 'balance' || valueKey === 'monthCharge') ? point.yearMonth : point.date;
      // console.log(`绘制点 ${index} - x: ${x.toFixed(1)}, y: ${y.toFixed(1)}, ${valueKey}: ${point[valueKey]}, 显示: ${displayDate}`);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = color;
    roomData.forEach(point => {
      // 根据图表类型选择正确的日期字段
      const dateField = (valueKey === 'balance' || valueKey === 'monthCharge') ? point.monthObj : point.dateObj;
      const x = padding.left + ((dateField.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point[valueKey] - minValue) / valueRange * chartHeight);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  },

  /**
   * Canvas初始化事件
   */
  onChartInit() {
    console.log('onChartInit - Canvas初始化完成');
  },

  /**
   * Canvas触摸开始事件 - 显示tooltip
   */
  onChartTouchStart(e) {
    const touch = e.touches[0];
    const canvasId = e.currentTarget.id;
    
    // 获取对应图表的点数据和padding
    const points = canvasId === 'usageChart' ? this._usageChartPoints : this._balanceChartPoints;
    const padding = canvasId === 'usageChart' ? this._usageChartPadding : this._balanceChartPadding;
    const tooltipKey = canvasId === 'usageChart' ? 'usageTooltip' : 'balanceTooltip';
    const unit = canvasId === 'usageChart' ? '度' : '元';
    const label = canvasId === 'usageChart' ? '日用电量' : '账户余额';
    
    if (!points || points.length === 0) return;
    
    // 找到最近的点
    const touchX = touch.x;
    const touchY = touch.y;
    
    let nearestPoint = null;
    let minDistance = Infinity;
    
    points.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2));
      if (distance < minDistance && distance < 50) { // 50px 触摸范围
        minDistance = distance;
        nearestPoint = point;
      }
    });
    
    if (nearestPoint) {
      // 格式化数值
      const valueStr = typeof nearestPoint.value === 'number' 
        ? nearestPoint.value.toFixed(2) 
        : nearestPoint.value;
      
      // tooltip 尺寸估算（rpx 转 px，假设屏幕宽度 375px 对应 750rpx）
      const rpxRatio = wx.getSystemInfoSync().windowWidth / 750;
      const tooltipWidth = 220 * rpxRatio;  // 估算 tooltip 宽度
      const tooltipHeight = 100 * rpxRatio; // 估算 tooltip 高度
      
      // 计算 tooltip 位置，确保不超出图表边界
      let tooltipX = nearestPoint.x;
      let tooltipY = nearestPoint.y - tooltipHeight - 20; // 在点上方显示，留出间距
      
      // 获取图表区域边界
      const chartLeft = padding ? padding.left : 40;
      const chartRight = padding ? (padding.left + (e.currentTarget.offsetWidth || 300) - padding.right) : 260;
      const chartTop = padding ? padding.top : 20;
      
      // 水平边界检测：确保 tooltip 不超出左右边界
      const halfWidth = tooltipWidth / 2;
      if (tooltipX - halfWidth < chartLeft) {
        // 靠近左边界，tooltip 向右偏移
        tooltipX = chartLeft + halfWidth + 10;
      } else if (tooltipX + halfWidth > chartRight) {
        // 靠近右边界，tooltip 向左偏移
        tooltipX = chartRight - halfWidth - 10;
      }
      
      // 垂直边界检测：如果上方空间不足，显示在点下方
      if (tooltipY < chartTop) {
        tooltipY = nearestPoint.y + 20;
      }
      
      this.setData({
        [tooltipKey]: {
          show: true,
          x: tooltipX,
          y: tooltipY,
          date: nearestPoint.date,
          value: valueStr,
          unit: unit,
          label: label
        }
      });
    }
  },

  /**
   * Canvas触摸移动事件
   */
  onChartTouchMove(e) {
    // 移动时也更新tooltip
    this.onChartTouchStart(e);
  },

  /**
   * Canvas触摸结束事件 - 隐藏tooltip
   */
  onChartTouchEnd(e) {
    const canvasId = e.currentTarget.id;
    const tooltipKey = canvasId === 'usageChart' ? 'usageTooltip' : 'balanceTooltip';
    
    // 延迟隐藏，让用户能看清数据
    setTimeout(() => {
      this.setData({
        [`${tooltipKey}.show`]: false
      });
    }, 1500);
  },

  /**
   * ⭐ 新增：加载游客模式数据
   */
  loadGuestModeData() {
    console.log('🎭 开始加载游客模式mock数据');
    
    // 获取mock电费数据
    const mockResult = mockData.getElectricData();
    
    if (mockResult) {
      wx.showLoading({ title: '加载体验数据...' });
      
      mockResult.then(res => {
        wx.hideLoading();
        
        if (res.success) {
          console.log('✅ 游客模式数据加载成功:', res.data);
          
          // 显示游客提示
          wx.showToast({
            title: '体验模式',
            icon: 'none',
            duration: 2000
          });
          
          // 设置mock数据
          this.setData({
            isGuest: true,
            showGuestBanner: true,
            hasGridAccount: true,
            checkingBinding: false,
            historyData: res.data.history || [],
            electricData: {
              balance: res.data.balance,
              currentMonthUsage: res.data.currentMonthUsage,
              lastMonthUsage: res.data.lastMonthUsage
            },
            userGridAccounts: res.data.boundAccounts || []
          });
          
          // 渲染图表
          if (res.data.chartData) {
            this.renderMockCharts(res.data.chartData);
          }
          
          // 停止下拉刷新（如果有）
          wx.stopPullDownRefresh();
        }
      }).catch(err => {
        wx.hideLoading();
        console.error('❌ 游客模式数据加载失败:', err);
        showError('数据加载失败');
      });
    }
  },

  /**
   * ⭐ 新增：渲染mock数据的图表
   */
  renderMockCharts(chartData) {
    console.log('📊 渲染游客模式图表:', chartData);
    
    // 这里可以调用现有的图表渲染逻辑
    // 简化版本：直接设置图表数据
    this.setData({
      showUsageChart: true,
      showBalanceChart: true,
      usageChartData: chartData,
      balanceChartData: chartData
    });
  },

  /**
   * ⭐ 新增：跳转登录页面
   */
  goToLogin() {
    wx.showModal({
      title: '提示',
      content: '登录后可查询真实电费数据，是否立即登录？',
      confirmText: '立即登录',
      success: (res) => {
        if (res.confirm) {
          // 清除游客模式标识
          wx.removeStorageSync('isGuestMode');
          // 跳转到登录页
          wx.redirectTo({
            url: '/pages/login/index'
          });
        }
      }
    });
  },

  /**
   * 检查并显示首次启动公告
   */
  checkAndShowFirstLaunchAnnouncement() {
    // 检查是否是首次启动
    const isFirstLaunch = wx.getStorageSync('isFirstLaunch');
    if (!isFirstLaunch) {
      return;
    }
    
    // 清除首次启动标记
    wx.removeStorageSync('isFirstLaunch');
    
    console.log('📱 首次启动小程序，准备显示公告弹窗');
    
    // 延迟显示公告弹窗，确保页面加载完成
    setTimeout(() => {
      this.loadAndShowAnnouncements();
    }, 1000);
  },

  /**
   * 加载并显示公告
   */
  loadAndShowAnnouncements() {
    wx.showLoading({ title: '加载公告...' });
    apiCall(
      () => API.announcement.getList(),
      null,
      (data) => {
        wx.hideLoading();
        const announcements = data.data || [];
        const activeAnnouncements = announcements.filter(item => item.is_active);
        
        if (activeAnnouncements.length === 0) {
          console.log('暂无活跃公告');
          return;
        }

        const noticeList = activeAnnouncements
          .sort((a, b) => (b.priority || 0) - (a.priority || 0))
          .map(item => ({
            id: item.id,
            content: item.content,
            date: (item.create_time || item.created_at || '').substring(0, 10),
            tag: item.title
          }));

        // 电费页面需要先设置 showNoticeModal 和 noticeModalList 数据
        this.setData({
          showNoticeModal: true,
          noticeModalList: noticeList
        });
      },
      (error) => {
        wx.hideLoading();
        console.error('加载公告失败:', error);
      }
    );
  },

  /**
   * 关闭公告弹窗
   */
  onNoticeModalClose() {
    this.setData({ showNoticeModal: false });
  }

});
