const { API, showError, showSuccess } = require('../../../../utils/api');

Page({
  data: {
    taskId: '',
    taskName: '',
    logs: [],
    availableDates: [],
    selectedDateIndex: 0,
    currentDate: '',
    levelOptions: ['全部', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'],
    selectedLevelIndex: 0,
    selectedLevelText: '全部',
    keyword: '',
    pagination: {
      page: 1,
      page_size: 100,
      total: 0,
      pages: 1,
      has_prev: false,
      has_next: false,
      has_more: false
    },
    loading: false,
    autoRefresh: true,
    autoRefreshTimer: null,
    lastTimestamp: '',
    scrollToId: ''
  },

  onLoad(options) {
    const { task_id, task_name } = options;
    console.log('📋 任务日志页面加载:', { task_id, task_name });
    
    this.setData({
      taskId: task_id,
      taskName: decodeURIComponent(task_name || '任务日志')
    });
    
    // 加载可用日期
    this.loadAvailableDates();
  },

  onShow() {
    // 页面显示时启动自动刷新
    if (this.data.autoRefresh) {
      this.startAutoRefresh();
    }
  },

  onHide() {
    this.stopAutoRefresh();
  },

  onUnload() {
    this.stopAutoRefresh();
  },

  /**
   * 切换自动刷新
   */
  toggleAutoRefresh() {
    const autoRefresh = !this.data.autoRefresh;
    this.setData({ autoRefresh });
    
    if (autoRefresh) {
      this.startAutoRefresh();
      showSuccess('自动刷新已开启');
    } else {
      this.stopAutoRefresh();
      showSuccess('自动刷新已暂停');
    }
  },

  /**
   * 启动自动刷新（每3秒刷新一次，无感更新）
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    
    console.log('🔄 启动自动刷新');
    const timer = setInterval(() => {
      const { availableDates, selectedDateIndex } = this.data;
      // 只在当天日期时自动刷新
      if (availableDates.length > 0 && selectedDateIndex === 0) {
        this.loadLogsIncremental();
      }
    }, 3000);  // 每3秒刷新一次
    
    this.setData({ autoRefreshTimer: timer });
  },

  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.data.autoRefreshTimer) {
      console.log('⏹️ 停止自动刷新');
      clearInterval(this.data.autoRefreshTimer);
      this.setData({ autoRefreshTimer: null });
    }
  },

  /**
   * 加载可用日期列表
   */
  async loadAvailableDates() {
    try {
      const response = await API.admin.getLogDates();
      
      if (response.data && response.data.dates) {
        const dates = response.data.dates;
        
        this.setData({
          availableDates: dates,
          selectedDateIndex: 0,
          currentDate: dates.length > 0 ? dates[0].display : ''
        });
        
        console.log(`📅 加载了 ${dates.length} 个可用日期`);
        this.loadLogs();
      }
    } catch (error) {
      console.error('❌ 加载日期列表失败:', error);
      showError('加载日期失败');
    }
  },

  /**
   * 格式化日志数据
   */
  formatLogs(logs) {
    return logs.map((log, index) => {
      // 提取短时间（只保留时:分:秒）
      let shortTime = '';
      if (log.timestamp) {
        const timePart = log.timestamp.split(' ')[1];
        if (timePart) {
          shortTime = timePart.split(',')[0];  // 去掉毫秒
        }
      }
      
      // 级别标签
      const levelTags = {
        'DEBUG': 'DBG',
        'INFO': 'INF',
        'WARNING': 'WRN',
        'ERROR': 'ERR',
        'CRITICAL': 'CRT'
      };
      
      return {
        ...log,
        shortTime,
        levelTag: levelTags[log.level] || log.level || '---',
        level: log.level || ''
      };
    });
  },

  /**
   * 加载日志（完整加载）
   * @param {boolean} goToLastPage - 是否跳转到最后一页（默认true，首次加载时显示最新日志）
   */
  async loadLogs(goToLastPage = true) {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    const { taskId, availableDates, selectedDateIndex, pagination, keyword, selectedLevelIndex, levelOptions } = this.data;
    
    if (availableDates.length === 0) {
      this.setData({ loading: false });
      return;
    }
    
    const date = availableDates[selectedDateIndex].date;
    const level = selectedLevelIndex > 0 ? levelOptions[selectedLevelIndex] : '';
    
    try {
      // 如果需要跳转到最后一页，先请求第1页获取总页数
      if (goToLastPage && pagination.page === 1) {
        const firstParams = {
          date,
          page: 1,
          page_size: pagination.page_size
        };
        if (level) firstParams.level = level;
        if (keyword) firstParams.keyword = keyword;
        
        const firstResponse = await API.admin.getTaskLogs(taskId, firstParams);
        
        if (firstResponse.data && firstResponse.data.pagination.pages > 1) {
          // 有多页，跳转到最后一页
          const lastPage = firstResponse.data.pagination.pages;
          this.setData({ 'pagination.page': lastPage });
          
          const lastParams = {
            date,
            page: lastPage,
            page_size: pagination.page_size
          };
          if (level) lastParams.level = level;
          if (keyword) lastParams.keyword = keyword;
          
          const lastResponse = await API.admin.getTaskLogs(taskId, lastParams);
          
          if (lastResponse.data) {
            const formattedLogs = this.formatLogs(lastResponse.data.logs);
            const lastLog = formattedLogs.length > 0 ? formattedLogs[formattedLogs.length - 1] : null;
            
            this.setData({
              logs: formattedLogs,
              pagination: lastResponse.data.pagination,
              loading: false,
              lastTimestamp: lastLog ? lastLog.timestamp : '',
              scrollToId: 'log-bottom'
            });
            
            console.log(`✅ 加载了最后一页 ${formattedLogs.length} 条日志（第${lastPage}页）`);
            return;
          }
        }
        
        // 只有1页或请求失败，直接使用第一次请求的结果
        if (firstResponse.data) {
          const formattedLogs = this.formatLogs(firstResponse.data.logs);
          const lastLog = formattedLogs.length > 0 ? formattedLogs[formattedLogs.length - 1] : null;
          
          this.setData({
            logs: formattedLogs,
            pagination: firstResponse.data.pagination,
            loading: false,
            lastTimestamp: lastLog ? lastLog.timestamp : '',
            scrollToId: 'log-bottom'
          });
          
          console.log(`✅ 加载了 ${formattedLogs.length} 条日志`);
          return;
        }
      }
      
      // 普通加载（翻页时）
      const params = {
        date,
        page: pagination.page,
        page_size: pagination.page_size
      };
      
      if (level) params.level = level;
      if (keyword) params.keyword = keyword;
      
      const response = await API.admin.getTaskLogs(taskId, params);
      
      if (response.data) {
        const formattedLogs = this.formatLogs(response.data.logs);
        const lastLog = formattedLogs.length > 0 ? formattedLogs[formattedLogs.length - 1] : null;
        
        this.setData({
          logs: formattedLogs,
          pagination: response.data.pagination,
          loading: false,
          lastTimestamp: lastLog ? lastLog.timestamp : '',
          scrollToId: 'log-bottom'
        });
        
        console.log(`✅ 加载了 ${formattedLogs.length} 条日志`);
      }
    } catch (error) {
      console.error('❌ 加载日志失败:', error);
      this.setData({ loading: false });
    }
  },

  /**
   * 增量加载日志（无感刷新）
   */
  async loadLogsIncremental() {
    const { taskId, availableDates, selectedDateIndex, lastTimestamp, keyword, selectedLevelIndex, levelOptions, logs } = this.data;
    
    if (availableDates.length === 0) return;
    
    const date = availableDates[selectedDateIndex].date;
    const level = selectedLevelIndex > 0 ? levelOptions[selectedLevelIndex] : '';
    
    try {
      const params = {
        date,
        page: 1,
        page_size: 100
      };
      
      if (level) params.level = level;
      if (keyword) params.keyword = keyword;
      if (lastTimestamp) params.since_timestamp = lastTimestamp;
      
      const response = await API.admin.getTaskLogs(taskId, params);
      
      if (response.data && response.data.logs.length > 0) {
        const newLogs = this.formatLogs(response.data.logs);
        
        // 过滤掉已存在的日志（基于时间戳去重）
        const existingTimestamps = new Set(logs.map(l => l.timestamp));
        const uniqueNewLogs = newLogs.filter(l => !existingTimestamps.has(l.timestamp));
        
        if (uniqueNewLogs.length > 0) {
          // 合并日志并更新
          const mergedLogs = [...logs, ...uniqueNewLogs];
          const lastLog = mergedLogs[mergedLogs.length - 1];
          
          this.setData({
            logs: mergedLogs,
            lastTimestamp: lastLog ? lastLog.timestamp : '',
            'pagination.total': mergedLogs.length,
            scrollToId: 'log-bottom'
          });
          
          console.log(`🆕 新增 ${uniqueNewLogs.length} 条日志`);
        }
      }
    } catch (error) {
      // 静默失败，不影响用户体验
      console.log('增量刷新失败:', error.message);
    }
  },

  /**
   * 日期切换
   */
  onDateChange(e) {
    const index = parseInt(e.detail.value);
    const date = this.data.availableDates[index];
    
    this.setData({
      selectedDateIndex: index,
      currentDate: date.display,
      'pagination.page': 1,
      logs: [],
      lastTimestamp: ''
    });
    
    console.log(`📅 切换日期: ${date.display}`);
    this.loadLogs(true);  // 切换日期时跳转到最后一页
  },

  /**
   * 级别过滤
   */
  onLevelChange(e) {
    const index = parseInt(e.detail.value);
    
    this.setData({
      selectedLevelIndex: index,
      selectedLevelText: this.data.levelOptions[index],
      'pagination.page': 1,
      logs: [],
      lastTimestamp: ''
    });
    
    console.log(`🎯 级别过滤: ${this.data.levelOptions[index]}`);
    this.loadLogs(true);  // 切换级别时跳转到最后一页
  },

  /**
   * 关键词输入
   */
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  /**
   * 搜索
   */
  onSearch() {
    this.setData({
      'pagination.page': 1,
      logs: [],
      lastTimestamp: ''
    });
    console.log(`🔍 搜索关键词: ${this.data.keyword}`);
    this.loadLogs(true);  // 搜索时跳转到最后一页
  },

  /**
   * 清空日志显示
   */
  onClear() {
    this.setData({
      logs: [],
      lastTimestamp: ''
    });
    showSuccess('已清空显示');
  },

  /**
   * 上一页
   */
  onPrevPage() {
    if (!this.data.pagination.has_prev) return;
    
    this.setData({
      'pagination.page': this.data.pagination.page - 1,
      logs: [],
      lastTimestamp: ''
    });
    this.loadLogs(false);  // 翻页时不跳转到最后一页
  },

  /**
   * 下一页
   */
  onNextPage() {
    if (!this.data.pagination.has_next) return;
    
    this.setData({
      'pagination.page': this.data.pagination.page + 1,
      logs: [],
      lastTimestamp: ''
    });
    this.loadLogs(false);  // 翻页时不跳转到最后一页
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({
      'pagination.page': 1,
      logs: [],
      lastTimestamp: ''
    });
    this.loadLogs(true).then(() => {  // 下拉刷新时跳转到最后一页
      wx.stopPullDownRefresh();
    }).catch(() => {
      wx.stopPullDownRefresh();
    });
  }
});
