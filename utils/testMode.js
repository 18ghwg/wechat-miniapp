/**
 * 全局测试模式管理工具
 * 用于小程序审核时隐藏真实数据，展示mock数据
 */

// 引入环境配置工具和API封装
const { getEnvironmentInfo } = require('./environment');
const { request } = require('./api');

class TestModeManager {
  constructor() {
    this.TEST_MODE_KEY = 'globalTestMode';
    this.listeners = new Set(); // 监听器集合
    this.globalTestModeCache = null; // 全局测试模式缓存
    this.cacheExpireTime = 0; // 缓存过期时间
    this.CACHE_DURATION = 30000; // 缓存30秒
  }

  /**
   * 从后端获取全局测试模式状态
   */
  async fetchGlobalTestModeFromServer() {
    try {
      // ✅ 使用API封装，自动添加签名
      const result = await request('/system/test-mode', 'GET')
        .then(data => (data.data ? data.data.is_enabled : false) || false)
        .catch(err => {
          console.warn('获取全局测试模式状态失败:', err);
          return false; // 如果获取失败，默认为false
        });
      
      // 更新缓存
      this.globalTestModeCache = result;
      this.cacheExpireTime = Date.now() + this.CACHE_DURATION;
      
      return result;
    } catch (error) {
      console.warn('获取全局测试模式状态异常:', error);
      return false;
    }
  }

  /**
   * 检查是否为全局测试模式（从服务器获取或使用缓存）
   */
  isGlobalTestMode() {
    // 如果缓存有效，直接返回缓存值
    if (this.globalTestModeCache !== null && Date.now() < this.cacheExpireTime) {
      return this.globalTestModeCache;
    }
    
    // 如果是首次调用（缓存为null），尝试从本地存储读取上次的状态
    if (this.globalTestModeCache === null) {
      try {
        const cachedState = wx.getStorageSync('globalTestModeState');
        if (cachedState !== undefined && cachedState !== null && cachedState !== '') {
          console.log('🔄 从本地存储恢复全局测试模式状态:', cachedState);
          this.globalTestModeCache = cachedState;
          this.cacheExpireTime = Date.now() + 5000; // 给5秒缓冲时间，让后台更新
        }
      } catch (error) {
        console.warn('读取本地测试模式状态失败:', error);
      }
    }
    
    // 缓存过期或不存在，异步获取新状态（但不阻塞当前调用）
    this.fetchGlobalTestModeFromServer().then(status => {
      const oldStatus = this.globalTestModeCache;
      this.globalTestModeCache = status;
      
      // 保存到本地存储
      try {
        wx.setStorageSync('globalTestModeState', status);
      } catch (error) {
        console.warn('保存测试模式状态到本地存储失败:', error);
      }
      
      // 如果状态发生变化，通知监听器
      if (oldStatus !== null && oldStatus !== status) {
        console.log('🔄 全局测试模式状态变化，通知监听器');
        this.notifyListeners(this.isTestMode());
      }
    });
    
    // 返回缓存值（如果没有缓存，返回false）
    return this.globalTestModeCache || false;
  }

  /**
   * 检查是否为测试模式
   * 包含两种情况：
   * 1. 全局测试模式开关（管理员手动控制，用于审核）
   * 2. 开发工具微信一键登录（登录时自动设置的测试模式）
   */
  isTestMode() {
    // 1. 检查全局测试模式开关（从服务器获取）
    const globalTestMode = this.isGlobalTestMode();
    if (globalTestMode) {
      console.log('🧪 测试模式激活：全局开关已启用');
      return true;
    }
    
    // 2. 检查微信一键登录测试模式（开发工具中微信登录时自动设置）
    const wechatTestMode = wx.getStorageSync('isTestMode') === true;
    if (wechatTestMode) {
      console.log('🧪 测试模式激活：微信一键登录测试账号');
      return true;
    }
    
    return false;
  }

  /**
   * 检测是否为开发环境（仅用于信息展示，不影响测试模式判断）
   */
  isDevelopmentEnvironment() {
    try {
      // 获取小程序账号信息
      const accountInfo = wx.getAccountInfoSync();
      const envVersion = (accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : undefined) || '';
      
      // 开发版、体验版都视为开发环境
      const isDevelopment = envVersion === 'develop' || envVersion === 'trial';
      
      return isDevelopment;
    } catch (error) {
      console.warn('❌ 获取环境信息失败，默认为非开发环境:', error);
      return false;
    }
  }


  /**
   * 获取当前测试模式状态详情
   */
  getTestModeStatus() {
    const globalTestMode = this.isGlobalTestMode();
    const wechatTestMode = wx.getStorageSync('isTestMode') === true;
    const developmentMode = this.isDevelopmentEnvironment();
    const isTestMode = this.isTestMode();
    
    let source = 'none';
    if (globalTestMode) {
      source = 'global_switch';
    } else if (wechatTestMode) {
      source = 'wechat_dev_login';
    }
    
    return {
      isTestMode,
      globalTestMode,
      wechatTestMode,
      developmentMode,
      source
    };
  }

  /**
   * 设置测试模式状态（调用后端API）
   * @param {boolean} enabled - 是否启用测试模式
   */
  async setTestMode(enabled) {
    const oldMode = this.isTestMode();
    
    try {
      // ✅ 使用API封装，自动添加签名
      const result = await request('/system/test-mode', 'POST', {
        is_enabled: enabled,
        description: `通过小程序${enabled ? '启用' : '关闭'}全局测试模式`
      })
        .then(data => true)
        .catch(err => {
          console.error('设置测试模式失败:', err);
          return false;
        });
      
      if (result) {
        // 更新缓存
        this.globalTestModeCache = enabled;
        this.cacheExpireTime = Date.now() + this.CACHE_DURATION;
        
        // 保存到本地存储
        try {
          wx.setStorageSync('globalTestModeState', enabled);
        } catch (error) {
          console.warn('保存测试模式状态到本地存储失败:', error);
        }
        
        console.log(`全局测试模式${enabled ? '启用' : '关闭'}成功`);
        
        // 通知监听器状态变化
        this.notifyListeners(this.isTestMode());
        
        return true;
      } else {
        throw new Error('设置测试模式失败');
      }
    } catch (error) {
      console.error('设置测试模式异常:', error);
      return false;
    }
  }

  /**
   * 切换测试模式状态
   */
  async toggleTestMode() {
    const currentMode = this.isGlobalTestMode(); // 只基于全局测试模式切换
    const success = await this.setTestMode(!currentMode);
    return success ? !currentMode : currentMode;
  }

  /**
   * 添加测试模式变化监听器
   * @param {Function} listener - 监听函数，参数为新的测试模式状态
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * 移除测试模式变化监听器
   * @param {Function} listener - 要移除的监听函数
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   * @param {boolean} isTestMode - 新的测试模式状态
   */
  notifyListeners(isTestMode) {
    console.log(`通知${this.listeners.size}个监听器，测试模式状态：${isTestMode}`);
    this.listeners.forEach(listener => {
      try {
        listener(isTestMode);
      } catch (error) {
        console.error('测试模式监听器执行出错:', error);
      }
    });
  }

  /**
   * 获取测试用户信息
   */
  getMockUserInfo() {
    const mockOpenid = 'test_openid_001';
    return {
      id: 'test_user_001',
      openid: mockOpenid,
      nickname: `微信用户${mockOpenid.slice(-5)}`, // 使用openid后五位
      nickName: `微信用户${mockOpenid.slice(-5)}`, // 兼容性
      avatar_url: '', // 不使用静态头像
      avatarUrl: '', // 不使用静态头像
      useGeneratedAvatar: true, // 标记需要生成头像
      avatarSeed: mockOpenid.slice(-1), // 使用openid最后一位作为头像种子
      real_name: '', // 测试未完善真实姓名的场景，头像应使用nickname最后一个字
      is_web_bound: false,
      web_username: null,
      web_user_level: null,
      user_level: 'admin',
      is_admin: true,
      is_active: true,
      register_time: '2025-09-25 10:00:00',
      last_login: '2025-09-25 12:00:00',
      permissions: [
        { code: 'electric_query', name: '电费查询', is_granted: true },
        { code: 'attendance', name: '考勤管理', is_granted: true },
        { code: 'admin', name: '管理员权限', is_granted: true }
      ]
    };
  }

  /**
   * 获取测试电费数据
   */
  getMockElectricData() {
    return [
      {
        id: 1,
        LastDailyDate: '2025-09-28',
        LastDailyUsage: 12.5,
        LastBalance: 156.78,
        MonthCharge: 89.45,
        GridPhone: '13800138001',
        GridAccount: '测试账户1',
        QueryDate: '2025-09-28 10:30:00',
        IsActive: true
      },
      {
        id: 2,
        LastDailyDate: '2025-09-27',
        LastDailyUsage: 15.2,
        LastBalance: 243.56,
        MonthCharge: 102.33,
        GridPhone: '13800138002',
        GridAccount: '测试账户2',
        QueryDate: '2025-09-27 15:20:00',
        IsActive: false
      },
      {
        id: 3,
        LastDailyDate: '2025-09-26',
        LastDailyUsage: 8.9,
        LastBalance: 89.23,
        MonthCharge: 75.60,
        GridPhone: '13800138003',
        GridAccount: '测试账户3',
        QueryDate: '2025-09-26 08:45:00',
        IsActive: false
      },
      {
        id: 4,
        LastDailyDate: '2025-09-25',
        LastDailyUsage: 18.7,
        LastBalance: 334.12,
        MonthCharge: 145.80,
        GridPhone: '13800138004',
        GridAccount: '测试账户4',
        QueryDate: '2025-09-25 12:15:00',
        IsActive: false
      },
      {
        id: 5,
        LastDailyDate: '2025-09-24',
        LastDailyUsage: 11.3,
        LastBalance: 198.45,
        MonthCharge: 67.90,
        GridPhone: '13800138005',
        GridAccount: '测试账户5',
        QueryDate: '2025-09-24 09:30:00',
        IsActive: false
      }
    ];
  }

  /**
   * 获取测试考勤数据
   */
  getMockAttendanceData() {
    const today = new Date();
    const mockData = [];
    
    // 生成当前月份所有工作日的测试考勤数据
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // 生成本月每一天的考勤记录
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay(); // 0=周日, 6=周六
      
      // 周末默认为休息，工作日随机工作状态
      let status;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = '休息';
      } else if (day > today.getDate()) {
        // 未来日期不生成记录
        continue;
      } else {
        const workStatuses = ['公司上班', '公司上班', '公司上班', '国内出差', '国外出差', '休息'];
        status = workStatuses[day % workStatuses.length];
      }
      
      mockData.push({
        id: day,
        WorkDate: date.toISOString().split('T')[0],
        WorkStatus: status,
        CheckInTime: status === '休息' ? null : '09:00:00',
        CheckOutTime: status === '休息' ? null : '18:00:00',
        WorkHours: status === '休息' ? 0 : 8,
        Subsidy: status.includes('出差') ? 100 : 0,
        RealName: '测试管理员',
        CreateTime: date.toISOString().replace('T', ' ').split('.')[0]
      });
    }
    
    // 如果需要显示上个月的数据，也生成一些
    const lastMonth = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0);
    
    for (let day = 1; day <= lastMonthEnd.getDate(); day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = date.getDay();
      
      let status;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = '休息';
      } else {
        const workStatuses = ['公司上班', '公司上班', '国内出差', '休息'];
        status = workStatuses[day % workStatuses.length];
      }
      
      mockData.push({
        id: 100 + day,
        WorkDate: date.toISOString().split('T')[0],
        WorkStatus: status,
        CheckInTime: status === '休息' ? null : '09:00:00',
        CheckOutTime: status === '休息' ? null : '18:00:00',
        WorkHours: status === '休息' ? 0 : 8,
        Subsidy: status.includes('出差') ? 100 : 0,
        RealName: '测试管理员',
        CreateTime: date.toISOString().replace('T', ' ').split('.')[0]
      });
    }
    
    // 按日期倒序排列（最新的在前面）
    mockData.sort((a, b) => b.WorkDate.localeCompare(a.WorkDate));
    
    return mockData;
  }

  /**
   * 获取测试国网账号数据
   */
  getMockGridAccounts() {
    return [
      {
        id: 1,
        PhoneName: '13800138001',
        AccountName: '测试用户1',
        Balance: 156.78,
        LastQueryDate: '2025-09-28 10:30:00',
        IsActive: true,
        CreatedBy: '系统管理员',
        CreateTime: '2025-09-20 09:00:00',
        Status: '正常'
      },
      {
        id: 2,
        PhoneName: '13800138002',
        AccountName: '测试用户2',
        Balance: 298.45,
        LastQueryDate: '2025-09-27 15:20:00',
        IsActive: false,
        CreatedBy: '系统管理员',
        CreateTime: '2025-09-22 14:15:00',
        Status: '正常'
      },
      {
        id: 3,
        PhoneName: '13800138003',
        AccountName: '测试用户3',
        Balance: 89.23,
        LastQueryDate: '2025-09-26 08:45:00',
        IsActive: false,
        CreatedBy: '系统管理员',
        CreateTime: '2025-09-15 11:30:00',
        Status: '停用'
      }
    ];
  }

  /**
   * 获取测试网盘账号信息
   */
  getMockNetdiskInfo() {
    return {
      id: 1,
      name: '测试管理员',
      sony_username: 'test_netdisk_user',
      sony_password: 'test_password_123',
      is_auto_create_salary: true
    };
  }

  /**
   * 获取测试WorkKaoQinUsers列表
   */
  getMockWorkKaoQinUsers() {
    return [
      { name: '张三', label: '张三', id: 1 },
      { name: '李四', label: '李四', id: 2 },
      { name: '王五', label: '王五', id: 3 },
      { name: '赵六', label: '赵六', id: 4 },
      { name: '测试管理员', label: '测试管理员', id: 5 }
    ];
  }

  /**
   * 模拟网盘信息提交成功
   */
  simulateNetdiskSubmitSuccess() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('测试模式：模拟网盘账号信息保存成功');
        resolve({
          code: 200,
          msg: '网盘账号信息保存成功(测试模式)',
          data: null
        });
      }, 1000);
    });
  }

  /**
   * 模拟网盘信息删除成功
   */
  simulateNetdiskDeleteSuccess() {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('测试模式：模拟网盘账号信息删除成功');
        resolve({
          code: 200,
          msg: '网盘账号信息删除成功(测试模式)',
          data: null
        });
      }, 800);
    });
  }

  /**
   * 获取测试公告数据
   */
  getMockAnnouncements() {
    return [
      {
        id: 1,
        title: '测试公告1',
        content: '这是测试环境的公告内容1，用于展示公告功能。',
        priority: 1,
        show_popup: true,
        is_active: true,
        create_time: '2025-09-28 10:00:00',
        created_by: '系统管理员'
      },
      {
        id: 2,
        title: '测试公告2',
        content: '这是测试环境的公告内容2，用于演示公告管理功能。',
        priority: 0,
        show_popup: false,
        is_active: true,
        create_time: '2025-09-27 14:30:00',
        created_by: '测试管理员'
      },
      {
        id: 3,
        title: '系统维护通知',
        content: '测试环境系统维护通知，此为演示数据。',
        priority: 2,
        show_popup: true,
        is_active: false,
        create_time: '2025-09-26 09:15:00',
        created_by: '系统管理员'
      }
    ];
  }

  /**
   * 获取测试用户列表数据
   */
  getMockUserList() {
    return {
      users: [
        {
          id: 1,
          nickname: '测试用户1',
          real_name: '张三',
          avatar_url: null,
          is_admin: true,
          is_active: true,
          is_web_bound: true,
          web_username: 'zhangsan',
          last_login: '2025-09-28 10:30:00',
          register_time: '2025-09-20 09:00:00',
          permissions: ['admin', 'electric_query', 'attendance']
        },
        {
          id: 2,
          nickname: '测试用户2',
          real_name: '李四',
          avatar_url: null,
          is_admin: false,
          is_active: true,
          is_web_bound: false,
          web_username: null,
          last_login: '2025-09-27 15:20:00',
          register_time: '2025-09-22 14:15:00',
          permissions: ['electric_query', 'attendance']
        }
      ],
      pagination: {
        page: 1,
        pages: 1,
        per_page: 20,
        total: 2,
        has_next: false,
        has_prev: false
      }
    };
  }

  /**
   * 获取测试系统配置数据
   */
  getMockSystemConfig() {
    return {
      app_name: '微信机器人管理系统',
      functions: [
        { name: '电费查询', code: 'electric_query' },
        { name: '考勤管理', code: 'attendance' },
        { name: '公告管理', code: 'announcement' },
        { name: '用户管理', code: 'user_management' }
      ],
      server_status: 'online',
      server_time: new Date().toISOString().replace('T', ' ').split('.')[0]
    };
  }

  /**
   * 获取测试通知群数据
   */
  getMockNotificationGroups() {
    return [
      {
        ID: 1,
        GroupName: '测试通知群1',
        WxQunID: 'test_group_001',
        Status: '正常',
        IsActive: true,
        AddTime: '2025-09-25 10:00:00',
        CreatedBy: '系统管理员'
      },
      {
        ID: 2,
        GroupName: '开发团队群',
        WxQunID: 'test_group_002',
        Status: '正常',
        IsActive: false,
        AddTime: '2025-09-24 14:30:00',
        CreatedBy: '系统管理员'
      },
      {
        ID: 3,
        GroupName: '产品讨论群',
        WxQunID: 'test_group_003',
        Status: '禁用',
        IsActive: false,
        AddTime: '2025-09-23 09:15:00',
        CreatedBy: '测试管理员'
      },
      {
        ID: 4,
        GroupName: '客服支持群',
        WxQunID: 'test_group_004',
        Status: '正常',
        IsActive: true,
        AddTime: '2025-09-22 16:45:00',
        CreatedBy: '系统管理员'
      }
    ];
  }

  /**
   * 模拟通知群增删改查操作
   */
  simulateNotificationGroupOperation(operation, data = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`测试模式：模拟通知群${operation}操作`, data);
        
        switch (operation) {
          case 'create':
            resolve({
              code: 200,
              msg: '通知群添加成功(测试模式)',
              data: Object.assign({
                ID: Date.now(), // 使用时间戳作为ID
              }, data, {
                AddTime: new Date().toISOString().replace('T', ' ').split('.')[0],
                CreatedBy: '测试管理员'
              })
            });
            break;
            
          case 'update':
            resolve({
              code: 200,
              msg: '通知群更新成功(测试模式)',
              data: Object.assign({}, data, {
                UpdateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
              })
            });
            break;
            
          case 'delete':
            resolve({
              code: 200,
              msg: '通知群删除成功(测试模式)',
              data: null
            });
            break;
            
          case 'toggle_active':
            resolve({
              code: 200,
              msg: `通知群${data.IsActive ? '启用' : '禁用'}成功(测试模式)`,
              data: Object.assign({}, data, {
                UpdateTime: new Date().toISOString().replace('T', ' ').split('.')[0]
              })
            });
            break;
            
          case 'list':
          default:
            resolve({
              code: 200,
              msg: '获取成功(测试模式)',
              data: this.getMockNotificationGroups()
            });
        }
      }, 800 + Math.random() * 400); // 模拟网络延迟 800-1200ms
    });
  }

  /**
   * 获取Mock使用记录数据
   */
  getMockUsageRecords() {
    return [
      {
        id: 1,
        user_id: 1,
        user_name: '张三',
        nickname: '张三',
        feature_key: 'login',
        feature_name: '用户登录',
        feature_icon: '📝',
        usage_count: 1,
        last_used_time: '2025-10-02 09:30:25',
        first_used_time: '2025-10-02 09:30:25',
        created_at: '2025-10-02 09:30:25',
        operation_detail: '用户从微信小程序登录',
        ip_address: '192.168.1.100'
      },
      {
        id: 2,
        user_id: 2,
        user_name: '李四',
        nickname: '李四',
        feature_key: 'query_electric',
        feature_name: '查询电费',
        feature_icon: '📝',
        usage_count: 1,
        last_used_time: '2025-10-02 09:20:10',
        first_used_time: '2025-10-02 09:20:10',
        created_at: '2025-10-02 09:20:10',
        operation_detail: '查询账户电费信息',
        ip_address: '192.168.1.101'
      },
      {
        id: 3,
        user_id: 3,
        user_name: '王五',
        nickname: '王五',
        feature_key: 'admin_update_task',
        feature_name: '更新定时任务',
        feature_icon: '📝',
        usage_count: 1,
        last_used_time: '2025-10-02 08:45:33',
        first_used_time: '2025-10-02 08:45:33',
        created_at: '2025-10-02 08:45:33',
        operation_detail: '更新任务配置 - 任务ID: weather_alert',
        ip_address: '192.168.1.102'
      },
      {
        id: 4,
        user_id: 4,
        user_name: '赵六',
        nickname: '赵六',
        feature_key: 'view_attendance',
        feature_name: '查看考勤',
        feature_icon: '📝',
        usage_count: 1,
        last_used_time: '2025-10-01 16:55:12',
        first_used_time: '2025-10-01 16:55:12',
        created_at: '2025-10-01 16:55:12',
        operation_detail: '查看2025年10月考勤记录',
        ip_address: '192.168.1.103'
      },
      {
        id: 5,
        user_id: 5,
        user_name: '孙七',
        nickname: '孙七',
        feature_key: 'admin_create_user',
        feature_name: '创建用户',
        feature_icon: '📝',
        usage_count: 1,
        last_used_time: '2025-10-01 10:20:45',
        first_used_time: '2025-10-01 10:20:45',
        created_at: '2025-10-01 10:20:45',
        operation_detail: '管理员创建用户 - 昵称: 测试用户',
        ip_address: '192.168.1.104'
      }
    ];
  }

  /**
   * 获取Mock使用统计数据
   */
  getMockUsageStats() {
    return {
      total_records: 128,
      active_users: 8,
      most_used_feature: 'login',
      total_usage_count: 128,
      active_days: 45
    };
  }

  /**
   * 获取Mock定时任务数据
   */
  getMockScheduledTasks() {
    return [
      {
        id: 1,
        task_id: '大蒜价格推送',
        task_name: '大蒜价格推送',
        task_description: '每天推送大蒜价格信息',
        func_name: 'push_garlic_price',
        is_enabled: true,
        trigger_type: 'cron',
        cron_hour: '8',
        cron_minute: '30',
        cron_second: '0',
        cron_year: '*',
        cron_month: '*',
        cron_day: '*',
        cron_week: '*',
        cron_day_of_week: '*',
        start_date: null,
        end_date: null,
        timezone: 'Asia/Shanghai',
        jitter: 0,
        interval_weeks: 0,
        interval_days: 0,
        interval_hours: 0,
        interval_minutes: 0,
        interval_seconds: 0,
        run_date: null,
        misfire_grace_time: 60,
        max_instances: 1,
        coalesce: false,
        replace_existing: true,
        created_by: '测试管理员',
        created_time: '2025-09-25 10:00:00',
        updated_by: '测试管理员',
        updated_time: '2025-09-30 15:30:00'
      },
      {
        id: 2,
        task_id: '自动查询电费余额',
        task_name: '自动查询电费余额',
        task_description: '每天自动查询电费余额并推送通知',
        func_name: 'check_electric_balance',
        is_enabled: true,
        trigger_type: 'cron',
        cron_hour: '7',
        cron_minute: '0',
        cron_second: '0',
        cron_year: '*',
        cron_month: '*',
        cron_day: '*',
        cron_week: '*',
        cron_day_of_week: '*',
        start_date: null,
        end_date: null,
        timezone: 'Asia/Shanghai',
        jitter: 0,
        interval_weeks: 0,
        interval_days: 0,
        interval_hours: 0,
        interval_minutes: 0,
        interval_seconds: 0,
        run_date: null,
        misfire_grace_time: 60,
        max_instances: 1,
        coalesce: false,
        replace_existing: true,
        created_by: '系统',
        created_time: '2025-09-20 09:00:00',
        updated_by: '测试管理员',
        updated_time: '2025-09-28 14:20:00'
      },
      {
        id: 3,
        task_id: '天气预报',
        task_name: '天气预报',
        task_description: '每天推送天气预报信息',
        func_name: 'push_weather_forecast',
        is_enabled: false,
        trigger_type: 'cron',
        cron_hour: '6',
        cron_minute: '30',
        cron_second: '0',
        cron_year: '*',
        cron_month: '*',
        cron_day: '*',
        cron_week: '*',
        cron_day_of_week: '*',
        start_date: null,
        end_date: null,
        timezone: 'Asia/Shanghai',
        jitter: 0,
        interval_weeks: 0,
        interval_days: 0,
        interval_hours: 0,
        interval_minutes: 0,
        interval_seconds: 0,
        run_date: null,
        misfire_grace_time: 60,
        max_instances: 1,
        coalesce: false,
        replace_existing: true,
        created_by: '系统',
        created_time: '2025-09-18 08:00:00',
        updated_by: '测试管理员',
        updated_time: '2025-09-29 11:15:00'
      },
      {
        id: 4,
        task_id: '天气预警监控',
        task_name: '天气预警监控',
        task_description: '定期检查天气预警信息',
        func_name: 'check_weather_warning',
        is_enabled: true,
        trigger_type: 'interval',
        cron_hour: '*',
        cron_minute: '0',
        cron_second: '0',
        cron_year: '*',
        cron_month: '*',
        cron_day: '*',
        cron_week: '*',
        cron_day_of_week: '*',
        start_date: null,
        end_date: null,
        timezone: 'Asia/Shanghai',
        jitter: 0,
        interval_weeks: 0,
        interval_days: 0,
        interval_hours: 1,
        interval_minutes: 0,
        interval_seconds: 0,
        run_date: null,
        misfire_grace_time: 300,
        max_instances: 1,
        coalesce: true,
        replace_existing: true,
        created_by: '系统',
        created_time: '2025-09-15 07:30:00',
        updated_by: '系统',
        updated_time: '2025-09-27 10:45:00'
      }
    ];
  }

  /**
   * 模拟定时任务操作
   */
  simulateScheduledTaskOperation(operation, taskId = null, data = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`测试模式：模拟定时任务${operation}操作`, { taskId, data });
        
        switch (operation) {
          case 'list':
            resolve({
              code: 200,
              msg: `获取到${this.getMockScheduledTasks().length}个任务`,
              data: this.getMockScheduledTasks()
            });
            break;
            
          case 'detail':
            const task = this.getMockScheduledTasks().find(t => t.task_id === taskId);
            if (task) {
              resolve({
                code: 200,
                msg: '获取成功',
                data: task
              });
            } else {
              resolve({
                code: 404,
                msg: '任务不存在',
                data: null
              });
            }
            break;
            
          case 'update':
            resolve({
              code: 200,
              msg: '任务配置已更新并立即生效(测试模式)',
              data: Object.assign({}, data, {
                updated_time: new Date().toISOString().replace('T', ' ').split('.')[0]
              })
            });
            break;
            
          case 'pause':
            resolve({
              code: 200,
              msg: '任务已暂停(测试模式)',
              data: null
            });
            break;
            
          case 'resume':
            resolve({
              code: 200,
              msg: '任务已恢复(测试模式)',
              data: null
            });
            break;
            
          case 'run':
            resolve({
              code: 200,
              msg: '任务已加入执行队列(测试模式)',
              data: null
            });
            break;
            
          case 'delete':
            resolve({
              code: 200,
              msg: '任务已删除(测试模式)',
              data: null
            });
            break;
            
          default:
            resolve({
              code: 400,
              msg: '未知操作',
              data: null
            });
        }
      }, 600 + Math.random() * 400); // 模拟网络延迟 600-1000ms
    });
  }

  /**
   * 页面热加载通用方法
   * @param {Object} pageInstance - 页面实例
   * @param {Function} loadDataFunction - 数据加载函数
   */
  setupPageHotReload(pageInstance, loadDataFunction) {
    const listener = (isTestMode) => {
      console.log(`页面热加载: ${pageInstance.route || '未知页面'}, 测试模式: ${isTestMode}`);
      if (typeof loadDataFunction === 'function') {
        loadDataFunction.call(pageInstance);
      }
    };

    // 添加监听器
    this.addListener(listener);

    // 在页面卸载时移除监听器
    const originalOnUnload = pageInstance.onUnload;
    pageInstance.onUnload = function() {
      testModeManager.removeListener(listener);
      if (originalOnUnload) {
        originalOnUnload.call(this);
      }
    };
  }
}

// 创建全局单例
const testModeManager = new TestModeManager();

// 导出
module.exports = {
  testModeManager,
  TestModeManager
};
