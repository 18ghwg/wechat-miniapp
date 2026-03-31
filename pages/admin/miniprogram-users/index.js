// pages/admin/miniprogram-users/index.js
const { API, apiCall, showError, showSuccess, showLoading, hideLoading } = require('../../../utils/api');
const avatarGenerator = require('../../../utils/avatar-generator');  // 导入的是实例，不是类
const { testModeManager } = require('../../../utils/testMode');
const featureUsage = require('../../../utils/feature-usage');

Page({
  data: {
    // 用户列表数据
    users: [],
    pagination: null,
    stats: null,
    loading: false,
    
    // 搜索和筛选
    searchKeyword: '',
    currentPage: 1,
    perPage: 20,
    
    // 权限控制
    isAdmin: false,
    currentUserOpenid: '',
    
    // 头像生成相关
    avatarGenerator: null,
    userAvatars: {}, // 存储用户生成的头像 {userId: avatarUrl}
    
    // 弹窗控制
    showCreateModal: false,
    showEditModal: false,
    showDetailModal: false,
    selectedUser: null,
    
    // 表单数据
    userLevelOptions: [
      { value: 'user', label: '普通用户' },
      { value: 'viewer', label: '访客' },
      { value: 'admin', label: '管理员' }
    ],
    
    // 创建用户表单
    createForm: {
      nickname: '',
      real_name: '',
      user_level: 'user',
      userLevelIndex: 0,
      errors: {},
      submitting: false
    },
    
    // 编辑用户表单
    editForm: {
      userId: null,
      nickname: '',
      real_name: '',
      user_level: 'user',
      userLevelIndex: 0,
      is_active: true,
      errors: {},
      submitting: false
    }
  },

  onLoad() {
    // 记录功能使用
    featureUsage.recordFeatureUsage('user-management', '小程序账号管理', '👥');
    
    this.checkAdminPermission();
    
    // 初始化头像生成器
    this.initAvatarGenerator();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('用户管理页面-测试模式热加载');
      this.loadUsers();
    });
  },

  onShow() {
    // 如果已经加载过数据，刷新一下
    if (this.data.users.length > 0) {
      this.loadUsers();
    }
  },

  onPullDownRefresh() {
    this.loadUsers().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 检查管理员权限
   */
  async checkAdminPermission() {
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      const openid = wx.getStorageSync('openid') || '';
      
      // 检查是否是管理员
      const isAdmin = userInfo.is_admin || 
                     (userInfo.permissions ? userInfo.permissions.includes('admin') : false) ||
                     userInfo.user_level === 'admin';
      
      this.setData({ 
        isAdmin,
        currentUserOpenid: openid
      });
      
      if (!isAdmin) {
        showError('权限不足，需要管理员权限');
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
        return;
      }
      
      // 加载用户列表
      this.loadUsers();
      
    } catch (error) {
      console.error('权限检查异常:', error);
      showError('权限检查失败');
    }
  },

  /**
   * 加载用户列表
   */
  async loadUsers(page = 1) {
    if (!this.data.isAdmin) return;
    
    this.setData({ loading: true });

    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('用户管理-测试模式：使用mock数据');
      setTimeout(() => {
        const mockUserList = testModeManager.getMockUserList();
        
        this.setData({
          users: mockUserList.users,
          pagination: mockUserList.pagination,
          loading: false
        });
        
        // 计算统计数据
        this.calculateStats();
        
        // 生成头像
        this.generateAvatarsForUsers();
        
        if (wx.stopPullDownRefresh) {
          wx.stopPullDownRefresh();
        }
      }, 800);
      return;
    }

    try {
      const params = {
        page: page,
        per_page: this.data.perPage
      };
      
      if (this.data.searchKeyword) {
        params.search = this.data.searchKeyword;
      }

      const result = await apiCall(
        () => API.miniprogramAdmin.getUsers(params),
        null,
        (data) => {
          console.log('获取用户列表成功:', data);
          console.log('数据类型:', typeof data);
          console.log('是否包含data字段:', !!data.data);
          
          // 正确提取数据：data是包含{code, msg, data}的对象，真正的数据在data.data中
          const responseData = data.data || {};
          const users = responseData.users || [];
          const pagination = responseData.pagination || null;
          
          console.log('提取的用户数组:', users);
          console.log('用户数组长度:', users.length);
          console.log('分页信息:', pagination);
          
          // 计算统计信息
          const stats = this.calculateStats(users);
          
          this.setData({
            users: users,
            pagination: pagination,
            stats: stats,
            currentPage: page,
            loading: false
          });
          
          console.log('设置后的用户数据:', this.data.users);
          console.log('设置后的统计信息:', this.data.stats);
          
          // 为所有用户生成头像
          this.generateAvatarsForUsers(users);
        },
        (error) => {
          console.error('获取用户列表失败:', error);
          this.setData({ loading: false });
          showError(error.message || '获取用户列表失败');
        }
      );
    } catch (error) {
      console.error('加载用户列表异常:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 计算用户统计信息
   */
  calculateStats(users) {
    // 添加空值检查
    if (!users || !Array.isArray(users)) {
      return {
        total: 0,
        admin_count: 0,
        user_count: 0,
        viewer_count: 0
      };
    }

    const stats = {
      total: users.length,
      admin_count: 0,
      user_count: 0,
      viewer_count: 0
    };

    users.forEach(user => {
      switch (user.user_level) {
        case 'admin':
          stats.admin_count++;
          break;
        case 'viewer':
          stats.viewer_count++;
          break;
        default:
          stats.user_count++;
          break;
      }
    });

    return stats;
  },

  /**
   * 搜索输入处理
   */
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  onSearchConfirm() {
    this.setData({ currentPage: 1 });
    this.loadUsers(1);
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    this.loadUsers(this.data.currentPage);
  },

  /**
   * 切换页面
   */
  changePage(e) {
    const page = e.currentTarget.dataset.page;
    if (page >= 1 && page <= this.data.pagination.pages) {
      this.loadUsers(page);
    }
  },

  /**
   * 显示用户详情
   */
  showUserDetail(e) {
    const user = e.currentTarget.dataset.user;
    this.setData({
      selectedUser: user,
      showDetailModal: true
    });
  },

  hideUserDetailModal() {
    this.setData({
      selectedUser: null,
      showDetailModal: false
    });
  },

  /**
   * 显示创建用户弹窗
   */
  showCreateUserModal() {
    this.setData({
      showCreateModal: true,
      createForm: {
        nickname: '',
        real_name: '',
        user_level: 'user',
        userLevelIndex: 0,
        errors: {},
        submitting: false
      }
    });
  },

  hideCreateUserModal() {
    this.setData({
      showCreateModal: false
    });
  },

  /**
   * 创建表单输入处理
   */
  onCreateFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`createForm.${field}`]: value,
      [`createForm.errors.${field}`]: ''
    });
  },

  /**
   * 创建用户级别选择
   */
  onCreateUserLevelChange(e) {
    const index = parseInt(e.detail.value);
    const userLevel = this.data.userLevelOptions[index];
    
    this.setData({
      'createForm.userLevelIndex': index,
      'createForm.user_level': userLevel.value,
      'createForm.errors.user_level': ''
    });
  },

  /**
   * 验证创建表单
   */
  validateCreateForm() {
    const { nickname, real_name, user_level } = this.data.createForm;
    const errors = {};

    // 验证昵称
    if (!nickname.trim()) {
      errors.nickname = '昵称不能为空';
    }

    // 验证真实姓名（如果填写）
    if (real_name.trim()) {
      const nameRegex = /^[\u4e00-\u9fa5]{2,10}$/;
      if (!nameRegex.test(real_name.trim())) {
        errors.real_name = '请输入2-10个汉字的真实姓名';
      }
    }

    // 验证用户级别
    if (!user_level || !['admin', 'user', 'viewer'].includes(user_level)) {
      errors.user_level = '请选择有效的用户级别';
    }

    this.setData({ 'createForm.errors': errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 提交创建用户
   */
  async submitCreateUser() {
    if (!this.validateCreateForm()) {
      return;
    }

    if (this.data.createForm.submitting) {
      return;
    }

    this.setData({ 'createForm.submitting': true });

    try {
      const { nickname, real_name, user_level } = this.data.createForm;
      
      const userData = {
        nickname: nickname.trim(),
        user_level: user_level
      };

      if (real_name.trim()) {
        userData.real_name = real_name.trim();
      }

      await apiCall(
        () => API.miniprogramAdmin.createUser(userData),
        '正在创建用户...',
        (data) => {
          console.log('创建用户成功:', data);
          showSuccess('创建用户成功');
          this.hideCreateUserModal();
          this.loadUsers(this.data.currentPage);
        },
        (error) => {
          console.error('创建用户失败:', error);
          showError(error.message || '创建用户失败');
        }
      );
    } catch (error) {
      console.error('创建用户异常:', error);
      showError('创建失败，请重试');
    } finally {
      this.setData({ 'createForm.submitting': false });
    }
  },

  /**
   * 显示编辑用户弹窗
   */
  showEditUserModal(e) {
    const user = e.currentTarget.dataset.user;
    
    // 找到用户级别的索引
    const userLevelIndex = this.data.userLevelOptions.findIndex(
      option => option.value === user.user_level
    );

    this.setData({
      showEditModal: true,
      editForm: {
        userId: user.id,
        nickname: user.nickname || '',
        real_name: user.real_name || '',
        user_level: user.user_level,
        userLevelIndex: userLevelIndex >= 0 ? userLevelIndex : 0,
        is_active: user.is_active,
        errors: {},
        submitting: false
      }
    });
  },

  hideEditUserModal() {
    this.setData({
      showEditModal: false
    });
  },

  /**
   * 编辑表单输入处理
   */
  onEditFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`editForm.${field}`]: value,
      [`editForm.errors.${field}`]: ''
    });
  },

  /**
   * 编辑用户级别选择
   */
  onEditUserLevelChange(e) {
    const index = parseInt(e.detail.value);
    const userLevel = this.data.userLevelOptions[index];
    
    this.setData({
      'editForm.userLevelIndex': index,
      'editForm.user_level': userLevel.value,
      'editForm.errors.user_level': ''
    });
  },

  /**
   * 编辑激活状态变更
   */
  onEditActiveChange(e) {
    this.setData({
      'editForm.is_active': e.detail.value
    });
  },

  /**
   * 验证编辑表单
   */
  validateEditForm() {
    const { nickname, real_name, user_level } = this.data.editForm;
    const errors = {};

    // 验证昵称
    if (!nickname.trim()) {
      errors.nickname = '昵称不能为空';
    }

    // 验证真实姓名（如果填写）
    if (real_name.trim()) {
      const nameRegex = /^[\u4e00-\u9fa5]{2,10}$/;
      if (!nameRegex.test(real_name.trim())) {
        errors.real_name = '请输入2-10个汉字的真实姓名';
      }
    }

    // 验证用户级别
    if (!user_level || !['admin', 'user', 'viewer'].includes(user_level)) {
      errors.user_level = '请选择有效的用户级别';
    }

    this.setData({ 'editForm.errors': errors });
    return Object.keys(errors).length === 0;
  },

  /**
   * 提交编辑用户
   */
  async submitEditUser() {
    if (!this.validateEditForm()) {
      return;
    }

    if (this.data.editForm.submitting) {
      return;
    }

    this.setData({ 'editForm.submitting': true });

    try {
      const { userId, nickname, real_name, user_level, is_active } = this.data.editForm;
      
      const updateData = {
        nickname: nickname.trim(),
        user_level: user_level,
        is_active: is_active
      };

      if (real_name.trim()) {
        updateData.real_name = real_name.trim();
      } else {
        updateData.real_name = null;
      }

      await apiCall(
        () => API.miniprogramAdmin.updateUser(userId, updateData),
        '正在更新用户...',
        (data) => {
          console.log('更新用户成功:', data);
          showSuccess('更新用户成功');
          this.hideEditUserModal();
          this.loadUsers(this.data.currentPage);
        },
        (error) => {
          console.error('更新用户失败:', error);
          showError(error.message || '更新用户失败');
        }
      );
    } catch (error) {
      console.error('更新用户异常:', error);
      showError('更新失败，请重试');
    } finally {
      this.setData({ 'editForm.submitting': false });
    }
  },

  /**
   * 删除用户
   */
  deleteUser(e) {
    const user = e.currentTarget.dataset.user;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除用户"${user.nickname}"吗？删除后用户的所有数据将被清除，此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteUser(user);
        }
      }
    });
  },

  /**
   * 执行删除用户操作
   */
  async performDeleteUser(user) {
    try {
      await apiCall(
        () => API.miniprogramAdmin.deleteUser(user.id),
        '正在删除用户...',
        (data) => {
          console.log('删除用户成功:', data);
          showSuccess('删除用户成功');
          this.loadUsers(this.data.currentPage);
        },
        (error) => {
          console.error('删除用户失败:', error);
          showError(error.message || '删除用户失败');
        }
      );
    } catch (error) {
      console.error('删除用户异常:', error);
      showError('删除失败，请重试');
    }
  },

  /**
   * 查看用户权限
   */
  async viewUserPermissions(e) {
    const user = e.currentTarget.dataset.user;
    
    try {
      showLoading('获取权限信息...');
      
      const result = await API.miniprogramAdmin.getUserPermissions(user.id);
      
      hideLoading();
      
      const permissionsInfo = result || {};
      const userInfo = permissionsInfo.user_info || {};
      const permissions = permissionsInfo.permissions || {};
      const webUser = permissionsInfo.web_user || null;
      
      let content = `用户权限详情：\n\n`;
      content += `用户级别：${userInfo.user_level === 'admin' ? '管理员' : userInfo.user_level === 'viewer' ? '访客' : '普通用户'}\n`;
      content += `账号状态：${userInfo.is_active ? '已激活' : '已禁用'}\n`;
      content += `权限来源：${permissions.permission_source || '未知'}\n`;
      content += `最终权限：${permissions.is_admin ? '管理员' : '普通用户'}\n`;
      
      if (webUser) {
        content += `\nWeb账号信息：\n`;
        content += `用户名：${webUser.username}\n`;
        content += `Web级别：${webUser.user_level}\n`;
        content += `Web状态：${webUser.is_active ? '激活' : '禁用'}\n`;
      }
      
      if (permissions.permissions_list && permissions.permissions_list.length > 0) {
        content += `\n具体权限：${permissions.permissions_list.join(', ')}`;
      }

      wx.showModal({
        title: '用户权限',
        content: content,
        showCancel: false,
        confirmText: '知道了'
      });
      
    } catch (error) {
      hideLoading();
      console.error('获取用户权限失败:', error);
      showError('获取权限信息失败');
    }
  },

  /**
   * 查看用户操作日志
   */
  async viewUserLogs(e) {
    const user = e.currentTarget.dataset.user;
    
    try {
      showLoading('获取操作日志...');
      
      const result = await API.miniprogramAdmin.getUserLogs(user.id, { per_page: 10 });
      
      hideLoading();
      
      const logsData = (result ? result.logs : undefined) || [];
      
      if (logsData.length === 0) {
        wx.showModal({
          title: '操作日志',
          content: '该用户暂无操作日志记录',
          showCancel: false,
          confirmText: '知道了'
        });
        return;
      }
      
      let content = `最近操作记录（最多显示10条）：\n\n`;
      logsData.forEach((log, index) => {
        content += `${index + 1}. ${log.operation_type}\n`;
        content += `   ${log.operation_detail || '无详情'}\n`;
        content += `   时间：${log.create_time}\n`;
        if (log.ip_address) {
          content += `   IP：${log.ip_address}\n`;
        }
        content += `\n`;
      });

      wx.showModal({
        title: '操作日志',
        content: content,
        showCancel: false,
        confirmText: '知道了'
      });
      
    } catch (error) {
      hideLoading();
      console.error('获取用户操作日志失败:', error);
      showError('获取操作日志失败');
    }
  },

  /**
   * 初始化头像生成器（使用全局单例）
   */
  initAvatarGenerator() {
    return new Promise((resolve) => {
      this.setData({ 
        avatarGenerator: avatarGenerator,
        avatarGeneratorReady: true 
      });
      console.log('miniprogram-users 头像生成器初始化完成');
      resolve();
    });
  },

  /**
   * 为用户列表中的所有用户生成头像
   */
  generateAvatarsForUsers(users) {
    if (!users || users.length === 0) return;
    
    console.log('miniprogram-users generateAvatarsForUsers - 开始为用户列表生成头像');
    
    // 确保头像生成器已经初始化
    const tryGenerate = () => {
      if (!this.data.avatarGenerator) {
        console.log('miniprogram-users generateAvatarsForUsers - 头像生成器未初始化，延迟重试');
        setTimeout(tryGenerate, 100);
        return;
      }
      
      users.forEach((user, index) => {
        // 延迟生成，避免一次性创建太多Canvas
        setTimeout(() => {
          this.generateAvatarForUser(user);
        }, index * 100); // 每个用户延迟100ms
      });
    };
    
    tryGenerate();
  },

  /**
   * 为单个用户生成头像
   */
  generateAvatarForUser(user) {
    const { avatarGenerator, userAvatars } = this.data;
    
    if (!avatarGenerator || !user) {
      console.log('miniprogram-users generateAvatarForUser - 参数不足:', { hasGenerator: !!avatarGenerator, hasUser: !!user });
      // 设置默认头像
      if (user && user.id) {
        this.setUserAvatar(user.id, '/static/default-avatar.svg');
      }
      return;
    }

    // 检查是否已经生成过
    if (userAvatars[user.id]) {
      console.log('miniprogram-users generateAvatarForUser - 用户', user.id, '头像已存在');
      return;
    }

    console.log('miniprogram-users generateAvatarForUser - 为用户生成头像:', user.id, user.nickname);
    
    // 优先使用真实姓名的最后一个字，否则使用昵称的第一个字
    let displayChar;
    let sourceText;
    
    if (user.real_name && user.real_name.trim() !== '') {
      sourceText = user.real_name;
      displayChar = sourceText.charAt(sourceText.length - 1);
      console.log('miniprogram-users generateAvatarForUser - 使用真实姓名最后一个字:', displayChar);
    } else {
      sourceText = user.nickname || user.web_username || '用户';
      displayChar = avatarGenerator.getFirstChar(sourceText);
      console.log('miniprogram-users generateAvatarForUser - 使用昵称第一个字:', displayChar);
    }
    
    const cacheKey = `${user.id || 'default'}_${sourceText}`;
    
    // 检查缓存
    const cachedAvatar = avatarGenerator.getCachedAvatar(cacheKey);
    if (cachedAvatar) {
      console.log('miniprogram-users generateAvatarForUser - 使用缓存头像:', user.id);
      this.setUserAvatar(user.id, cachedAvatar);
      return;
    }

    // 直接生成头像，不依赖Canvas元素查询（Canvas元素在WXML中已存在）
    this.generateTextAvatarForUser(user, displayChar, sourceText, cacheKey);
  },

  /**
   * 生成文字头像 - 使用AvatarGenerator统一方法
   */
  generateTextAvatarForUser(user, displayChar, sourceText, cacheKey) {
    const { avatarGenerator } = this.data;
    
    if (!avatarGenerator) {
      console.error('miniprogram-users generateTextAvatarForUser - avatarGenerator未初始化');
      this.setUserAvatar(user.id, '/static/default-avatar.svg');
      return;
    }
    
    const canvasId = `avatarCanvas_${user.id}`;
    
    try {
      const colorIndex = avatarGenerator.generateColorIndex(user, sourceText);
      const backgroundColor = avatarGenerator.defaultColors[colorIndex % avatarGenerator.defaultColors.length];
      
      console.log('miniprogram-users generateTextAvatarForUser - 开始生成头像:', {
        userId: user.id,
        canvasId: canvasId,
        displayChar: displayChar,
        backgroundColor: backgroundColor
      });
      
      // 使用AvatarGenerator的drawTextAvatar方法 (Canvas 2D版本)
      avatarGenerator.drawTextAvatar(
        `#${canvasId}`,  // Canvas选择器（需要加#）
        this,            // 组件实例
        displayChar, 
        backgroundColor, 
        120, 
        (result) => {
          if (result && result.tempFilePath && result.tempFilePath !== '/static/default-avatar.svg') {
            console.log('miniprogram-users generateTextAvatarForUser - 头像生成成功:', user.id, result.tempFilePath);
            
            // 缓存头像
            avatarGenerator.cacheAvatar(cacheKey, result.tempFilePath);
            
            // 设置用户头像
            this.setUserAvatar(user.id, result.tempFilePath);
          } else {
            console.warn('miniprogram-users generateTextAvatarForUser - 头像生成失败，使用默认头像:', user.id);
            this.setUserAvatar(user.id, '/static/default-avatar.svg');
          }
        }
      );
      
    } catch (error) {
      console.error('miniprogram-users generateTextAvatarForUser - 绘制失败:', user.id, error);
      // 使用默认头像作为fallback
      this.setUserAvatar(user.id, '/static/default-avatar.svg');
    }
  },

  /**
   * 设置用户头像URL
   */
  setUserAvatar(userId, avatarUrl) {
    const { userAvatars } = this.data;
    userAvatars[userId] = avatarUrl;
    
    this.setData({
      userAvatars: userAvatars
    });
    
    console.log('miniprogram-users setUserAvatar - 设置用户头像:', userId, '共', Object.keys(userAvatars).length, '个用户有头像');
  },

  /**
   * 获取用户头像URL
   */
  getUserAvatarUrl(user) {
    if (!user) return '/static/default-avatar.svg';
    
    const { userAvatars } = this.data;
    
    // 返回生成的头像
    if (userAvatars[user.id]) {
      return userAvatars[user.id];
    }
    
    // 返回默认头像
    return '/static/default-avatar.svg';
  },

  /**
   * 页面卸载时清理资源
   */
  onUnload() {
    // 清理头像生成器资源
    if (this.data.avatarGenerator && typeof this.data.avatarGenerator.cleanup === 'function') {
      this.data.avatarGenerator.cleanup();
    }
  },

  /**
   * 阻止事件冒泡
   */
  preventBubble() {
    // 空函数，用于阻止事件冒泡
  }
});
