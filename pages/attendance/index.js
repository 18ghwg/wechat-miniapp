const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { testModeManager } = require('../../utils/testMode');
const mockData = require('../../utils/mock-data');
const featureUsage = require('../../utils/feature-usage');
const { userInfoCache } = require('../../utils/user-info-cache');
const { performanceMonitor, PERF_TYPES } = require('../../utils/performance-monitor');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { isDevtools } = require('../../utils/system-info');

Page({
  data: {
    pageAnimationClass: '',
    cardAnimationClass: '',
    todayAttendance: null,
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
    showCalendar: true, // 是否显示日历
    // ⭐ 游客模式相关
    isGuest: false, // 是否为游客模式
    showGuestBanner: false, // 是否显示游客模式横幅
    // ⭐ 时间显示相关
    currentTime: '00:00:00',
    formattedDate: '',
    greetingText: '你好', // 问候语
    greetingIcon: '/assets/icons/sun.png', // 问候图标
    hasNotification: false,
    // ⭐ 编辑弹窗相关
    showEditModal: false,
    editForm: {
      id: '',
      type: 'office',
      date: '',
      time: '',
      location: '',
      baseName: '',
      subsidy: ''
    },
    // ⭐ 保存结果弹窗相关
    showResultModal: false,
    resultSuccess: true,
    resultMsg: '',
    // ⭐ 公告弹窗相关
    showNoticeModal: false,
    noticeModalList: [],
    // ⭐ 打卡弹窗相关
    showCheckinModal: false,
    checkinForm: {
      type: 'office',
      date: '', // 打卡日期
      baseName: '',
      subsidy: ''
    },
    // ⭐ 删除确认弹窗相关
    showDeleteModal: false,
    deleteRecordId: null,
    // ⭐ 删除进度弹窗相关
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
    
    // ⭐ 检查游客模式
    const isGuest = mockData.isGuestMode();
    this.setData({ 
      isGuest: isGuest,
      showGuestBanner: isGuest 
    });
    
    // ⭐ 启动时间更新定时器
    this.updateTime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
    
    // 记录功能使用（非阻塞）
    setTimeout(() => {
      featureUsage.recordFeatureUsage('attendance', '考勤管理', '📋');
    }, 0);
    
    // 显示分享菜单（包含朋友圈分享）
    wx.showShareMenu({
      withShareTicket: true,
      success: (res) => {
        console.log('✅ 考勤管理：分享菜单显示成功');
      },
      fail: (err) => {
        console.warn('⚠️ 考勤管理：分享菜单显示失败，但不影响分享功能');
      }
    });
    
    this.updateCurrentDate();
    this.initCalendar(); // 初始化日历
    this.loadUserInfo();
    this.loadTodayAttendance();
    this.loadRecentAttendance();
    this.checkMissedAttendance();
    
    // ⭐ 检查是否首次启动，如果是则显示公告弹窗
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
      this.checkMissedAttendance();
      
      // 更新日历
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
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

      // ⭐ 检查游客模式变化
      const oldGuestMode = this.data.isGuest || false;
      const newGuestMode = mockData.isGuestMode();
      const guestModeChanged = oldGuestMode !== newGuestMode;

      // ⭐ 更新游客模式状态
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

      // ⭐ 检查是否需要强制刷新（从编辑页面返回）
      // 修复：改为调用 refreshPageData() 统一处理数据刷新，避免重复加载
      if (this._needRefreshCalendar) {
        console.log('🔄 检测到需要刷新标记，强制刷新所有数据（包括日历）');
        this._needRefreshCalendar = false; // 重置标记

        // 调用 refreshPageData() 统一处理数据刷新
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
    const formattedDate = `${year}年${month}月${day}日 · 周${weekday}`;
    
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
      path: '/pages/attendance/index',
      imageUrl: ''
    };
  },
  
  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    const appName = miniprogramInfo.getAppName();
    
    return {
      title: `考勤管理 - ${appName}`,
      query: '',
      imageUrl: ''
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
    
    // ⭐ 游客模式：加载mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 刷新页面-游客模式：加载mock数据');
      this.loadUserInfo();
      this.loadTodayAttendance();
      this.loadRecentAttendance();
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
      this.checkMissedAttendance();
      
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
        this.checkMissedAttendance();
        
        // 更新日历
        const now = new Date();
        this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
        
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
    // 下拉刷新时，重新检查用户信息并刷新所有数据
    console.log('下拉刷新：重新加载所有数据');
    this.refreshPageData();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 考勤用户信息-游客模式：使用mock数据');
      const mockUser = {
        nickname: '体验用户',
        real_name: '张三',
        openid: 'mock_openid'
      };
      this.setData({ 
        currentUser: mockUser,
        needCompleteProfile: false
      });
      
      // 加载日历考勤数据
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
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
      
      // 加载日历考勤数据
      const now = new Date();
      this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
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
        
        // 加载日历考勤数据
        const now = new Date();
        this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
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
   * 加载今日考勤 - 根据用户真实姓名自动查询
   */
  loadTodayAttendance() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    
    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 今日考勤-游客模式：使用mock数据');
      const mockTodayAttendance = {
        id: 1,
        date: dateStr,
        work_status: '公司上班',
        submit_time: '09:00',
        location: '北京市朝阳区',
        remark: '正常出勤'
      };
      this.setData({
        todayAttendance: mockTodayAttendance,
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
                name: '微信用户d_001', // 与nickname保持一致
                work_status: '公司上班',
                comment: '公司上班 - 小程序提交',
                work_date: dateStr,
                submit_time: this.formatPutDateTime(new Date().toISOString())
              },
              needCompleteProfile: false
            });
          } else {
            console.log('测试模式：显示无今日考勤记录');
            this.setData({
              todayAttendance: null,
              needCompleteProfile: false
            });
          }
        }
      }, 300);
      return;
    }
    
    // 先确保获取最新用户信息，再查询今日考勤
    this.ensureLatestUserInfo((userInfo) => {
      // 如果没有用户信息或没有真实姓名，提示用户完善
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
        // 检查数据结构：data 可能是 {code, msg, data: {attendance}} 或直接的 {attendance}
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
            needCompleteProfile: false
          });
        } else {
          // 今日未打卡
          console.log('今日未找到考勤记录');
          this.setData({
            todayAttendance: null,
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
        
        // 根据后端实际返回的数据结构处理
        let historyList = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // 如果返回的是对象，可能有data字段
          historyList = data.data || data;
        }
        
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
            needCompleteProfile: false
          });
        } else {
          // 今日未打卡
          this.setData({
            todayAttendance: null,
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

    // ⭐ 游客模式：使用mock数据
    if (mockData.isGuestMode()) {
      console.log('🎭 考勤记录-游客模式：使用mock数据');
      const today = new Date();
      const mockRecentAttendance = [
        {
          id: 1,
          work_status: '公司上班',
          work_date: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`,
          put_date_time: '09:00',
          status_class: 'company-work'
        },
        {
          id: 2,
          work_status: '公司上班',
          work_date: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${(today.getDate() - 1).toString().padStart(2, '0')}`,
          put_date_time: '09:15',
          status_class: 'company-work'
        },
        {
          id: 3,
          work_status: '休息',
          work_date: `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${(today.getDate() - 2).toString().padStart(2, '0')}`,
          put_date_time: '00:00',
          status_class: 'rest'
        }
      ];
      this.setData({ 
        recentAttendance: mockRecentAttendance,
        loading: false 
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
    // ⭐ 游客模式：不加载数据
    if (mockData.isGuestMode()) {
      console.log('🎭 用户信息-游客模式：不加载数据');
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
        
        // 处理不同的数据格式：data可能直接是数组，也可能在responseData或data字段中
        let rawData = [];
        if (Array.isArray(data)) {
          rawData = data;
        } else if (data && Array.isArray(data.responseData)) {
          rawData = data.responseData;
        } else if (data && Array.isArray(data.data)) {
          rawData = data.data;
        } else if (data && data.data && Array.isArray(data.data.data)) {
          rawData = data.data.data;
        }
        
        // console.log('提取的原始考勤数据:', rawData);
        
        // 后端已按日期倒序排列，直接处理数据
        let sortedData = rawData || [];
        if (sortedData.length > 0) {
          // 获取最近一周的日期范围（7天）
          const today = new Date();
          today.setHours(0, 0, 0, 0); // 设置为当天开始时间
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(today.getDate() - 7); // 7天前
          
          // ===== 性能优化：使用字符串比较代替Date对象 =====
          // 计算一周前的日期字符串
          const oneWeekAgoStr = this.getDateString(oneWeekAgo);
          const todayStr = this.getDateString(today);
          
          // 过滤最近一周的记录（使用字符串比较，更高效）
          sortedData = sortedData.filter(item => {
            if (!item.work_date) return false;
            return item.work_date >= oneWeekAgoStr && item.work_date <= todayStr;
          });
          
          // ===== 性能优化：预处理时间格式化和状态类名 =====
          // 使用 for 循环代替 map（性能更好）
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
        content: `确定要提交 ${status} 的考勤记录吗？`,
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
      content: `确定要提交 ${status} 的考勤记录吗？\n出差基地：${location}\n出差补贴：${subsidyText}`,
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

      // 构建comment字段 - 直接使用工作状态或出差基地，不添加提交来源后缀
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
          this.checkMissedAttendance();
          
          // 更新日历
          const now = new Date();
          this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
          
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
            this.checkMissedAttendance();
            
            // 更新日历
            const now = new Date();
            this.loadCalendarAttendance(now.getFullYear(), now.getMonth() + 1);
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
                // 直接显示弹窗，不先显示错误提示，避免冲突  
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
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    // 将 work_status 映射为 type
    const typeMap = {
      '公司上班': 'office',
      '国内出差': 'domestic',
      '国外出差': 'international',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'office'
    };

    // 获取当前时间（HH:MM格式）
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.setData({
      showEditModal: true,
      editForm: {
        id: item.id,
        name: item.name || item.real_name || item.employee_name || '',
        type: typeMap[item.work_status] || 'office',
        date: item.work_date || '',
        time: currentTime, // 使用当前时间
        location: item.business_trip_location || '',
        baseName: item.comment || '',
        subsidy: item.business_trip_subsidy ? String(item.business_trip_subsidy) : ''
      }
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
    this.setData({ 'editForm.date': e.detail.value });
  },

  onEditTimeChange(e) {
    this.setData({ 'editForm.time': e.detail.value });
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
    
    // 根据工作状态生成 comment
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
      business_trip_location: form.baseName || '',
      comment: comment,
      business_trip_subsidy: parseFloat(form.subsidy) || 0
    };

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
        this.checkMissedAttendance();
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
   * 确认删除 - 带进度弹窗
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
            const allSuccess = steps.db_deleted && steps.excel_cleared && steps.nas_uploaded;
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
            this.checkMissedAttendance();
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
    // ⭐ 游客模式：禁止访问历史页面
    if (mockData.isGuestMode()) {
      console.log('🎭 考勤历史-游客模式：需要登录');
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
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
    // ⭐ 优先检查是否为游客模式
    if (mockData.isGuestMode()) {
      console.log('🎭 漏打卡检查-游客模式：不显示漏打卡提醒');
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
      
      // 更新日历显示
      this.updateCalendarDisplay();
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
              let historyList = [];
              if (Array.isArray(data)) {
                historyList = data;
              } else if (data && Array.isArray(data.data)) {
                historyList = data.data;
              } else if (data && data.data && Array.isArray(data.data.data)) {
                historyList = data.data.data;
              }
              resolve(historyList);
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
              let historyList = [];
              if (Array.isArray(data)) {
                historyList = data;
              } else if (data && Array.isArray(data.data)) {
                historyList = data.data;
              } else if (data && data.data && Array.isArray(data.data.data)) {
                historyList = data.data.data;
              }
              resolve(historyList);
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
        
        // 计算漏打卡的日期（包含上月最后几天）
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
        
        // 更新日历显示
        this.updateCalendarDisplay();
      }).catch(error => {
        console.log('漏打卡检查失败:', error);
        this.setData({
          missedDays: [],
          showMissedReminder: false,
          hasLastMonthMissed: false
        });
        
        // 更新日历显示
        this.updateCalendarDisplay();
      });
    });
  },

  /**
   * 计算漏打卡的日期（包含上月最后几天）
   * @param {Array} historyList 考勤历史记录
   * @returns {Array} 漏打卡的日期列表
   */
  calculateMissedDaysWithLastMonth(historyList) {
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
    historyList.forEach(record => {
      const workDate = record.work_date || record.WorkDate;
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
      if (!attendedDates.has(dateStr)) {
        missedDays.push(dateStr);
      }
    }
    
    // 2. 检查当月从1号到昨天的所有日期
    for (let day = 1; day <= currentDay - 1; day++) {
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      if (!attendedDates.has(dateStr)) {
        missedDays.push(dateStr);
      }
    }
    
    // 按日期排序
    missedDays.sort();

    console.log('计算出的漏打卡日期（包括上月最后7天）:', missedDays);
    return missedDays;
  },

  /**
   * 计算漏打卡的日期（旧版本，仅供参考）
   * @param {Array} historyList 考勤历史记录
   * @returns {Array} 漏打卡的日期列表
   */
  calculateMissedDays(historyList) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 获取本月1号
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 获取已打卡的日期集合
    const attendedDates = new Set();
    historyList.forEach(record => {
      const workDate = record.work_date || record.WorkDate;
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
    if (this.data.missedDays.length === 0) {
      wx.showToast({ title: '暂无漏打卡', icon: 'none' });
      return;
    }
    this._needRefreshCalendar = true;
    wx.navigateTo({
      url: '/pages/attendance/missing-checkin/index?missedDays=' + encodeURIComponent(JSON.stringify(this.data.missedDays))
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
    
    // ⭐ 优先检查是否为游客模式
    if (mockData.isGuestMode()) {
      console.log(`🎭 日历考勤-游客模式：生成${year}年${month}月的mock数据`);
      
      // 生成游客模式的日历数据
      const attendanceMap = {};
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      
      // 只为当前月份生成数据
      if (year === currentYear && month === currentMonth) {
        const currentDay = today.getDate();
        // 生成本月已过去的工作日考勤记录
        for (let day = 1; day <= currentDay; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = new Date(year, month - 1, day).getDay();
          
          // 周末显示休息，工作日显示出勤
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            attendanceMap[dateStr] = {
              id: `guest_${dateStr}`, // 缓存记录ID
              work_status: '休息',
              icon: '🏠',
              comment: '休息',
              business_trip_subsidy: 0
            };
          } else {
            attendanceMap[dateStr] = {
              id: `guest_${dateStr}`, // 缓存记录ID
              work_status: '公司上班',
              icon: '🏢',
              comment: '正常出勤',
              business_trip_subsidy: 0
            };
          }
        }
      }
      
      console.log('游客模式：日历考勤映射', attendanceMap);
      
      this.setData({
        attendanceMap: attendanceMap
      });
      
      // 更新日历显示
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
      () => API.attendance.getHistory({
        year: year,
        month: month,
        name: realName
      }),
      null,
      (data) => {
        console.log('日历考勤数据:', data);
        
        const attendanceList = data && data.data ? data.data : [];
        const attendanceMap = {};
        
        // 构建考勤映射
        attendanceList.forEach(record => {
          if (record.work_date) {
            const icon = this.getStatusIcon(record.work_status);
            attendanceMap[record.work_date] = {
              id: record.id,
              name: record.name || record.real_name || record.employee_name || '', // 缓存姓名
              work_status: record.work_status,
              icon: icon,
              comment: record.comment,
              business_trip_subsidy: record.business_trip_subsidy
            };
          }
        });
        
        this.setData({
          attendanceMap: attendanceMap
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
    console.log('📅 更新日历显示，attendanceMap:', this.data.attendanceMap);
    console.log('📅 更新日历显示，calendarDays数量:', this.data.calendarDays.length);
    
    const calendarDays = this.data.calendarDays.map(dayInfo => {
      if (dayInfo.isEmpty) {
        return dayInfo;
      }
      
      const attendance = this.data.attendanceMap[dayInfo.date];
      const isMissed = this.data.missedDays.includes(dayInfo.date);
      
      const updatedDay = {
        ...dayInfo,
        hasAttendance: !!attendance,
        attendanceIcon: attendance ? attendance.icon : '',
        workStatus: attendance ? attendance.work_status : '',
        attendanceType: attendance ? this.getAttendanceType(attendance.work_status) : '',
        isMissed: isMissed
      };
      
      // 调试：输出有考勤记录的日期
      // if (attendance) {
      //   console.log(`📅 日期 ${dayInfo.date} 有考勤记录:`, attendance);
      // }
      
      return updatedDay;
    });
    
    console.log('📅 更新后的calendarDays:', calendarDays.filter(d => !d.isEmpty && d.hasAttendance));
    
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
    const { date, isMissed } = e.currentTarget.dataset;
    
    if (!date) {
      return;
    }
    
    // 检查该日期是否有考勤记录
    const attendance = this.data.attendanceMap[date];
    
    if (attendance) {
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
    // 将 work_status 映射为 type
    const typeMap = {
      '公司上班': 'office',
      '国内出差': 'domestic',
      '国外出差': 'international',
      '休息': 'rest',
      '调休': 'compensatory',
      '加班': 'office'
    };

    // 获取当前时间（HH:MM格式）
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.setData({
      showEditModal: true,
      editForm: {
        id: attendance.id || attendance.record_id,
        name: attendance.name || attendance.real_name || attendance.employee_name || this.data.currentUser?.real_name || '',
        type: typeMap[attendance.work_status] || 'office',
        date: attendance.work_date || date,
        time: currentTime, // 使用当前时间
        location: attendance.business_trip_location || '',
        baseName: attendance.comment || '',
        subsidy: attendance.business_trip_subsidy ? String(attendance.business_trip_subsidy) : ''
      }
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
    
    // ⭐ 设置需要刷新标记，返回时会自动刷新
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

    // 根据工作状态生成 comment
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
        this.checkMissedAttendance();
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
   * 通知按钮点击 - 获取公告并显示弹窗
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