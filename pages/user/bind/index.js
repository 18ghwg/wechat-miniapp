const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');

Page({
  data: {
    activeTab: 'web', // 'web' 或 'grid'
    // Web账号绑定
    username: '',
    password: '',
    bindLoading: false,
    // 国网账号绑定
    gridPhone: '',
    gridPassword: '',
    gridAccountName: '',
    gridBindLoading: false,
    // 通用 - 确保初始值不为null，避免渲染错误
    userInfo: {
      is_web_bound: false,
      web_username: '',
      openid: '',
      nickname: '加载中...'
    },
    gridAccounts: []
  },

  onLoad(options) {
    // 根据URL参数设置默认标签页
    if (options && options.tab) {
      this.setData({ activeTab: options.tab });
    }
    
    // 设置测试模式热重载
    testModeManager.setupPageHotReload(this, function() {
      console.log('用户绑定页面-测试模式热重载');
      this.checkNetworkAndLoadData();
    });
    
    // 检查网络连接并加载数据
    this.checkNetworkAndLoadData();
  },

  /**
   * 检查网络连接并加载数据
   */
  checkNetworkAndLoadData() {
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          // 无网络连接
          wx.showModal({
            title: '网络连接失败',
            content: '请检查您的网络连接后重试，或者可以启用测试模式进行体验。',
            showCancel: true,
            confirmText: '重试',
            cancelText: '测试模式',
            success: (modalRes) => {
              if (modalRes.confirm) {
                this.checkNetworkAndLoadData();
              } else if (modalRes.cancel) {
                // 启用测试模式
                testModeManager.setTestMode(true);
                console.log('已启用测试模式');
                this.loadUserInfo();
                this.loadGridAccounts();
              }
            }
          });
        } else {
          // 有网络连接，正常加载数据
          this.loadUserInfo();
          this.loadGridAccounts();
        }
      },
      fail: () => {
        // 无法检查网络状态，尝试正常加载
        this.loadUserInfo();
        this.loadGridAccounts();
      }
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：使用testModeManager提供的mock数据
      console.log('绑定页面-测试模式：使用mock用户信息');
      
      // 使用testModeManager获取标准的mock用户信息
      let userInfo = testModeManager.getMockUserInfo();
      
      // 添加Web绑定相关的mock字段
      userInfo = Object.assign({}, userInfo, {
        is_web_bound: true,   // 测试模式默认已绑定，展示完整功能
        web_username: 'admin_test',  // 测试用户名
        bound_username: 'admin_test'
      });
      
      // 保存到本地存储，供其他地方使用
      wx.setStorageSync('userInfo', userInfo);
      
      this.setData({ userInfo });
      return;
    }
    
    apiCall(
      () => API.user.getInfo(),
      null,
      (data) => {
        // 确保数据完整性
        const userInfo = data || {
          is_web_bound: false,
          web_username: '',
          openid: '',
          nickname: '未知用户'
        };
        this.setData({ userInfo });
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        
        // 检查是否是网络连接问题
        if (error.message && error.message.includes('网络连接失败')) {
          wx.showModal({
            title: '网络连接失败',
            content: '无法连接到服务器，您可以启用测试模式来体验功能。',
            showCancel: true,
            confirmText: '测试模式',
            cancelText: '稍后',
            success: (res) => {
              if (res.confirm) {
                testModeManager.setTestMode(true);
                console.log('用户选择启用测试模式');
                this.loadUserInfo(); // 重新加载，这次会使用测试模式
              }
            }
          });
        }
        
        // 网络失败时使用默认用户信息，避免渲染错误
        this.setData({ 
          userInfo: {
            is_web_bound: false,
            web_username: '',
            openid: '',
            nickname: '网络连接失败'
          }
        });
      }
    );
  },

  /**
   * 用户名输入
   */
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    });
  },

  /**
   * 密码输入
   */
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  /**
   * 绑定Web用户
   */
  onBindUser() {
    const { username, password } = this.data;

    if (!username.trim()) {
      showError('请输入用户名');
      return;
    }

    if (!password.trim()) {
      showError('请输入密码');
      return;
    }

    this.setData({ bindLoading: true });

    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：模拟绑定成功
      console.log('绑定页面-测试模式：模拟Web账号绑定成功');
      setTimeout(() => {
        showSuccess('Web账号绑定成功(测试模式)');
        
        // 更新本地用户信息
        const userInfo = wx.getStorageSync('userInfo') || testModeManager.getMockUserInfo();
        userInfo.is_web_bound = true;
        userInfo.web_username = username.trim();
        userInfo.bound_username = username.trim();
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({ 
          bindLoading: false,
          userInfo: userInfo
        });
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }, 1000);
      return;
    }

    apiCall(
      () => API.auth.bind(username.trim(), password.trim()),
      '绑定中...',
      (data) => {
        showSuccess('绑定成功');
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      (error) => {
        this.setData({ bindLoading: false });
        showError(error.message || '绑定失败');
      }
    );
  },

  /**
   * 解绑Web用户
   */
  onUnbindUser() {
    wx.showModal({
      title: '确认解绑',
      content: '解绑后您将失去所有功能权限，需要重新绑定或联系管理员授权，确定要解绑吗？',
      success: (res) => {
        if (res.confirm) {
          this.doUnbind();
        }
      }
    });
  },

  /**
   * 执行解绑
   */
  doUnbind() {
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：模拟解绑成功
      console.log('绑定页面-测试模式：模拟Web账号解绑成功');
      setTimeout(() => {
        showSuccess('Web账号解绑成功(测试模式)');
        
        // 更新本地用户信息
        const userInfo = wx.getStorageSync('userInfo') || testModeManager.getMockUserInfo();
        userInfo.is_web_bound = false;
        userInfo.web_username = '';
        userInfo.bound_username = '';
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({ userInfo });
        
        // 清空表单
        this.setData({
          username: '',
          password: ''
        });
        
        console.log('测试模式：Web账号解绑完成，现在显示绑定表单');
      }, 1000);
      return;
    }

    apiCall(
      () => API.auth.unbind(),
      '解绑中...',
      (data) => {
        showSuccess('解绑成功');
        
        // 刷新用户信息
        this.loadUserInfo();
        
        // 清空表单
        this.setData({
          username: '',
          password: ''
        });
      },
      (error) => {
        showError(error.message || '解绑失败');
      }
    );
  },

  /**
   * 标签切换
   */
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  /**
   * 加载国网账号列表
   */
  loadGridAccounts() {
    if (testModeManager.isTestMode()) {
      // 测试模式：使用testModeManager提供的mock数据
      console.log('绑定页面-测试模式：使用mock国网账号数据');
      
      // 使用testModeManager获取标准的mock国网账号数据
      const mockGridAccounts = testModeManager.getMockGridAccounts();
      
      // 格式化为绑定页面需要的格式
      const formattedAccounts = mockGridAccounts.map(account => ({
        id: account.id,
        PhoneName: account.PhoneName,
        grid_phone: account.PhoneName.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 脱敏显示
        account_name: account.AccountName,
        AccountName: account.AccountName,
        Status: account.Status,
        CreateTime: account.CreateTime
      }));
      
      this.setData({
        gridAccounts: formattedAccounts
      });
      
      console.log('测试模式国网账号数据已加载:', formattedAccounts);
      return;
    }
    
    apiCall(
      () => API.grid.getAccounts(),
      null,
      (data) => {
        // 确保数据是数组格式，避免渲染错误
        let accounts = [];
        
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            accounts = data;
          } else if (data.data && Array.isArray(data.data)) {
            accounts = data.data;
          } else if (data.code === 200 && Array.isArray(data.data)) {
            accounts = data.data;
          }
        }
        
        console.log('国网账号数据:', accounts);
        // 确保accounts是数组，避免渲染错误
        this.setData({ gridAccounts: Array.isArray(accounts) ? accounts : [] });
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        // 网络失败时设置空数组，避免渲染错误
        this.setData({ gridAccounts: [] });
      }
    );
  },

  /**
   * 国网手机号输入
   */
  onGridPhoneInput(e) {
    this.setData({
      gridPhone: e.detail.value
    });
  },

  /**
   * 国网密码输入
   */
  onGridPasswordInput(e) {
    this.setData({
      gridPassword: e.detail.value
    });
  },

  /**
   * 国网账号备注名称输入
   */
  onGridAccountNameInput(e) {
    this.setData({
      gridAccountName: e.detail.value
    });
  },

  /**
   * 验证手机号格式
   */
  validatePhoneNumber(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * 绑定国网账号
   */
  onBindGridAccount() {
    const { gridPhone, gridPassword, gridAccountName } = this.data;

    if (!gridPhone.trim()) {
      showError('请输入国网手机号');
      return;
    }

    if (!this.validatePhoneNumber(gridPhone.trim())) {
      showError('请输入正确的手机号格式');
      return;
    }

    if (!gridPassword.trim()) {
      showError('请输入国网密码');
      return;
    }

    this.setData({ gridBindLoading: true });

    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：模拟绑定成功
      console.log('绑定页面-测试模式：模拟国网账号绑定成功');
      setTimeout(() => {
        showSuccess('国网账号绑定成功(测试模式)');
        
        // 模拟在现有账号列表中添加一个新账号
        const currentAccounts = this.data.gridAccounts;
        const newAccountId = currentAccounts.length + 1;
        const newAccount = {
          id: newAccountId,
          PhoneName: gridPhone.trim(),
          grid_phone: gridPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // 脱敏显示
          account_name: gridAccountName.trim() || `账号${gridPhone.slice(-4)}`,
          AccountName: gridAccountName.trim() || `账号${gridPhone.slice(-4)}`,
          Status: '正常',
          CreateTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '-')
        };
        
        // 更新账号列表
        this.setData({
          gridBindLoading: false,
          gridAccounts: currentAccounts.concat([newAccount])
        });
        
        // 清空表单
        this.setData({
          gridPhone: '',
          gridPassword: '',
          gridAccountName: ''
        });
        
        console.log('测试模式：已添加新的国网账号', newAccount);
      }, 2000);
      return;
    }

    apiCall(
      () => API.grid.bind({
        grid_phone: gridPhone.trim(),
        grid_password: gridPassword.trim(),
        account_name: gridAccountName.trim() || `账号${gridPhone.slice(-4)}`
      }),
      '验证中...',
      (data) => {
        this.setData({ gridBindLoading: false });
        console.log('绑定API成功回调，数据:', data);
        
        // 根据后端返回的code判断绑定是否成功
        if (data && data.code === 200) {
          // 绑定成功 - 用弹窗显示完整的成功信息
          const successMsg = data.msg || '国网账号绑定成功！';
          console.log('绑定成功，显示消息:', successMsg);
          wx.showModal({
            title: '绑定成功',
            content: successMsg,
            showCancel: false,
            confirmText: '确定'
          });
          
          // 刷新账号列表
          this.loadGridAccounts();
          
          // 清空表单
          this.setData({
            gridPhone: '',
            gridPassword: '',
            gridAccountName: ''
          });
        } else {
          // 绑定失败 - 用弹窗显示完整的错误信息
          const errorMsg = (data ? data.msg : undefined) || '绑定失败，请稍后重试';
          console.log('绑定失败，显示错误:', errorMsg);
          wx.showModal({
            title: '绑定失败',
            content: errorMsg,
            showCancel: false,
            confirmText: '确定'
          });
        }
      },
      (error) => {
        this.setData({ gridBindLoading: false });
        console.log('绑定API错误回调，错误:', error);
        
        // 显示网络错误信息
        const errorMsg = error.message || '网络连接失败，请稍后重试';
        console.log('网络错误，显示消息:', errorMsg);
        showError(errorMsg);
      }
    );
  },

  /**
   * 解绑国网账号
   */
  onUnbindGridAccount(e) {
    const accountId = e.currentTarget.dataset.id;
    const account = this.data.gridAccounts.find(acc => acc.id === accountId);
    
    if (!account) {
      showError('账号信息不存在');
      return;
    }
    
    wx.showModal({
      title: '确认解绑',
      content: `确定要解绑国网账号 ${account.PhoneName || account.grid_phone || '未知号码'} 吗？解绑后将无法查询该账号的电费信息。`,
      success: (res) => {
        if (res.confirm) {
          this.doUnbindGridAccount(accountId);
        }
      }
    });
  },

  /**
   * 执行国网账号解绑
   */
  doUnbindGridAccount(accountId) {
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：模拟解绑成功
      console.log('绑定页面-测试模式：模拟国网账号解绑成功', { accountId });
      setTimeout(() => {
        showSuccess('国网账号解绑成功(测试模式)');
        
        // 从当前账号列表中移除指定账号
        const currentAccounts = this.data.gridAccounts;
        const updatedAccounts = currentAccounts.filter(account => account.id !== accountId);
        
        // 更新账号列表
        this.setData({
          gridAccounts: updatedAccounts
        });
        
        console.log('测试模式：已从列表中移除国网账号', { 
          removed: accountId,
          remaining: updatedAccounts.length 
        });
      }, 1000);
      return;
    }

    apiCall(
      () => API.grid.unbind({ account_id: accountId }),
      '解绑中...',
      (data) => {
        showSuccess('国网账号解绑成功');
        this.loadGridAccounts(); // 刷新账号列表
      },
      (error) => {
        showError(error.message || '解绑失败');
      }
    );
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('下拉刷新，重新加载数据');
    this.checkNetworkAndLoadData();
  },

  /**
   * 切换测试模式（长按标题栏触发）
   */
  onTitleTap() {
    const currentTestMode = testModeManager.isTestMode();
    const statusDetail = testModeManager.getTestModeStatus();
    
    // 构建详细的状态信息
    let statusText = `当前状态：${currentTestMode ? '测试模式' : '正常模式'}`;
    if (currentTestMode) {
      if (statusDetail.globalTestMode) {
        statusText += '(全局开关)';
      } else if (statusDetail.wechatTestMode) {
        statusText += '(微信一键登录)';
      }
    }
    
    wx.showModal({
      title: '测试模式切换',
      content: `${statusText}\n\n是否${currentTestMode ? '关闭' : '开启'}测试模式？`,
      success: (res) => {
        if (res.confirm) {
          if (currentTestMode && statusDetail.wechatTestMode && !statusDetail.globalTestMode) {
            // 如果是微信一键登录的测试模式，只能关闭微信测试模式
            wx.setStorageSync('isTestMode', false);
          } else {
            // 切换全局测试模式
            testModeManager.setTestMode(!currentTestMode);
          }
          
          const newMode = testModeManager.isTestMode();
          console.log(`已切换到${newMode ? '测试' : '正常'}模式`);
          
          // 重新加载数据
          this.loadUserInfo();
          this.loadGridAccounts();
          
          wx.showToast({
            title: `已切换到${newMode ? '测试' : '正常'}模式`,
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  }
});
