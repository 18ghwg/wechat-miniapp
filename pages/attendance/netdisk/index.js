const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const { getEnvironmentInfo } = require('../../../utils/environment');
const {
  isAllowedCompanyName,
  getCompanyNetdiskVerificationKey
} = require('../../../utils/company-netdisk-access');

function formatMonthText(year, month) {
  return year + "年" + month + "月";
}

function getWorkRestModeIndex(mode) {
  return mode === "single_rest" ? 1 : 0;
}

Page({
  data: {
    userInfo: null,
    netdiskInfo: null,
    companyVerified: false,
    companyVerificationInput: '',
    companyVerificationError: '',
    isAdmin: false,
    testMode: false,
    formData: {
      user_name: '',
      sony_username: '',
      sony_password: '',
      is_auto_create_salary: false,
      is_upload_to_netdisk: true,
      base_salary: '7000',
      overtime_pay_per_day: '250',
      overtime_pay_per_hour: '30',
      domestic_allowance_per_trip_day: '100',
      meal_allowance_per_trip_day: '20',
      work_rest_mode: 'double_rest'
    },
    isEditing: false,
    loading: false,
    allUsers: [], // 管理员模式下显示所有用户
    displayUsers: [],
    selectedUserIndex: 0,
    selectedUserStatus: null,
    statusMonthLabel: '',
    workRestModeOptions: ['双休', '单休'],
    workRestModeIndex: 0
  },

  onLoad() {
    console.log('网盘管理页面 onLoad');
    const cachedUserInfo = wx.getStorageSync('userInfo') || {};
    this._companyVerificationStorageKey = getCompanyNetdiskVerificationKey(
      wx.getStorageSync('openid'),
      cachedUserInfo
    );
    const companyVerified = !!(
      this._companyVerificationStorageKey
      && wx.getStorageSync(this._companyVerificationStorageKey) === true
    );
    this._netdiskPageInitialized = false;

    // 确保数据初始化
    this.setData({
      userInfo: null,
      netdiskInfo: null,
      companyVerified,
      companyVerificationInput: '',
      companyVerificationError: '',
      isAdmin: false,
      testMode: false,
      loading: true,
      allUsers: [],
      displayUsers: [],
      selectedUserIndex: 0,
      selectedUserStatus: null,
      statusMonthLabel: '',
      workRestModeIndex: 0,
      isEditing: false
    });

    this.initializeNetdiskPage();
  },

  initializeNetdiskPage() {
    if (this._netdiskPageInitialized) {
      return;
    }

    this._netdiskPageInitialized = true;
    this.loadUserInfo();

    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('网盘管理页面-测试模式热加载');
      this.loadUserInfo();
    });
  },

  onCompanyVerificationInput(e) {
    this.setData({
      companyVerificationInput: (e && e.detail && e.detail.value) || '',
      companyVerificationError: ''
    });
  },

  confirmCompanyVerification() {
    const companyName = this.data.companyVerificationInput;
    if (!String(companyName || '').trim()) {
      this.setData({ companyVerificationError: '请输入您的公司名称' });
      return;
    }

    if (!isAllowedCompanyName(companyName)) {
      this.setData({ companyVerificationError: '公司名称验证未通过，请检查后重试' });
      return;
    }

    if (this._companyVerificationStorageKey) {
      wx.setStorageSync(this._companyVerificationStorageKey, true);
    }

    this.setData({
      companyVerified: true,
      companyVerificationInput: '',
      companyVerificationError: ''
    }, () => this.loadNetdiskInfo());
  },

  onShow() {
    console.log('网盘管理页面 onShow，当前状态:', {
      hasUserInfo: !!this.data.userInfo,
      hasNetdiskInfo: !!this.data.netdiskInfo,
      userName: this.data.formData.user_name,
      isEditing: this.data.isEditing
    });
    // onLoad已经会加载数据，onShow主要用于状态检查
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const isTestMode = testModeManager.isTestMode();
    
    if (isTestMode) {
      console.log('网盘管理-测试模式：使用mock用户信息');
      const userInfo = testModeManager.getMockUserInfo();
      this.setData({ 
        userInfo: userInfo,
        isAdmin: userInfo.is_admin || false,
        testMode: true,
        loading: false
      });
      console.log('测试模式用户信息设置完成:', userInfo);
      
      // 设置表单默认值
      this.setData({
        'formData.user_name': userInfo.real_name || userInfo.nickname
      });
      
      // 用户信息设置完成后加载网盘信息
      this.loadNetdiskInfo();
      return;
    }

    apiCall(
      () => API.user.getInfo(),
      null,
      (data) => {
        const userInfo = data.data || data;
        this.setData({ 
          userInfo: userInfo,
          isAdmin: userInfo.is_admin || false,
          testMode: false,
          loading: false
        });
        console.log('正常模式用户信息加载完成:', userInfo);
        
        // 设置表单默认值
        this.setData({
          'formData.user_name': userInfo.real_name || userInfo.nickname
        });

        // 如果是管理员，加载所有用户列表
        if (userInfo.is_admin) {
          this.loadAllUsers();
        }
        
        // 用户信息设置完成后加载网盘信息
        this.loadNetdiskInfo();
      },
      (error) => {
        console.log('加载用户信息失败:', error);
      }
    );
  },

  /**
   * 加载网盘账号信息
   */
  loadNetdiskInfo() {
    if (testModeManager.isTestMode()) {
      console.log('网盘管理-测试模式：使用mock网盘信息');
      const mockNetdiskInfo = {
        id: 1,
        name: '测试管理员',
        sony_username: 'test_netdisk_user',
        sony_password: 'test_password',
        is_auto_create_salary: true,
        is_upload_to_netdisk: true,
        base_salary: 7000,
        overtime_pay_per_day: 250,
        overtime_pay_per_hour: 30,
        domestic_allowance_per_trip_day: 100,
        meal_allowance_per_trip_day: 20,
        work_rest_mode: 'double_rest'
      };
        this.setData({ 
          netdiskInfo: mockNetdiskInfo,
          'formData.sony_username': mockNetdiskInfo.sony_username,
          'formData.sony_password': mockNetdiskInfo.sony_password,
          'formData.is_auto_create_salary': mockNetdiskInfo.is_auto_create_salary,
          'formData.is_upload_to_netdisk': mockNetdiskInfo.is_upload_to_netdisk,
          'formData.base_salary': String(mockNetdiskInfo.base_salary),
          'formData.overtime_pay_per_day': String(mockNetdiskInfo.overtime_pay_per_day),
          'formData.overtime_pay_per_hour': String(mockNetdiskInfo.overtime_pay_per_hour),
          'formData.domestic_allowance_per_trip_day': String(mockNetdiskInfo.domestic_allowance_per_trip_day),
          'formData.meal_allowance_per_trip_day': String(mockNetdiskInfo.meal_allowance_per_trip_day),
          'formData.work_rest_mode': mockNetdiskInfo.work_rest_mode || 'double_rest',
          workRestModeIndex: getWorkRestModeIndex(mockNetdiskInfo.work_rest_mode),
        isEditing: false, // 测试模式下有数据，默认不编辑
        loading: false
      });
      console.log('测试模式网盘信息设置完成:', this.data);
      return;
    }

    const userName = this.data.formData.user_name;
    if (!userName) {
      console.log('loadNetdiskInfo: 没有用户名，设置为编辑模式');
      this.setData({ 
        loading: false,
        isEditing: true,
        netdiskInfo: null
      });
      return;
    }
    
    console.log('loadNetdiskInfo: 开始加载用户网盘信息:', userName);

    this.setData({ loading: true });
    
    // ✅ 使用API封装，自动添加签名
    API.attendance.getNetdiskInfo(userName, {
      salaryOnly: !this.data.companyVerified
    })
      .then((data) => {
        console.log('loadNetdiskInfo: 获取成功，返回数据:', data);
        
        // 成功获取到网盘信息
        const netdiskInfo = data.data;
        const formUpdates = {
          netdiskInfo: netdiskInfo,
          'formData.is_auto_create_salary': (netdiskInfo ? netdiskInfo.is_auto_create_salary : undefined) || false,
          'formData.base_salary': String((netdiskInfo ? netdiskInfo.base_salary : undefined) ?? 7000),
          'formData.overtime_pay_per_day': String((netdiskInfo ? netdiskInfo.overtime_pay_per_day : undefined) ?? 250),
          'formData.overtime_pay_per_hour': String((netdiskInfo ? netdiskInfo.overtime_pay_per_hour : undefined) ?? 30),
          'formData.domestic_allowance_per_trip_day': String((netdiskInfo ? netdiskInfo.domestic_allowance_per_trip_day : undefined) ?? 100),
          'formData.meal_allowance_per_trip_day': String((netdiskInfo ? netdiskInfo.meal_allowance_per_trip_day : undefined) ?? 20),
          'formData.work_rest_mode': (netdiskInfo ? netdiskInfo.work_rest_mode : undefined) || 'double_rest',
          workRestModeIndex: getWorkRestModeIndex((netdiskInfo ? netdiskInfo.work_rest_mode : undefined) || 'double_rest'),
          loading: false,
          isEditing: false // 有数据时默认不编辑
        };
        if (this.data.companyVerified) {
          formUpdates['formData.sony_username'] = (netdiskInfo ? netdiskInfo.sony_username : undefined) || '';
          formUpdates['formData.sony_password'] = (netdiskInfo ? netdiskInfo.sony_password : undefined) || '';
          formUpdates['formData.is_upload_to_netdisk'] = netdiskInfo && netdiskInfo.is_upload_to_netdisk !== undefined
            ? !!netdiskInfo.is_upload_to_netdisk
            : true;
        }
        this.setData(formUpdates);
        console.log('loadNetdiskInfo: 网盘信息加载完成，编辑状态:', false);
      })
      .catch((err) => {
        console.log('loadNetdiskInfo: 获取失败或404:', err);
        
        // 404 表示用户还没有网盘账号，正常情况
        if (err.statusCode === 404 || err.code === 404) {
          console.log('loadNetdiskInfo: 用户未配置网盘信息（正常情况），进入编辑模式');
          this.setData({ 
            netdiskInfo: null,
            loading: false,
            isEditing: true, // 没有数据时默认进入编辑模式，允许用户输入
            'formData.sony_username': '',
            'formData.sony_password': '',
            'formData.is_auto_create_salary': false,
            'formData.is_upload_to_netdisk': true,
            'formData.base_salary': '7000',
            'formData.overtime_pay_per_day': '250',
            'formData.overtime_pay_per_hour': '30',
            'formData.domestic_allowance_per_trip_day': '100',
            'formData.meal_allowance_per_trip_day': '20',
            'formData.work_rest_mode': 'double_rest',
            workRestModeIndex: 0
          });
          console.log('loadNetdiskInfo: 进入编辑模式，编辑状态设置为:', true);
          
          // 延迟一下再次检查状态，确保设置生效
          setTimeout(() => {
            console.log('loadNetdiskInfo: 检查当前页面状态:', {
              isEditing: this.data.isEditing,
              loading: this.data.loading,
              netdiskInfo: this.data.netdiskInfo,
              formData: this.data.formData
            });
          }, 100);
        } else {
          // 其他错误
          console.log('loadNetdiskInfo: 业务错误:', err);
          showError(err.message || '加载网盘信息失败');
          this.setData({ 
            netdiskInfo: null,
            loading: false,
            isEditing: true
          });
        }
      });
  },

  /**
   * 加载所有用户列表（管理员功能）
   */
  loadAllUsers() {
    if (testModeManager.isTestMode()) {
      console.log('网盘管理-测试模式：使用mock用户列表');
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthText = formatMonthText(year, month);
      const mockUsers = [
        {
          name: '张三',
          label: '张三',
          id: 1,
          salary_status: {
            code: 'manual_locked',
            text: '已手动锁定',
            badge_type: 'manual',
            description: `${monthText}工资条已手动生成，自动任务不会重复执行`,
            month_text: monthText,
            generated_at: `${year}-${String(month).padStart(2, '0')}-26 09:30:00`
          }
        },
        {
          name: '李四',
          label: '李四',
          id: 2,
          salary_status: {
            code: 'auto_generated',
            text: '自动生成',
            badge_type: 'auto',
            description: `${monthText}工资条已由定时任务自动生成`,
            month_text: monthText,
            generated_at: `${year}-${String(month).padStart(2, '0')}-26 08:00:00`
          }
        },
        {
          name: '王五',
          label: '王五',
          id: 3,
          salary_status: {
            code: 'not_generated',
            text: '未生成',
            badge_type: 'pending',
            description: `${monthText}工资条尚未生成`,
            month_text: monthText,
            generated_at: null
          }
        },
        {
          name: '测试管理员',
          label: '测试管理员',
          id: 4,
          salary_status: {
            code: 'generated',
            text: '已生成',
            badge_type: 'normal',
            description: `${monthText}工资条已有生成记录`,
            month_text: monthText,
            generated_at: `${year}-${String(month).padStart(2, '0')}-25 20:10:00`
          }
        }
      ];
      const decoratedUsers = this.decorateUsers(mockUsers);
      const selectedState = this.resolveSelectedUserState(decoratedUsers);
      this.setData({
        allUsers: decoratedUsers,
        displayUsers: this.buildDisplayUsers(decoratedUsers, selectedState.selectedUserIndex),
        statusMonthLabel: monthText,
        selectedUserIndex: selectedState.selectedUserIndex,
        selectedUserStatus: selectedState.selectedUserStatus
      });
      return;
    }

    const now = new Date();
    const query = {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };

    apiCall(
      () => API.attendance.getKaoqinUsers(query),
      null,
      (data) => {
        const users = (data && data.data) ? data.data : [];
        console.log('加载用户列表成功:', users);
        const decoratedUsers = this.decorateUsers(Array.isArray(users) ? users : []);
        const selectedState = this.resolveSelectedUserState(decoratedUsers);
        this.setData({
          allUsers: decoratedUsers,
          displayUsers: this.buildDisplayUsers(decoratedUsers, selectedState.selectedUserIndex),
          statusMonthLabel: formatMonthText(query.year, query.month),
          selectedUserIndex: selectedState.selectedUserIndex,
          selectedUserStatus: selectedState.selectedUserStatus
        });
      },
      (error) => {
        console.log('加载用户列表失败:', error);
        // 确保allUsers始终是数组
        this.setData({
          allUsers: [],
          displayUsers: [],
          selectedUserIndex: 0,
          selectedUserStatus: null,
          statusMonthLabel: formatMonthText(query.year, query.month)
        });
      }
    );
  },

  decorateUsers(users = []) {
    return users.map((user) => {
      const salaryStatus = user.salary_status || {};
      const badgeType = salaryStatus.badge_type || 'normal';
      const generatedAt = salaryStatus.generated_at || '';
      const statusMeta = {
        text: salaryStatus.text || '未生成',
        badgeType,
        description: salaryStatus.description || '当前月份工资条状态未知',
        generatedAt
      };

      return Object.assign({}, user, {
        salary_status: Object.assign({}, salaryStatus, statusMeta)
      });
    });
  },

  buildDisplayUsers(users = [], selectedUserIndex = 0) {
    if (!Array.isArray(users) || !users.length) {
      return [];
    }

    return users
      .map((user, index) => Object.assign({}, user, {
        originalIndex: index
      }))
      .filter((user) => user.originalIndex !== selectedUserIndex);
  },

  getSelectedUserStatus() {
    const { allUsers, selectedUserIndex } = this.data;
    if (!Array.isArray(allUsers) || !allUsers.length) {
      return null;
    }
    return allUsers[selectedUserIndex] || null;
  },

  resolveSelectedUserState(users = []) {
    if (!Array.isArray(users) || !users.length) {
      return {
        selectedUserIndex: 0,
        selectedUserStatus: null
      };
    }

    const currentName = (this.data.formData && this.data.formData.user_name) || '';
    let selectedUserIndex = users.findIndex((item) => item.name === currentName);
    if (selectedUserIndex < 0) {
      selectedUserIndex = Math.min(this.data.selectedUserIndex || 0, users.length - 1);
    }

    return {
      selectedUserIndex,
      selectedUserStatus: users[selectedUserIndex] || null
    };
  },

  /**
   * 表单字段输入处理
   */
  onInputChange(e) {
    const { field } = e && e.currentTarget && e.currentTarget.dataset ? e.currentTarget.dataset : {};
    if (!field) return;
    const value = e && e.detail ? e.detail.value : '';
    
    console.log('表单输入变化:', field, value, '编辑状态:', this.data.isEditing);
    
    this.setData({
      [`formData.${field}`]: value
    });

    // 如果是用户名改变，重新加载网盘信息
    if (field === 'user_name') {
      this.loadNetdiskInfo();
    }
  },

  /**
   * 开关切换处理
   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  onWorkRestModeChange(e) {
    const index = Number(e.detail.value || 0);
    this.setData({
      'formData.work_rest_mode': index === 1 ? 'single_rest' : 'double_rest',
      workRestModeIndex: index
    });
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    const newEditingState = !this.data.isEditing;
    console.log('切换编辑模式:', this.data.isEditing, '->', newEditingState);
    this.setData({ isEditing: newEditingState });
    
    // 设置状态后立即检查
    setTimeout(() => {
      console.log('toggleEditMode后状态检查:', {
        isEditing: this.data.isEditing,
        inputShouldBeEnabled: this.data.isEditing
      });
    }, 50);
  },


  /**
   * 保存网盘信息
   */
  saveNetdiskInfo() {
    const {
      user_name,
      sony_username,
      sony_password,
      is_auto_create_salary,
      is_upload_to_netdisk,
      base_salary,
      overtime_pay_per_day,
      overtime_pay_per_hour,
      domestic_allowance_per_trip_day,
      meal_allowance_per_trip_day,
      work_rest_mode
    } = this.data.formData;

    if (!user_name) {
      showError('请填写用户姓名');
      return;
    }

    if (this.data.companyVerified && is_upload_to_netdisk && (!sony_username || !sony_password)) {
      showError('开启网盘上传时，请填写完整的网盘账号信息');
      return;
    }

    const salaryFields = [
      { key: 'base_salary', label: '底薪', value: base_salary },
      { key: 'overtime_pay_per_day', label: '双倍/三倍加班单价', value: overtime_pay_per_day },
      { key: 'overtime_pay_per_hour', label: '日常加班小时单价', value: overtime_pay_per_hour },
      { key: 'domestic_allowance_per_trip_day', label: '国内出差补贴/天', value: domestic_allowance_per_trip_day },
      { key: 'meal_allowance_per_trip_day', label: '餐补/出差天', value: meal_allowance_per_trip_day }
    ];

    for (const field of salaryFields) {
      if (field.value === '' || field.value === null || field.value === undefined) {
        showError(`请填写${field.label}`);
        return;
      }

      const numericValue = Number(field.value);
      if (Number.isNaN(numericValue) || numericValue < 0) {
        showError(`${field.label}必须是大于等于0的数字`);
        return;
      }
    }

    if (testModeManager.isTestMode()) {
      console.log('网盘管理-测试模式：模拟保存网盘信息');
      setTimeout(() => {
        showSuccess('网盘账号信息保存成功(测试模式)');
        this.setData({ isEditing: false });
        this.loadNetdiskInfo();
      }, 1000);
      return;
    }

    const payload = {
        user_name,
        is_auto_create_salary,
        update_netdisk_credentials: this.data.companyVerified,
        base_salary: Number(base_salary),
        overtime_pay_per_day: Number(overtime_pay_per_day),
        overtime_pay_per_hour: Number(overtime_pay_per_hour),
        domestic_allowance_per_trip_day: Number(domestic_allowance_per_trip_day),
        meal_allowance_per_trip_day: Number(meal_allowance_per_trip_day),
        work_rest_mode
    };
    if (this.data.companyVerified) {
      payload.sony_username = sony_username;
      payload.sony_password = sony_password;
      payload.is_upload_to_netdisk = is_upload_to_netdisk;
    }

    apiCall(
      () => API.attendance.updateNetdiskInfo(payload),
      '保存中...',
      (data) => {
        const savedNetdiskInfo = data && data.data ? data.data : null;
        const nextFormData = savedNetdiskInfo ? Object.assign({}, this.data.formData, {
          user_name: savedNetdiskInfo.name || user_name,
          is_auto_create_salary: !!savedNetdiskInfo.is_auto_create_salary,
          base_salary: String(savedNetdiskInfo.base_salary ?? base_salary),
          overtime_pay_per_day: String(savedNetdiskInfo.overtime_pay_per_day ?? overtime_pay_per_day),
          overtime_pay_per_hour: String(savedNetdiskInfo.overtime_pay_per_hour ?? overtime_pay_per_hour),
          domestic_allowance_per_trip_day: String(savedNetdiskInfo.domestic_allowance_per_trip_day ?? domestic_allowance_per_trip_day),
          meal_allowance_per_trip_day: String(savedNetdiskInfo.meal_allowance_per_trip_day ?? meal_allowance_per_trip_day),
          work_rest_mode: savedNetdiskInfo.work_rest_mode || work_rest_mode || 'double_rest'
        }) : null;
        if (nextFormData && this.data.companyVerified) {
          nextFormData.sony_username = savedNetdiskInfo.sony_username || '';
          nextFormData.sony_password = savedNetdiskInfo.sony_password || '';
          nextFormData.is_upload_to_netdisk = savedNetdiskInfo.is_upload_to_netdisk !== false;
        }

        showSuccess(this.data.companyVerified ? '工资条及网盘配置保存成功' : '工资条配置保存成功');
        this.setData({
          isEditing: false,
          netdiskInfo: savedNetdiskInfo || this.data.netdiskInfo,
          ...(nextFormData ? { formData: nextFormData } : {})
        });
        this.loadNetdiskInfo();
      },
      (error) => {
        console.log('保存网盘信息失败:', error);
        
        // 特殊处理权限不足错误
        if (error.message && error.message.includes('权限不足')) {
          wx.showModal({
            title: '权限提示',
            content: '您只能修改自己的网盘账号信息。\n\n如果您需要修改其他用户的信息，请联系管理员。',
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          showError(error.message || '保存失败');
        }
      }
    );
  },

  /**
   * 删除网盘信息
   */
  deleteNetdiskInfo() {
    const userName = this.data.formData.user_name;
    if (!userName) {
      showError('请先选择要删除的用户');
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: `确定要删除用户"${userName}"的网盘账号信息吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          this.performDelete(userName);
        }
      }
    });
  },

  /**
   * 执行删除操作
   */
  performDelete(userName) {
    if (testModeManager.isTestMode()) {
      console.log('网盘管理-测试模式：模拟删除网盘信息');
      setTimeout(() => {
        showSuccess('网盘账号信息删除成功(测试模式)');
        this.setData({
          netdiskInfo: null,
          'formData.sony_username': '',
          'formData.sony_password': '',
          'formData.is_auto_create_salary': false,
          'formData.is_upload_to_netdisk': true,
          'formData.base_salary': '7000',
          'formData.overtime_pay_per_day': '250',
          'formData.overtime_pay_per_hour': '30',
          'formData.domestic_allowance_per_trip_day': '100',
          'formData.meal_allowance_per_trip_day': '20',
          'formData.work_rest_mode': 'double_rest',
          workRestModeIndex: 0
        });
      }, 1000);
      return;
    }

    apiCall(
      () => API.attendance.deleteNetdiskInfo(userName),
      '删除中...',
      (data) => {
        showSuccess('网盘账号信息删除成功');
        this.setData({
          netdiskInfo: null,
          'formData.sony_username': '',
          'formData.sony_password': '',
          'formData.is_auto_create_salary': false,
          'formData.is_upload_to_netdisk': true,
          'formData.base_salary': '7000',
          'formData.overtime_pay_per_day': '250',
          'formData.overtime_pay_per_hour': '30',
          'formData.domestic_allowance_per_trip_day': '100',
          'formData.meal_allowance_per_trip_day': '20',
          'formData.work_rest_mode': 'double_rest',
          workRestModeIndex: 0
        });
      },
      (error) => {
        showError(error.message || '删除失败');
      }
    );
  },

  /**
   * 选择用户（管理员功能）
   */
  onUserSelect(e) {
    const index = Number(e.detail.value) || 0;
    const selectedUser = this.data.allUsers[index];
    if (selectedUser) {
      this.setData({
        displayUsers: this.buildDisplayUsers(this.data.allUsers, index),
        selectedUserIndex: index,
        selectedUserStatus: selectedUser,
        'formData.user_name': selectedUser.name
      });
      this.loadNetdiskInfo();
    }
  },

  onUserCardSelect(e) {
    const index = Number(e.currentTarget.dataset.index);
    const selectedUser = this.data.allUsers[index];
    if (!selectedUser) {
      return;
    }

    this.setData({
      displayUsers: this.buildDisplayUsers(this.data.allUsers, index),
      selectedUserIndex: index,
      selectedUserStatus: selectedUser,
      'formData.user_name': selectedUser.name
    });
    this.loadNetdiskInfo();
  },

  goToSalaryRecords() {
    wx.navigateTo({
      url: '/pages/attendance/salary-records/index',
      fail: () => {
        showError('页面跳转失败');
      }
    });
  },

});
