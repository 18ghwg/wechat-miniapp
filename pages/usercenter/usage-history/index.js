const featureUsage = require('../../../utils/feature-usage');
const { showError, showSuccess } = require('../../../utils/api');

Page({
  data: {
    loading: false,
    activeTab: 'frequent', // frequent/all/recent
    statistics: null,
    frequentFeatures: [],
    allFeatures: [],
    recentFeatures: []
  },

  onLoad() {
    console.log('📊 使用记录页面加载');
    this.loadData();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadData();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('🔄 下拉刷新使用记录');
    this.loadData().then(() => {
      wx.stopPullDownRefresh();
      showSuccess('刷新成功');
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载数据
   */
  async loadData() {
    this.setData({ loading: true });

    try {
      // 并行加载所有数据
      const [statistics, frequentFeatures, allFeatures] = await Promise.all([
        featureUsage.getUserUsageStatistics(),
        featureUsage.getFrequentFeatures(10, 1, 30),
        featureUsage.getAvailableFeatures()
      ]);

      console.log('📊 统计数据:', statistics);
      console.log('🔥 常用功能:', frequentFeatures);
      console.log('📱 所有功能:', allFeatures);

      // 提取最近使用的功能
      const recentFeatures = statistics.recent_features || [];

      this.setData({
        statistics,
        frequentFeatures,
        allFeatures,
        recentFeatures,
        loading: false
      });
    } catch (error) {
      console.error('❌ 加载使用记录失败:', error);
      this.setData({ loading: false });
      showError('加载失败，请稍后重试');
    }
  },

  /**
   * 切换标签页
   */
  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    console.log('🔄 切换标签页:', tab);
    this.setData({ activeTab: tab });
  },

  /**
   * 获取当前列表
   */
  getCurrentList() {
    const { activeTab, frequentFeatures, allFeatures, recentFeatures } = this.data;
    switch (activeTab) {
      case 'frequent':
        return frequentFeatures;
      case 'all':
        return allFeatures;
      case 'recent':
        return recentFeatures;
      default:
        return [];
    }
  },

  /**
   * 获取空状态描述
   */
  getEmptyDesc() {
    const { activeTab } = this.data;
    switch (activeTab) {
      case 'frequent':
        return '开始使用功能后，这里会显示您的常用功能';
      case 'all':
        return '暂无可用功能';
      case 'recent':
        return '暂无最近使用的功能记录';
      default:
        return '暂无数据';
    }
  },

  /**
   * 导航到功能页面
   */
  navigateToFeature(e) {
    const { featureKey } = e.currentTarget.dataset;
    console.log('🚀 导航到功能:', featureKey);

    // 功能路由映射
    const routeMap = {
      'electric': '/pages/electric/index',
      'electric-query': '/pages/electric/query/index',
      'electric-account': '/pages/electric/account-manage/index',
      'attendance': '/pages/attendance/index',
      'attendance-submit': '/pages/attendance/index', // 改为跳转到主页
      'attendance-history': '/pages/attendance/history/index',
      'announcement': '/pages/announcement/manage',
      'task-management': '/pages/admin/task-management/list/index',
      'user-management': '/pages/admin/miniprogram-users/index',
      'notification-group': '/pages/admin/notification-group/index',
      'weather-settings': '/pages/admin/weather-settings/index',
      'df-notification': '/pages/admin/df-notification-settings/index',
      'feedback': '/pages/feedback/index'
    };

    const url = routeMap[featureKey];
    if (url) {
      wx.navigateTo({
        url,
        fail: () => {
          wx.switchTab({
            url,
            fail: () => {
              showError('页面跳转失败');
            }
          });
        }
      });
    } else {
      showError('该功能暂未开放');
    }
  }
});

