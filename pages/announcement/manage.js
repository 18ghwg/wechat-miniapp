const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { testModeManager } = require('../../utils/testMode');
const featureUsage = require('../../utils/feature-usage');

Page({
  data: {
    announcements: [],
    loading: false,
    showCreateDialog: false,
    showEditDialog: false,
    formData: {
      title: '',
      content: '',
      priority: 0,
      show_popup: false,
      is_active: true
    },
    editingId: null
  },

  onLoad() {
    // 记录功能使用
    featureUsage.recordFeatureUsage('announcement', '公告管理', '📢');
    
    this.loadAnnouncements();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('公告管理页面-测试模式热加载');
      this.loadAnnouncements();
    });
  },

  onShow() {
    this.loadAnnouncements();
  },

  onPullDownRefresh() {
    this.loadAnnouncements();
  },

  /**
   * 加载公告列表
   */
  loadAnnouncements() {
    this.setData({ loading: true });
    
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      // 测试模式：使用mock公告数据
      console.log('公告管理-测试模式：使用mock数据');
      const mockAnnouncements = testModeManager.getMockAnnouncements();
      
      this.setData({ 
        announcements: mockAnnouncements,
        loading: false 
      });
      
      if (wx.stopPullDownRefresh) {
        wx.stopPullDownRefresh();
      }
      
      console.log('测试模式公告数据已加载:', mockAnnouncements);
      return;
    }
    
    apiCall(
      () => API.announcement.getManageList(),
      null,
      (data) => {
        console.log('公告数据处理:', data);
        console.log('数据类型:', typeof data);
        console.log('是否数组:', Array.isArray(data));
        
        // 正确提取数组数据：data是包含{code, msg, data}的对象，真正的数组在data.data中
        const announcements = data.data || [];
        console.log('提取的公告数组:', announcements);
        console.log('公告数组类型:', typeof announcements);
        console.log('公告数组长度:', Array.isArray(announcements) ? announcements.length : 'not array');
        
        this.setData({
          announcements: announcements,
          loading: false
        });
        
        console.log('设置后的公告数据:', this.data.announcements);
      },
      (error) => {
        console.error('加载公告失败:', error);
        showError(error.message || '加载失败');
        this.setData({ loading: false });
      }
    ).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 显示创建对话框
   */
  onShowCreate() {
    this.setData({
      showCreateDialog: true,
      formData: {
        title: '',
        content: '',
        priority: 0,
        show_popup: false,
        is_active: true
      }
    });
  },

  /**
   * 显示编辑对话框
   */
  onShowEdit(e) {
    const { item } = e.currentTarget.dataset;
    this.setData({
      showEditDialog: true,
      editingId: item.id,
      formData: {
        title: item.title,
        content: item.content,
        priority: item.priority,
        show_popup: item.show_popup,
        is_active: item.is_active
      }
    });
  },

  /**
   * 关闭对话框
   */
  onCloseDialog() {
    this.setData({
      showCreateDialog: false,
      showEditDialog: false,
      editingId: null
    });
  },

  /**
   * 对话框内容点击事件 - 阻止冒泡
   */
  onDialogContentTap() {
    // 阻止事件冒泡到父级，防止关闭对话框
    // 这个函数的存在就是为了停止事件传播
  },

  /**
   * 输入处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 开关处理
   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 优先级选择
   */
  onPriorityChange(e) {
    const { value } = e.detail;
    this.setData({
      'formData.priority': parseInt(value)
    });
  },

  /**
   * 创建公告
   */
  onCreateSubmit() {
    const { formData } = this.data;
    
    if (!formData.title.trim()) {
      showError('请输入公告标题');
      return;
    }
    
    if (!formData.content.trim()) {
      showError('请输入公告内容');
      return;
    }
    
    apiCall(
      () => API.announcement.create(formData),
      '创建中...',
      (data) => {
        showSuccess('公告创建成功');
        this.onCloseDialog();
        this.loadAnnouncements();
      },
      (error) => {
        showError(error.message || '创建失败');
      }
    );
  },

  /**
   * 更新公告
   */
  onEditSubmit() {
    const { formData, editingId } = this.data;
    
    if (!formData.title.trim()) {
      showError('请输入公告标题');
      return;
    }
    
    if (!formData.content.trim()) {
      showError('请输入公告内容');
      return;
    }
    
    apiCall(
      () => API.announcement.update(editingId, formData),
      '更新中...',
      (data) => {
        showSuccess('公告更新成功');
        this.onCloseDialog();
        this.loadAnnouncements();
      },
      (error) => {
        showError(error.message || '更新失败');
      }
    );
  },

  /**
   * 删除公告
   */
  onDelete(e) {
    const { item } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除公告"${item.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          apiCall(
            () => API.announcement.delete(item.id),
            '删除中...',
            (data) => {
              showSuccess('公告删除成功');
              this.loadAnnouncements();
            },
            (error) => {
              showError(error.message || '删除失败');
            }
          );
        }
      }
    });
  },

  /**
   * 切换公告状态
   */
  onToggleStatus(e) {
    const { item } = e.currentTarget.dataset;
    
    apiCall(
      () => API.announcement.update(item.id, { is_active: !item.is_active }),
      '更新中...',
      (data) => {
        showSuccess(item.is_active ? '公告已禁用' : '公告已启用');
        this.loadAnnouncements();
      },
      (error) => {
        showError(error.message || '更新失败');
      }
    );
  }
});
