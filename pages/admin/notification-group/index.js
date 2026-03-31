const { API, request, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');
const { environmentManager } = require('../../../utils/environment');
const featureUsage = require('../../../utils/feature-usage');

Page({
  data: {
    notificationGroups: [],    // 通知群列表
    loading: false,           // 加载状态
    
    // 弹窗相关
    showPopup: false,
    popupTitle: '',
    popupMode: '',           // 'add' | 'edit'
    currentGroup: null,
    
    // 表单数据
    formData: {
      GroupName: '',
      WxQunID: '',
      Status: '正常'
    },
    
    // 确认弹窗
    showConfirmDialog: false,
    confirmTitle: '',
    confirmMessage: '',
    confirmAction: null,
    
    // 状态选项
    statusOptions: ['正常', '禁用'],
    statusIndex: 0,
    showStatusDropdown: false
  },

  onLoad() {
    console.log('通知群管理页面加载');
    
    // 记录功能使用
    featureUsage.recordFeatureUsage('notification-group', '通知群管理', '🔔');
    
    // 检查管理员权限
    if (!this.checkAdminPermission()) {
      return; // 权限检查失败，页面会自动跳转
    }
    
    // 强制刷新环境检测
    environmentManager.forceRefresh();
    
    // 环境检测调试
    this.debugEnvironment();
    
    this.loadNotificationGroups();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, () => {
      console.log('通知群管理页面-测试模式热加载');
      this.loadNotificationGroups();
    });
  },

  // 检查管理员权限
  checkAdminPermission() {
    try {
      // 获取当前用户信息
      const userInfo = wx.getStorageSync('userInfo');
      
      if (!userInfo) {
        console.log('❌ 未获取到用户信息，跳转到登录页');
        showError('请先登录');
        wx.reLaunch({ url: '/pages/login/index' });
        return false;
      }
      
      // 检查是否为管理员
      const isAdmin = this.isAdminUser(userInfo);
      
      if (!isAdmin) {
        console.log('❌ 非管理员用户，无权访问通知群管理', userInfo);
        showError('权限不足，需要管理员权限');
        wx.navigateBack({ delta: 1 });
        return false;
      }
      
      console.log('✅ 管理员权限验证通过');
      return true;
    } catch (error) {
      console.error('权限检查失败:', error);
      showError('权限验证失败');
      wx.navigateBack({ delta: 1 });
      return false;
    }
  },

  // 判断是否为管理员（与用户中心保持一致）
  isAdminUser(userInfo) {
    if (!userInfo) {
      return false;
    }

    if (userInfo.is_admin) {
      return true;
    }

    if (userInfo.user_level && String(userInfo.user_level).toLowerCase() === 'admin') {
      return true;
    }

    if (Array.isArray(userInfo.permissions)) {
      return userInfo.permissions.some(perm => {
        if (!perm) return false;
        if (typeof perm === 'string') {
          return perm.toLowerCase() === 'admin';
        }
        const code = perm.code || perm.permission_code;
        return code && String(code).toLowerCase() === 'admin';
      });
    }

    return false;
  },

  // 环境检测调试方法
  debugEnvironment() {
    // 使用全局环境管理器
    const envInfo = environmentManager.getEnvironmentInfo();
    
    console.log('🔧 通知群管理页面 - 环境信息:', envInfo);
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadNotificationGroups();
  },

  onPullDownRefresh() {
    this.loadNotificationGroups();
  },

  // 加载通知群列表
  async loadNotificationGroups() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      console.log('开始加载通知群列表...');
      
      // 检查是否为测试模式
      const isTestMode = testModeManager.isTestMode();
      
      let result;
      if (isTestMode) {
        console.log('🧪 测试模式：使用mock通知群数据');
        // 测试模式：使用mock数据
        result = await testModeManager.simulateNotificationGroupOperation('list');
      } else {
        // 正常模式：调用API
        result = await apiCall(
          () => request('/notification-groups', 'GET'),
          null
        );
      }
      
      if (result && result.code === 200 && Array.isArray(result.data)) {
        console.log(`通知群列表加载成功: ${result.data.length} 个群${isTestMode ? '(测试模式)' : ''}`);
        
        // 按添加时间倒序排序（处理iOS日期格式兼容性）
        const sortedGroups = result.data.sort((a, b) => {
          // 将 "yyyy-MM-dd HH:mm:ss" 格式转换为 "yyyy/MM/dd HH:mm:ss" 以兼容iOS
          const timeA = new Date(a.AddTime.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
          const timeB = new Date(b.AddTime.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3'));
          return timeB - timeA;
        });
        
        // 检查是否在编辑模式下，避免关闭弹窗
        const currentShowPopup = this.data.showPopup;
        console.log('📊 数据加载完成，当前弹窗状态:', currentShowPopup);
        
        this.setData({
          notificationGroups: sortedGroups
        });
        
        console.log('📊 数据更新完成，弹窗状态保持:', this.data.showPopup);
      } else {
        console.warn('通知群列表加载失败:', result);
        showError(isTestMode ? '加载测试数据失败' : '加载通知群列表失败');
      }
    } catch (error) {
      console.error('加载通知群列表错误:', error);
      showError('网络错误，请稍后重试');
    } finally {
      this.setData({ loading: false });
      
      // 停止下拉刷新
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  },

  // 添加通知群
  addNotificationGroup() {
    this.setData({
      showPopup: true,
      popupTitle: '添加通知群',
      popupMode: 'add',
      currentGroup: null,
      formData: {
        GroupName: '',
        WxQunID: '',
        Status: '正常'
      },
      statusIndex: 0,
      showStatusDropdown: false
    });
  },

  // 编辑通知群
  editNotificationGroup(e) {
    console.log('📝 开始编辑通知群');
    const { group } = e.currentTarget.dataset;
    const statusIndex = this.data.statusOptions.indexOf(group.Status);
    
    console.log('📝 群信息:', group);
    console.log('📝 状态选项:', this.data.statusOptions);
    console.log('📝 状态索引:', statusIndex);
    
    this.setData({
      showPopup: true,
      popupTitle: '编辑通知群',
      popupMode: 'edit',
      currentGroup: group,
      formData: {
        GroupName: group.GroupName,
        WxQunID: group.WxQunID,
        Status: group.Status
      },
      statusIndex: statusIndex >= 0 ? statusIndex : 0,
      showStatusDropdown: false
    });
    
    console.log('📝 弹窗已打开，当前数据:', this.data);
  },

  // 删除通知群
  deleteNotificationGroup(e) {
    const { group } = e.currentTarget.dataset;
    
    this.setData({
      showConfirmDialog: true,
      confirmTitle: '确认删除',
      confirmMessage: `确定要删除群"${group.GroupName}"吗？\n删除后将无法恢复。`,
      confirmAction: () => this.performDelete(group.id)
    });
  },

  // 执行删除操作
  async performDelete(groupId) {
    try {
      console.log('删除通知群:', groupId);
      
      const isTestMode = testModeManager.isTestMode();
      let result;
      
      if (isTestMode) {
        console.log('🧪 测试模式：模拟通知群删除操作');
        // 测试模式：模拟删除
        result = await testModeManager.simulateNotificationGroupOperation('delete', { ID: groupId });
      } else {
        // 正常模式：调用API
        result = await apiCall(
          () => request(`/notification-groups/${groupId}`, 'DELETE'),
          null
        );
      }
      
      if (result && result.code === 200) {
        showSuccess('删除成功' + (isTestMode ? '(测试模式)' : ''));
        this.loadNotificationGroups();
      } else {
        showError((result ? result.msg : undefined) || '删除失败');
      }
    } catch (error) {
      console.error('删除通知群错误:', error);
      showError('删除失败，请稍后重试');
    }
  },

  // 设置为当前通知群
  setAsActiveGroup(e) {
    const { group } = e.currentTarget.dataset;
    
    if (group.IsActive) {
      wx.showToast({
        title: '该群已是当前通知群',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showConfirmDialog: true,
      confirmTitle: '确认设置',
      confirmMessage: `确定将"${group.GroupName}"设置为当前通知群吗？\n其他群的激活状态将被取消。`,
      confirmAction: () => this.performSetActive(group.id)
    });
  },

  // 执行设置激活操作
  async performSetActive(groupId) {
    try {
      console.log('设置激活通知群:', groupId);
      
      const isTestMode = testModeManager.isTestMode();
      let result;
      
      if (isTestMode) {
        console.log('🧪 测试模式：模拟设置激活通知群操作');
        // 测试模式：模拟设置激活
        const mockData = { ID: groupId, IsActive: true };
        result = await testModeManager.simulateNotificationGroupOperation('toggle_active', mockData);
      } else {
        // 正常模式：调用API
        result = await apiCall(
          () => request(`/notification-groups/${groupId}/set-active`, 'PUT'),
          null
        );
      }
      
      if (result && result.code === 200) {
        showSuccess('设置成功' + (isTestMode ? '(测试模式)' : ''));
        this.loadNotificationGroups();
      } else {
        showError((result ? result.msg : undefined) || '设置失败');
      }
    } catch (error) {
      console.error('设置激活通知群错误:', error);
      showError('设置失败，请稍后重试');
    }
  },

  // 表单输入处理
  onGroupNameChange(e) {
    this.setData({
      'formData.GroupName': e.detail.value
    });
  },

  onWxQunIDChange(e) {
    this.setData({
      'formData.WxQunID': e.detail.value
    });
  },

  // 切换状态下拉框显示
  toggleStatusDropdown(e) {
    console.log('切换状态下拉框:', !this.data.showStatusDropdown);
    // 阻止事件冒泡，防止触发弹窗关闭
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    this.setData({
      showStatusDropdown: !this.data.showStatusDropdown
    });
  },

  // 选择状态
  selectStatus(e) {
    const { index, status } = e.currentTarget.dataset;
    console.log('选择状态:', status, 'index:', index);
    // 阻止事件冒泡，防止触发弹窗关闭
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    this.setData({
      statusIndex: parseInt(index),
      'formData.Status': status,
      showStatusDropdown: false
    });
  },

  // 保存通知群
  async saveNotificationGroup() {
    const { formData, popupMode, currentGroup } = this.data;
    
    // 表单验证
    if (!formData.GroupName.trim()) {
      showError('请输入群名称');
      return;
    }
    
    if (!formData.WxQunID.trim()) {
      showError('请输入微信群号ID');
      return;
    }
    
    try {
      console.log('保存通知群:', { formData, popupMode });
      
      const isTestMode = testModeManager.isTestMode();
      let result;
      
      if (isTestMode) {
        console.log('🧪 测试模式：模拟通知群保存操作');
        // 测试模式：模拟操作
        const operation = popupMode === 'add' ? 'create' : 'update';
        const mockData = popupMode === 'add' ? formData : Object.assign({}, currentGroup, formData);
        result = await testModeManager.simulateNotificationGroupOperation(operation, mockData);
      } else {
        // 正常模式：调用API
        if (popupMode === 'add') {
          result = await apiCall(
            () => request('/notification-groups', 'POST', formData),
            null
          );
        } else {
          result = await apiCall(
            () => request(`/notification-groups/${currentGroup.id}`, 'PUT', formData),
            null
          );
        }
      }
      
      if (result && result.code === 200) {
        const successMsg = popupMode === 'add' ? '添加成功' : '更新成功';
        showSuccess(successMsg + (isTestMode ? '(测试模式)' : ''));
        this.closePopup();
        this.loadNotificationGroups();
      } else {
        showError((result ? result.msg : undefined) || '保存失败');
      }
    } catch (error) {
      console.error('保存通知群错误:', error);
      showError('保存失败，请稍后重试');
    }
  },

  // 关闭弹窗
  closePopup(e) {
    console.log('🚨 关闭弹窗被调用', e);
    
    // 如果有事件对象，检查是否应该关闭
    if (e) {
      // 检查是否有明确的关闭标识
      const hasCloseFlag = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.closePopup;
      
      // 检查是否是遮罩层点击（target 和 currentTarget 相同）
      const isOverlayClick = e.target === e.currentTarget;
      
      // 只有明确的关闭标识或遮罩层点击才关闭
      if (!hasCloseFlag && !isOverlayClick) {
        console.log('🚨 非关闭操作，忽略');
        return;
      }
    }
    
    console.log('✅ 执行关闭弹窗操作');
    this.setData({
      showPopup: false,
      popupTitle: '',
      popupMode: '',
      currentGroup: null,
      formData: {
        GroupName: '',
        WxQunID: '',
        Status: '正常'
      },
      statusIndex: 0,
      showStatusDropdown: false
    });
  },

  // 关闭确认对话框
  closeConfirmDialog() {
    this.setData({
      showConfirmDialog: false,
      confirmTitle: '',
      confirmMessage: '',
      confirmAction: null
    });
  },

  // 确认对话框确认按钮
  onConfirmDialogConfirm() {
    const { confirmAction } = this.data;
    if (confirmAction && typeof confirmAction === 'function') {
      confirmAction();
    }
    this.closeConfirmDialog();
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '未知';
    
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hour}:${minute}`;
    } catch (error) {
      console.warn('时间格式化错误:', error, timeStr);
      return timeStr;
    }
  }
});
