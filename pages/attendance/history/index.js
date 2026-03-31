const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const mockData = require('../../../utils/mock-data');

Page({
  data: {
    attendanceData: [],        // 考勤数据列表
    loading: false,            // 加载状态
    
    // 筛选条件
    filterName: '',            // 筛选姓名（保留兼容性）
    currentYear: new Date().getFullYear(),   // 当前年份
    currentMonth: new Date().getMonth() + 1, // 当前月份
    yearOptions: [],           // 年份选项
    monthOptions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    yearIndex: 0,              // 年份选择索引
    monthIndex: new Date().getMonth(), // 月份选择索引
    
    // 员工多选相关
    selectedEmployees: [],     // 已选择的员工列表
    employeeList: [],          // 所有员工列表
    employeeLoading: false,    // 员工列表加载状态
    showEmployeePopup: false,  // 显示员工选择弹窗
    
    // 用户权限
    isAdmin: false,            // 是否是管理员
    realName: '',              // 当前用户真实姓名
    
    // 统计数据
    statisticsData: {
      attendanceDays: 0,       // 出勤天数 (公司上班+国内出差+国外出差)
      companyDays: 0,          // 公司上班天数
      domesticTripDays: 0,     // 国内出差天数
      foreignTripDays: 0,      // 国外出差天数
      restDays: 0,             // 休息天数
      compensatoryDays: 0,     // 调休天数
      workDays: 0,             // 工作日天数
      totalDays: 0,            // 总记录天数
      attendanceRate: 0,       // 出勤率
      totalSubsidy: 0          // 总补贴
    },
    
    // 弹窗相关
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
    },
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
    // ⭐ 游客模式相关
    isGuest: false, // 是否为游客模式
    showGuestBanner: false // 是否显示游客模式横幅
  },

  onLoad(options) {
    // ⭐ 检查游客模式
    const isGuest = mockData.isGuestMode();
    this.setData({ 
      isGuest: isGuest,
      showGuestBanner: isGuest 
    });
    
    this.initYearOptions();
    this.loadUserInfo();
    this.loadAttendanceData();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('考勤历史页面-测试模式热加载');
      this.loadUserInfo();
      this.loadEmployeeList();
      this.loadAttendanceData();
    });
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadAttendanceData();
  },

  onPullDownRefresh() {
    this.loadAttendanceData();
  },

  // 初始化年份选项
  initYearOptions() {
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      yearOptions.push(i.toString());
    }
    
    const yearIndex = yearOptions.findIndex(year => parseInt(year) === currentYear);
    
    this.setData({
      yearOptions,
      yearIndex: yearIndex >= 0 ? yearIndex : 2
    });
  },

  // 加载用户信息
  loadUserInfo() {
    try {
      // ⭐ 优先检查是否为游客模式
      if (mockData.isGuestMode()) {
        console.log('🎭 考勤历史-游客模式：使用mock用户信息');
        const mockUserInfo = mockData.getUserInfo();
        this.setData({
          isAdmin: false,  // 游客不是管理员
          realName: mockUserInfo.real_name || '张三'
        });
        return;  // 游客模式不调用 API
      }
      
      // 检查是否为测试模式
      if (testModeManager.isTestMode()) {
        // 测试模式：模拟管理员权限
        console.log('考勤历史-测试模式：模拟管理员权限');
        
        // 初始化测试用户信息
        const testUserInfo = {
          id: 'test_user_001',
          openid: 'test_openid_001',
          nickname: '微信用户d_001', // 与testMode.js保持一致
          avatar_url: '/images/default-avatar.png',
          real_name: '', // 测试未完善真实姓名的场景
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
        
        // 保存到本地存储
        wx.setStorageSync('userInfo', testUserInfo);
        
        this.setData({
          isAdmin: true,
          realName: '' // 测试未完善真实姓名的场景
        });
        
        console.log('考勤历史-测试模式：用户信息已初始化', testUserInfo);
        this.loadEmployeeList();
        return; // 确保测试模式下不执行后续的API调用
      }
      
      // 先尝试从本地存储获取用户信息
      const localUserInfo = wx.getStorageSync('userInfo');
      if (localUserInfo && localUserInfo.is_admin !== undefined) {
        console.log('从本地存储获取用户信息:', localUserInfo);
        this.setData({
          isAdmin: localUserInfo.is_admin || false,
          realName: localUserInfo.real_name || ''
        });
        
        if (localUserInfo.is_admin) {
          console.log('本地存储显示管理员权限，加载员工列表');
          this.loadEmployeeList();
        }
      }

      // 正常模式：调用API获取用户信息
      apiCall(
        () => API.user.getInfo(),
        '',
        (result) => {
          console.log('考勤历史-用户信息API返回结果:', result);
          if (result && result.data) {
            console.log('考勤历史-用户权限信息:', {
              is_admin: result.data.is_admin,
              real_name: result.data.real_name,
              user_level: result.data.user_level,
              web_user_level: result.data.web_user_level,
              is_web_bound: result.data.is_web_bound,
              web_username: result.data.web_username
            });
            
            // 详细的权限判断日志
            console.log('考勤历史-权限判断详情:', {
              微信用户级别: result.data.user_level,
              Web用户级别: result.data.web_user_level,
              是否绑定Web: result.data.is_web_bound,
              Web用户名: result.data.web_username,
              最终管理员权限: result.data.is_admin
            });
            
            // 更新本地存储
            wx.setStorageSync('userInfo', result.data);
            
            this.setData({
              isAdmin: result.data.is_admin || false,
              realName: result.data.real_name || ''
            });
            
            // 如果是管理员，加载员工列表
            if (result.data.is_admin) {
              console.log('考勤历史-检测到管理员权限，开始加载员工列表');
              this.loadEmployeeList();
            } else {
              console.log('考勤历史-普通用户权限，不加载员工列表');
            }
          }
        },
        (error) => {
          // 移除console.error以避免触发全局错误恢复机制
          // 如果API失败但本地有管理员信息，继续使用本地信息
          if (!localUserInfo || !localUserInfo.is_admin) {
            this.setData({
              isAdmin: false,
              realName: ''
            });
          }
        }
      );
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.setData({
        isAdmin: false,
        realName: ''
      });
    }
  },

  // 加载员工列表（管理员功能 - 从WorkKaoQinUsers表获取）
  loadEmployeeList() {
    if (!this.data.isAdmin) {
      console.log('非管理员用户，跳过员工列表加载');
      return;
    }

    console.log('开始加载员工列表...');
    this.setData({ employeeLoading: true });

    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('测试模式：使用模拟员工数据');
      const mockEmployees = [
        { name: '张三', label: '张三', id: 1, selected: false },
        { name: '李四', label: '李四', id: 2, selected: false },
        { name: '王五', label: '王五', id: 3, selected: false },
        { name: '赵六', label: '赵六', id: 4, selected: false },
        { name: '测试管理员', label: '测试管理员', id: 5, selected: false }
      ];
      
      setTimeout(() => {
        this.setData({
          employeeList: mockEmployees,
          employeeLoading: false
        });
        console.log('测试模式：员工列表加载完成', mockEmployees);
      }, 300);
      return;
    }

    apiCall(
      () => API.attendance.getKaoqinUsers(),
      null,
      (result) => {
        console.log('WorkKaoQinUsers员工列表API返回结果:', result);
        if (result && Array.isArray(result)) {
          // 初始化每个员工的选中状态
          const employeeList = result.map(emp => (Object.assign({}, emp, {
            selected: this.data.selectedEmployees.indexOf(emp.name) >= 0
          })));
          
          this.setData({
            employeeList: employeeList,
            employeeLoading: false
          });
          console.log('员工列表加载成功，数量:', result.length);
        } else if (result && result.data && Array.isArray(result.data)) {
          // 初始化每个员工的选中状态
          const employeeList = result.data.map(emp => (Object.assign({}, emp, {
            selected: this.data.selectedEmployees.indexOf(emp.name) >= 0
          })));
          
          this.setData({
            employeeList: employeeList,
            employeeLoading: false
          });
          console.log('员工列表加载成功，数量:', result.data.length);
        } else {
          this.setData({
            employeeList: [],
            employeeLoading: false
          });
          console.log('员工列表为空或格式错误');
        }
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        this.setData({
          employeeList: [],
          employeeLoading: false
        });
        
        if (error.message && !error.message.includes('403')) {
          showError(`获取员工列表失败: ${error.message}`);
        }
      }
    );
  },

  // 加载考勤数据
  loadAttendanceData() {
    try {
      this.setData({ loading: true });

      // ⭐ 优先检查是否为游客模式
      if (mockData.isGuestMode()) {
        console.log('🎭 考勤历史-游客模式：使用mock数据');
        mockData.getAttendanceData().then((result) => {
          const mockRecords = result.data.records || [];
          // 转换为考勤历史页面需要的格式
          const formattedRecords = mockRecords.map((item, index) => ({
            id: item.id ||`mock_${index}`,
            employee_name: '张三',
            work_date: item.date,
            work_status: item.statusText,
            submit_time: item.submitTime,
            location: '示例地点',
            business_trip_subsidy: 0,
            remark: item.remark
          }));
          
          // 计算统计数据
          const stats = this.calculateStatistics(formattedRecords);
          
          this.setData({
            attendanceData: formattedRecords,
            statisticsData: stats,
            loading: false
          });
          
          if (wx.stopPullDownRefresh) {
            wx.stopPullDownRefresh();
          }
        });
        return;
      }

      // 检查是否为测试模式
      if (testModeManager.isTestMode()) {
        // 测试模式：使用mock数据
        console.log('考勤历史-测试模式：使用mock数据');
        setTimeout(() => {
          const baseMockData = testModeManager.getMockAttendanceData();
          
          // 扩展mock数据：为多个员工生成数据
          const employees = ['张三', '李四', '王五', '赵六', '测试管理员'];
          const expandedMockData = [];
          
          employees.forEach((employee, employeeIndex) => {
            baseMockData.forEach((item, itemIndex) => {
              const workStatuses = ['公司上班', '国内出差', '国外出差', '休息'];
              const randomStatus = workStatuses[Math.floor(Math.random() * workStatuses.length)];
              
              expandedMockData.push(Object.assign({}, item, {
                id: employeeIndex * baseMockData.length + itemIndex + 1,
                RealName: employee,
                WorkStatus: randomStatus,
                CheckInTime: randomStatus === '休息' ? null : '09:00:00',
                CheckOutTime: randomStatus === '休息' ? null : '18:00:00',
                WorkHours: randomStatus === '休息' ? 0 : 8,
                Subsidy: randomStatus.includes('出差') ? 100 : 0,
                // 确保有CreateTime字段
                CreateTime: item.CreateTime || item.WorkDate + ' ' + (randomStatus === '休息' ? '00:00:00' : '18:00:00')
              }));
            });
          });
          
          console.log('测试模式考勤数据扩展完成:', expandedMockData.length, '条记录', employees.length, '个员工');
          
          // 转换mock数据字段格式以匹配页面期望
          const convertedData = expandedMockData.map(item => (Object.assign({}, item, {
            // 字段映射：将mock数据的字段名转换为页面期望的字段名
            work_date: item.WorkDate,
            work_status: item.WorkStatus, 
            check_in_time: item.CheckInTime,
            check_out_time: item.CheckOutTime,
            work_hours: item.WorkHours,
            business_trip_subsidy: item.Subsidy,
            real_name: item.RealName,
            create_time: item.CreateTime,
            
            // 模板专用字段映射
            name: item.RealName,           // 模板中使用 {{item.name}}
            submit_time: item.CreateTime,  // 模板中使用 {{item.submit_time}}
            
            // 状态相关字段
            status_type: item.WorkStatus === '公司上班' ? 'work' : 
                        item.WorkStatus === '休息' ? 'rest' : 'trip',
            weekday: this.getWeekday(item.WorkDate)
          })));
          
          console.log('测试模式考勤数据字段转换完成:', convertedData.length, '条记录');
          
          // 根据当前筛选条件过滤数据
          let filteredData = convertedData;
          if (this.data.selectedEmployees.length > 0) {
            filteredData = filteredData.filter(item => 
              this.data.selectedEmployees.includes(item.RealName || item.real_name)
            );
          }
          
          // 计算统计数据
          const stats = this.calculateStatistics(filteredData);
          
          console.log('测试模式考勤数据处理完成:', {
            原始数据条数: expandedMockData.length,
            转换后数据条数: convertedData.length,
            筛选后数据条数: filteredData.length,
            统计数据: stats,
            样本记录: filteredData[0],
            '样本记录的关键字段': {
              name: filteredData[0] ? filteredData[0].name : undefined,
              submit_time: filteredData[0] ? filteredData[0].submit_time : undefined,
              work_date: filteredData[0] ? filteredData[0].work_date : undefined,
              work_status: filteredData[0] ? filteredData[0].work_status : undefined,
              weekday: filteredData[0] ? filteredData[0].weekday : undefined,
              status_type: filteredData[0] ? filteredData[0].status_type : undefined,
              business_trip_subsidy: filteredData[0] ? filteredData[0].business_trip_subsidy : undefined
            }
          });
          
          this.setData({
            attendanceData: filteredData,
            statisticsData: stats,
            loading: false
          });
          
          console.log('测试模式数据已设置到页面状态');
          
          if (wx.stopPullDownRefresh) {
            wx.stopPullDownRefresh();
          }
        }, 800);
        return;
      }

      const params = {
        year: this.data.currentYear,
        month: this.data.currentMonth
      };
      
      // 只有管理员才能搜索其他人的考勤记录
      if (this.data.isAdmin && this.data.selectedEmployees.length > 0) {
        if (this.data.selectedEmployees.length === 1) {
          // 单个员工查询（兼容旧接口）
          params.name = this.data.selectedEmployees[0];
        } else {
          // 多个员工查询
          params.names = this.data.selectedEmployees.join(',');
        }
      } else if (this.data.isAdmin && this.data.filterName) {
        // 兼容旧版本的单个姓名查询
        params.name = this.data.filterName;
      }

      // 使用apiCall方法处理API调用
      apiCall(
        () => API.attendance.getHistory(params),
        '加载中...',
        (result) => this.handleAttendanceSuccess(result),
        (error) => this.handleAttendanceError(error)
      );

    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.handleAttendanceError(error);
    }
  },

  // 处理Mock考勤数据
  handleMockAttendanceData() {
    setTimeout(() => {
      const mockData = [
        {
          id: 'attendance_1',
          employee_name: '测试管理员',
          work_date: '2025-09-23',
          work_status: '公司上班',
          submit_time: '2025-09-23 09:00:00',
          location: '测试公司',
          business_trip_subsidy: 0
        },
        {
          id: 'attendance_2',
          employee_name: '测试管理员',
          work_date: '2025-09-22',
          work_status: '国内出差',
          submit_time: '2025-09-22 10:30:00',
          location: '北京',
          business_trip_subsidy: 200
        },
        {
          id: 'attendance_3',
          employee_name: '测试管理员',
          work_date: '2025-09-21',
          work_status: '休息',
          submit_time: '2025-09-21 12:00:00',
          location: '家中',
          business_trip_subsidy: 0
        }
      ];

      // Mock数据按日期倒序排序后再处理
      const sortedMockData = mockData.sort((a, b) => {
        const dateA = new Date(a.work_date);
        const dateB = new Date(b.work_date);
        return dateB.getTime() - dateA.getTime();
      });
      console.log('Mock考勤数据按日期倒序排序完成');
      
      this.handleAttendanceSuccess(sortedMockData);
    }, 500);
  },

  // 处理考勤数据成功返回
  handleAttendanceSuccess(result) {
    try {
      let attendanceList = [];
      let updateData = { loading: false };
      
      // 处理后端返回的数据结构
      if (result && result.data && Array.isArray(result.data)) {
        attendanceList = result.data;
        
        // 更新权限信息（如果后端返回）
        if (typeof result.is_admin !== 'undefined') {
          console.log('从考勤API更新管理员权限:', result.is_admin);
          updateData.isAdmin = result.is_admin;
        }
        
        if (result.real_name) {
          updateData.realName = result.real_name;
        }
      } else if (result && Array.isArray(result)) {
        attendanceList = result;
      }
      
      if (attendanceList.length > 0) {
        // 处理数据格式
        const processedData = attendanceList.map(item => {
          console.log('处理考勤记录:', {
            id: item.id,
            put_date_原始: item.put_date,
            submit_time_原始: item.submit_time,
            create_time_原始: item.create_time,
            put_date_类型: typeof item.put_date,
            work_date_原始: item.work_date,
            name_原始: item.name
          });
          
          // 字段映射：后端字段 -> 前端字段
          const submitTime = item.put_date || item.submit_time || item.create_time;
          
          return Object.assign({}, item, {
            id: item.id || Math.random().toString(36).substr(2, 9),
            work_date: this.formatDate(item.work_date),
            weekday: this.getWeekday(item.work_date),
            submit_time: this.formatDateTime(submitTime),
            status_type: this.getStatusType(item.work_status),
            business_trip_subsidy: item.business_trip_subsidy || 0,
            // 统一字段命名
            employee_name: item.name || item.employee_name || item.real_name,
            real_name: item.name || item.real_name || item.employee_name
          });
        });

        // 按考勤日期倒序排序（最新的日期在前）
        processedData.sort((a, b) => {
          const dateA = new Date(a.work_date.replace(/\//g, '-'));
          const dateB = new Date(b.work_date.replace(/\//g, '-'));
          return dateB.getTime() - dateA.getTime();
        });

        console.log('考勤数据按日期倒序排序完成，总条数:', processedData.length);
        if (processedData.length > 0) {
          console.log('第一条记录日期:', processedData[0].work_date);
          console.log('最后一条记录日期:', processedData[processedData.length - 1].work_date);
        }

        // 计算统计数据
        const statistics = this.calculateStatistics(processedData);

        updateData.attendanceData = processedData;
        updateData.statisticsData = statistics;
      } else {
        updateData.attendanceData = [];
        updateData.statisticsData = {
          attendanceDays: 0,
          companyDays: 0,
          domesticTripDays: 0,
          foreignTripDays: 0,
          restDays: 0,
          totalDays: 0,
          workDays: 0,
          attendanceRate: 0,
          totalSubsidy: 0
        };
      }
      
      this.setData(updateData);
      
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.handleAttendanceError(error);
    }
  },

  // 处理考勤数据错误
  handleAttendanceError(error) {
    // 移除console.error以避免触发全局错误恢复机制
    console.log('考勤历史查询错误:', error);
    
    // 特殊处理：用户姓名未完善的情况，优先处理避免错误冒泡
    if (error.need_complete_name || (error.message && error.message.includes('请先完善真实姓名'))) {
      console.log('用户需要完善真实姓名才能查看考勤历史');
      wx.showModal({
        title: '信息不完整',
        content: '您还未完善真实姓名，无法查看考勤记录。\n\n请先前往个人信息页面完善您的真实姓名。',
        showCancel: true,
        cancelText: '稍后完善',
        confirmText: '立即完善',
        success: (res) => {
          if (res.confirm) {
            // 跳转到用户中心页面（使用switchTab因为是Tab页面）
            wx.switchTab({
              url: '/pages/usercenter/index'
            });
          } else {
            // 返回上一页
            wx.navigateBack({
              delta: 1
            });
          }
        }
      });
      
      this.setData({ 
        loading: false,
        attendanceData: []
      });
      return; // 显式返回，确保错误被正确处理
    }
    
    // 处理其他错误
    console.warn('考勤历史查询其他错误:', error.message || error);
    // 使用已导入的showError函数
    showError(`加载失败: ${error.message || '网络错误'}`);

    this.setData({ 
      loading: false,
      attendanceData: []
    });
  },

  // 姓名输入
  onNameChange(e) {
    this.setData({
      filterName: e.detail.value
    });
  },

  // 年份选择
  onYearChange(e) {
    const index = e.detail.value;
    const year = parseInt(this.data.yearOptions[index]);
    
    this.setData({
      yearIndex: index,
      currentYear: year
    });
    this.loadAttendanceData();
  },

  // 月份选择
  onMonthChange(e) {
    const index = e.detail.value;
    const month = parseInt(this.data.monthOptions[index]);
    
    this.setData({
      monthIndex: index,
      currentMonth: month
    });
    this.loadAttendanceData();
  },

  // 执行筛选
  onFilter() {
    this.loadAttendanceData();
  },

  // 重置筛选
  onReset() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const yearIndex = this.data.yearOptions.findIndex(year => parseInt(year) === currentYear);
    
    this.setData({
      filterName: '',
      selectedEmployees: [],  // 清空员工选择
      currentYear,
      currentMonth,
      yearIndex: yearIndex >= 0 ? yearIndex : 2,
      monthIndex: currentDate.getMonth()
    });
    
    this.loadAttendanceData();
  },

  // 编辑考勤项
  onEditItem(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;
    const typeMap = {
      '公司上班': 'office', '国内出差': 'domestic',
      '国外出差': 'international', '休息': 'rest', '调休': 'compensatory', '加班': 'office'
    };
    this.setData({
      showEditModal: true,
      editForm: {
        id: item.id,
        name: item.name || item.real_name || item.employee_name || '',
        type: typeMap[item.work_status] || 'office',
        date: item.work_date || '',
        time: item.submit_time ? (item.submit_time.split(' ')[1] || '').substring(0, 5) : '',
        location: item.location || item.business_trip_location || '',
        baseName: item.comment || item.base_name || '',
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
      office: '公司上班', domestic: '国内出差',
      international: '国外出差', rest: '休息', compensatory: '调休'
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
        this.loadAttendanceData();

        // 通知主考勤页面刷新日历和漏打卡状态
        const pages = getCurrentPages();
        const attendancePage = pages.find(p => p.route === 'pages/attendance/index');
        if (attendancePage) {
          attendancePage._needRefreshCalendar = true;
        }
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

  // 删除考勤项 - 打开自定义删除弹窗
  onDeleteItem(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showDeleteModal: true,
      deleteRecordId: item.id
    });
  },

  onCloseDeleteModal() {
    this.setData({ showDeleteModal: false, deleteRecordId: null });
  },

  // 确认删除 - 带进度弹窗
  async onConfirmDelete() {
    const recordId = this.data.deleteRecordId;
    if (!recordId) return;

    this.setData({
      showDeleteModal: false,
      isDeleting: true,
      deleteProgress: 10,
      deleteCurrentStep: '正在删除数据库记录...'
    });

    try {
      const res = await API.attendance.delete(recordId);
      // res = { code, msg, data: responseData }
      // responseData = { steps: { db_deleted, db_msg, excel_cleared, excel_msg, nas_uploaded, nas_msg } }
      const steps = (res.data && res.data.steps) ? res.data.steps : {
        db_deleted: true, db_msg: '数据库记录已删除',
        excel_cleared: true, excel_msg: 'Excel考勤表已清除',
        nas_uploaded: true, nas_msg: '已同步到公盘'
      };
      const msg = res.msg || '操作完成';

      // 动画式推进进度
      this.setData({ deleteProgress: 40, deleteCurrentStep: '正在清除Excel考勤表...' });
      await new Promise(r => setTimeout(r, 400));
      this.setData({ deleteProgress: 70, deleteCurrentStep: '正在同步到公司公盘...' });
      await new Promise(r => setTimeout(r, 400));

      const allSuccess = steps.db_deleted && steps.excel_cleared && steps.nas_uploaded;
      this.setData({
        isDeleting: false,
        deleteProgress: 100,
        deleteRecordId: null,
        showDeleteResult: true,
        deleteResultSuccess: allSuccess,
        deleteResultMsg: msg,
        deleteSteps: steps
      });
      this.loadAttendanceData();

      // 通知主考勤页面刷新日历和漏打卡状态
      const pages = getCurrentPages();
      const attendancePage = pages.find(p => p.route === 'pages/attendance/index');
      if (attendancePage) {
        attendancePage._needRefreshCalendar = true;
      }
    } catch (error) {
      this.setData({
        isDeleting: false,
        deleteRecordId: null,
        showDeleteResult: true,
        deleteResultSuccess: false,
        deleteResultMsg: (error && error.message) ? error.message : '删除失败',
        deleteSteps: {
          db_deleted: false, db_msg: '删除失败',
          excel_cleared: false, excel_msg: '',
          nas_uploaded: false, nas_msg: ''
        }
      });
    }
  },

  // 关闭删除结果弹窗
  onCloseDeleteResult() {
    this.setData({ showDeleteResult: false });
  },

  // 跳转到提交页面
  goToSubmit() {
    // 跳转回考勤主页并打开打卡弹窗
    wx.navigateBack();
  },

  // 计算统计数据
  calculateStatistics(data) {
    const statistics = {
      attendanceDays: 0,       // 出勤天数 (公司上班+国内出差+国外出差)
      companyDays: 0,          // 公司上班天数
      domesticTripDays: 0,     // 国内出差天数
      foreignTripDays: 0,      // 国外出差天数
      restDays: 0,             // 休息天数
      compensatoryDays: 0,     // 调休天数
      totalDays: data.length,  // 总记录天数
      workDays: 0,
      attendanceRate: 0,
      totalSubsidy: 0
    };

    data.forEach(item => {
      // 统计不同状态的天数
      if (item.work_status === '公司上班') {
        statistics.companyDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '国内出差') {
        statistics.domesticTripDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '国外出差') {
        statistics.foreignTripDays++;
        statistics.attendanceDays++;
      } else if (item.work_status === '休息') {
        statistics.restDays++;
      } else if (item.work_status === '调休') {
        statistics.compensatoryDays++;
      }
      
      // 统计总补贴
      if (item.business_trip_subsidy) {
        statistics.totalSubsidy += parseFloat(item.business_trip_subsidy);
      }
    });

    // 计算工作日天数（这里简化处理，实际应该排除周末和节假日）
    statistics.workDays = this.getWorkDaysInMonth(this.data.currentYear, this.data.currentMonth);
    
    // 计算出勤率（出勤天数已经包含了所有工作相关天数）
    if (statistics.workDays > 0) {
      statistics.attendanceRate = Math.round((statistics.attendanceDays / statistics.workDays) * 100);
    }

    return statistics;
  },

  // 获取空统计数据
  getEmptyStatistics() {
    return {
      totalDays: 0,
      normalDays: 0,
      tripDays: 0,
      leaveDays: 0,
      workDays: 0,
      attendanceDays: 0,
      attendanceRate: 0,
      totalSubsidy: 0
    };
  },

  // 获取月份工作日天数
  getWorkDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      
      // 排除周末（周六=6，周日=0）
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }
    
    return workDays;
  },

  // 格式化日期 - iOS兼容版本
  formatDate(dateStr) {
    if (!dateStr) return '未知';
    
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      const date = new Date(processedDateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('formatDate: 无法解析日期字符串:', dateStr);
        return dateStr;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('formatDate: 日期格式化错误:', error, '原始字符串:', dateStr);
      return dateStr;
    }
  },

  // 格式化日期时间 - iOS兼容版本 - 增强调试
  formatDateTime(dateStr) {
    if (!dateStr) return '未知';
    
    // console.log('formatDateTime: 开始处理时间:', {
    //   原始输入: dateStr,
    //   输入类型: typeof dateStr,
    //   输入长度: typeof dateStr === 'string' ? dateStr.length : 'N/A'
    // });
    
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      // console.log('formatDateTime: processDateForIOS处理后:', {
      //   处理后结果: processedDateStr,
      //   结果类型: typeof processedDateStr
      // });
      
      const date = new Date(processedDateStr);
      
      // console.log('formatDateTime: Date对象创建:', {
      //   Date对象: date,
      //   是否有效: !isNaN(date.getTime()),
      //   时间戳: date.getTime()
      // });
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('formatDateTime: 无法解析日期字符串:', dateStr, '处理后:', processedDateStr);
        return `解析失败: ${dateStr}`;
      }
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      const formatted = `${year}-${month}-${day} ${hour}:${minute}`;
      // console.log('formatDateTime: 格式化完成:', dateStr, '->', formatted);
      
      return formatted;
    } catch (error) {
      console.error('formatDateTime: 日期时间格式化错误:', error, '原始字符串:', dateStr);
      return `错误: ${dateStr}`;
    }
  },

  // iOS日期格式处理工具函数 - 增强版
  processDateForIOS(dateStr) {
    if (!dateStr) return dateStr;
    
    // 如果是数字或数字字符串，当作时间戳处理
    if (typeof dateStr === 'number' || (typeof dateStr === 'string' && /^\d+$/.test(dateStr))) {
      const timestamp = parseInt(dateStr);
      // 检查是否是毫秒时间戳（长度为13位）或秒时间戳（长度为10位）
      if (timestamp > 0) {
        const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
        if (!isNaN(date.getTime())) {
          // console.log('processDateForIOS: 时间戳转换成功:', dateStr, '->', date.toISOString());
          return date;
        }
      }
    }
    
    // 如果不是字符串，直接返回
    if (typeof dateStr !== 'string') return dateStr;
    
    // 去除首尾空格
    dateStr = dateStr.trim();
    
    // 处理ISO 8601格式 (例如: "2025-09-29T12:34:56.789Z" 或 "2025-09-29T12:34:56+08:00")
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      // console.log('processDateForIOS: 检测到ISO格式:', dateStr);
      return dateStr; // ISO格式可以直接被Date()解析
    }
    
    // 检查是否是标准的 "yyyy-MM-dd HH:mm:ss" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // 将中间的空格替换为/以兼容iOS
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})/, '$1/$2/$3 $4');
      // console.log('processDateForIOS: 标准格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是 "yyyy-MM-dd HH:mm" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/)) {
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2})/, '$1/$2/$3 $4:00');
      // console.log('processDateForIOS: 无秒格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是纯日期 "yyyy-MM-dd" 格式
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const converted = dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');
      // console.log('processDateForIOS: 纯日期格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是缺少前导0的日期格式 "yyyy-M-d" 或 "yyyy-MM-d" 或 "yyyy-M-dd"
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      // 补充前导0，然后转换
      const parts = dateStr.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      const normalized = `${year}-${month}-${day}`;
      const converted = `${year}/${month}/${day}`;
      // console.log('processDateForIOS: 缺少前导0日期格式转换:', dateStr, '->', normalized, '->', converted);
      return converted;
    }
    
    // 检查是否是带时间但缺少前导0的格式 "yyyy-M-d HH:mm:ss" 等
    if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}(:\d{2})?$/)) {
      // 先规范化日期部分，再转换
      const [datePart, timePart] = dateStr.split(' ');
      const parts = datePart.split('-');
      const year = parts[0];
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      const normalizedTime = timePart.includes(':') && timePart.split(':').length === 2 ? timePart + ':00' : timePart;
      const converted = `${year}/${month}/${day} ${normalizedTime}`;
      // console.log('processDateForIOS: 缺少前导0日期时间格式转换:', dateStr, '->', converted);
      return converted;
    }
    
    // 检查是否是其他常见格式 
    // 格式: "yyyy/MM/dd HH:mm:ss"
    if (dateStr.match(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // console.log('processDateForIOS: 斜杠格式已兼容:', dateStr);
      return dateStr;
    }
    
    // 如果都不匹配，记录警告并返回原值
    // console.warn('processDateForIOS: 未识别的日期格式:', dateStr, typeof dateStr);
    return dateStr;
  },

  // 获取星期几 - iOS兼容版本
  getWeekday(dateStr) {
    try {
      // iOS兼容性处理
      let processedDateStr = this.processDateForIOS(dateStr);
      
      const date = new Date(processedDateStr);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.warn('getWeekday: 无法解析日期字符串:', dateStr);
        return '';
      }
      
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()];
    } catch (error) {
      console.warn('getWeekday: 星期获取错误:', error, '原始字符串:', dateStr);
      return '';
    }
  },

  // 获取状态类型
  getStatusType(status) {
    if (status === '公司上班') {
      return 'attendance';
    } else if (status === '国内出差') {
      return 'domestic-trip';
    } else if (status === '国外出差') {
      return 'foreign-trip';
    } else if (status === '休息') {
      return 'rest';
    } else if (status === '调休') {
      return 'compensatory';
    } else {
      return 'other';
    }
  },

  // ==================== 员工多选相关方法 ====================
  
  // 显示员工选择器
  onShowEmployeeSelector() {
    if (!this.data.isAdmin) {
      return;
    }
    
    this.setData({ showEmployeePopup: true });
    
    // 如果员工列表为空，重新加载
    if (this.data.employeeList.length === 0) {
      this.loadEmployeeList();
    }
  },

  // 员工弹窗状态变化
  onEmployeePopupChange(e) {
    this.setData({ showEmployeePopup: e.detail.visible });
  },

  // 切换员工选择状态
  onToggleEmployee(e) {
    const employeeName = e.currentTarget.dataset.name;
    const selectedEmployees = this.data.selectedEmployees.slice();
    const employeeList = this.data.employeeList.slice();
    
    const index = selectedEmployees.indexOf(employeeName);
    if (index >= 0) {
      // 取消选择
      selectedEmployees.splice(index, 1);
      console.log('取消选择员工:', employeeName, '当前选择:', selectedEmployees);
    } else {
      // 添加选择
      selectedEmployees.push(employeeName);
      console.log('添加选择员工:', employeeName, '当前选择:', selectedEmployees);
    }
    
    // 更新员工列表的选中状态
    employeeList.forEach(emp => {
      emp.selected = selectedEmployees.indexOf(emp.name) >= 0;
    });
    
    this.setData({ 
      selectedEmployees,
      employeeList
    });
    console.log('界面数据更新后的selectedEmployees:', this.data.selectedEmployees);
  },

  // 清空所有选择
  onClearAllEmployees() {
    console.log('清空所有员工选择');
    const employeeList = this.data.employeeList.map(emp => (Object.assign({}, emp, {
      selected: false
    })));
    this.setData({ 
      selectedEmployees: [],
      employeeList
    });
    console.log('清空后selectedEmployees:', this.data.selectedEmployees);
  },

  // 全选员工
  onSelectAllEmployees() {
    const allEmployees = this.data.employeeList.map(item => item.name);
    const employeeList = this.data.employeeList.map(emp => (Object.assign({}, emp, {
      selected: true
    })));
    console.log('全选员工:', allEmployees);
    this.setData({ 
      selectedEmployees: allEmployees,
      employeeList
    });
    console.log('全选后selectedEmployees:', this.data.selectedEmployees);
  },

  /**
   * 关闭游客模式横幅
   */
  closeGuestBanner() {
    this.setData({
      showGuestBanner: false
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 导出（下载JSON）
  onExport() {
    const data = this.data.attendanceData;
    if (!data || data.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }
    wx.showToast({ title: '导出功能需在PC端使用', icon: 'none' });
  },

  // 重置筛选（供空状态按钮和筛选卡片按钮共用）
  onResetFilter() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const yearIndex = this.data.yearOptions.findIndex(year => parseInt(year) === currentYear);

    this.setData({
      filterName: '',
      selectedEmployees: [],
      currentYear,
      currentMonth,
      yearIndex: yearIndex >= 0 ? yearIndex : 2,
      monthIndex: currentDate.getMonth()
    });

    this.loadAttendanceData();
  },

  // 确认员工选择
  onConfirmEmployeeSelection() {
    console.log('确认员工选择，当前selectedEmployees:', this.data.selectedEmployees);
    this.setData({ showEmployeePopup: false });
    // 选择完成后自动查询
    this.loadAttendanceData();
  }
});