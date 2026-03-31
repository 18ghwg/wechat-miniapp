const { API, apiCall, showError, showSuccess, showLoading, hideLoading } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');

Page({
  data: {
    gridAccounts: [],  // 国网账号列表 - 确保初始值为空数组
    loading: false,
    refreshing: false,
    isAdmin: false,  // 是否为管理员用户
    showAddModal: false,  // 显示添加账号弹窗
    showEditModal: false,  // 显示编辑账号弹窗
    currentAccount: null,  // 当前编辑的账号
    formData: {
      grid_phone: '',
      grid_password: '',
      account_name: ''
    },
    formErrors: {},
    submitting: false,
    statusPickerIndex: 0,  // 状态选择器索引
    // 统计数据
    totalAccounts: 0,      // 总账号数
    activeAccounts: 0,     // 使用中的账号数
    inactiveAccounts: 0,   // 未使用的账号数
    // 实体电表弹窗
    showMeterModal: false,
    meterAccountId: null,
    meterFormData: { area: '', ip: '' },
    meterFormErrors: {},
    meterSubmitting: false,
    // 添加电表 - IP检测状态
    meterCheckingIP: false,
    meterDetectedSN: null,
    meterIPStatus: 'idle',  // 'idle' | 'success' | 'error'
    // 编辑电表弹窗
    showEditMeterModal: false,
    editingMeter: null,
    editMeterFormData: { area: '', ip: '' },
    // 编辑电表 - IP检测状态
    editMeterCheckingIP: false,
    editMeterIPStatus: 'idle',  // 'idle' | 'success' | 'error'
    // 删除确认弹窗
    showDeleteMeterModal: false,
    deletingMeter: null
  },

  onLoad() {
    this.loadGridAccounts();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('国网账号管理页面-测试模式热加载');
      this.loadGridAccounts();
    });
  },

  onUnload() {
    // 返回时通知电网管理页面刷新实体电表数据
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      if (prevPage.route === 'pages/electric/index' && prevPage.loadPhysicalMeters) {
        prevPage.loadPhysicalMeters();
      }
    }
  },

  /**
   * 计算统计数据
   */
  calculateStats(accounts) {
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(item => item.IsActive).length;
    const inactiveAccounts = totalAccounts - activeAccounts;
    
    return {
      totalAccounts,
      activeAccounts,
      inactiveAccounts
    };
  },

  /**
   * 处理账号数据，添加头像显示文本
   */
  processAccountsData(accounts) {
    return accounts.map(account => ({
      ...account,
      avatarText: account.PhoneName ? account.PhoneName.slice(-2) : '00',
      displayTime: this.formatTime(account.CreateTime || account.AddTime),
      PhysicalMeters: Array.isArray(account.PhysicalMeters)
        ? account.PhysicalMeters.map(meter => ({
            ...meter,
            displayIP: this.extractIP(meter.url)
          }))
        : []
    }));
  },

  /**
   * 格式化时间
   */
  formatTime(timeStr) {
    return timeStr || '未知';
  },

  /**
   * 从 URL 中提取 IP 地址
   */
  extractIP(url) {
    if (!url) return '';
    const match = url.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    return match ? match[1] : url;
  },

  onShow() {
    // 如果从其他页面返回，刷新数据
    if (this.data.gridAccounts.length > 0) {
      this.loadGridAccounts();
    }
  },

  onPullDownRefresh() {
    this.loadGridAccounts().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载国网账号列表
   */
  async loadGridAccounts() {
    this.setData({ loading: true });
    
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：使用mock国网账号数据
      console.log('国网账号管理-测试模式：使用mock数据');
      
      // 初始化测试用户信息
      let userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || Object.keys(userInfo).length === 0) {
        userInfo = testModeManager.getMockUserInfo();
        wx.setStorageSync('userInfo', userInfo);
      }
      
      const isAdmin = this.isAdminUser(userInfo);
      const mockGridAccounts = testModeManager.getMockGridAccounts();
      const processedAccounts = this.processAccountsData(mockGridAccounts);
      const stats = this.calculateStats(processedAccounts);
      
      this.setData({ 
        gridAccounts: processedAccounts,
        loading: false,
        isAdmin: isAdmin,
        ...stats
      });
      
      console.log('测试模式国网账号数据已加载:', mockGridAccounts);
      console.log('用户权限:', isAdmin ? '管理员' : '普通用户');
      return;
    }
    
    try {
      // 检查用户权限，决定调用哪个API
      const userInfo = wx.getStorageSync('userInfo');
      const isAdmin = this.isAdminUser(userInfo);
      
      console.log('加载国网账号 - 用户权限检查:', { userInfo, isAdmin });
      
      const result = await apiCall(
        // 管理员获取所有账号，普通用户获取自己的账号
        () => isAdmin ? API.grid.getAllAccounts() : API.grid.getAccounts(),
        null,
        (data) => {
          console.log('获取国网账号列表成功:', data);
          // 根据API响应格式，实际账号数据在data.data中
          const accounts = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
          const processedAccounts = this.processAccountsData(accounts);
          console.log('处理后的账号数据:', processedAccounts);
          console.log('用户类型:', isAdmin ? '管理员' : '普通用户');
          const stats = this.calculateStats(processedAccounts);
          this.setData({ 
            gridAccounts: processedAccounts,
            loading: false,
            isAdmin: isAdmin,
            ...stats
          });
        },
        (error) => {
          // 移除console.error以避免触发全局错误恢复机制
          this.setData({ loading: false });
          showError(error.message || '获取账号列表失败');
        }
      );
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      this.setData({ loading: false });
    }
  },

  /**
   * 统一的管理员权限判断方法
   * 与电费查询页面保持一致
   */
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }
    
    // 检查 is_admin 字段
    if (userInfo.is_admin) {
      return true;
    }
    
    // 检查 user_level 字段
    if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') {
      return true;
    }
    
    // 检查 permissions 数组中是否有admin权限
    if (Array.isArray(userInfo.permissions)) {
      return userInfo.permissions.some((permission) => {
        const code = (permission ? permission.code : undefined) || (permission ? permission.permission_code : undefined);
        return code && String(code).toLowerCase() === 'admin';
      });
    }
    
    return false;
  },

  /**
   * 初始化测试模式用户信息
   */
  initTestModeUserInfo() {
    const testUserInfo = {
      id: 'test_user_001',
      openid: 'test_openid_001',
      nickname: '测试用户',
      avatar_url: '/images/default-avatar.png',
      real_name: '张三',
      is_web_bound: false,
      web_username: null,
      web_user_level: null,
      user_level: 'admin',  // 测试账号设为管理员，方便查看所有功能
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
    console.log('国网账号管理-测试模式：已初始化用户信息', testUserInfo);
    
    return testUserInfo;
  },

  /**
   * 显示添加账号弹窗
   */
  showAddAccount() {
    this.setData({
      showAddModal: true,
      currentAccount: null,
      formData: {
        grid_phone: '',
        grid_password: '',
        account_name: ''
      },
      formErrors: {}
    });
  },

  /**
   * 显示编辑账号弹窗
   */
  showEditAccount(e) {
    const account = e.currentTarget.dataset.account;
    const status = account.Status || '正常';
    const statusOptions = ['正常', '禁用', '异常'];
    const statusIndex = statusOptions.indexOf(status);
    
    this.setData({
      showEditModal: true,
      currentAccount: account,
      formData: {
        grid_phone: account.PhoneName,
        grid_password: '', // 出于安全考虑，不显示原密码
        account_name: account.AccountName || '',
        status: status
      },
      formErrors: {},
      statusPickerIndex: statusIndex >= 0 ? statusIndex : 0
    });
  },

  /**
   * 隐藏弹窗
   */
  hideModal() {
    this.setData({
      showAddModal: false,
      showEditModal: false,
      currentAccount: null,
      formData: {
        grid_phone: '',
        grid_password: '',
        account_name: ''
      },
      formErrors: {}
    });
  },

  /**
   * 表单输入处理
   */
  onInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`formErrors.${field}`]: '' // 清除错误信息
    });
  },

  /**
   * 状态选择器改变事件
   */
  onStatusChange(e) {
    const statusOptions = ['正常', '禁用', '异常'];
    const selectedIndex = parseInt(e.detail.value);
    const selectedStatus = statusOptions[selectedIndex];
    
    this.setData({
      'formData.status': selectedStatus,
      statusPickerIndex: selectedIndex
    });
  },

  /**
   * 设为使用账号开关切换
   */
  async onActiveSwitch(e) {
    const isActive = e.detail.value;
    const accountId = this.data.currentAccount.id;
    
    if (!isActive) {
      // 如果要取消设为使用账号，直接更新本地状态
      this.setData({
        'currentAccount.IsActive': false
      });
      return;
    }

    try {
      await apiCall(
        () => API.grid.setActiveAccount(accountId),
        '正在设置使用账号...',
        (data) => {
          console.log('设置使用账号成功:', data);
          showSuccess('已设为使用账号');
          // 更新当前账号状态
          this.setData({
            'currentAccount.IsActive': true
          });
          // 刷新账号列表，更新所有账号的使用状态
          this.loadGridAccounts();
        },
        (error) => {
          console.log('设置使用账号失败:', error);
          showError(error.message || '设置失败');
          // 恢复开关状态
          this.setData({
            'currentAccount.IsActive': false
          });
        }
      );
    } catch (error) {
      console.log('设置使用账号异常:', error);
      showError('设置失败，请重试');
      // 恢复开关状态
      this.setData({
        'currentAccount.IsActive': false
      });
    }
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { grid_phone, grid_password, account_name } = this.data.formData;
    const errors = {};

    // 验证手机号
    if (!grid_phone.trim()) {
      errors.grid_phone = '请输入国网手机号';
    } else if (!/^1[3-9]\d{9}$/.test(grid_phone.trim())) {
      errors.grid_phone = '请输入有效的手机号';
    }

    // 验证密码（新增时必填，编辑时选填）
    if (!this.data.currentAccount && !grid_password.trim()) {
      errors.grid_password = '请输入国网密码';
    } else if (grid_password.trim() && grid_password.trim().length < 6) {
      errors.grid_password = '密码长度至少6位';
    }

    // 验证账号名称（可选）
    if (account_name.trim() && account_name.trim().length > 20) {
      errors.account_name = '账号名称不能超过20个字符';
    }

    this.setData({ formErrors: errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 提交表单
   */
  async submitForm() {
    if (!this.validateForm()) {
      return;
    }

    if (this.data.submitting) {
      return;
    }

    this.setData({ submitting: true });

    try {
      const { grid_phone, grid_password, account_name, status } = this.data.formData;
      
      if (this.data.currentAccount) {
        // 编辑账号
        const updateData = {
          account_name: account_name.trim() || null
        };
        
        // 如果提供了新密码
        if (grid_password.trim()) {
          updateData.grid_password = grid_password.trim();
        }
        
        // 如果有状态字段（管理员功能）
        if (status && status !== this.data.currentAccount.Status) {
          updateData.status = status;
        }
        
        await apiCall(
          () => API.grid.updateAccount(this.data.currentAccount.id, updateData),
          '正在更新账号...',
          (data) => {
            console.log('更新账号成功:', data);
            showSuccess('更新账号成功');
            this.hideModal();
            this.loadGridAccounts();
          },
          (error) => {
            // 移除console.error以避免触发全局错误恢复机制
            showError(error.message || '更新账号失败');
          }
        );
      } else {
        // 添加账号
        await apiCall(
          () => API.grid.bindAccount({
            grid_phone: grid_phone.trim(),
            grid_password: grid_password.trim(),
            account_name: account_name.trim() || null
          }),
          '正在绑定账号...',
          (data) => {
            console.log('绑定账号成功:', data);
            // 显示具体的成功信息
            if (data && data.message) {
              showSuccess(data.message);
            } else if (data && data.msg) {
              showSuccess(data.msg);
            } else {
              showSuccess('绑定账号成功');
            }
            this.hideModal();
            this.loadGridAccounts();
          },
          (error) => {
            // 移除console.error以避免触发全局错误恢复机制
            // 显示具体的错误信息
            const errorMsg = error.message || error.toString() || '绑定账号失败';
            showError(errorMsg);
          }
        );
      }
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      showError('操作失败，请重试');
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 删除账号
   */
  deleteAccount(e) {
    const account = e.currentTarget.dataset.account;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除账号 ${account.PhoneName} 吗？删除后相关的电费历史记录也会被清除。`,
      confirmText: '删除',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(account);
        }
      }
    });
  },

  /**
   * 执行删除操作
   */
  async performDelete(account) {
    try {
      await apiCall(
        () => API.grid.unbindAccount(account.id),
        '正在删除...',
        (data) => {
          console.log('删除账号成功:', data);
          showSuccess('删除账号成功');
          this.loadGridAccounts();
        },
        (error) => {
          // 移除console.error以避免触发全局错误恢复机制
          showError(error.message || '删除账号失败');
        }
      );
    } catch (error) {
      // 移除console.error以避免触发全局错误恢复机制
      showError('删除失败，请重试');
    }
  },

  /**
   * 查看账号详情/测试连接
   */
  /**
   * 切换使用的账号
   */
  switchAccount(e) {
    const account = e.currentTarget.dataset.account;
    
    // 如果已经是使用中的账号，不需要操作
    if (account.IsActive) {
      return;
    }
    
    wx.showModal({
      title: '切换使用账号',
      content: `确定要切换到账号 ${account.PhoneName} 吗？`,
      confirmText: '确定',
      cancelText: '取消',
      success: async (res) => {
        if (res.confirm) {
          try {
            await apiCall(
              () => API.grid.setActiveAccount(account.id),
              '正在切换账号...',
              (data) => {
                console.log('切换账号成功:', data);
                showSuccess('已切换到该账号');
                // 刷新账号列表，更新所有账号的使用状态
                this.loadGridAccounts();
              },
              (error) => {
                console.log('切换账号失败:', error);
                showError(error.message || '切换失败');
              }
            );
          } catch (error) {
            console.log('切换账号异常:', error);
          }
        }
      }
    });
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    this.loadGridAccounts();
  },

  // ===== 实体电表管理方法 =====

  /**
   * 显示添加电表弹窗
   */
  showAddMeterModal(e) {
    const account = e.currentTarget.dataset.account;
    this.setData({
      showMeterModal: true,
      meterAccountId: account.id,
      meterFormData: { area: '', ip: '' },
      meterFormErrors: {},
      meterSubmitting: false
    });
  },

  /**
   * 阻止事件冒泡（空函数）
   */
  stopPropagation() {
    // 阻止事件冒泡到 overlay
  },

  /**
   * 隐藏电表弹窗
   */
  hideMeterModal() {
    this.setData({
      showMeterModal: false,
      meterAccountId: null,
      meterFormData: { area: '', ip: '' },
      meterFormErrors: {},
      meterCheckingIP: false,
      meterDetectedSN: null,
      meterIPStatus: 'idle'
    });
  },

  /**
   * 电表表单输入
   */
  onMeterInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    const update = {
      [`meterFormData.${field}`]: value,
      [`meterFormErrors.${field}`]: ''
    };
    // IP变化时重置检测状态
    if (field === 'ip') {
      update.meterIPStatus = 'idle';
      update.meterDetectedSN = null;
    }
    this.setData(update);
  },

  /**
   * 检测电表IP（添加弹窗）
   */
  async checkMeterIP() {
    const { ip } = this.data.meterFormData;
    if (!ip.trim()) {
      showError('请先输入 IP 地址');
      return;
    }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim())) {
      showError('请输入有效的 IP 地址');
      return;
    }
    this.setData({ meterCheckingIP: true, meterIPStatus: 'idle', meterDetectedSN: null });
    try {
      await apiCall(
        () => API.grid.checkMeterIP(ip.trim()),
        null,
        (resp) => {
          // apiCall 的 successCallback 接收的是 {code, msg, data} 整体
          const result = (resp && resp.data) ? resp.data : resp;
          if (result && result.online) {
            // sn 可能是数字，转为字符串以便 WXML 正确判断和显示
            const snValue = result.sn != null ? String(result.sn) : null;
            this.setData({
              meterIPStatus: 'success',
              meterDetectedSN: snValue,
              meterCheckingIP: false
            });
            showSuccess(snValue ? '电表在线，SN 获取成功！' : '电表连接正常！');
          } else {
            this.setData({ meterIPStatus: 'error', meterCheckingIP: false });
            showError('未能连接到该 IP，请检查电表状态');
          }
        },
        (error) => {
          this.setData({ meterIPStatus: 'error', meterCheckingIP: false });
          showError(error.message || '检测失败');
        }
      );
    } catch (e) {
      this.setData({ meterIPStatus: 'error', meterCheckingIP: false });
    }
  },

  /**
   * 提交添加电表
   */
  async submitMeterForm() {
    const { area, ip } = this.data.meterFormData;
    const { meterDetectedSN } = this.data;
    const errors = {};

    if (!area.trim()) {
      errors.area = '请输入所在区域';
    }
    if (!ip.trim()) {
      errors.ip = '请输入电表 IP 地址';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim())) {
      errors.ip = '请输入有效的 IP 地址';
    }

    if (Object.keys(errors).length > 0) {
      this.setData({ meterFormErrors: errors });
      return;
    }

    if (!meterDetectedSN) {
      showError('请先点击检查并获取电表 SN');
      return;
    }

    if (this.data.meterSubmitting) return;
    this.setData({ meterSubmitting: true });

    try {
      // 找到对应账号，获取当前电表列表
      const account = this.data.gridAccounts.find(a => a.id === this.data.meterAccountId);
      if (!account) {
        showError('账号不存在');
        this.setData({ meterSubmitting: false });
        return;
      }

      const currentMeters = Array.isArray(account.PhysicalMeters) ? [...account.PhysicalMeters] : [];

      // 查重：仅检查当前账号下的电表中是否已有相同 IP 或 SN
      const ipUrl = `http://${ip.trim()}/data`;
      const dupByIP = currentMeters.find(m => m.url === ipUrl);
      const dupBySN = meterDetectedSN && currentMeters.find(m => m.sn && String(m.sn) === meterDetectedSN);
      if (dupByIP) {
        showError(`该 IP (${ip.trim()}) 已被添加过，请勿重复添加`);
        this.setData({ meterSubmitting: false });
        return;
      }
      if (dupBySN) {
        showError(`该电表 SN (${meterDetectedSN}) 已被添加过，请勿重复添加`);
        this.setData({ meterSubmitting: false });
        return;
      }

      const newMeter = {
        location: area.trim(),
        url: ipUrl,
        sn: meterDetectedSN
      };
      currentMeters.push(newMeter);

      await apiCall(
        () => API.grid.updateAccount(this.data.meterAccountId, {
          physical_meters: currentMeters
        }),
        '正在添加电表...',
        (data) => {
          console.log('添加电表成功:', data);
          showSuccess('实体电表添加成功！⚡');
          this.hideMeterModal();
          this.loadGridAccounts();
        },
        (error) => {
          showError(error.message || '添加电表失败');
        }
      );
    } catch (error) {
      showError('添加失败，请重试');
    } finally {
      this.setData({ meterSubmitting: false });
    }
  },

  /**
   * 删除电表
   */
  showEditMeter(e) {
    console.log('showEditMeter 被调用', e.currentTarget.dataset);
    const { accountId, meterIndex } = e.currentTarget.dataset;
    const account = this.data.gridAccounts.find(a => a.id == accountId);
    if (!account || !Array.isArray(account.PhysicalMeters)) {
      console.log('未找到账号或电表列表');
      return;
    }
    
    const meter = account.PhysicalMeters[parseInt(meterIndex)];
    console.log('准备编辑电表', meter);
    this.setData({
      showEditMeterModal: true,
      editingMeter: { accountId, meterIndex, meter },
      editMeterFormData: {
        area: meter.location || '',
        ip: meter.url ? this.extractIP(meter.url) : ''
      }
    }, () => {
      console.log('setData 完成，showEditMeterModal:', this.data.showEditMeterModal);
    });
  },

  /**
   * 检测电表IP（编辑弹窗）
   */
  async checkEditMeterIP() {
    const { ip } = this.data.editMeterFormData;
    if (!ip.trim()) {
      showError('请先输入 IP 地址');
      return;
    }
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim())) {
      showError('请输入有效的 IP 地址');
      return;
    }
    this.setData({ editMeterCheckingIP: true, editMeterIPStatus: 'idle' });
    try {
      await apiCall(
        () => API.grid.checkMeterIP(ip.trim()),
        null,
        (resp) => {
          const result = (resp && resp.data) ? resp.data : resp;
          if (result && result.online) {
            const snValue = result.sn != null ? String(result.sn) : null;
            // 如果检测到新SN，更新到 editingMeter 中
            if (snValue && this.data.editingMeter) {
              this.setData({
                'editingMeter.meter.sn': snValue,
                editMeterIPStatus: 'success',
                editMeterCheckingIP: false
              });
            } else {
              this.setData({ editMeterIPStatus: 'success', editMeterCheckingIP: false });
            }
            showSuccess('电表连接正常！');
          } else {
            this.setData({ editMeterIPStatus: 'error', editMeterCheckingIP: false });
            showError('未能连接到该 IP，请检查电表状态');
          }
        },
        (error) => {
          this.setData({ editMeterIPStatus: 'error', editMeterCheckingIP: false });
          showError(error.message || '检测失败');
        }
      );
    } catch (e) {
      this.setData({ editMeterIPStatus: 'error', editMeterCheckingIP: false });
    }
  },

  handleUpdateMeter() {
    const { editingMeter, editMeterFormData } = this.data;
    if (!editingMeter) return;

    if (!editMeterFormData.area.trim() || !editMeterFormData.ip.trim()) {
      showError('请填写完整信息');
      return;
    }

    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(editMeterFormData.ip)) {
      showError('请输入有效的 IP 地址');
      return;
    }

    const account = this.data.gridAccounts.find(a => a.id == editingMeter.accountId);
    if (!account) return;

    const updatedMeters = account.PhysicalMeters.map((m, idx) => {
      if (idx === parseInt(editingMeter.meterIndex)) {
        const updated = {
          ...m,
          location: editMeterFormData.area,
          url: `http://${editMeterFormData.ip}/data`
        };
        // 如果 editingMeter.meter 中有 sn（可能是检测后更新的），也一并保存
        if (editingMeter.meter && editingMeter.meter.sn) {
          updated.sn = editingMeter.meter.sn;
        }
        return updated;
      }
      return m;
    });

    apiCall(
      () => API.grid.updateAccount(editingMeter.accountId, {
        physical_meters: updatedMeters
      }),
      '正在更新...',
      () => {
        showSuccess('电表信息已更新');
        this.setData({ showEditMeterModal: false, editingMeter: null, editMeterIPStatus: 'idle' });
        this.loadGridAccounts();
      },
      (error) => showError(error.message || '更新失败')
    );
  },

  showDeleteMeterConfirm(e) {
    console.log('showDeleteMeterConfirm 被调用', e.currentTarget.dataset);
    const { accountId, meterIndex } = e.currentTarget.dataset;
    const account = this.data.gridAccounts.find(a => a.id == accountId);
    if (!account || !Array.isArray(account.PhysicalMeters)) {
      console.log('未找到账号或电表列表');
      return;
    }
    
    const meter = account.PhysicalMeters[parseInt(meterIndex)];
    console.log('准备删除电表', meter);
    this.setData({
      showDeleteMeterModal: true,
      deletingMeter: {
        accountId,
        meterIndex,
        location: meter.location || '未知位置'
      }
    }, () => {
      console.log('setData 完成，showDeleteMeterModal:', this.data.showDeleteMeterModal);
    });
  },

  deleteMeter() {
    const { deletingMeter } = this.data;
    if (!deletingMeter) return;

    const account = this.data.gridAccounts.find(a => a.id == deletingMeter.accountId);
    if (!account) return;

    const updatedMeters = account.PhysicalMeters.filter((_, idx) => idx !== parseInt(deletingMeter.meterIndex));

    apiCall(
      () => API.grid.updateAccount(deletingMeter.accountId, {
        physical_meters: updatedMeters
      }),
      '正在移除...',
      () => {
        showSuccess('电表已移除');
        this.setData({ showDeleteMeterModal: false, deletingMeter: null });
        this.loadGridAccounts();
      },
      (error) => showError(error.message || '移除失败')
    );
  },

  cancelDeleteMeter() {
    this.setData({ showDeleteMeterModal: false, deletingMeter: null });
  },

  cancelEditMeter() {
    this.setData({ showEditMeterModal: false, editingMeter: null, editMeterIPStatus: 'idle', editMeterCheckingIP: false });
  },

  onEditMeterAreaInput(e) {
    this.setData({ 'editMeterFormData.area': e.detail.value });
  },

  onEditMeterIPInput(e) {
    this.setData({ 'editMeterFormData.ip': e.detail.value, editMeterIPStatus: 'idle' });
  }
});
