const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { testModeManager } = require('../../utils/testMode');
const mockData = require('../../utils/mock-data');
const featureUsage = require('../../utils/feature-usage');
const { userInfoCache } = require('../../utils/user-info-cache');
const { performanceMonitor, PERF_TYPES } = require('../../utils/performance-monitor');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { isDevtools } = require('../../utils/system-info');
const { calculateOvertimeFromTimes } = require('./time-overtime');
const { enableShareMenu } = require('../../utils/share');

Page({
  data: {
    pageAnimationClass: '',
    cardAnimationClass: '',
    todayAttendance: null,
    todayCheckedIn: false, // 今日是否已打卡
    recentAttendance: [],
    monthStats: null,
    workStatusOptions: [
      { value: '公司上班', label: '公司上班', icon: '🏢' },
      { value: '国内出差', label: '国内出差', icon: '🚄' },
      { value: '国外出差', label: '国外出差', icon: '✈️' },
      { value: '休息', label: '休息', icon: '🏠' },
      { value: '调休', label: '调休', icon: '📅' },
      { value: '加班', label: '加班', icon: '💻' }
    ],
    currentUser: null,
    needCompleteProfile: false, // 是否需要完善真实姓名
    loading: false,
    missedDays: [], // 漏打卡的日期列表
    showMissedReminder: false, // 是否显示漏打卡提醒
    hasLastMonthMissed: false, // 是否包含上月漏打卡
    // 日历相关
    calendarYear: 0,
    calendarMonth: 0,
    calendarDays: [], // 日历日期数组
    attendanceMap: {}, // 考勤记录映射 {date: {work_status, icon, ...}}
    calendarSummary: null,
    salaryRateConfig: {
      loaded: false,
      loading: false,
      overtimePayPerDay: 0,
      overtimePayPerHour: 0,
      workRestMode: 'double_rest'
    },
    syncingDingtalk: false,
    canSyncDingtalk: false,
    showCalendar: true, // 是否显示日历
    // 游客模式相关
    isGuest: false, // 是否为游客模式
    showGuestBanner: false, // 是否显示游客模式横幅
    ruleSetup: {
      loading: false,
      needsSetup: false,
      state: '',
      title: '',
      description: '',
      actionText: ''
    },
    // 时间显示相关
    currentTime: '00:00:00',
    formattedDate: '',
    greetingText: '你好', // 问候语
    greetingIcon: '/assets/icons/sun.png', // 问候图标
    hasNotification: false,
    // 编辑弹窗相关
    showEditModal: false,
    editForm: {
      id: '',
      type: 'office',
      date: '',
      time: '',
      location: '',
      baseName: '',
      subsidy: '',
      hasDingAttendance: false,
      dingAttendance: {},
      holidayInfo: {},
      overtime: {},
      overtimeCalc: null,
      overtimeHoursInput: '',
      overtimeHoursTouched: false,
      checkInDate: '',
      checkInTime: '',
      checkOutDate: '',
      checkOutTime: '',
      checkOutDayOffset: 0,
      checkInDateTimeRange: [],
      checkInDateTimeValue: [],
      checkInDateTimeText: '',
      checkOutDateTimeRange: [],
      checkOutDateTimeValue: [],
      checkOutDateTimeText: '',
      timeCalc: null,
      calendarStamp: ''
    },
    quickCheckInTimes: [
      { value: '08:30', label: '08:30' },
      { value: '09:00', label: '09:00' },
      { value: '09:30', label: '09:30' }
    ],
    quickCheckOutTimes: [
      { value: '18:00', label: '18:00' },
      { value: '19:00', label: '19:00' },
      { value: '20:00', label: '20:00' },
      { value: '21:00', label: '21:00' }
    ],
    checkOutDayOffsetOptions: [
      { value: 0, label: '当日' },
      { value: 1, label: '次日' }
    ],
    // 保存结果弹窗相关
    showResultModal: false,
    resultSuccess: true,
    resultMsg: '',
    // 公告弹窗相关
    showNoticeModal: false,
    noticeModalList: [],
    // 打卡弹窗相关
    showCheckinModal: false,
    checkinForm: {
      type: 'office',
      date: '', // 打卡日期
      baseName: '',
      subsidy: ''
    },
    // 删除确认弹窗相关
    showDeleteModal: false,
    deleteRecordId: null,
    // 删除进度弹窗相关
    isDeleting: false,
    deleteProgress: 0,
    deleteCurrentStep: '',
    showDeleteResult: false,
    deleteResultSuccess: true,
    deleteResultMsg: '',
    deleteSteps: {
      db_deleted: false,
      db_msg: '',
      excel_cleared: false,
      excel_msg: '',
      nas_uploaded: false,
      nas_msg: ''
    }
  },

  // ========== 性能优化相关 ==========
  _isTestMode: false,           // 缓存测试模式状态
  _lastRefreshTime: 0,          // 上次刷新时间
  _dataStaleCheckInterval: 30000, // 数据过期检查间隔（30秒）

  /**
   * 格式化PutDate字段为时间显示
   * @param {string} putDate - PutDate字段值，格式如 "2025-09-25 09:00:00"
   * @returns {string} 格式化后的时间，如 "09:00"
   */
  formatPutDateTime(putDate) {
    if (!putDate) return '未知';
    
    try {
      // 如果是完整的日期时间格式
      if (putDate.includes(' ')) {
        const timePart = putDate.split(' ')[1];
        if (timePart) {
          // 提取小时:分钟部分
          return timePart.substring(0, 5);
        }
      }
      
      // 如果只是时间格式
      if (putDate.includes(':')) {
        return putDate.substring(0, 5);
      }
      
      return putDate;
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      return '未知';
    }
  },

  /**
   * 将不同接口包装层里的考勤列表统一转换为数组。
   * 后端迁移后可能返回 null、数组、{data: []} 或 {data: {records: []}}。
   */
  normalizeAttendanceList(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    if (Array.isArray(payload.responseData)) return payload.responseData;
    if (Array.isArray(payload.records)) return payload.records;
    if (Array.isArray(payload.list)) return payload.list;
    if (Array.isArray(payload.items)) return payload.items;

    const data = payload.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.records)) return data.records;
      if (Array.isArray(data.list)) return data.list;
      if (Array.isArray(data.items)) return data.items;
    }

    return [];
  },

  getAttendanceWorkDate(record) {
    if (!record || typeof record !== 'object') return '';
    return record.work_date || record.WorkDate || record.date || record.workDate || '';
  },

  /**
   * 打卡成功后立即同步首页顶部按钮状态，避免依赖后续接口刷新。
   * 仅当提交的是今天的记录时才禁用顶部打卡按钮。
   * @param {object} attendancePayload
   */
  applyImmediateTodayAttendance(attendancePayload) {
    if (!attendancePayload || !attendancePayload.work_date) return;

    const todayStr = this.getDateString(new Date());
    if (attendancePayload.work_date !== todayStr) return;

    const submitTime = attendancePayload.put_date || attendancePayload.submit_time || new Date().toISOString();

    this.setData({
      todayAttendance: {
        id: attendancePayload.id || this.data.todayAttendance?.id || '',
        work_status: attendancePayload.work_status,
        submit_time: this.formatPutDateTime(submitTime),
        work_date: attendancePayload.work_date,
        comment: attendancePayload.comment || '',
        name: attendancePayload.name || this.data.currentUser?.real_name || ''
      },
      todayCheckedIn: true,
      needCompleteProfile: false
    });
  },

  /**
   * 获取工作状态对应的CSS类名
   * @param {string} workStatus - 工作状态，如"公司上班"
   * @returns {string} 对应的CSS类名，如"company-work"
   */
  getStatusClass(workStatus) {
    const statusMap = {
      '公司上班': 'company-work',
      '国内出差': 'domestic-trip', 
      '国外出差': 'foreign-trip',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'overtime'
    };
    return statusMap[workStatus] || 'unknown';
  },

  onLoad() {
    // ===== 性能监控：页面加载开始 =====
    performanceMonitor.mark('attendance_page_load_start');
    
    // 缓存测试模式状态（避免重复读取Storage）
    this._isTestMode = testModeManager.isTestMode();
    
    // 检查游客模式
    const isGuest = mockData.isGuestMode();
    this.setData({ 
      isGuest: isGuest,
      showGuestBanner: isGuest 
    });
    
    // 启动时间更新定时器
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
    
    // 记录功能使用（非阻塞）
    setTimeout(() => {
      featureUsage.recordFeatureUsage('attendance', '考勤管理', '📋');
    }, 0);
    
    enableShareMenu('考勤管理');
    
    this.updateCurrentDate();
    this.initCalendar(); // 初始化日历
    this.loadUserInfo();
    this.loadTodayAttendance();
    this.loadRecentAttendance();
    // 注意：checkMissedAttendance() 会在 loadUserInfo() 完成后自动调用
    // 不在这里直接调用，避免竞态条件
    
    // 检查是否首次启动，如果是则显示公告弹窗
    this.checkAndShowFirstLaunchAnnouncement();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('考勤管理页面-测试模式热加载');
      // 清除用户信息缓存
      userInfoCache.clear();
      this._isTestMode = testModeManager.isTestMode();
      this.loadUserInfo();
      this.loadTodayAttendance();
      this.loadRecentAttendance();

      // 更新日历
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

      // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
      setTimeout(() => {
        this.checkMissedAttendance();
      }, 500);
    });
  },

  onShow() {
      // 触发页面进入动画
      const { triggerPageAnimation } = require('../../utils/page-animation');
      triggerPageAnimation();

      const tabBar = this.getTabBar();
      if (tabBar) tabBar.init();

      // ===== 关键修复：每次显示页面时都重新检测测试模式和游客模式 =====
      const oldTestMode = this._isTestMode;
      const newTestMode = testModeManager.isTestMode();
      const testModeChanged = oldTestMode !== newTestMode;

      // 检查游客模式变化
      const oldGuestMode = this.data.isGuest || false;
      const newGuestMode = mockData.isGuestMode();
      const guestModeChanged = oldGuestMode !== newGuestMode;
      this.loadDingtalkSyncAvailability(newGuestMode || newTestMode);
      this.loadAttendanceRuleSetup(newGuestMode || newTestMode);

      // 更新游客模式状态
      if (guestModeChanged) {
        console.log(`🔄 考勤管理-游客模式状态变化: ${oldGuestMode} -> ${newGuestMode}`);
        this.setData({ 
          isGuest: newGuestMode,
          showGuestBanner: newGuestMode 
        });
      }

      if (testModeChanged || guestModeChanged) {
        console.log(`🔄 测试模式状态变化: ${oldTestMode} -> ${newTestMode}`);
        this._isTestMode = newTestMode;

        // 清除缓存并强制刷新所有数据
        userInfoCache.clear();
        this.setData({
          needCompleteProfile: false,
          showNameCompleteHint: false,
          loading: false
        });

        // 强制刷新数据
        this._lastRefreshTime = 0; // 重置刷新时间，强制刷新
        this.refreshPageData();
        return;
      }

      // 重置一些状态标志，确保界面刷新正确
      this.setData({
        needCompleteProfile: false,
        showNameCompleteHint: false,
        loading: false
      });

      // 检查是否需要强制刷新（从编辑页面返回）
      // 修复：改为调refreshPageData() 统一处理数据刷新，避免重复加载
      if (this._needRefreshCalendar) {
        console.log('🔄 检测到需要刷新标记，强制刷新所有数据（包括日历）');
        this._needRefreshCalendar = false; // 重置标记

        // 调refreshPageData() 统一处理数据刷新
        // 这会刷新用户信息、今日考勤、最近记录和日历数据
        this._lastRefreshTime = Date.now(); // 更新刷新时间
        this.refreshPageData();
        return;
      }

      // ===== 性能优化：智能刷新机制 =====
      // 检查是否需要刷新（避免频繁无意义的刷新）
      const now = Date.now();
      const timeSinceLastRefresh = now - this._lastRefreshTime;

      // 如果距离上次刷新不到30秒，跳过刷新
      if (timeSinceLastRefresh < this._dataStaleCheckInterval) {
        console.log('[性能优化] 跳过频繁刷新，距上次刷新:', Math.floor(timeSinceLastRefresh / 1000), '秒');
        return;
      }

      // 检查数据是否过期（智能判断）
      if (!this.isDataStale()) {
        console.log('[性能优化] 数据未过期，跳过刷新');
        return;
      }

      // 页面显示时重新加载用户信息和今日考勤状态
      console.log('页面显示：重新加载数据以确保状态同步');
      this._lastRefreshTime = now;
      this.refreshPageData();

      // 修复：移除重复的 loadCalendarAttendance() 调用
      // refreshPageData() 已经包含了日历数据的加载逻辑
    },

  onUnload() {
    // 清理定时器
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  },

  /**
   * 更新当前时间显示
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}:${seconds}`;
    
    // 格式化日期
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    const formattedDate = `${year}年${month}月${day} · 周${weekday}`;
    
    // 根据时间段设置问候语
    const hour = now.getHours();
    let greetingText = '你好';
    let greetingIcon = '/assets/icons/sun.png';
    
    if (hour >= 5 && hour < 12) {
      greetingText = '早安';
      greetingIcon = '/assets/icons/sun.png';
    } else if (hour >= 12 && hour < 14) {
      greetingText = '午安';
      greetingIcon = '/assets/icons/sun.png';
    } else if (hour >= 14 && hour < 18) {
      greetingText = '下午好';
      greetingIcon = '/assets/icons/cloud-sun.png';
    } else if (hour >= 18 && hour < 22) {
      greetingText = '晚上好';
      greetingIcon = '/assets/icons/cloud-sun.png';
    } else {
      greetingText = '夜深了';
      greetingIcon = '/assets/icons/clock.png';
    }
    
    this.setData({
      currentTime,
      formattedDate,
      greetingText,
      greetingIcon
    });
  },
  
  /**
   * 分享给好友
   */
  onShareAppMessage(res) {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `考勤管理 - ${appName}`,
      path: '/pages/attendance/index'
    };
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `考勤管理 - ${appName}`,
      query: ''
    };
  },

  /**
   * 检查数据是否过期（需要刷新）
   * @returns {boolean}
   */
  isDataStale() {
    // 如果今日考勤状态未知且用户不需要完善信息，说明数据可能未加载
    if (!this.data.todayAttendance && !this.data.needCompleteProfile) {
      console.log('[数据检查] 今日考勤未加载，需要刷新');
      return true;
    }
    
    // 如果最近记录为空（且不是因为用户未完善信息），说明需要加载
    if (!this.data.recentAttendance || this.data.recentAttendance.length === 0) {
      if (!this.data.needCompleteProfile && !this.data.showNameCompleteHint) {
        console.log('[数据检查] 最近记录为空，需要刷新');
        return true;
      }
    }
    
    // 数据有效，不需要刷新
    console.log('[数据检查] 数据有效，无需刷新');
    return false;
  },

  /**
   * 刷新页面数据
   */
  refreshPageData() {
    // ===== 性能监控：数据刷新开始 =====
    performanceMonitor.mark('attendance_refresh_start');
    
    // 未登录预览只显示空状态。
    if (mockData.isGuestMode()) {
      console.log('刷新页面-未登录预览：保持空状态');
      this.loadUserInfo();
      this.loadTodayAttendance();
      this.loadRecentAttendance();
      this.loadCalendarAttendance(this.data.calendarYear, this.data.calendarMonth);
      wx.stopPullDownRefresh();
      return;
    }
    
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：使用本地用户信息
      console.log('考勤页面-测试模式：使用本地用户信息');
      let userInfo = wx.getStorageSync('userInfo');
      
      // 确保有完整的用户信息
      if (!userInfo || Object.keys(userInfo).length === 0) {
        userInfo = this.initTestModeUserInfo();
      }
      
      this.setData({ currentUser: userInfo });
      wx.setStorageSync('userInfo', userInfo);

      // 加载今日考勤状态和最近记录
      this.loadTodayAttendance();
      this.loadRecentAttendance();
      this.loadSalaryRateConfig(userInfo);

      // 更新日历
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

      // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
      setTimeout(() => {
        this.checkMissedAttendance();
      }, 500);

      // 性能监控：刷新完成
      performanceMonitor.measure('attendance_refresh', 'attendance_refresh_start', PERF_TYPES.PAGE_LOAD);
      return;
    }
    
    // ===== 性能优化：使用用户信息缓存 =====
    // 正常模式：使用缓存获取用户信息
    userInfoCache.get()
      .then((userInfo) => {
        console.log('[性能优化] 使用缓存的用户信息:', userInfo);
        this.setData({ currentUser: userInfo });

        // 用户信息加载完成后，立即加载今日考勤状态和最近记录
        this.loadTodayAttendance();
        this.loadRecentAttendance();
        this.loadSalaryRateConfig(userInfo);

        // 更新日历
        const now = new Date();
        this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

        // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
        setTimeout(() => {
          this.checkMissedAttendance();
        }, 500);

        // 更新当前日期显示
        this.updateCurrentDate();

        // 性能监控：刷新完成
        performanceMonitor.measure('attendance_refresh', 'attendance_refresh_start', PERF_TYPES.PAGE_LOAD);
      })
      .catch((error) => {
        console.log('[性能优化] 获取用户信息失败:', error);
        // 即使用户信息加载失败，也尝试加载考勤状态
        this.loadTodayAttendance();
        this.loadRecentAttendance();
        // 确保下拉刷新结束
        wx.stopPullDownRefresh();
        
        // 性能监控：刷新完成（失败）
        performanceMonitor.measure('attendance_refresh_failed', 'attendance_refresh_start', PERF_TYPES.PAGE_LOAD);
      });
  },

  toFiniteNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  },

  formatCalcHours(value) {
    const num = Math.round(this.toFiniteNumber(value) * 100) / 100;
    return Number.isInteger(num) ? String(num) : num.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  },

  loadAttendanceRuleSetup(skipCheck = false) {
    const attendanceAPI = API && API.attendance;
    if (skipCheck || !attendanceAPI || typeof attendanceAPI.getRuleDocument !== 'function') {
      this.setData({
        ruleSetup: {
          loading: false,
          needsSetup: false,
          state: '',
          title: '',
          description: '',
          actionText: ''
        }
      });
      return Promise.resolve();
    }

    this.setData({ 'ruleSetup.loading': true });
    return attendanceAPI.getRuleDocument().then(res => {
      if (!res || res.code !== 200) throw new Error((res && res.msg) || '读取考勤规则失败');
      const meta = (res.data && res.data.meta) || {};
      const state = meta.setup_state || (meta.status === 'legacy_v1' ? 'unconfigured' : '');
      const needsSetup = meta.needs_setup === true || state === 'unconfigured' || state === 'draft_unpublished';
      const isDraft = state === 'draft_unpublished';
      this.setData({
        ruleSetup: {
          loading: false,
          needsSetup,
          state,
          title: isDraft ? '考勤规则还没有发布' : '先完成考勤规则配置',
          description: isDraft
            ? '你已经保存了规则草稿，但当前考勤和工资计算还不会使用它。请检查后发布。'
            : '选择一个适合你的考勤方案，系统会生成班次和每周安排，再由你确认发布。',
          actionText: isDraft ? '继续配置并发布' : '选择考勤方案'
        }
      });
    }).catch(() => {
      this.setData({ 'ruleSetup.loading': false, 'ruleSetup.needsSetup': false });
    });
  },

  goToAttendanceRuleSetup() {
    wx.navigateTo({ url: '/pages/attendance/rules/index?setup=1' });
  },

  normalizeTimeText(value) {
    if (!value) return '';
    const text = String(value);
    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return '';

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  },

  normalizeDateText(value) {
    if (!value) return '';
    const text = String(value);
    const dateMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
    return dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';
  },

  padDateTimePart(value) {
    return String(value).padStart(2, '0');
  },

  buildNumberOptions(start, end) {
    const result = [];
    for (let value = start; value <= end; value += 1) {
      result.push(this.padDateTimePart(value));
    }
    return result;
  },

  getDateTimePickerYears(selectedYear) {
    const currentYear = new Date().getFullYear();
    const safeSelectedYear = Number(selectedYear) || currentYear;
    const startYear = Math.min(currentYear - 5, safeSelectedYear - 2);
    const endYear = Math.max(currentYear + 5, safeSelectedYear + 2);
    const years = [];

    for (let year = startYear; year <= endYear; year += 1) {
      years.push(String(year));
    }

    return years;
  },

  getDaysInMonth(year, month) {
    return new Date(Number(year), Number(month), 0).getDate();
  },

  getDateTimeParts(dateText, timeText, fallbackTime = '09:00') {
    const now = new Date();
    const normalizedDate = this.normalizeDateText(dateText) || this.getDateString(now);
    const normalizedTime = this.normalizeTimeText(timeText) || fallbackTime;
    const dateParts = normalizedDate.split('-').map(item => Number(item));
    const timeParts = normalizedTime.split(':').map(item => Number(item));

    return {
      year: dateParts[0],
      month: dateParts[1],
      day: dateParts[2],
      hour: timeParts[0],
      minute: timeParts[1]
    };
  },

  buildDateTimePickerState(dateText, timeText, fallbackTime = '09:00') {
    const parts = this.getDateTimeParts(dateText, timeText, fallbackTime);
    const years = this.getDateTimePickerYears(parts.year);
    const months = this.buildNumberOptions(1, 12);
    const days = this.buildNumberOptions(1, this.getDaysInMonth(parts.year, parts.month));
    const hours = this.buildNumberOptions(0, 23);
    const minutes = this.buildNumberOptions(0, 59);
    const range = [years, months, days, hours, minutes];
    const clampedDay = Math.min(parts.day, days.length);
    const date = `${parts.year}-${this.padDateTimePart(parts.month)}-${this.padDateTimePart(clampedDay)}`;
    const time = `${this.padDateTimePart(parts.hour)}:${this.padDateTimePart(parts.minute)}`;

    return {
      range,
      value: [
        Math.max(years.indexOf(String(parts.year)), 0),
        Math.max(months.indexOf(this.padDateTimePart(parts.month)), 0),
        Math.max(days.indexOf(this.padDateTimePart(clampedDay)), 0),
        Math.max(hours.indexOf(this.padDateTimePart(parts.hour)), 0),
        Math.max(minutes.indexOf(this.padDateTimePart(parts.minute)), 0)
      ],
      date,
      time,
      text: `${date} ${time}`
    };
  },

  resolveDateTimePickerValue(range = [], value = []) {
    const safeRange = Array.isArray(range) ? range : [];
    const safeValue = Array.isArray(value) ? value : [];
    const year = safeRange[0] && safeRange[0][safeValue[0]] ? Number(safeRange[0][safeValue[0]]) : new Date().getFullYear();
    const month = safeRange[1] && safeRange[1][safeValue[1]] ? Number(safeRange[1][safeValue[1]]) : 1;
    const maxDay = this.getDaysInMonth(year, month);
    const selectedDay = safeRange[2] && safeRange[2][safeValue[2]] ? Number(safeRange[2][safeValue[2]]) : 1;
    const day = Math.min(selectedDay, maxDay);
    const hour = safeRange[3] && safeRange[3][safeValue[3]] ? Number(safeRange[3][safeValue[3]]) : 0;
    const minute = safeRange[4] && safeRange[4][safeValue[4]] ? Number(safeRange[4][safeValue[4]]) : 0;
    const date = `${year}-${this.padDateTimePart(month)}-${this.padDateTimePart(day)}`;
    const time = `${this.padDateTimePart(hour)}:${this.padDateTimePart(minute)}`;

    return { date, time };
  },

  buildDateTimePickerColumnState(range, value, column, columnValue) {
    const nextValue = Array.isArray(value) ? value.slice() : [0, 0, 0, 0, 0];
    nextValue[column] = columnValue;
    const selected = this.resolveDateTimePickerValue(range, nextValue);
    return this.buildDateTimePickerState(selected.date, selected.time);
  },

  buildEditFormDateTimeState(form = {}) {
    const checkInState = this.buildDateTimePickerState(form.checkInDate || form.date, form.checkInTime, '09:00');
    const checkOutState = this.buildDateTimePickerState(form.checkOutDate || form.date, form.checkOutTime, '18:00');

    return {
      checkInDateTimeRange: checkInState.range,
      checkInDateTimeValue: checkInState.value,
      checkInDateTimeText: checkInState.text,
      checkOutDateTimeRange: checkOutState.range,
      checkOutDateTimeValue: checkOutState.value,
      checkOutDateTimeText: checkOutState.text
    };
  },

  buildEditFormDateTimeStatePatch(form = {}) {
    const state = this.buildEditFormDateTimeState(form);
    return {
      'editForm.checkInDateTimeRange': state.checkInDateTimeRange,
      'editForm.checkInDateTimeValue': state.checkInDateTimeValue,
      'editForm.checkInDateTimeText': state.checkInDateTimeText,
      'editForm.checkOutDateTimeRange': state.checkOutDateTimeRange,
      'editForm.checkOutDateTimeValue': state.checkOutDateTimeValue,
      'editForm.checkOutDateTimeText': state.checkOutDateTimeText
    };
  },

  formatDateTimeMinuteText(value, fallbackDate = '', fallbackTime = '') {
    const date = this.normalizeDateText(value) || this.normalizeDateText(fallbackDate);
    const time = this.normalizeTimeText(value) || this.normalizeTimeText(fallbackTime);

    if (date && time) return `${date} ${time}`;
    return time || date || '';
  },

  normalizeDingAttendanceDisplay(dingAttendance = {}, workDate = '') {
    const result = Object.assign({}, dingAttendance || {});
    result.check_in_datetime_text = this.formatDateTimeMinuteText(
      result.check_in_time,
      workDate,
      result.check_in_time_text
    );
    result.check_out_datetime_text = this.formatDateTimeMinuteText(
      result.check_out_time,
      workDate,
      result.check_out_time_text
    );
    return result;
  },

  addDaysToDateText(dateText, dayOffset = 0) {
    const normalizedDate = this.normalizeDateText(dateText);
    if (!normalizedDate) return '';

    const parts = normalizedDate.split('-').map(item => Number(item));
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() + Number(dayOffset || 0));
    return this.getDateString(date);
  },

  getCheckOutDayOffset(workDate, checkOutDate) {
    const baseDate = this.normalizeDateText(workDate);
    const targetDate = this.normalizeDateText(checkOutDate);
    if (!baseDate || !targetDate || targetDate <= baseDate) return 0;
    return 1;
  },

  buildCheckOutDateByOffset(workDate, offset) {
    return this.addDaysToDateText(workDate, Number(offset || 0)) || workDate || '';
  },

  getAttendanceCheckTimeRange(attendance = {}) {
    const dingAttendance = attendance.ding_attendance || attendance.dingAttendance || {};
    const checkInSource = attendance.check_in_time ||
      attendance.checkInTime ||
      dingAttendance.check_in_time ||
      dingAttendance.check_in_time_text;
    const checkOutSource = attendance.check_out_time ||
      attendance.checkOutTime ||
      dingAttendance.check_out_time ||
      dingAttendance.check_out_time_text;

    return {
      checkInDate: this.normalizeDateText(checkInSource),
      checkInTime: this.normalizeTimeText(checkInSource),
      checkOutDate: this.normalizeDateText(checkOutSource),
      checkOutTime: this.normalizeTimeText(checkOutSource)
    };
  },

  hasDingCheckTime(dingAttendance = {}) {
    return !!(
      dingAttendance &&
      (
        dingAttendance.check_in_time ||
        dingAttendance.check_in_time_text ||
        dingAttendance.check_out_time ||
        dingAttendance.check_out_time_text ||
        dingAttendance.has_ding_attendance
      )
    );
  },

  buildEditFormDingTimePatch(dingAttendance = {}, workDate = '') {
    const timeRange = this.getAttendanceCheckTimeRange({ ding_attendance: dingAttendance });
    const checkInDate = timeRange.checkInDate || workDate;
    const checkOutDate = timeRange.checkOutDate || workDate;
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkInDate,
      checkInTime: timeRange.checkInTime || (this.data.editForm && this.data.editForm.checkInTime),
      checkOutDate,
      checkOutTime: timeRange.checkOutTime || (this.data.editForm && this.data.editForm.checkOutTime)
    });
    const patch = this.buildEditFormDateTimeStatePatch(nextForm);

    if (checkInDate) patch['editForm.checkInDate'] = checkInDate;
    if (timeRange.checkInTime) patch['editForm.checkInTime'] = timeRange.checkInTime;
    if (checkOutDate) patch['editForm.checkOutDate'] = checkOutDate;
    if (timeRange.checkOutTime) patch['editForm.checkOutTime'] = timeRange.checkOutTime;
    patch['editForm.checkOutDayOffset'] = this.getCheckOutDayOffset(workDate, checkOutDate);

    return patch;
  },

  syncEditWorkDate(nextDate) {
    const calendarInfo = (this.data.attendanceMap && this.data.attendanceMap[nextDate]) || {};
    const checkOutDayOffset = Number(this.data.editForm.checkOutDayOffset || 0);
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      date: nextDate,
      checkInDate: nextDate,
      checkOutDate: this.buildCheckOutDateByOffset(nextDate, checkOutDayOffset)
    });

    this.setData(Object.assign({
      'editForm.date': nextDate,
      'editForm.holidayInfo': calendarInfo.holiday_info || {},
      'editForm.calendarStamp': calendarInfo.calendar_stamp || '',
      'editForm.checkInDate': nextDate,
      'editForm.checkOutDate': nextForm.checkOutDate
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  formatCalcCurrency(value) {
    const num = Math.round(this.toFiniteNumber(value) * 100) / 100;
    return num.toFixed(2);
  },

  loadSalaryRateConfig(userInfo = this.data.currentUser) {
    const defaultConfig = {
      loaded: true,
      loading: false,
      overtimePayPerDay: 250,
      overtimePayPerHour: 30,
      workRestMode: 'double_rest'
    };

    if (mockData.isGuestMode()) {
      this.setData({
        salaryRateConfig: Object.assign({}, defaultConfig, {
          loaded: false,
          overtimePayPerDay: 0,
          overtimePayPerHour: 0
        })
      });
      this.updateEditModalOvertimeCalc();
      return;
    }

    if (this._isTestMode) {
      this.setData({ salaryRateConfig: defaultConfig });
      this.updateEditModalOvertimeCalc();
      return;
    }

    const userName = userInfo && (userInfo.real_name || userInfo.nickname);
    if (!userName) {
      this.setData({
        salaryRateConfig: Object.assign({}, defaultConfig, {
          loaded: false,
          overtimePayPerDay: 0,
          overtimePayPerHour: 0
        })
      });
      this.updateEditModalOvertimeCalc();
      return;
    }

    if (this.data.salaryRateConfig && this.data.salaryRateConfig.loading) {
      return;
    }

    this.setData({
      'salaryRateConfig.loading': true
    });

    API.attendance.getNetdiskInfo(userName)
      .then((res) => {
        const netdiskInfo = res && res.data ? res.data : res;
        const nextConfig = {
          loaded: true,
          loading: false,
          overtimePayPerDay: this.toFiniteNumber(netdiskInfo && netdiskInfo.overtime_pay_per_day, defaultConfig.overtimePayPerDay),
          overtimePayPerHour: this.toFiniteNumber(netdiskInfo && netdiskInfo.overtime_pay_per_hour, defaultConfig.overtimePayPerHour),
          workRestMode: (netdiskInfo && netdiskInfo.work_rest_mode) || defaultConfig.workRestMode
        };
        this.setData({ salaryRateConfig: nextConfig });
        this.updateEditModalOvertimeCalc();
      })
      .catch((err) => {
        console.log('加载工资单价配置失败，日期弹窗使用默认配置:', err);
        this.setData({ salaryRateConfig: defaultConfig });
        this.updateEditModalOvertimeCalc();
      });
  },

  getDateWeekday(dateText) {
    const parts = String(dateText || '').split('-').map(item => Number(item));
    if (parts.length !== 3 || parts.some(item => !Number.isFinite(item))) {
      return null;
    }
    return new Date(parts[0], parts[1] - 1, parts[2]).getDay();
  },

  resolveOvertimePayRule(dateText, holidayInfo = {}, salaryRateConfig = {}) {
    const weekday = this.getDateWeekday(dateText);
    const isSaturday = weekday === 6;
    const workRestMode = salaryRateConfig.workRestMode || 'double_rest';
    const isLegalHoliday = !!holidayInfo.is_legal_holiday || holidayInfo.work_type === 'legal_holiday';
    const isAdjustedWorkday = !!holidayInfo.is_adjusted_workday || holidayInfo.work_type === 'adjusted_workday';
    const isRestDay = !!holidayInfo.is_rest_day || holidayInfo.work_type === 'rest_day';

    if (isLegalHoliday) {
      return { multiplier: 3, typeText: '法定休息', multiplierText: '三倍' };
    }

    if (isAdjustedWorkday) {
      return { multiplier: 1, typeText: '调休上班', multiplierText: '' };
    }

    if (isRestDay && !(workRestMode === 'single_rest' && isSaturday)) {
      return { multiplier: 2, typeText: holidayInfo.work_type_text || '休息日', multiplierText: '双倍' };
    }

    if (workRestMode === 'single_rest' && isSaturday) {
      return { multiplier: 1, typeText: '工作日（单休周六）', multiplierText: '' };
    }

    return { multiplier: 1, typeText: holidayInfo.work_type_text || '工作日', multiplierText: '' };
  },

  buildDayOvertimeCalc(attendance = {}) {
    const overtime = attendance.overtime || {};
    const dingAttendance = attendance.ding_attendance || {};
    const inputHours = attendance.overtimeHoursInput !== undefined ? this.toFiniteNumber(attendance.overtimeHoursInput, 0) : null;
    const hours = Math.max(
      inputHours !== null ? inputHours : this.toFiniteNumber(overtime.effective_hours, this.toFiniteNumber(dingAttendance.overtime_hours, 0)),
      0
    );
    const salaryRateConfig = this.data.salaryRateConfig || {};
    const fixedRate = this.toFiniteNumber(salaryRateConfig.overtimePayPerHour, 0);
    const multiplierRate = this.toFiniteNumber(salaryRateConfig.overtimePayPerDay, fixedRate);
    const rule = this.resolveOvertimePayRule(
      attendance.work_date || attendance.date,
      attendance.holiday_info || attendance.holidayInfo || {},
      salaryRateConfig
    );

    let baseHours = 0;
    let extraHours = 0;
    let amount = 0;
    let formulaText = '';

    if (rule.multiplier > 1) {
      baseHours = Math.min(hours, 8);
      extraHours = Math.max(hours - baseHours, 0);
      amount = Math.round((baseHours * multiplierRate * rule.multiplier + extraHours * fixedRate) * 100) / 100;
      formulaText = `${this.formatCalcHours(baseHours)}h x ${rule.multiplierText} x ¥${this.formatCalcCurrency(multiplierRate)} + ${this.formatCalcHours(extraHours)}h x ¥${this.formatCalcCurrency(fixedRate)}`;
    } else {
      baseHours = hours;
      amount = Math.round(hours * fixedRate * 100) / 100;
      formulaText = `${this.formatCalcHours(hours)}h x ¥${this.formatCalcCurrency(fixedRate)}`;
    }

    const configReady = salaryRateConfig.loaded && fixedRate > 0 && (rule.multiplier <= 1 || multiplierRate > 0);

    return {
      show: true,
      typeText: rule.typeText,
      multiplierText: rule.multiplierText || '普通',
      hoursText: this.formatCalcHours(hours),
      baseHoursText: this.formatCalcHours(baseHours),
      extraHoursText: this.formatCalcHours(extraHours),
      amountText: configReady ? this.formatCalcCurrency(amount) : '0.00',
      fixedRateText: this.formatCalcCurrency(fixedRate),
      multiplierRateText: this.formatCalcCurrency(multiplierRate),
      formulaText,
      warningText: configReady ? '' : '未读取到有效工资单价配置，金额暂按0显示'
    };
  },

  buildTimeOvertimeCalc(form = {}) {
    const salaryRateConfig = this.data.salaryRateConfig || {};
    const result = calculateOvertimeFromTimes({
      dateText: form.date,
      checkInDate: form.checkInDate || form.date,
      checkInTime: form.checkInTime,
      checkOutDate: form.checkOutDate || form.date,
      checkOutTime: form.checkOutTime,
      holidayInfo: form.holidayInfo || {},
      workRestMode: salaryRateConfig.workRestMode || 'double_rest'
    });

    if (!result.valid) {
      return {
        show: false,
        intervalHoursText: '0',
        rawHoursText: '0',
        deductionHoursText: '0',
        effectiveHoursText: '0',
        modeText: ''
      };
    }

    return {
      show: true,
      intervalHours: result.intervalHours,
      rawHours: result.rawHours,
      deductionHours: result.deductionHours,
      effectiveHours: result.effectiveHours,
      intervalHoursText: this.formatCalcHours(result.intervalHours),
      rawHoursText: this.formatCalcHours(result.rawHours),
      deductionHoursText: this.formatCalcHours(result.deductionHours),
      effectiveHoursText: this.formatCalcHours(result.effectiveHours),
      modeText: result.mode === 'rest' ? '休息日' : '工作日'
    };
  },

  updateEditModalOvertimeCalc() {
    if (!this.data.showEditModal || !this.data.editForm) {
      return;
    }

    const form = this.data.editForm;
    const overtimeCalc = this.buildDayOvertimeCalc({
      work_date: form.date,
      holiday_info: form.holidayInfo,
      overtime: form.overtime,
      ding_attendance: form.dingAttendance,
      overtimeHoursInput: form.overtimeHoursInput
    });

    this.setData({
      'editForm.overtimeCalc': overtimeCalc
    });
  },

  updateEditModalTimeCalc(options = {}) {
    if (!this.data.showEditModal || !this.data.editForm) {
      return;
    }

    const timeCalc = this.buildTimeOvertimeCalc(this.data.editForm);
    const nextData = {
      'editForm.timeCalc': timeCalc
    };

    if (timeCalc.show && options.applyToHours !== false) {
      const effectiveHoursText = this.formatCalcHours(timeCalc.effectiveHours);
      nextData['editForm.overtimeHoursInput'] = effectiveHoursText;
      nextData['editForm.overtimeHoursTouched'] = true;
      nextData['editForm.overtime.effective_hours'] = timeCalc.effectiveHours;
      nextData['editForm.overtime.rule_text'] = '按上下班时间计算，手动覆盖加班小时';
      nextData['editForm.dingAttendance.overtime_hours'] = timeCalc.effectiveHours;
    }

    this.setData(nextData, () => {
      this.updateEditModalOvertimeCalc();
    });
  },

  /**
   * 初始化测试模式用户信息
   */
  initTestModeUserInfo() {
    const testUserInfo = {
      id: 'test_user_001',
      openid: 'test_openid_001',
      nickname: '微信用户d_001', // 与testMode.js保持一致
      avatar_url: '/images/default-avatar.png',
      real_name: '', // 测试未完善真实姓名的场景
      is_web_bound: false,
      web_username: null,
      web_user_level: null,
      user_level: 'user',
      is_admin: false,
      is_active: true,
      register_time: '2025-09-25 10:00:00',
      last_login: '2025-09-25 12:00:00',
      permissions: [
        { code: 'electric_query', name: '电费查询', is_granted: true },
        { code: 'attendance', name: '考勤管理', is_granted: true }
      ]
    };
    
    // 保存到本地存储
    wx.setStorageSync('userInfo', testUserInfo);
    console.log('考勤页面测试模式：已初始化用户信息', testUserInfo);
    
    return testUserInfo;
  },

  onPullDownRefresh() {
    if (mockData.showGuestModeTip('attendance')) {
      wx.stopPullDownRefresh();
      return;
    }

    // 下拉刷新时，重新检查用户信息并刷新所有数据
    console.log('下拉刷新：重新加载所有数据');
    this.refreshPageData();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 未登录预览：不构造用户身份或业务数据。
    if (mockData.isGuestMode()) {
      console.log('考勤用户信息-未登录预览：保持为空');
      this.setData({
        currentUser: null,
        needCompleteProfile: false
      });
      this.loadSalaryRateConfig(null);
      return;
    }
    
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：使用本地存储的用户信息
      console.log('考勤管理-测试模式：使用本地用户信息');
      let userInfo = wx.getStorageSync('userInfo');
      
      // 确保有完整的用户信息
      if (!userInfo || Object.keys(userInfo).length === 0) {
        userInfo = this.initTestModeUserInfo();
      }
      
      this.setData({ 
        currentUser: userInfo,
        needCompleteProfile: false // 测试模式下不需要完善信息
      });
      this.loadSalaryRateConfig(userInfo);
      
      // 加载日历考勤数据
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

      // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
      setTimeout(() => {
        this.checkMissedAttendance();
      }, 500);
      return;
    }
    
    // ===== 性能优化：使用用户信息缓存 =====
    userInfoCache.get()
      .then((userInfo) => {
        console.log('[性能优化] 初始加载用户信息（缓存）:', userInfo);
        
        // 检查是否需要完善真实姓名
        const needCompleteProfile = !userInfo || !userInfo.real_name || userInfo.real_name.trim() === '';
        
        this.setData({ 
          currentUser: userInfo,
          needCompleteProfile: needCompleteProfile
        });
        this.loadSalaryRateConfig(userInfo);
        
        // 加载日历考勤数据
        const now = new Date();
        this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

        // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
        setTimeout(() => {
          this.checkMissedAttendance();
        }, 500);
      })
      .catch((error) => {
        // 加载失败时也要设置状态
        this.setData({ 
          currentUser: null,
          needCompleteProfile: true
        });
        console.log('加载用户信息失败:', error);
      });
  },

  /**
   * 加载今日考勤：根据用户真实姓名自动查询
   */
  loadTodayAttendance() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // 未登录预览：今日记录为空。
    if (mockData.isGuestMode()) {
      this.setData({
        todayAttendance: null,
        todayCheckedIn: false,
        needCompleteProfile: false
      });
      return;
    }
    
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：检查是否有今日提交的考勤记录
      console.log('考勤查询-测试模式：使用mock数据');
      setTimeout(() => {
        const todayAttendanceKey = `testTodayAttendance_${dateStr}`;
        const submittedTodayAttendance = wx.getStorageSync(todayAttendanceKey);
        
        if (submittedTodayAttendance) {
          // 如果有今日提交的考勤记录，显示提交的记录
          console.log('测试模式：显示今日已提交的考勤记录', submittedTodayAttendance);
          this.setData({
            todayAttendance: Object.assign({}, submittedTodayAttendance, {
              submit_time: this.formatPutDateTime(submittedTodayAttendance.submit_time)
            }),
            todayCheckedIn: true,
            needCompleteProfile: false
          });
        } else {
          // 如果没有今日提交记录，使用默认mock数据或显示无记录
          const showDefaultMock = Math.random() > 0.7; // 30%概率显示默认mock考勤
          if (showDefaultMock) {
            console.log('测试模式：显示默认mock考勤记录');
            this.setData({
              todayAttendance: {
                id: 'mock_today_default',
                name: '微信用户d_001',
                work_status: '公司上班',
                comment: '公司上班 - 小程序提交',
                work_date: dateStr,
                submit_time: this.formatPutDateTime(new Date().toISOString())
              },
              todayCheckedIn: true,
              needCompleteProfile: false
            });
          } else {
            console.log('测试模式：显示无今日考勤记录');
            this.setData({
              todayAttendance: null,
              todayCheckedIn: false,
              needCompleteProfile: false
            });
          }
        }
      }, 300);
      return;
    }
    
    // 先确保获取最新用户信息，再查询今日考勤
    this.ensureLatestUserInfo((userInfo) => {
      // 如果没有用户信息或没有真实姓名，提示用户完善信息
      if (!userInfo || !userInfo.real_name) {
        this.setData({
          todayAttendance: null,
          needCompleteProfile: true
        });
        return;
      }
      
      // 用户已有姓名，查询今日考勤
      this.queryTodayAttendance(userInfo, dateStr);
    });
  },

  /**
   * 查询今日考勤状态
   */
  queryTodayAttendance(userInfo, dateStr) {
    // 调用API查询今日考勤状态，如果today接口不存在则使用history接口
    apiCall(
      () => API.attendance.getTodayAttendance({
        real_name: userInfo.real_name,
        work_date: dateStr
      }),
      null,
      (data) => {
        console.log('今日考勤API返回数据:', data);
        // 检查数据结构：data 可能{code, msg, data: {attendance}} 或直接的 {attendance}
        let attendanceInfo = null;
        
        if (data && data.data && data.data.attendance) {
          // 格式1: {code, msg, data: {attendance}}
          attendanceInfo = data.data.attendance;
        } else if (data && data.attendance) {
          // 格式2: {attendance}
          attendanceInfo = data.attendance;
        }
        
        if (attendanceInfo) {
          // 标准化数据字段，确保与WXML模板匹配
          const attendanceData = {
            id: attendanceInfo.id,
            work_status: attendanceInfo.work_status || attendanceInfo.WorkStatus,
            submit_time: this.formatPutDateTime(attendanceInfo.submit_time || attendanceInfo.PutDate),
            work_date: attendanceInfo.work_date || attendanceInfo.WorkDate,
            comment: attendanceInfo.comment || attendanceInfo.Comment,
            name: attendanceInfo.name || attendanceInfo.Name
          };
          console.log('标准化后的今日考勤数据:', attendanceData);
          
          // 找到今日考勤记录
          this.setData({
            todayAttendance: attendanceData,
            todayCheckedIn: true,
            needCompleteProfile: false
          });
        } else {
          // 今日未打卡
          console.log('今日未找到考勤记录');
          this.setData({
            todayAttendance: null,
            todayCheckedIn: false,
            needCompleteProfile: false
          });
        }
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        
        // 如果是404错误，说明today接口不存在，使用history接口代替
        if (error.message && error.message.includes('404')) {
          console.log('today接口不存在，使用history接口查询今日考勤');
          this.getTodayAttendanceFromHistory(userInfo.real_name, dateStr);
          return;
        }
        
        // 如果是因为没有找到真实姓名
        if (error.code === 'NAME_NOT_FOUND') {
          this.setData({
            todayAttendance: null,
            needCompleteProfile: true
          });
          
          wx.showModal({
            title: '完善个人信息',
            content: '请先完善真实姓名，以便查询您的考勤记录',
            showCancel: true,
            confirmText: '去完善',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/usercenter/index'
                });
              }
            }
          });
        } else {
          // 其他错误，假设未打卡
          this.setData({
            todayAttendance: null,
            needCompleteProfile: false
          });
        }
      }
    );
  },

  /**
   * 使用历史接口查询今日考勤（兼容性方案）
   */
  getTodayAttendanceFromHistory(realName, dateStr) {
    console.log('使用history接口查询今日考勤:', realName, dateStr);
    
    // 使用现有的history接口查询，注意参数名应该是name而不是其他
    apiCall(
      () => API.attendance.getHistory({
        name: realName,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      }),
      null,
      (data) => {
        console.log('历史考勤数据返回结构:', data);
        
        const historyList = this.normalizeAttendanceList(data);
        
        // 在历史数据中查找今日的考勤记录
        let todayRecord = null;
        if (historyList && Array.isArray(historyList)) {
          todayRecord = historyList.find(record => {
            // 比较工作日期，支持多种格式
            const recordDate = record.WorkDate || record.work_date;
            return recordDate === dateStr;
          });
        }
        
        if (todayRecord) {
          // 标准化数据格式以匹配前端WXML模板期望
          const attendanceData = {
            id: todayRecord.id,
            work_status: todayRecord.work_status || todayRecord.WorkStatus,
            submit_time: this.formatPutDateTime(todayRecord.put_date || todayRecord.PutDate),
            work_date: todayRecord.work_date || todayRecord.WorkDate,
            comment: todayRecord.comment || todayRecord.Comment,
            name: todayRecord.name || todayRecord.Name,
            business_trip_subsidy: todayRecord.business_trip_subsidy || todayRecord.BusinessTripSubsidy || 0
          };
          console.log('从历史数据提取的今日考勤:', attendanceData);
          
          this.setData({
            todayAttendance: attendanceData,
            todayCheckedIn: true,
            needCompleteProfile: false
          });
        } else {
          // 今日未打卡
          this.setData({
            todayAttendance: null,
            todayCheckedIn: false,
            needCompleteProfile: false
          });
        }
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        console.log('今日考勤查询错误:', error);
        
        // 优先处理需要完善姓名的情况，避免错误冒泡
        if (error.need_complete_name || (error.message && error.message.includes('完善真实姓名'))) {
          console.log('用户需要完善真实姓名才能查看考勤记录，显示完善提示');
          this.setData({
            todayAttendance: null,
            needCompleteProfile: true
          });
          return; // 显式返回，确保错误被正确处理
        }
        
        // 检查其他类型的错误
        if (error.message && error.message.includes('404')) {
          console.warn('考勤历史接口404，可能服务器未启动或接口不存在');
          this.setData({
            todayAttendance: null,
            needCompleteProfile: false
          });
        } else {
          // 其他错误，假设未打卡
          console.log('今日考勤查询其他错误:', error.message);
          this.setData({
            todayAttendance: null,
            needCompleteProfile: false
          });
        }
      }
    );
  },

  /**
   * 加载最近考勤记录
   */
  loadRecentAttendance() {
    this.setData({ 
      loading: true,
      showNameCompleteHint: false  // 重置姓名完善提示状态
    });

    // 未登录预览：最近记录为空。
    if (mockData.isGuestMode()) {
      console.log('考勤记录-未登录预览：保持为空');
      this.setData({
        recentAttendance: [],
        loading: false,
        showNameCompleteHint: false
      });
      wx.stopPullDownRefresh();
      return;
    }

    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：使用mock考勤记录（按WorkDate倒序排列）
      console.log('考勤记录-测试模式：使用mock数据');
      const mockAttendanceData = testModeManager.getMockAttendanceData().map((item, index) => ({
        id: `attend_${index + 1}`,
        name: item.RealName,
        work_status: item.WorkStatus,
        work_date: item.WorkDate,
        put_date: item.CreateTime,
        comment: `测试考勤记录${index + 1}`,
        business_trip_subsidy: item.Subsidy,
        put_date_time: item.CheckInTime ? item.CheckInTime.slice(0, 5) : '09:00'
      }));
      
      setTimeout(() => {
        // 为测试数据添加status_class字段
        const processedMockData = mockAttendanceData.map(item => (Object.assign({}, item, {
          status_class: this.getStatusClass(item.work_status),
          status_type: this.getAttendanceType(item.work_status)
        })));
        
        console.log('测试模式考勤数据已处理:', processedMockData.map(item => ({
          work_status: item.work_status,
          status_class: item.status_class,
          business_trip_subsidy: item.business_trip_subsidy
        })));
        
        this.setData({
          recentAttendance: processedMockData,
          loading: false
        });
        wx.stopPullDownRefresh();
      }, 300);
      return;
    }

    // 正常模式：先确保获取最新用户信息，再加载考勤记录
    this.ensureLatestUserInfo((userInfo) => {
      // 如果没有用户信息或没有真实姓名，显示完善姓名提示
      if (!userInfo || !userInfo.real_name) {
        this.setData({
          recentAttendance: [],
          loading: false,
          showNameCompleteHint: true
        });
        wx.stopPullDownRefresh(); // 确保下拉刷新结束
        return;
      }
      
      // 用户已有姓名，调用API获取考勤记录
      this.loadAttendanceHistory(userInfo);
    });
  },

  /**
   * 确保获取最新的用户信息
   */
  ensureLatestUserInfo(callback) {
    // 游客模式：不加载数据
    if (mockData.isGuestMode()) {
      console.log('用户信息-游客模式：不加载数据');
      return;
    }
    
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：使用本地用户信息
      console.log('ensureLatestUserInfo-测试模式：使用本地用户信息');
      let userInfo = wx.getStorageSync('userInfo');
      
      // 确保有完整的用户信息
      if (!userInfo || Object.keys(userInfo).length === 0) {
        userInfo = this.initTestModeUserInfo();
      }
      
      this.setData({ currentUser: userInfo });
      wx.setStorageSync('userInfo', userInfo);
      callback(userInfo);
      return;
    }
    
    // ===== 性能优化：使用用户信息缓存 =====
    // 优先使用当前组件中的用户信息
    let userInfo = this.data.currentUser;
    
    // 如果组件中有完整的用户信息，直接使用
    if (userInfo && userInfo.real_name) {
      console.log('[性能优化] 使用组件中的用户信息');
      callback(userInfo);
      return;
    }
    
    // 使用缓存获取用户信息
    console.log('[性能优化] 从缓存获取用户信息');
    userInfoCache.get()
      .then((userInfo) => {
        this.setData({ currentUser: userInfo });
        callback(userInfo);
      })
      .catch((error) => {
        console.log('[性能优化] 获取用户信息失败:', error);
        // 使用本地存储的用户信息作为降级方案
        const localUserInfo = wx.getStorageSync('userInfo');
        callback(localUserInfo);
        // 确保下拉刷新结束
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 加载考勤历史记录
   */
  loadAttendanceHistory(userInfo) {
    // ===== 性能监控：数据加载开始 =====
    performanceMonitor.mark('attendance_history_load_start');
    
    apiCall(
      () => API.attendance.getHistory(),
      null,
      (data) => {
        // 性能监控：API调用完成
        performanceMonitor.measure('attendance_api_history', 'attendance_history_load_start', PERF_TYPES.API_CALL);
        
        // 性能监控：数据处理开始
        performanceMonitor.mark('attendance_data_process_start');
        console.log('考勤历史API返回数据:', data);
        
        const rawData = this.normalizeAttendanceList(data);
        
        // console.log('提取的原始考勤数据:', rawData);
        
        // 后端已按日期倒序排列，直接处理数据
        let sortedData = rawData || [];
        if (sortedData.length > 0) {
          // 获取最近一周的日期范围（7天）
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 设置为当天开始时间
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7); // 7天前
          
          // ===== 性能优化：使用字符串比较代替Date对=====
          // 计算一周前的日期字符串
          const oneWeekAgoStr = this.getDateString(oneWeekAgo);
          const todayStr = this.getDateString(today);
          
          // 过滤最近一周的记录（使用字符串比较，更高效）
          sortedData = sortedData.filter(item => {
            if (!item.work_date) return false;
            return item.work_date >= oneWeekAgoStr && item.work_date <= todayStr;
          });
          
          // ===== 性能优化：预处理时间格式化和状态类=====
          // 使for 循环代替 map（性能更好）
          const processed = [];
          for (let i = 0; i < sortedData.length; i++) {
            const item = sortedData[i];
            processed.push({
              ...item,
              put_date_time: this.formatPutDateTime(item.put_date),
              status_class: this.getStatusClass(item.work_status),
              status_type: this.getAttendanceType(item.work_status)
            });
          }
          sortedData = processed;
          
          console.log(`最近一周考勤记录 (${oneWeekAgo.toLocaleDateString()} ~ ${today.toLocaleDateString()}):`, sortedData.length, '条');
          console.log('数据详情:', sortedData.map(item => ({
            work_date: item.work_date,
            work_status: item.work_status,
            comment: item.comment,
            put_date_time: item.put_date_time
          })));
        }
        
        this.setData({
          recentAttendance: sortedData,
          loading: false,
          showNameCompleteHint: false  // 清除姓名完善提示
        });
        wx.stopPullDownRefresh();
      },
      (error) => {
        console.log('最近考勤记录查询错误:', error);
        
        // 优先处理需要完善姓名的情况，避免错误冒泡
        if (error.need_complete_name || (error.message && error.message.includes('完善真实姓名'))) {
          console.log('用户需要完善真实姓名才能查看考勤记录，显示完善提示');
          this.setData({
            recentAttendance: [],
            loading: false,
            showNameCompleteHint: true
          });
          
          wx.showModal({
            title: '完善个人信息',
            content: '请先完善真实姓名后查看考勤记录',
            showCancel: true,
            confirmText: '去完善',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                // 跳转到用户中心
                wx.switchTab({
                  url: '/pages/usercenter/index'
                });
              }
            }
          });
          wx.stopPullDownRefresh();
          return; // 显式返回，确保错误被正确处理
        }
        
        // 处理其他错误
        console.warn('获取最近考勤记录失败:', error.message || error);
        this.setData({
          recentAttendance: [],
          loading: false,
          showNameCompleteHint: false  // 其他错误时清除姓名完善提示
        });
        showError(error.message || '加载考勤记录失败');
        wx.stopPullDownRefresh();
      }
    );
  },

  /**
   * 快速打卡
   */
  onQuickPunch(e) {
    if (mockData.showGuestModeTip('submit')) {
      return;
    }

    const { status } = e.currentTarget.dataset;
    
    // 检查用户是否登录
    if (!this.data.currentUser || !this.data.currentUser.nickname) {
      showError('请先完善用户信息');
      return;
    }

    // 非测试模式下，检查是否完善了真实姓名
    if (!testModeManager.isTestMode()) {
      if (!this.data.currentUser.real_name || this.data.currentUser.real_name.trim() === '') {
        wx.showModal({
          title: '信息不完整',
          content: '您还未完善真实姓名，无法进行考勤打卡。\n\n请先前往用户中心完善您的真实姓名。',
          showCancel: true,
          cancelText: '稍后完善',
          confirmText: '去完善',
          success: (res) => {
            if (res.confirm) {
              this.goToUserCenter();
            }
          }
        });
        return;
      }
    }

    // 如果是出差状态，需要输入出差基地
    if (status === '国内出差' || status === '国外出差') {
      this.handleBusinessTripInput(status);
    } else {
      wx.showModal({
        title: '确认打卡',
        content: `确定要提${status} 的考勤记录吗？`,
        success: (res) => {
          if (res.confirm) {
            this.submitAttendance(status);
          }
        }
      });
    }
  },

  /**
   * 处理出差基地输入
   */
  handleBusinessTripInput(status) {
    wx.showModal({
      title: '出差基地',
      content: '',
      editable: true,
      placeholderText: '如：北京基地、上海项目部',
      success: (res) => {
        if (res.confirm) {
          const location = res.content ? res.content.trim() : undefined;
          if (!location) {
            showError('请输入出差基地名称');
            return;
          }
          
          if (status === '国外出差') {
            // 国外出差还需要输入补贴金额
            wx.showModal({
              title: '出差补贴',
              content: '',
              editable: true,
              placeholderText: '请输入金额',
              success: (res2) => {
                if (res2.confirm) {
                  const subsidy = parseFloat(res2.content) || 0;
                  if (subsidy < 0) {
                    showError('补贴金额不能为负数');
                    return;
                  }
                  this.confirmAndSubmitAttendance(status, location, subsidy);
                }
              }
            });
          } else {
            // 国内出差，固定补贴100元
            this.confirmAndSubmitAttendance(status, location, 100);
          }
        }
      }
    });
  },

  /**
   * 确认并提交考勤
   */
  confirmAndSubmitAttendance(status, location, subsidy) {
    const subsidyText = status === '国内出差' ? '100元（固定）' : `${subsidy}元`;
    wx.showModal({
      title: '确认打卡',
      content: `确定要提${status} 的考勤记录吗？\n出差基地：${location}\n出差补贴：${subsidyText}`,
      success: (res) => {
        if (res.confirm) {
          this.submitAttendance(status, location, subsidy, location);
        }
      }
    });
  },

  /**
   * 提交考勤
   */
  submitAttendance(workStatus, comment = '', customSubsidy = null, businessTripLocation = '') {
    if (mockData.showGuestModeTip('submit')) {
      return;
    }

    // 先获取真实姓名
    this.getRealNameForAttendance((realName) => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      
      // 根据工作状态计算补贴
      let businessTripSubsidy = 0;
      if (customSubsidy !== null) {
        // 使用传入的补贴金额
        businessTripSubsidy = customSubsidy;
      } else {
        // 根据工作状态自动计算补贴
        switch (workStatus) {
          case '休息':
            businessTripSubsidy = 0;
            break;
          case '公司上班':
            businessTripSubsidy = 0;
            break;
          case '加班':
            businessTripSubsidy = 0;
            break;
          case '国内出差':
            businessTripSubsidy = 100;
            break;
          case '国外出差':
            businessTripSubsidy = 0; // 这种情况应该不会到这里
            break;
          default:
            businessTripSubsidy = 0;
        }
      }

      // 构建 comment 字段：直接使用工作状态或出差基地，不添加提交来源后缀
      let finalComment;
      if ((workStatus === '国内出差' || workStatus === '国外出差') && businessTripLocation) {
        finalComment = businessTripLocation;
      } else {
        // 对于其他状态（休息、公司上班、加班），直接使用工作状态作为comment
        finalComment = workStatus;
      }
      
      const attendanceData = {
        name: realName,
        work_date: dateStr,
        work_status: workStatus,
        comment: finalComment,
        business_trip_subsidy: businessTripSubsidy,
        business_trip_location: businessTripLocation
      };

      console.log('提交考勤数据:', attendanceData);

      // 检查是否为测试模式
      if (testModeManager.isTestMode()) {
        // 测试模式：模拟提交成功
        console.log('考勤提交-测试模式：模拟考勤提交成功');
        console.log('测试模式提交的考勤数据:', attendanceData);
        
        // 保存今日提交的考勤记录到本地存储，供界面显示使用
        const todayAttendanceKey = `testTodayAttendance_${attendanceData.work_date}`;
        const todayAttendanceRecord = {
          id: 'mock_today_submitted',
          name: attendanceData.name,
          work_status: attendanceData.work_status,
          comment: attendanceData.comment,
          work_date: attendanceData.work_date,
          business_trip_subsidy: attendanceData.business_trip_subsidy,
          submit_time: new Date().toISOString()
        };
        wx.setStorageSync(todayAttendanceKey, todayAttendanceRecord);
        
        // 模拟提交延迟
        setTimeout(() => {
          showSuccess('考勤提交成功(测试模式)');

          // 更新今日考勤和最近考勤数据
          this.loadTodayAttendance();
          this.loadRecentAttendance();

          // 更新日历
          const now = new Date();
          this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

          // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
          setTimeout(() => {
            this.checkMissedAttendance();
          }, 500);

          console.log('测试模式：考勤数据已成功"提交"，界面已刷新');
        }, 1500);
        return;
      }

      apiCall(
        () => API.attendance.submit(attendanceData),
        '提交中...',
        (data) => {
          console.log('考勤提交API返回数据:', data);
          // 检查业务状态码，只有code为200才算成功
          if (data.code === 200) {
            showSuccess(data.msg || '考勤提交成功');
            this.loadTodayAttendance();
            this.loadRecentAttendance();

            // 更新日历
            const now = new Date();
            this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);

            // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
            setTimeout(() => {
              this.checkMissedAttendance();
            }, 500);
          } else {
            // 业务逻辑失败，按错误处理
            console.log('考勤提交业务失败，业务状态码:', data.code);
            
              // 检查是否是网盘账号相关错误
              if (data.data && data.data.need_netdisk_info) {
                console.log('触发网盘账号错误处理，用户名:', data.data.user_name);
                // 直接显示弹窗，不先显示错误提示，避免冲突
                this.showNetdiskInfoDialog(data.data.user_name, data.msg);
              } else if (data.data && data.data.need_netdisk_update && data.data.error_type === 'auth_failed') {
                console.log('触发网盘账号密码错误处理，用户名:', data.data.user_name);
                // 网盘账号密码错误，显示特殊弹窗
                this.showNetdiskAuthErrorDialog(data.data.user_name, data.msg);
              } else if (data.msg && data.msg.includes('网盘')) {
                console.log('触发网盘相关错误处理');
                // 直接显示弹窗，不先显示错误提示，避免冲 
                this.showNetdiskInfoDialog('', data.msg);
              } else {
                showError(data.msg || '考勤提交失败');
              }
          }
        },
        (error) => {
          console.log('考勤提交失败，错误信息:', error);
          // 检查是否需要完善网盘信息
          if (error.data && error.data.need_netdisk_info) {
            // 显示网盘账号信息缺失错误，不显示提交成功
            showError('考勤提交失败：' + (error.message || '网盘账号信息缺失'));
            this.showNetdiskInfoDialog(error.data.user_name, error.message);
          } else if (error.message && error.message.includes('网盘账号')) {
            // 处理其他网盘相关错误
            showError('考勤提交失败：' + error.message);
            this.showNetdiskInfoDialog('', error.message);
          } else {
            showError(error.message || '考勤提交失败');
          }
        }
      );
    });
  },

  /**
   * 获取真实姓名用于考勤提交
   */
  getRealNameForAttendance(callback) {
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：使用本地存储的用户信息中的真实姓名
      console.log('考勤提交-测试模式：使用本地存储的真实姓名');
      const userInfo = wx.getStorageSync('userInfo') || {};
      let realName = userInfo.real_name || '测试用户';
      
      // 如果没有真实姓名，使用nickname
      if (!realName || realName.trim() === '') {
        realName = userInfo.nickname || '微信用户';
      }
      
      console.log('测试模式获取到的真实姓名:', realName);
      
      // 模拟异步回调
      setTimeout(() => {
        callback(realName);
      }, 100);
      return;
    }

    apiCall(
      () => API.attendance.getRealName(),
      null,
      (data) => {
        // 成功获取到真实姓名 - 修复数据结构访问
        console.log('获取真实姓名API返回数据:', data);
        const realName = data.data ? data.data.real_name : data.real_name;
        console.log('提取到的真实姓名:', realName);
        callback(realName);
      },
      (error) => {
        console.log('未获取到真实姓名，要求用户输入:', error);
        // 弹出输入框让用户手动输入姓名
        this.promptForRealName(callback);
      }
    );
  },

  /**
   * 提示用户输入真实姓名
   */
  promptForRealName(callback) {
    wx.showModal({
      title: '完善个人信息',
      content: '',
      editable: true,
      placeholderText: '请输入2-10个汉字',
      success: (res) => {
        if (res.confirm) {
          const realName = res.content ? res.content.trim() : undefined;
          if (!realName) {
            showError('姓名不能为空');
            this.promptForRealName(callback);
            return;
          }

          // 验证姓名格式
          const nameRegex = /^[\u4e00-\u9fa5]{2,10}$/;
          if (!nameRegex.test(realName)) {
            showError('请输入2-10个汉字的真实姓名');
            this.promptForRealName(callback);
            return;
          }

          // 保存姓名到数据库
          apiCall(
            () => API.user.updateRealName(realName),
            '保存中...',
            (data) => {
              showSuccess('姓名保存成功');
              // 提示用户去完善个人信息
              setTimeout(() => {
                wx.showModal({
                  title: '提示',
                  content: '建议您到用户中心完善更多个人信息，以获得更好的使用体验',
                  showCancel: false,
                  confirmText: '知道了'
                });
              }, 1000);
              
              callback(realName);
            },
            (error) => {
              showError(error.message || '姓名保存失败');
              this.promptForRealName(callback);
            }
          );
        } else {
          // 用户取消输入，使用昵称作为备选
          const fallbackName = this.data.currentUser.nickname || '用户';
          wx.showModal({
            title: '提示',
            content: `将使用"${fallbackName}"作为考勤姓名，建议您到用户中心完善真实姓名`,
            showCancel: false,
            confirmText: '知道了',
            success: () => {
              callback(fallbackName);
            }
          });
        }
      }
    });
  },

  /**
   * 前往提交考勤页面
   */
  goToSubmit() {
    // 打开打卡弹窗而不是跳转页面
    this.onOpenCheckInModal();
  },

  /**
   * 编辑打卡记录 - 打开内联编辑弹窗
   */
  onEditRecord(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const item = e.currentTarget.dataset.item;
    if (!item) return;

    // work_status 映射为 type
    const typeMap = {
      '公司上班': 'office',
      '国内出差': 'domestic',
      '国外出差': 'international',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'office'
    };

    const workDate = item.work_date || '';
    const dingAttendance = this.normalizeDingAttendanceDisplay(item.ding_attendance || {}, workDate);
    const timeRange = this.getAttendanceCheckTimeRange(Object.assign({}, item, { ding_attendance: dingAttendance }));
    const overtime = item.overtime || {};
    const overtimeHoursInput = String(
      item.overtimeHours ||
      overtime.effective_hours ||
      dingAttendance.overtime_hours ||
      0
    );
    const checkInDate = timeRange.checkInDate || workDate;
    const checkOutDate = timeRange.checkOutDate || workDate;
    const checkOutDayOffset = this.getCheckOutDayOffset(workDate, checkOutDate);
    const editForm = {
      id: item.id,
      name: item.name || item.real_name || item.employee_name || this.data.currentUser?.real_name || '',
      type: typeMap[item.work_status] || 'office',
      date: workDate,
      time: this.normalizeTimeText(item.put_date_time || item.submit_time) || '00:00',
      location: item.business_trip_location || '',
      baseName: item.comment || '',
      subsidy: item.business_trip_subsidy ? String(item.business_trip_subsidy) : '',
      hasDingAttendance: this.hasDingCheckTime(dingAttendance),
      dingAttendance,
      holidayInfo: item.holiday_info || {},
      overtime,
      overtimeHoursInput,
      overtimeHoursTouched: false,
      checkInDate,
      checkInTime: timeRange.checkInTime || '09:00',
      checkOutDate,
      checkOutTime: timeRange.checkOutTime || '18:00',
      checkOutDayOffset,
      timeCalc: null,
      overtimeCalc: null,
      calendarStamp: item.calendar_stamp || ''
    };
    Object.assign(editForm, this.buildEditFormDateTimeState(editForm));
    editForm.timeCalc = this.buildTimeOvertimeCalc(editForm);
    editForm.overtimeCalc = this.buildDayOvertimeCalc({
      work_date: editForm.date,
      holiday_info: editForm.holidayInfo,
      overtime: editForm.overtime,
      ding_attendance: editForm.dingAttendance,
      overtimeHoursInput: editForm.overtimeHoursInput
    });

    this.setData({
      showEditModal: true,
      editForm
    });
  },

  onCloseEditModal() {
    this.setData({ showEditModal: false });
  },

  onStopPropagation() {},

  onEditModalChange(e) {
    if (!e.detail.visible) this.setData({ showEditModal: false });
  },

  onEditTypeChange(e) {
    this.setData({ 'editForm.type': e.currentTarget.dataset.type });
  },

  onEditDateChange(e) {
    this.syncEditWorkDate(e.detail.value);
  },

  onEditTimeChange(e) {
    this.setData({ 'editForm.time': e.detail.value });
  },

  onEditCheckInTimeChange(e) {
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkInTime: e.detail.value
    });
    this.setData(Object.assign({
      'editForm.checkInTime': e.detail.value
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onEditCheckInDateChange(e) {
    this.syncEditWorkDate(e.detail.value);
  },

  onEditCheckOutTimeChange(e) {
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkOutTime: e.detail.value
    });
    this.setData(Object.assign({
      'editForm.checkOutTime': e.detail.value
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onEditCheckOutDateChange(e) {
    const nextDate = e.detail.value;
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkOutDate: nextDate,
      checkOutDayOffset: this.getCheckOutDayOffset(this.data.editForm.date, nextDate)
    });
    this.setData(Object.assign({
      'editForm.checkOutDate': nextDate,
      'editForm.checkOutDayOffset': nextForm.checkOutDayOffset
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onCheckOutDayOffsetTap(e) {
    const offset = Number(e.currentTarget.dataset.value || 0);
    const workDate = this.data.editForm.date;
    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkOutDayOffset: offset,
      checkOutDate: this.buildCheckOutDateByOffset(workDate, offset)
    });
    this.setData(Object.assign({
      'editForm.checkOutDayOffset': offset,
      'editForm.checkOutDate': nextForm.checkOutDate
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onQuickCheckInTimeTap(e) {
    const value = e.currentTarget.dataset.value;
    if (!value) return;

    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkInTime: value
    });
    this.setData(Object.assign({
      'editForm.checkInTime': value
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onQuickCheckOutTimeTap(e) {
    const value = e.currentTarget.dataset.value;
    if (!value) return;

    const nextForm = Object.assign({}, this.data.editForm || {}, {
      checkOutTime: value
    });
    this.setData(Object.assign({
      'editForm.checkOutTime': value
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onEditCheckInDateTimeColumnChange(e) {
    const form = this.data.editForm || {};
    const state = this.buildDateTimePickerColumnState(
      form.checkInDateTimeRange,
      form.checkInDateTimeValue,
      e.detail.column,
      e.detail.value
    );

    this.setData({
      'editForm.checkInDateTimeRange': state.range,
      'editForm.checkInDateTimeValue': state.value
    });
  },

  onEditCheckOutDateTimeColumnChange(e) {
    const form = this.data.editForm || {};
    const state = this.buildDateTimePickerColumnState(
      form.checkOutDateTimeRange,
      form.checkOutDateTimeValue,
      e.detail.column,
      e.detail.value
    );

    this.setData({
      'editForm.checkOutDateTimeRange': state.range,
      'editForm.checkOutDateTimeValue': state.value
    });
  },

  onEditCheckInDateTimeChange(e) {
    const form = this.data.editForm || {};
    const selected = this.resolveDateTimePickerValue(form.checkInDateTimeRange, e.detail.value);
    const isDateChanged = selected.date !== form.checkInDate;
    const nextForm = Object.assign({}, form, {
      checkInDate: selected.date,
      checkInTime: selected.time
    });
    const nextData = {
      'editForm.checkInDate': selected.date,
      'editForm.checkInTime': selected.time
    };

    if (isDateChanged) {
      const calendarInfo = (this.data.attendanceMap && this.data.attendanceMap[selected.date]) || {};
      nextForm.date = selected.date;
      nextForm.holidayInfo = calendarInfo.holiday_info || {};
      nextForm.calendarStamp = calendarInfo.calendar_stamp || '';
      nextForm.checkOutDate = this.buildCheckOutDateByOffset(selected.date, form.checkOutDayOffset);
      nextData['editForm.date'] = nextForm.date;
      nextData['editForm.holidayInfo'] = nextForm.holidayInfo;
      nextData['editForm.calendarStamp'] = nextForm.calendarStamp;
      nextData['editForm.checkOutDate'] = nextForm.checkOutDate;
    }

    this.setData(Object.assign(nextData, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onEditCheckOutDateTimeChange(e) {
    const form = this.data.editForm || {};
    const selected = this.resolveDateTimePickerValue(form.checkOutDateTimeRange, e.detail.value);
    const nextForm = Object.assign({}, form, {
      checkOutDate: selected.date,
      checkOutTime: selected.time,
      checkOutDayOffset: this.getCheckOutDayOffset(form.date, selected.date)
    });

    this.setData(Object.assign({
      'editForm.checkOutDate': nextForm.checkOutDate,
      'editForm.checkOutTime': nextForm.checkOutTime,
      'editForm.checkOutDayOffset': nextForm.checkOutDayOffset
    }, this.buildEditFormDateTimeStatePatch(nextForm)), () => {
      this.updateEditModalTimeCalc();
    });
  },

  onSyncEditDingTimeTap() {
    const form = this.data.editForm || {};
    const dingAttendance = form.dingAttendance || {};
    const hasDingTime = this.hasDingCheckTime(dingAttendance);
    if (!hasDingTime) {
      showError('暂无钉钉打卡时间');
      return;
    }

    const patch = this.buildEditFormDingTimePatch(dingAttendance, form.date);
    if (!patch['editForm.checkInTime'] && !patch['editForm.checkOutTime']) {
      showError('暂无可同步的钉钉时间');
      return;
    }

    this.setData(Object.assign({
      'editForm.hasDingAttendance': true
    }, patch), () => {
      this.updateEditModalTimeCalc();
      showSuccess('已同步钉钉时间');
    });
  },

  onEditLocationChange(e) {
    this.setData({ 'editForm.location': e.detail.value });
  },

  onEditBaseNameChange(e) {
    this.setData({ 'editForm.baseName': e.detail.value });
  },

  onEditSubsidyChange(e) {
    this.setData({ 'editForm.subsidy': e.detail.value });
  },

  onEditOvertimeHoursChange(e) {
    const value = e.detail.value;
    const normalizedHours = Math.max(this.toFiniteNumber(value, 0), 0);
    this.setData({
      'editForm.overtimeHoursInput': value,
      'editForm.overtimeHoursTouched': true,
      'editForm.overtime.effective_hours': normalizedHours,
      'editForm.overtime.rule_text': '手动调整加班小时，钉钉同步不会覆盖',
      'editForm.dingAttendance.overtime_hours': normalizedHours
    }, () => {
      this.updateEditModalOvertimeCalc();
    });
  },

  onSaveEdit() {
    const form = this.data.editForm;
    if (!form.id) return;

    const typeToStatus = {
      office: '公司上班',
      domestic: '国内出差',
      international: '国外出差',
      rest: '休息',
      compensatory: '调休'
    };

    const workStatus = typeToStatus[form.type] || '公司上班';
    
    // 根据工作状态生comment
    let comment = '';
    if (workStatus === '国内出差' || workStatus === '国外出差') {
      // 出差类型：comment 是出差地点（基地名）
      comment = form.baseName || '';
    } else {
      // 公司上班或休息：comment 就是工作状态本身
      comment = workStatus;
    }

    const payload = {
      name: form.name,
      work_status: workStatus,
      work_date: form.date,
      put_date: form.date && form.time ? `${form.date} ${form.time}:00` : undefined,
      check_in_time: form.checkInDate && form.checkInTime ? `${form.checkInDate} ${form.checkInTime}:00` : undefined,
      check_out_time: form.checkOutDate && form.checkOutTime ? `${form.checkOutDate} ${form.checkOutTime}:00` : undefined,
      business_trip_location: form.baseName || '',
      comment: comment,
      business_trip_subsidy: parseFloat(form.subsidy) || 0
    };

    if (form.overtimeHoursTouched) {
      payload.overtime_hours = Math.max(this.toFiniteNumber(form.overtimeHoursInput, 0), 0);
    }

    apiCall(
      () => API.attendance.update(form.id, payload),
      null,
      (res) => {
        this.setData({
          showEditModal: false,
          showResultModal: true,
          resultSuccess: true,
          resultMsg: res && res.msg ? res.msg : '打卡记录已成功同步至服务器'
        });
        this.loadTodayAttendance();
        this.loadRecentAttendance();
        // 同步刷新日历显示和漏打卡状态
        this.loadCalendarAttendance(this.data.calendarYear, this.data.calendarMonth);

        // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
        setTimeout(() => {
          this.checkMissedAttendance();
        }, 500);
      },
      (err) => {
        this.setData({
          showResultModal: true,
          resultSuccess: false,
          resultMsg: err && err.message ? err.message : '操作失败，请重试'
        });
      }
    );
  },

  onCloseResultModal() {
    this.setData({ showResultModal: false });
  },

  /**
   * 删除打卡记录 - 打开确认弹窗
   */
  onDeleteRecord(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const id = e.currentTarget.dataset.id;
    if (!id) return;
    this.setData({
      showDeleteModal: true,
      deleteRecordId: id
    });
  },

  /**
   * 关闭删除确认弹窗
   */
  onCloseDeleteModal() {
    this.setData({ showDeleteModal: false, deleteRecordId: null });
  },

  /**
   * 确认删除记录 - 带进度弹窗
   */
  onConfirmDelete() {
    const id = this.data.deleteRecordId;
    if (!id) return;
    this.setData({
      showDeleteModal: false,
      isDeleting: true,
      deleteProgress: 10,
      deleteCurrentStep: '正在删除数据库记录...'
    });
    apiCall(
      () => API.attendance.delete(id),
      null,
      (res) => {
        const steps = (res && res.data && res.data.steps) ? res.data.steps : {
          db_deleted: true, db_msg: '数据库记录已删除',
          excel_cleared: true, excel_msg: 'Excel考勤表已清除',
          nas_uploaded: true, nas_msg: '已同步到公盘'
        };
        // 动画式推进进度
        this.setData({ deleteProgress: 40, deleteCurrentStep: '正在清除Excel考勤表...' });
        setTimeout(() => {
          this.setData({ deleteProgress: 70, deleteCurrentStep: '正在同步到公司公盘...' });
          setTimeout(() => {
            const uploadStepOk = steps.nas_uploaded || ((steps.nas_msg || '').includes('已关闭网盘上传'));
            const allSuccess = steps.db_deleted && steps.excel_cleared && uploadStepOk;
            this.setData({
              isDeleting: false,
              deleteProgress: 100,
              deleteRecordId: null,
              showDeleteResult: true,
              deleteResultSuccess: allSuccess,
              deleteResultMsg: (res && res.msg) ? res.msg : '操作完成',
              deleteSteps: steps
            });
            this.loadRecentAttendance();
            this.loadTodayAttendance();
            this.loadCalendarAttendance(this.data.calendarYear, this.data.calendarMonth);

            // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
            setTimeout(() => {
              this.checkMissedAttendance();
            }, 500);
          }, 400);
        }, 400);
      },
      (err) => {
        this.setData({
          isDeleting: false,
          deleteRecordId: null,
          showDeleteResult: true,
          deleteResultSuccess: false,
          deleteResultMsg: (err && err.message) ? err.message : '删除失败',
          deleteSteps: {
            db_deleted: false, db_msg: '删除失败',
            excel_cleared: false, excel_msg: '',
            nas_uploaded: false, nas_msg: ''
          }
        });
      }
    );
  },

  /**
   * 关闭删除结果弹窗
   */
  onCloseDeleteResult() {
    this.setData({ showDeleteResult: false });
  },

  /**
   * 前往考勤历史页面
   */
  goToHistory() {
    // 检查用户信息是否完善
    this.checkUserInfoBeforeHistory();
  },

  /**
   * 检查用户信息是否完善，完善后再跳转到历史页面
   */
  checkUserInfoBeforeHistory() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }
    
    // 检查是否为测试模式（使用缓存的状态）
    if (this._isTestMode) {
      // 测试模式：直接跳转到历史页面
      console.log('checkUserInfoBeforeHistory-测试模式：直接跳转');
      wx.navigateTo({
        url: '/pages/attendance/history/index'
      });
      return;
    }
    
    wx.showLoading({
      title: '验证用户信息...',
      mask: true
    });

    // ===== 性能优化：使用用户信息缓存 =====
    // 使用缓存获取用户信息
    userInfoCache.get()
      .then((userInfo) => {
        wx.hideLoading();
        console.log('[性能优化] 历史页面检查用户信息（缓存）:', userInfo);
        
        // 检查真实姓名是否完善
        if (!userInfo.real_name || userInfo.real_name.trim() === '') {
          // 姓名未完善，显示提示弹窗
          wx.showModal({
            title: '信息不完整',
            content: '您还未完善真实姓名，无法查看考勤历史记录。\n\n请先前往用户中心完善您的真实姓名。',
            showCancel: true,
            cancelText: '稍后完善',
            confirmText: '立即完善',
            success: (res) => {
              if (res.confirm) {
                // 跳转到用户中心页面（使用switchTab因为是Tab页面）
                this.goToUserCenter();
              }
              // 如果用户选择取消，则不进行任何操作
            }
          });
        } else {
          // 姓名已完善，正常跳转到历史页面
          wx.navigateTo({
            url: '/pages/attendance/history/index'
          });
        }
      },
      (error) => {
        wx.hideLoading();
        // 移除console.error以避免触发全局错误恢复机制
        
        // 获取用户信息失败，显示错误提示
        wx.showModal({
          title: '验证失败',
          content: '无法验证用户信息，请检查网络连接后重试。',
          showCancel: false,
          confirmText: '确定'
        });
      }
    );
  },


  /**
   * 更新当前日期显示
   */
  updateCurrentDate() {
    const today = new Date();
    const currentDate = this.getDateString(today);
    this.setData({ currentDate });
  },

  /**
   * 将Date对象转换为日期字符串（YYYY-MM-DD）
   * @param {Date} date 
   * @returns {string}
   */
  getDateString(date) {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  /**
   * 显示网盘账号信息不足的对话框
   */
  showNetdiskInfoDialog(userName, message) {
    console.log('显示网盘账号信息对话框，用户名:', userName, '消息:', message);
    wx.showModal({
      title: '网盘账号未配置',
      content: `${message}\n\n请前往网盘账号管理页面完善您的网盘账号信息，以便系统能够正常上传考勤Excel文件。`,
      showCancel: true,
      cancelText: '稍后处理',
      confirmText: '去配置',
      success: (res) => {
        console.log('网盘账号弹窗用户操作:', res);
        if (res.confirm) {
          console.log('用户确认跳转，准备跳转到网盘管理页面');
          this.goToNetdiskManagement();
        } else {
          console.log('用户取消跳转');
        }
      },
      fail: (err) => {
        console.log('网盘账号弹窗显示失败:', err);
      }
    });
  },

  /**
   * 显示网盘账号密码错误弹窗
   */
  showNetdiskAuthErrorDialog(userName, message) {
    console.log('显示网盘账号密码错误弹窗，用户名:', userName, '消息:', message);
    wx.showModal({
      title: '网盘账号认证失败',
      content: `${message}\n\n请检查您的网盘用户名和密码是否正确，然后前往网盘账号管理页面进行修改。`,
      showCancel: true,
      cancelText: '稍后处理',
      confirmText: '去修改',
      success: (res) => {
        console.log('网盘账号密码错误弹窗用户操作:', res);
        if (res.confirm) {
          console.log('用户确认跳转，准备跳转到网盘管理页面修改密码');
          this.goToNetdiskManagement();
        }
      },
      fail: (err) => {
        console.log('网盘账号密码错误弹窗显示失败:', err);
      }
    });
  },

  /**
   * 跳转到网盘账号管理页面
   */
  goToNetdiskManagement() {
    console.log('开始跳转到网盘账号管理页面');
    wx.navigateTo({
      url: '/pages/attendance/netdisk/index',
      success: () => {
        console.log('跳转网盘账号管理页面成功');
      },
      fail: (err) => {
        console.log('跳转网盘账号管理页面失败:', err);
        // 如果跳转失败，显示错误提示
        wx.showToast({
          title: '页面跳转失败',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  /**
   * 跳转到用户中心
   */
  goToUserCenter() {
    wx.switchTab({
      url: '/pages/usercenter/index'
    });
  },

  /**
   * 检查漏打卡情况
   */
  checkMissedAttendance() {
    // 优先检查是否为游客模式
    if (mockData.isGuestMode()) {
      console.log('漏打卡检查-游客模式：不显示漏打卡提醒');
      this.setData({
        missedDays: [],
        showMissedReminder: false
      });
      return;
    }
    
    // 检查是否为测试模式
    if (this._isTestMode) {
      console.log('测试模式：模拟漏打卡数据');
      // 测试模式：显示一些模拟的漏打卡日期
      const today = new Date();
      const missedDays = [];
      
      // 模拟2-7天的漏打卡
      if (Math.random() > 0.5) {
        const day1 = new Date(today);
        day1.setDate(today.getDate() - 3);
        missedDays.push(this.getDateString(day1));
        
        const day2 = new Date(today);
        day2.setDate(today.getDate() - 5);
        missedDays.push(this.getDateString(day2));
      }
      
      this.setData({
        missedDays: missedDays,
        showMissedReminder: missedDays.length > 0
      });

      // 不在这里更新日历显示，让loadCalendarAttendance完成后统一更新
      // this.updateCalendarDisplay();
      return;
    }

    // 正常模式：先确保获取最新用户信息
    this.ensureLatestUserInfo((userInfo) => {
      // 如果没有用户信息或没有真实姓名，不检查漏打卡
      if (!userInfo || !userInfo.real_name) {
        this.setData({
          missedDays: [],
          showMissedReminder: false
        });
        return;
      }

      // 获取当前年月
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      // 计算上个月的年月
      const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
      const lastMonthYear = lastMonthDate.getFullYear();
      const lastMonth = lastMonthDate.getMonth() + 1;

      // 同时获取当月和上月的考勤记录
      Promise.all([
        // 获取当月记录
        new Promise((resolve) => {
          apiCall(
            () => API.attendance.getHistory({
              name: userInfo.real_name,
              year: currentYear,
              month: currentMonth
            }),
            null,
            (data) => {
              resolve(this.normalizeAttendanceList(data));
            },
            (error) => {
              console.log('获取当月考勤失败:', error);
              resolve([]);
            }
          );
        }),
        // 获取上月记录
        new Promise((resolve) => {
          apiCall(
            () => API.attendance.getHistory({
              name: userInfo.real_name,
              year: lastMonthYear,
              month: lastMonth
            }),
            null,
            (data) => {
              resolve(this.normalizeAttendanceList(data));
            },
            (error) => {
              console.log('获取上月考勤失败:', error);
              resolve([]);
            }
          );
        })
      ]).then(([currentMonthData, lastMonthData]) => {
        console.log('当月考勤数据:', currentMonthData);
        console.log('上月考勤数据:', lastMonthData);

        // 合并所有已打卡的日期
        const allHistoryList = [...currentMonthData, ...lastMonthData];

        // 计算漏打卡的日期（按本月计算，并兼容上月最后几天）
        const missedDays = this.calculateMissedDaysWithLastMonth(allHistoryList);

        // 检查是否包含上月的漏打卡
        const hasLastMonthMissed = missedDays.some(date => {
          const dateMonth = parseInt(date.split('-')[1]);
          return dateMonth === lastMonth;
        });

        this.setData({
          missedDays: missedDays,
          showMissedReminder: missedDays.length > 0,
          hasLastMonthMissed: hasLastMonthMissed
        });

        // 漏打卡数据更新后，立即同步到考勤日历标记
        this.updateCalendarDisplay();
      }).catch(error => {
        console.log('漏打卡检查失败:', error);
        this.setData({
          missedDays: [],
          showMissedReminder: false,
          hasLastMonthMissed: false
        });

        // 不在这里更新日历显示，让loadCalendarAttendance完成后统一更新
        // this.updateCalendarDisplay();
      });
    });
  },

  /**
   * 计算漏打卡的日期（包含上月最后几天）
   * @param {Array} historyList 考勤历史记录
   * @returns {Array} 漏打卡的日期列表
   */
  calculateMissedDaysWithLastMonth(historyList) {
    const safeHistoryList = Array.isArray(historyList) ? historyList : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // 计算上个月的年月
    const lastMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const lastMonthYear = lastMonthDate.getFullYear();
    const lastMonth = lastMonthDate.getMonth() + 1;

    // 获取已打卡的日期集合
    const attendedDates = new Set();
    safeHistoryList.forEach(record => {
      const workDate = this.getAttendanceWorkDate(record);
      if (workDate) {
        attendedDates.add(workDate);
      }
    });

    const missedDays = [];

    // 1. 检查上月最后7天（防止月初时上月底漏打卡）
    const lastMonthLastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
    const checkLastMonthDays = 7;

    for (let day = lastMonthLastDay - checkLastMonthDays + 1; day <= lastMonthLastDay; day++) {
      const dateStr = `${lastMonthYear}-${lastMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // 包括周末，因为周末也需要打卡（休息状态）
      if (!attendedDates.has(dateStr)) {
        missedDays.push(dateStr);
      }
    }

    // 2. 检查当月从1号到昨天的所有日期（包括周末）
    for (let day = 1; day <= currentDay - 1; day++) {
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

      // 包括周末，因为周末也需要打卡（休息状态）
      if (!attendedDates.has(dateStr)) {
        missedDays.push(dateStr);
      }
    }

    // 按日期排序
    missedDays.sort();

    console.log('计算出的漏打卡日期（包括上月最后7天和周末）:', missedDays);
    return missedDays;
  },

  /**
   * 计算漏打卡的日期（旧版本，仅供参考）
   * @param {Array} historyList 考勤历史记录
   * @returns {Array} 漏打卡的日期列表
   */
  calculateMissedDays(historyList) {
    const safeHistoryList = Array.isArray(historyList) ? historyList : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 获取本月1号
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 获取已打卡的日期集合
    const attendedDates = new Set();
    safeHistoryList.forEach(record => {
      const workDate = this.getAttendanceWorkDate(record);
      if (workDate) {
        attendedDates.add(workDate);
      }
    });

    // 遍历从本月1号到今天的所有日期（包括周末），找出未打卡的日期
    const missedDays = [];
    const currentDate = new Date(firstDay);
    
    while (currentDate < today) {
      const dateStr = this.getDateString(currentDate);
      
      // 检查所有日期（包括周末），只要没有打卡记录就算漏打卡
      if (!attendedDates.has(dateStr)) {
        missedDays.push(dateStr);
      }
      
      // 移到下一天
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('计算出的漏打卡日期（包括周末）:', missedDays);
    return missedDays;
  },

  /**
   * 点击漏打卡提醒，展开显示详细信息
   */
  onMissedReminderTap() {
    this.goToMissingCheckin();
  },

  /**
   * 跳转到漏打卡补交页面
   */
  goToMissingCheckin() {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const missedDays = Array.isArray(this.data.missedDays) ? this.data.missedDays : [];
    if (missedDays.length === 0) {
      wx.showToast({ title: '暂无漏打卡', icon: 'none' });
      return;
    }
    this._needRefreshCalendar = true;
    wx.navigateTo({
      url: '/pages/attendance/missing-checkin/index?missedDays=' + encodeURIComponent(JSON.stringify(missedDays))
    });
  },

  // ========== 日历相关功能 ==========

  /**
   * 初始化日历
   */
  initCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.setData({
      calendarYear: year,
      calendarMonth: month
    });
    
    this.generateCalendar(year, month);
    // 注意：考勤数据会在用户信息加载完成后自动加载
  },

  /**
   * 生成日历数据
   */
  generateCalendar(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay(); // 0=周日, 1=周一, ...
    
    const calendarDays = [];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 添加前面的空白天数（周日开始）
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push({ isEmpty: true });
    }
    
    // 添加本月的所有日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      
      calendarDays.push({
        day: day,
        date: dateStr,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isEmpty: false
      });
    }
    
    this.setData({
      calendarDays: calendarDays
    });
    
    // 立即更新日历显示（使用当前的 attendanceMap）
    this.updateCalendarDisplay();
  },

  /**
   * 加载日历考勤数据
   */
  loadCalendarAttendance(year, month) {
    const userInfo = this.data.currentUser;
    
    // 未登录预览：日历结构保留，考勤映射为空。
    if (mockData.isGuestMode()) {
      this.setData({ attendanceMap: {} });
      this.updateCalendarDisplay();
      return;
    }
    
    // 检查是否为测试模式
    if (this._isTestMode) {
      console.log(`日历考勤-测试模式：生成${year}年${month}月的mock数据`);
      
      // 使用testModeManager生成mock数据
      const mockData = testModeManager.getMockAttendanceData();
      const attendanceMap = {};
      
      // 过滤指定年月的数据并构建映射
      mockData.forEach(record => {
        const workDate = record.WorkDate;
        if (workDate && workDate.startsWith(`${year}-${String(month).padStart(2, '0')}`)) {
          const icon = this.getStatusIcon(record.WorkStatus);
          attendanceMap[workDate] = {
            id: record.id || `test_${workDate}`, // 缓存记录ID
            work_status: record.WorkStatus,
            icon: icon,
            comment: `测试${record.WorkStatus}记录`,
            business_trip_subsidy: record.Subsidy || 0
          };
        }
      });
      
      console.log('测试模式：日历考勤映射', attendanceMap);
      
      setTimeout(() => {
        this.setData({
          attendanceMap: attendanceMap
        });
        
        // 更新日历显示
        this.updateCalendarDisplay();
      }, 300); // 模拟网络延迟
      
      return;
    }
    
    // 正常模式：检查用户信息
    if (!userInfo || !userInfo.real_name) {
      console.log('用户信息不完整，无法加载日历考勤数据');
      return;
    }

    const realName = userInfo.real_name;
    
    apiCall(
      () => API.attendance.getCalendar({
        year: year,
        month: month,
        name: realName
      }),
      null,
      (data) => {
        console.log('考勤月历数据:', data);

        const payload = data && data.data ? data.data : data;
        const calendarDays = payload && Array.isArray(payload.days) ? payload.days : [];
        const attendanceMap = {};

        calendarDays.forEach(record => {
          const workDate = this.getAttendanceWorkDate(record);
          if (!workDate) return;

          const workStatus = record.work_status || record.WorkStatus || '';
          const dingAttendance = record.ding_attendance || {};
          const overtime = record.overtime || {};
          const icon = this.getStatusIcon(workStatus);
          const hasAttendance = !!(record.id || workStatus);

          attendanceMap[workDate] = {
            id: record.id,
            name: record.name || record.real_name || record.employee_name || realName,
            work_date: workDate,
            work_status: workStatus,
            icon: icon,
            comment: record.comment,
            business_trip_subsidy: record.business_trip_subsidy,
            hasAttendance: hasAttendance,
            ding_attendance: dingAttendance,
            holiday_info: record.holiday_info || null,
            calendar_stamp: record.calendar_stamp || '',
            calendar_stamp_type: record.calendar_stamp_type || '',
            overtime: overtime,
            hasDingAttendance: !!dingAttendance.has_ding_attendance,
            manualOvertimeOverride: !!(overtime.manual_override || dingAttendance.manual_override || record.manual_override),
            overtimeHours: Number(overtime.effective_hours || dingAttendance.overtime_hours || 0)
          };
        });

        this.setData({
          attendanceMap: attendanceMap,
          calendarSummary: payload ? payload.summary || null : null
        });
        
        // 更新日历显示
        this.updateCalendarDisplay();
      },
      (error) => {
        console.log('加载日历考勤数据失败:', error);
      }
    );
  },

  /**
   * 获取工作状态对应的图标
   */
  getStatusIcon(workStatus) {
    const iconMap = {
      '公司上班': '🏢',
      '国内出差': '🚄',
      '国外出差': '✈️',
      '休息': '🏠',
      '加班': '💻'
    };
    return iconMap[workStatus] || '📝';
  },

  /**
   * 获取工作状态对应的attendanceType（用于日历和记录图标CSS类）
   */
  getAttendanceType(workStatus) {
    const typeMap = {
      '公司上班': 'office',
      '国内出差': 'domestic',
      '国外出差': 'international',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'office'
    };
    return typeMap[workStatus] || 'office';
  },

  /**
   * 更新日历显示
   */
  updateCalendarDisplay() {
    const baseCalendarDays = Array.isArray(this.data.calendarDays) ? this.data.calendarDays : [];
    const attendanceMap = (this.data.attendanceMap && typeof this.data.attendanceMap === 'object') ? this.data.attendanceMap : {};
    const missedDays = Array.isArray(this.data.missedDays) ? this.data.missedDays : [];

    console.log('更新日历显示，attendanceMap:', attendanceMap);
    console.log('missedDays array:', missedDays);
    console.log('更新日历显示，calendarDays数量:', baseCalendarDays.length);
    
    const calendarDays = baseCalendarDays.map(dayInfo => {
      if (!dayInfo || dayInfo.isEmpty) {
        return dayInfo;
      }
      
      const attendance = dayInfo.date ? attendanceMap[dayInfo.date] : null;
      const isMissed = dayInfo.date ? missedDays.includes(dayInfo.date) : false;
      if (isMissed) { console.log('Missed date:', dayInfo.date); }
      
      const hasAttendance = !!(attendance && attendance.hasAttendance);
      const updatedDay = {
        ...dayInfo,
        hasAttendance: hasAttendance,
        attendanceIcon: hasAttendance ? attendance.icon : '',
        workStatus: hasAttendance ? attendance.work_status : '',
        attendanceType: hasAttendance ? this.getAttendanceType(attendance.work_status) : '',
        calendarStamp: attendance ? attendance.calendar_stamp : '',
        calendarStampType: attendance ? attendance.calendar_stamp_type : '',
        hasDingAttendance: !!(attendance && attendance.hasDingAttendance),
        manualOvertimeOverride: !!(attendance && attendance.manualOvertimeOverride),
        overtimeHours: attendance ? attendance.overtimeHours || 0 : 0,
        isMissed: isMissed
      };
      
      // 调试：输出有考勤记录的日期
      // if (attendance) {
      //   console.log(`日${dayInfo.date} 有考勤记录:`, attendance);
      // }
      
      return updatedDay;
    });
    
    console.log('Missed days in calendar:', calendarDays.filter(d => !d.isEmpty && d.isMissed));
    console.log('更新后的calendarDays:', calendarDays.filter(d => !d.isEmpty && d.hasAttendance));
    
    this.setData({
      calendarDays: calendarDays
    });
  },

  /**
   * 切换月份
   */
  changeMonth(e) {
    const direction = e.currentTarget.dataset.direction;
    let { calendarYear, calendarMonth } = this.data;
    
    if (direction === 'prev') {
      calendarMonth--;
      if (calendarMonth < 1) {
        calendarMonth = 12;
        calendarYear--;
      }
    } else {
      calendarMonth++;
      if (calendarMonth > 12) {
        calendarMonth = 1;
        calendarYear++;
      }
    }
    
    this.setData({
      calendarYear: calendarYear,
      calendarMonth: calendarMonth
    });
    
    this.generateCalendar(calendarYear, calendarMonth);
    this.loadCalendarAttendance(calendarYear, calendarMonth);
  },

  /**
   * 点击日历日期
   */
  onCalendarDayTap(e) {
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }

    const { date, isMissed } = e.currentTarget.dataset;
    
    if (!date) {
      return;
    }
    
    // 检查该日期是否有考勤记录
    const attendance = this.data.attendanceMap[date];
    
    if (attendance && attendance.hasAttendance) {
      // 已有考勤记录：打开编辑弹窗
      this.openEditModalForCalendar(date, attendance);
    } else {
      // 没有考勤记录：打开新增打卡弹窗
      this.openCheckinModalForDate(date);
    }
  },

  /**
   * 为日历点击打开编辑弹窗
   * @param {string} date - 日期字符串
   * @param {object} attendance - 考勤记录对象
   */
  openEditModalForCalendar(date, attendance) {
    // work_status 映射为 type
    const typeMap = {
      '公司上班': 'office',
      '国内出差': 'domestic',
      '国外出差': 'international',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'office'
    };

    const workDate = attendance.work_date || date;
    const dingAttendance = this.normalizeDingAttendanceDisplay(attendance.ding_attendance || {}, workDate);
    const timeRange = this.getAttendanceCheckTimeRange(Object.assign({}, attendance, { ding_attendance: dingAttendance }));
    const overtime = attendance.overtime || {};
    const overtimeHoursInput = String(
      attendance.overtimeHours ||
      overtime.effective_hours ||
      dingAttendance.overtime_hours ||
      0
    );
    const checkInDate = timeRange.checkInDate || workDate;
    const checkOutDate = timeRange.checkOutDate || workDate;
    const checkOutDayOffset = this.getCheckOutDayOffset(workDate, checkOutDate);
    const editForm = {
      id: attendance.id || attendance.record_id,
      name: attendance.name || attendance.real_name || attendance.employee_name || this.data.currentUser?.real_name || '',
      type: typeMap[attendance.work_status] || 'office',
      date: workDate,
      time: this.normalizeTimeText(attendance.put_date_time || attendance.submit_time) || '00:00',
      location: attendance.business_trip_location || '',
      baseName: attendance.comment || '',
      subsidy: attendance.business_trip_subsidy ? String(attendance.business_trip_subsidy) : '',
      hasDingAttendance: !!attendance.hasDingAttendance || this.hasDingCheckTime(dingAttendance),
      dingAttendance,
      holidayInfo: attendance.holiday_info || {},
      overtime,
      overtimeHoursInput,
      overtimeHoursTouched: false,
      checkInDate,
      checkInTime: timeRange.checkInTime || '09:00',
      checkOutDate,
      checkOutTime: timeRange.checkOutTime || '18:00',
      checkOutDayOffset,
      timeCalc: null,
      overtimeCalc: null,
      calendarStamp: attendance.calendar_stamp || ''
    };
    Object.assign(editForm, this.buildEditFormDateTimeState(editForm));
    editForm.timeCalc = this.buildTimeOvertimeCalc(editForm);
    editForm.overtimeCalc = this.buildDayOvertimeCalc({
      work_date: editForm.date,
      holiday_info: editForm.holidayInfo,
      overtime: editForm.overtime,
      ding_attendance: editForm.dingAttendance,
      overtimeHoursInput: editForm.overtimeHoursInput
    });

    this.setData({
      showEditModal: true,
      editForm
    });

    if (!this.data.salaryRateConfig.loaded && !this.data.salaryRateConfig.loading) {
      this.loadSalaryRateConfig(this.data.currentUser);
    }
  },

  onSyncDingtalk() {
    if (this.data.syncingDingtalk) return;
    if (mockData.showGuestModeTip('attendance')) {
      return;
    }
    if (this._isTestMode) {
      showError('当前模式不支持同步');
      return;
    }
	if (!this.data.canSyncDingtalk) {
		wx.showModal({
			title: '请先完成钉钉配置',
			content: '需要验证本人钉钉企业和用户身份后才能同步',
			confirmText: '去配置',
			success: res => {
				if (res.confirm) wx.navigateTo({ url: '/pages/admin/dingtalk-settings/index' });
			}
		});
		return;
	}

    const currentUser = this.data.currentUser || wx.getStorageSync('userInfo');
    if (!currentUser || !currentUser.real_name) {
      showError('请先完善真实姓名');
      return;
    }

    this.setData({ syncingDingtalk: true });
    wx.showLoading({ title: '同步中...' });

    API.attendance.syncDingtalk({
      year: this.data.calendarYear,
      month: this.data.calendarMonth,
      name: currentUser.real_name,
      source: 'openapi',
      include_calendar: true,
      include_details: false
    })
      .then(res => {
        wx.hideLoading();
        this.setData({ syncingDingtalk: false });
        if (!res || res.code !== 200) {
          const hint = res && res.data && res.data.hint ? res.data.hint : (res && res.msg ? res.msg : '同步失败');
          wx.showModal({
            title: '同步失败',
            content: hint,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        showSuccess('同步完成');
        const syncData = res && res.data ? res.data : null;
        let hydratedFromResponse = false;
        if (syncData && syncData.calendar && Array.isArray(syncData.calendar.days)) {
          const attendanceMap = {};
          syncData.calendar.days.forEach(record => {
            const workDate = this.getAttendanceWorkDate(record);
            if (!workDate) return;

            const workStatus = record.work_status || record.WorkStatus || '';
            const dingAttendance = record.ding_attendance || {};
            const overtime = record.overtime || {};

            attendanceMap[workDate] = {
              id: record.id,
              name: record.name || record.real_name || record.employee_name || currentUser.real_name,
              work_date: workDate,
              work_status: workStatus,
              icon: this.getStatusIcon(workStatus),
              comment: record.comment,
              business_trip_subsidy: record.business_trip_subsidy,
              hasAttendance: !!(record.id || workStatus),
              ding_attendance: dingAttendance,
              holiday_info: record.holiday_info || null,
              calendar_stamp: record.calendar_stamp || '',
              calendar_stamp_type: record.calendar_stamp_type || '',
              overtime: overtime,
              hasDingAttendance: !!dingAttendance.has_ding_attendance,
              manualOvertimeOverride: !!(overtime.manual_override || dingAttendance.manual_override || record.manual_override),
              overtimeHours: Number(overtime.effective_hours || dingAttendance.overtime_hours || 0)
            };
          });

          this.setData({
            attendanceMap,
            calendarSummary: syncData.calendar.summary || null
          });
          this.updateCalendarDisplay();
          hydratedFromResponse = true;
        }
        if (!hydratedFromResponse) {
          this.loadCalendarAttendance(this.data.calendarYear, this.data.calendarMonth);
        }
        this.loadRecentAttendance();
        this.loadTodayAttendance();
      })
      .catch(err => {
        wx.hideLoading();
        this.setData({ syncingDingtalk: false });
        wx.showModal({
          title: '同步失败',
          content: err && err.message ? err.message : '请稍后重试',
          showCancel: false,
          confirmText: '知道了'
        });
      });
  },

  goToAttendanceEntries() {
    if (mockData.showGuestModeTip('attendance')) return;
    wx.navigateTo({ url: '/pages/attendance/entries/index' });
  },

  loadDingtalkSyncAvailability(disabledMode) {
    if (disabledMode || !wx.getStorageSync('openid')) {
      this.setData({ canSyncDingtalk: false });
      return;
    }
    API.attendance.getDingtalkSettings()
      .then(res => {
        const settings = res && res.data ? res.data : {};
        this.setData({ canSyncDingtalk: settings.can_sync === true });
      })
      .catch(() => {
        this.setData({ canSyncDingtalk: false });
      });
  },

  /**
   * 为指定日期打开打卡弹窗（新增打卡）
   * @param {string} date - 日期字符串
   */
  openCheckinModalForDate(date) {
    // 重置表单并打开弹窗，设置日期
    this.setData({
      showCheckinModal: true,
      checkinForm: {
        type: 'office',
        date: date, // 设置选中的日期
        baseName: '',
        subsidy: ''
      }
    });
  },

  /**
   * 显示考勤操作选择（已废弃，保留以防其他地方调用）
   * @param {string} date - 日期字符串
   * @param {object} attendance - 考勤记录对象
   */
  showAttendanceActions(date, attendance) {
    wx.showActionSheet({
      itemList: ['查看详情', '编辑考勤'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看详情
          this.showAttendanceDetail(date, attendance);
        } else if (res.tapIndex === 1) {
          // 编辑考勤
          this.editAttendance(date, attendance);
        }
      }
    });
  },

  /**
   * 显示考勤详情（只读）
   * @param {string} date - 日期字符串
   * @param {object} attendance - 考勤记录对象
   */
  showAttendanceDetail(date, attendance) {
    const subsidy = attendance.business_trip_subsidy || 0;
    const subsidyText = subsidy > 0 ? `\n出差补贴：¥${subsidy}` : '';
    
    wx.showModal({
      title: `${date} 考勤详情`,
      content: `工作状态：${attendance.work_status}\n备注：${attendance.comment || '无'}${subsidyText}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 编辑考勤记录（已废弃，保留以防其他地方调用）
   * @param {string} date - 日期字符串
   * @param {object} attendance - 考勤记录对象
   */
  editAttendance(date, attendance) {
    // 获取考勤记录ID
    const recordId = attendance.id || attendance.record_id;
    
    if (!recordId) {
      showError('无法获取考勤记录ID');
      return;
    }
    
    // 设置需要刷新标记，返回时会自动刷新
    this._needRefreshCalendar = true;
    
    // 跳转到编辑页面
    wx.navigateTo({
      url: `/pages/attendance/submit/index?mode=edit&id=${recordId}&date=${date}`
    });
  },

  /**
   * 关闭游客模式横幅
   */
  closeGuestBanner() {
    this.setData({
      showGuestBanner: false
    });
  },

  /**
   * 打开打卡模态框
   */
  onOpenCheckInModal() {
    if (mockData.showGuestModeTip('submit')) {
      return;
    }

    if (this.data.todayCheckedIn) {
      return;
    }

    // 获取当前日期
    const now = new Date();
    const currentDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    
    // 重置表单并打开弹窗
    this.setData({
      showCheckinModal: true,
      checkinForm: {
        type: 'office',
        date: currentDate,
        baseName: '',
        subsidy: ''
      }
    });
  },

  /**
   * 关闭打卡弹窗
   */
  onCloseCheckinModal() {
    this.setData({ showCheckinModal: false });
  },

  /**
   * 打卡类型选择
   */
  onCheckinTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ 'checkinForm.type': type });
  },

  /**
   * 出差地址输入
   */
  onCheckinBaseNameChange(e) {
    this.setData({ 'checkinForm.baseName': e.detail.value });
  },

  /**
   * 补贴金额输入
   */
  onCheckinSubsidyChange(e) {
    this.setData({ 'checkinForm.subsidy': e.detail.value });
  },

  /**
   * 确认打卡
   */
  onConfirmCheckin() {
    if (mockData.showGuestModeTip('submit')) {
      return;
    }

    const form = this.data.checkinForm;
    const currentUser = this.data.currentUser;

    // 检查用户信息
    if (!currentUser || !currentUser.real_name) {
      wx.showModal({
        title: '提示',
        content: '请先完善真实姓名',
        showCancel: false
      });
      return;
    }

    // 类型映射
    const typeToStatus = {
      office: '公司上班',
      domestic: '国内出差',
      international: '国外出差',
      rest: '休息',
      compensatory: '调休'
    };

    const workStatus = typeToStatus[form.type] || '公司上班';

    // 根据工作状态生comment
    let comment = '';
    if (workStatus === '国内出差' || workStatus === '国外出差') {
      // 出差类型：comment 是出差地点（基地名）
      comment = form.baseName || '';
      
      // 验证出差必须填写地址
      if (!comment) {
        wx.showToast({
          title: '请填写出差地址',
          icon: 'none'
        });
        return;
      }
    } else {
      // 公司上班或休息：comment 就是工作状态本身
      comment = workStatus;
    }

    // 使用表单中的日期，如果没有则使用当前日期
    const workDate = form.date || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    })();
    
    // 获取当前时间
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const putDate = `${workDate} ${currentTime}`;

    const payload = {
      name: currentUser.real_name,
      work_status: workStatus,
      work_date: workDate,
      put_date: putDate,
      business_trip_location: form.baseName || '',
      comment: comment,
      business_trip_subsidy: parseFloat(form.subsidy) || 0
    };

    // 提交打卡
    wx.showLoading({ title: '提交中...' });
    apiCall(
      () => API.attendance.submit(payload),
      null,
      (res) => {
        wx.hideLoading();
        if (!res || res.code !== 200) {
          this.setData({
            showCheckinModal: false,
            showResultModal: true,
            resultSuccess: false,
            resultMsg: res && res.msg ? res.msg : '打卡失败'
          });
          return;
        }

        this.applyImmediateTodayAttendance(payload);
        this.setData({
          showCheckinModal: false,
          showResultModal: true,
          resultSuccess: true,
          resultMsg: res && res.msg ? res.msg : '打卡成功'
        });
        // 刷新数据
        this.loadTodayAttendance();
        this.loadRecentAttendance();
        this.loadCalendarAttendance(this.data.calendarYear, this.data.calendarMonth);

        // 在日历数据加载后检查漏打卡（延迟执行以确保日历数据已加载）
        setTimeout(() => {
          this.checkMissedAttendance();
        }, 500);
      },
      (err) => {
        wx.hideLoading();
        this.setData({
          showCheckinModal: false,
          showResultModal: true,
          resultSuccess: false,
          resultMsg: err && err.message ? err.message : '打卡失败'
        });
      }
    );
  },

  /**
   * 通知按钮点- 获取公告并显示弹窗
   */
  onNotificationTap() {
    wx.showLoading({ title: '加载中...' });
    apiCall(
      () => API.announcement.getList(),
      null,
      (data) => {
        wx.hideLoading();
        const announcements = data.data || [];
        const activeAnnouncements = announcements.filter(item => item.is_active);
        
        if (activeAnnouncements.length === 0) {
          wx.showToast({ title: '暂无新公告', icon: 'none' });
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

        this.setData({
          showNoticeModal: true,
          noticeModalList: noticeList
        });
      },
      (error) => {
        wx.hideLoading();
        console.error('加载公告失败:', error);
        wx.showToast({ title: '加载公告失败', icon: 'none' });
      }
    );
  },

  /**
   * 关闭公告弹窗
   */
  onNoticeModalClose() {
    this.setData({ showNoticeModal: false });
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
    
    console.log('首次启动小程序，准备显示公告弹窗');
    
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
  }
});
