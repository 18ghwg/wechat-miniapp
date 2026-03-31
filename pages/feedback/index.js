const { API, apiCall, showError, showSuccess } = require('../../utils/api');

Page({
  data: {
    feedbackSetting: null,
    isEnabled: true,
    formData: {
      title: '',
      content: '',
      feedback_type: 'suggestion'
      // ⭐ 移除contact_info字段，避免小程序审核时隐私收集问题
    },
    feedbackTypes: [
      { value: 'bug', label: '问题反馈' },
      { value: 'suggestion', label: '意见建议' },
      { value: 'other', label: '其他' }
    ],
    typeIndex: 1,
    submitting: false,
    userFeedbacks: [],
    isAdmin: false,
    showHistory: false
  },

  onLoad() {
    this.loadFeedbackSetting();
    this.loadUserInfo();
  },

  onShow() {
    // 刷新用户反馈列表
    this.loadUserFeedbacks();
  },

  /**
   * 加载反馈设置
   */
  loadFeedbackSetting() {
    apiCall(
      () => API.feedback.getSetting(),
      null,
      (data) => {
        this.setData({
          feedbackSetting: data,
          isEnabled: data.is_enabled
        });
        
        if (!data.is_enabled) {
          wx.showModal({
            title: '功能暂时关闭',
            content: '意见反馈功能暂时关闭，如有紧急问题请联系管理员。',
            showCancel: false,
            confirmText: '知道了',
            success: () => {
              wx.navigateBack();
            }
          });
        }
      },
      (error) => {
        console.error('获取反馈设置失败:', error);
        showError('获取设置失败，请稍后重试');
      }
    );
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    apiCall(
      () => API.user.getInfo(),
      null,
      (data) => {
        this.setData({
          isAdmin: data.is_admin || false
        });
      },
      (error) => {
        console.error('获取用户信息失败:', error);
      }
    );
  },

  /**
   * 加载用户反馈历史
   */
  loadUserFeedbacks() {
    apiCall(
      () => API.feedback.getList(),
      null,
      (data) => {
        this.setData({
          userFeedbacks: data || []
        });
      },
      (error) => {
        console.error('获取反馈历史失败:', error);
      }
    );
  },

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 反馈类型选择 (picker方式 - 保留兼容)
   */
  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      typeIndex: index,
      'formData.feedback_type': this.data.feedbackTypes[index].value
    });
  },

  /**
   * 反馈类型选择 (马卡龙风格单选组)
   */
  onTypeSelect(e) {
    const { value, index } = e.currentTarget.dataset;
    this.setData({
      typeIndex: index,
      'formData.feedback_type': value
    });
  },

  /**
   * 提交反馈
   */
  onSubmit() {
    if (!this.data.isEnabled) {
      showError('意见反馈功能暂时关闭');
      return;
    }

    const { formData } = this.data;
    
    // 验证表单
    if (!formData.title.trim()) {
      showError('请输入反馈标题');
      return;
    }
    
    if (!formData.content.trim()) {
      showError('请输入反馈内容');
      return;
    }
    
    this.setData({ submitting: true });
    
    apiCall(
      () => API.feedback.submit(formData),
      '提交中...',
      (data) => {
        showSuccess('反馈提交成功，谢谢您的建议！');
        
        // 显示自动回复消息
        if (data.auto_reply) {
          setTimeout(() => {
            wx.showModal({
              title: '感谢反馈',
              content: data.auto_reply,
              showCancel: false,
              confirmText: '知道了'
            });
          }, 1500);
        }
        
        // 重置表单
        this.resetForm();
        
        // 刷新反馈历史
        this.loadUserFeedbacks();
      },
      (error) => {
        showError(error.message || '提交失败，请稍后重试');
      }
    ).finally(() => {
      this.setData({ submitting: false });
    });
  },

  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      formData: {
        title: '',
        content: '',
        feedback_type: 'suggestion'
        // ⭐ 移除contact_info字段
      },
      typeIndex: 1
    });
  },

  /**
   * 切换历史显示
   */
  onToggleHistory() {
    this.setData({
      showHistory: !this.data.showHistory
    });
  },

  /**
   * 查看反馈详情
   */
  onFeedbackTap(e) {
    const { item } = e.currentTarget.dataset;
    let content = `反馈类型：${this.getFeedbackTypeLabel(item.feedback_type)}\n\n`;
    content += `反馈内容：\n${item.content}\n\n`;
    content += `提交时间：${item.create_time}\n`;
    content += `处理状态：${this.getStatusLabel(item.status)}`;
    
    if (item.admin_reply) {
      content += `\n\n管理员回复：\n${item.admin_reply}\n`;
      content += `回复时间：${item.reply_time}`;
    }

    wx.showModal({
      title: item.title,
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 管理员查看所有反馈
   */
  onManageFeedbacks() {
    if (!this.data.isAdmin) {
      showError('权限不足，需要管理员权限');
      return;
    }

    wx.navigateTo({
      url: '/pages/feedback/manage/index'
    });
  },

  /**
   * 获取反馈类型标签
   */
  getFeedbackTypeLabel(type) {
    const typeMap = {
      'bug': '问题反馈',
      'suggestion': '意见建议',
      'other': '其他'
    };
    return typeMap[type] || '未知';
  },

  /**
   * 获取状态标签
   */
  getStatusLabel(status) {
    const statusMap = {
      'pending': '待处理',
      'processing': '处理中',
      'resolved': '已解决',
      'closed': '已关闭'
    };
    return statusMap[status] || '未知';
  }
});
