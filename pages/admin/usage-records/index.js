const { API, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');

// 功能标识到中文名称的映射
const FEATURE_NAME_MAP = {
  'electric': '电费查询',
  'attendance': '考勤管理',
  'announcement': '公告管理',
  'user-management': '用户管理',
  'task-management': '任务管理',
  'df-notification': 'DF通知设置',
  'weather-notification': '天气通知',
  'miniprogram-users': '小程序用户',
  'notification-group': '通知群组',
  'view_system_config': '查看系统配置',
  'login': '登录',
  'query_electric': '查询电费',
  'view_attendance': '查看考勤',
  'submit_attendance': '提交考勤',
  'manage_announcement': '管理公告',
  'view_feedback': '查看反馈',
  'other': '其他'
};

Page({
  data: {
    loading: false,
    records: [],
    stats: null,
    
    // 记录数量统计
    recordsCount: {
      total_count: 0,
      max_limit: 1000,
      remaining: 1000,
      usage_percentage: 0
    },
    
    // 搜索和筛选
    searchKeyword: '',
    featureFilterIndex: 0,
    featureOptions: [
      { label: '全部功能', value: '' },
      { label: '电费查询', value: 'electric' },
      { label: '考勤管理', value: 'attendance' },
      { label: '任务管理', value: 'task-management' },
      { label: '用户管理', value: 'user-management' },
      { label: '其他', value: 'other' }
    ],
    dateFilter: '',
    
    // 分页
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    totalRecords: 0,
    
    // 弹窗
    showDialog: false,
    editingRecord: null,
    formData: {},
    submitting: false,
    
    // 清理旧数据弹窗
    showCleanupDialog: false,
    cleanupDays: 90,
    cleanupBatchSize: 100,
    cleaning: false,
    
    isTestMode: false
  },

  onLoad() {
    console.log('📊 使用记录管理页面加载');
    
    // 检查权限
    if (!this.checkPermission()) {
      wx.showModal({
        title: '权限不足',
        content: '只有管理员才能访问此页面',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    // 检查测试模式
    const isTestMode = testModeManager.isTestMode();
    this.setData({ isTestMode });
    console.log(`🧪 测试模式: ${isTestMode ? '开启' : '关闭'}`);
    
    this.loadData();
    
    // 设置测试模式热重载
    testModeManager.setupPageHotReload(this, this.loadData);
  },

  onShow() {
    this.loadData();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('🔄 下拉刷新');
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
      showSuccess('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 权限检查
   */
  checkPermission() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) return false;
    
    return userInfo.is_admin === true || 
           userInfo.is_admin === 1 || 
           ['admin', 'Admin', 'ADMIN'].includes(userInfo.user_level);
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });

    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：使用Mock数据');
      return this.loadMockData();
    }

    try {
      const params = {
        page: this.data.currentPage,
        page_size: this.data.pageSize,
        keyword: this.data.searchKeyword,
        feature_key: this.data.featureOptions[this.data.featureFilterIndex].value,
        date: this.data.dateFilter
      };

      const [recordsRes, statsRes, countRes] = await Promise.all([
        API.admin.getUsageRecords(params),
        API.admin.getUsageStats(),
        API.admin.getUsageRecordsCount()  // 获取总记录数
      ]);

      console.log('✅ 数据加载成功');

      // 转换最热功能为中文名称
      const stats = statsRes.data || {};
      if (stats.most_used_feature) {
        stats.most_used_feature_name = FEATURE_NAME_MAP[stats.most_used_feature] || stats.most_used_feature;
      }

      this.setData({
        records: recordsRes.data.records || [],
        totalRecords: recordsRes.data.total || 0,
        totalPages: Math.ceil((recordsRes.data.total || 0) / this.data.pageSize),
        stats: stats,
        recordsCount: countRes.data || {
          total_count: 0,
          max_limit: 1000,
          remaining: 1000,
          usage_percentage: 0
        },
        loading: false
      });
      
      // 如果记录数接近限制，显示警告
      if (countRes.data && countRes.data.usage_percentage >= 80) {
        console.warn(`⚠️ 使用记录数量警告: ${countRes.data.total_count}/${countRes.data.max_limit} (${countRes.data.usage_percentage}%)`);
      }
    } catch (error) {
      console.error('❌ 加载失败:', error);
      this.setData({ loading: false });
      showError('加载失败，请稍后重试');
    }
  },

  /**
   * 加载Mock数据
   */
  loadMockData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockRecords = testModeManager.getMockUsageRecords();
        const mockStats = testModeManager.getMockUsageStats();
        
        // 转换最热功能为中文名称
        if (mockStats.most_used_feature) {
          mockStats.most_used_feature_name = FEATURE_NAME_MAP[mockStats.most_used_feature] || mockStats.most_used_feature;
        }
        
        this.setData({
          records: mockRecords,
          totalRecords: mockRecords.length,
          totalPages: Math.ceil(mockRecords.length / this.data.pageSize),
          stats: mockStats,
          loading: false
        });
        
        console.log('✅ Mock数据加载成功');
        resolve();
      }, 300);
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  /**
   * 执行搜索
   */
  onSearch() {
    this.setData({ currentPage: 1 });
    this.loadData();
  },

  /**
   * 功能筛选
   */
  onFeatureFilterChange(e) {
    this.setData({ 
      featureFilterIndex: e.detail.value,
      currentPage: 1 
    });
    this.loadData();
  },

  /**
   * 日期筛选
   */
  onDateFilterChange(e) {
    this.setData({ 
      dateFilter: e.detail.value,
      currentPage: 1 
    });
    this.loadData();
  },

  /**
   * 重置筛选
   */
  resetFilters() {
    this.setData({
      searchKeyword: '',
      featureFilterIndex: 0,
      dateFilter: '',
      currentPage: 1
    });
    this.loadData();
  },

  /**
   * 上一页
   */
  prevPage() {
    if (this.data.currentPage > 1) {
      this.setData({ currentPage: this.data.currentPage - 1 });
      this.loadData();
    }
  },

  /**
   * 下一页
   */
  nextPage() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({ currentPage: this.data.currentPage + 1 });
      this.loadData();
    }
  },

  /**
   * 显示添加对话框
   */
  showAddDialog() {
    this.setData({
      showDialog: true,
      editingRecord: null,
      formData: {
        user_name: '',
        feature_key: '',
        feature_name: '',
        feature_icon: ''
      }
    });
  },

  /**
   * 显示编辑对话框
   */
  showEditDialog(e) {
    const record = e.currentTarget.dataset.record;
    this.setData({
      showDialog: true,
      editingRecord: record,
      formData: {
        user_name: record.user_name || record.nickname,
        feature_key: record.feature_key,
        feature_name: record.feature_name,
        feature_icon: record.feature_icon
      }
    });
  },

  /**
   * 隐藏对话框
   */
  hideDialog() {
    this.setData({ showDialog: false });
  },

  /**
   * 表单输入
   */
  onFormInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  /**
   * 提交表单
   */
  async submitForm() {
    const { formData, editingRecord } = this.data;

    // 验证
    if (!formData.user_name || !formData.feature_key || !formData.feature_name) {
      showError('请填写必填字段');
      return;
    }

    this.setData({ submitting: true });

    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：模拟保存');
      setTimeout(() => {
        this.setData({ 
          submitting: false,
          showDialog: false 
        });
        showSuccess(editingRecord ? '更新成功(测试模式)' : '添加成功(测试模式)');
        this.loadData();
      }, 500);
      return;
    }

    try {
      if (editingRecord) {
        await API.admin.updateUsageRecord(editingRecord.id, formData);
        showSuccess('更新成功');
      } else {
        await API.admin.createUsageRecord(formData);
        showSuccess('添加成功');
      }

      this.setData({ 
        submitting: false,
        showDialog: false 
      });
      this.loadData();
    } catch (error) {
      console.error('❌ 保存失败:', error);
      this.setData({ submitting: false });
      showError(`保存失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 删除记录
   */
  deleteRecord(e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          // 测试模式
          if (testModeManager.isTestMode()) {
            console.log('🧪 测试模式：模拟删除');
            showSuccess('删除成功(测试模式)');
            this.loadData();
            return;
          }

          try {
            await API.admin.deleteUsageRecord(id);
            showSuccess('删除成功');
            this.loadData();
          } catch (error) {
            console.error('❌ 删除失败:', error);
            showError(`删除失败: ${error.message || '未知错误'}`);
          }
        }
      }
    });
  },

  /**
   * 显示清理对话框
   */
  showCleanupDialog() {
    this.setData({
      showCleanupDialog: true,
      cleanupDays: 90,
      cleanupBatchSize: 100
    });
  },

  /**
   * 隐藏清理对话框
   */
  hideCleanupDialog() {
    this.setData({ showCleanupDialog: false });
  },

  /**
   * 清理天数输入
   */
  onCleanupDaysInput(e) {
    this.setData({ cleanupDays: parseInt(e.detail.value) || 90 });
  },

  /**
   * 批量大小输入
   */
  onCleanupBatchSizeInput(e) {
    this.setData({ cleanupBatchSize: parseInt(e.detail.value) || 100 });
  },

  /**
   * 执行清理
   */
  async executeCleanup() {
    const { cleanupDays, cleanupBatchSize } = this.data;

    wx.showModal({
      title: '确认清理',
      content: `确定要清理 ${cleanupDays} 天前的记录吗？\n\n此操作不可恢复！`,
      success: async (res) => {
        if (res.confirm) {
          this.setData({ cleaning: true });

          // 测试模式
          if (testModeManager.isTestMode()) {
            console.log('🧪 测试模式：模拟清理');
            setTimeout(() => {
              this.setData({ 
                cleaning: false,
                showCleanupDialog: false 
              });
              showSuccess('清理成功(测试模式)');
              this.loadData();
            }, 1000);
            return;
          }

          try {
            const result = await API.admin.cleanupUsageRecords({
              days: cleanupDays,
              batch_size: cleanupBatchSize
            });

            this.setData({ 
              cleaning: false,
              showCleanupDialog: false 
            });

            if (result.data && result.data.deleted_count > 0) {
              showSuccess(`清理成功，删除了 ${result.data.deleted_count} 条记录`);
            } else {
              showSuccess('没有需要清理的记录');
            }

            this.loadData();
          } catch (error) {
            console.error('❌ 清理失败:', error);
            this.setData({ cleaning: false });
            showError(`清理失败: ${error.message || '未知错误'}`);
          }
        }
      }
    });
  },

  /**
   * 导出数据
   */
  exportRecords() {
    wx.showModal({
      title: '导出数据',
      content: '导出功能正在开发中，敬请期待',
      showCancel: false
    });
  }
});

