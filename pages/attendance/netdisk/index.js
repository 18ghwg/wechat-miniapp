const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const { getEnvironmentInfo } = require('../../../utils/environment');

Page({
  data: {
    userInfo: null,
    netdiskInfo: null,
    isAdmin: false,
    testMode: false,
    formData: {
      user_name: '',
      sony_username: '',
      sony_password: '',
      is_auto_create_salary: false
    },
    isEditing: false,
    loading: false,
    allUsers: [], // 管理员模式下显示所有用户
    selectedUserIndex: 0
  },

  onLoad() {
    console.log('网盘管理页面 onLoad');
    // 确保数据初始化
    this.setData({
      userInfo: null,
      netdiskInfo: null,
      isAdmin: false,
      testMode: false,
      loading: true,
      allUsers: [],
      isEditing: false
    });
    
    // 先加载用户信息，然后在回调中加载网盘信息
    this.loadUserInfo();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('网盘管理页面-测试模式热加载');
      this.loadUserInfo();
    });
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
        is_auto_create_salary: true
      };
      this.setData({ 
        netdiskInfo: mockNetdiskInfo,
        'formData.sony_username': mockNetdiskInfo.sony_username,
        'formData.sony_password': mockNetdiskInfo.sony_password,
        'formData.is_auto_create_salary': mockNetdiskInfo.is_auto_create_salary,
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
    API.attendance.getNetdiskInfo(userName)
      .then((data) => {
        console.log('loadNetdiskInfo: 获取成功，返回数据:', data);
        
        // 成功获取到网盘信息
        const netdiskInfo = data.data;
        this.setData({ 
          netdiskInfo: netdiskInfo,
          'formData.sony_username': (netdiskInfo ? netdiskInfo.sony_username : undefined) || '',
          'formData.sony_password': (netdiskInfo ? netdiskInfo.sony_password : undefined) || '',
          'formData.is_auto_create_salary': (netdiskInfo ? netdiskInfo.is_auto_create_salary : undefined) || false,
          loading: false,
          isEditing: false // 有数据时默认不编辑
        });
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
            'formData.is_auto_create_salary': false
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
      const mockUsers = [
        { name: '张三', label: '张三', id: 1 },
        { name: '李四', label: '李四', id: 2 },
        { name: '王五', label: '王五', id: 3 },
        { name: '测试管理员', label: '测试管理员', id: 4 }
      ];
      this.setData({ allUsers: mockUsers });
      return;
    }

    apiCall(
      () => API.attendance.getKaoqinUsers(),
      null,
      (data) => {
        const users = (data && data.data) ? data.data : [];
        console.log('加载用户列表成功:', users);
        this.setData({ allUsers: Array.isArray(users) ? users : [] });
      },
      (error) => {
        console.log('加载用户列表失败:', error);
        // 确保allUsers始终是数组
        this.setData({ allUsers: [] });
      }
    );
  },

  /**
   * 表单字段输入处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
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
    const { user_name, sony_username, sony_password, is_auto_create_salary } = this.data.formData;

    if (!user_name || !sony_username || !sony_password) {
      showError('请填写完整的网盘账号信息');
      return;
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

    apiCall(
      () => API.attendance.updateNetdiskInfo({
        user_name,
        sony_username,
        sony_password,
        is_auto_create_salary
      }),
      '保存中...',
      (data) => {
        showSuccess('网盘账号信息保存成功');
        this.setData({ isEditing: false });
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
          'formData.is_auto_create_salary': false
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
          'formData.is_auto_create_salary': false
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
    const index = e.detail.value;
    const selectedUser = this.data.allUsers[index];
    if (selectedUser) {
      this.setData({
        'formData.user_name': selectedUser.name
      });
      this.loadNetdiskInfo();
    }
  },

});
