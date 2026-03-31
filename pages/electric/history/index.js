const { API, apiCall, showError, showSuccess } = require('../../../utils/api');
const { testModeManager } = require('../../../utils/testMode');

Page({
  data: {
    historyData: [],
    loading: false,
    loadingMore: false,
    isAdmin: false,
    bindingStatus: {
      hasBound: false,
      hasGridAccount: false
    },
    
    // 分页相关
    currentPage: 1,
    totalPages: 1,
    hasMoreData: true,
    limit: 20,
    
    // 筛选相关 - 新版马卡龙风格
    selectedAccountId: 'all',  // 当前选中的账号ID
    accountOptions: [],        // 账号选项列表 [{id, address, accountNo}]
    
    // 统计数据
    stats: {
      totalQueries: 0,
      avgUsage: '0.00',
      latestBalance: 0
    },
    
    // 旧版筛选相关（保留兼容）
    filterOptions: {
      gridAccount: '',
      roomName: '',
      monthYear: ''
    },
    
    // 管理员筛选选项
    adminAccountOptions: [],
    adminAccountIndex: -1,
    adminAccountData: [],
    adminRoomOptions: [],
    adminRoomIndex: -1,
    adminRoomData: [],
    
    // 普通用户相关
    gridAccountInput: '',
    userAccountOptions: [],
    userAccountIndex: -1,
    
    // 数据条数选项
    limitOptions: ['10条', '20条', '50条', '100条'],
    limitIndex: 1,
    
    // 图表相关
    chartData: [],
    chartStats: {},
    chartLegend: [],
    
    // 图表 tooltip
    chartTooltip: { show: false, x: 0, y: 0, date: '', value: '', unit: '度', label: '日用电量' }
  },

  // ========== 图表交互数据缓存 ==========
  _chartPoints: [],      // 图表的点坐标缓存
  _chartPadding: null,   // 图表的padding缓存
  
  // ==================== 马卡龙风格图表配置 ====================
  _chartColors: {
    // 主色调 - 马卡龙配色
    peach: '#FF9F43',      // 橙色马卡龙
    mint: '#B9FBC0',       // 薄荷绿马卡龙
    pink: '#FFB3BA',       // 粉色马卡龙
    lavender: '#E0BBE4',   // 薰衣草马卡龙
    blue: '#98F5E1',       // 蓝色马卡龙
    yellow: '#FFD93D',     // 黄色马卡龙
    // 辅助色
    foreground: '#5E4E3E', // 前景色（文字、边框）
    background: '#fef9f3', // 背景色
    gridLine: 'rgba(94, 78, 62, 0.1)', // 网格线
    axisLine: 'rgba(94, 78, 62, 0.2)', // 坐标轴
  },

  onLoad(options) {
    this.checkUserPermission();
    this.checkBindingStatus();
    this.loadAccountOptions();
    
    // 设置测试模式热加载
    testModeManager.setupPageHotReload(this, function() {
      console.log('电费历史页面-测试模式热加载');
      this.refreshData();
    });
  },

  onShow() {
    this.refreshData();
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({ delta: 1 });
  },

  // 导出数据
  onExport() {
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  },

  // 选择账号筛选
  onSelectAccount(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedAccountId: id });
    this.filterAndRefresh();
  },

  // 加载账号选项
  loadAccountOptions() {
    // 测试模式
    if (testModeManager.isTestMode()) {
      const mockOptions = [
        { id: '1', address: '幸福小区 3-2-801', accountNo: '3208893802673' },
        { id: '2', address: '万科新城 A-1-102', accountNo: '3201567890124' }
      ];
      this.setData({ accountOptions: mockOptions });
      return;
    }

    // 从历史数据中提取唯一的账号选项
    // 这会在 loadHistoryData 成功后调用
  },

  // 从历史数据中提取账号选项
  extractAccountOptions(historyData) {
    const accountMap = new Map();
    historyData.forEach(item => {
      const key = item.account_number || item.room_name;
      if (key && !accountMap.has(key)) {
        accountMap.set(key, {
          id: key,
          address: item.address || item.room_name || key,
          accountNo: item.account_number || key
        });
      }
    });
    return Array.from(accountMap.values());
  },

  // 计算统计数据
  calculateStats(data) {
    const totalQueries = data.length;
    const avgUsage = data.length > 0 
      ? (data.reduce((sum, item) => sum + (item.daily_usage || 0), 0) / data.length).toFixed(2)
      : '0.00';
    const latestBalance = data.length > 0 ? (data[0].balance_num || 0) : 0;
    
    return { totalQueries, avgUsage, latestBalance };
  },

  // 筛选并刷新
  filterAndRefresh() {
    this.setData({ currentPage: 1, historyData: [] });
    this.loadHistoryData();
  },

  // 检查用户绑定状态
  checkBindingStatus() {
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('电费历史-测试模式：模拟绑定状态检查');
      setTimeout(() => {
        this.setData({
          bindingStatus: {
            hasBound: true,
            hasGridAccount: true
          }
        });
      }, 100);
      return;
    }
    
    apiCall(
      () => API.grid.getAccounts(),
      '检查绑定状态...',
      (result) => {
        console.log('绑定状态检查API响应:', result);
        
        if (Array.isArray(result) && result.length === 0) {
          console.log('用户未绑定国网账号，数据:', result);
          this.setData({
            bindingStatus: {
              hasBound: false,
              hasGridAccount: false
            }
          });
          this.showBindingPrompt();
        } else {
          this.setData({
            bindingStatus: {
              hasBound: true,
              hasGridAccount: true
            }
          });
        }
      },
      (error) => {
        // 移除console.error以避免触发全局错误恢复机制
        this.setData({
          bindingStatus: {
            hasBound: false,
            hasGridAccount: false
          }
        });
        this.showBindingPrompt();
      }
    );
  },

  // 显示绑定提示
  showBindingPrompt() {
    wx.showModal({
      title: '需要绑定账号',
      content: '您还未绑定国网账号，无法查看电费历史记录。\n\n请先绑定您的国网账号。',
      showCancel: true,
      cancelText: '稍后绑定',
      confirmText: '立即绑定',
      success: (res) => {
        if (res.confirm) {
          // 跳转到国网账号绑定页面
          wx.navigateTo({
            url: '/pages/user/bind/index'
          });
      } else {
          // 返回上一页
          wx.navigateBack({
            delta: 1
          });
        }
      }
    });
  },

  // 加载历史数据
  loadHistoryData() {
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('电费历史-测试模式：使用mock历史数据');
      this.setData({ loading: true });
      
      // 使用mock历史数据
      const mockHistoryData = this.generateMockHistoryData();
      setTimeout(() => {
        this.handleApiSuccess({
          code: 200,
          msg: '获取成功',
          data: mockHistoryData
        });
      }, 300); // 模拟API延迟
      return;
    }
    
    // 管理员直接允许查看数据，普通用户需要检查绑定状态
    if (!this.data.isAdmin && !this.data.bindingStatus.hasBound) {
      console.log('普通用户未绑定，跳过加载数据');
        return;
      }

    console.log('开始加载历史数据，用户权限:', this.data.isAdmin ? '管理员' : '普通用户');
    this.setData({ loading: true });

      const params = {
      page: this.data.currentPage,
      limit: this.data.limit,
      grid_account: this.data.filterOptions.gridAccount,
      room_name: this.data.filterOptions.roomName,
      is_admin_request: this.data.isAdmin
    };

      apiCall(
        () => API.electric.getHistory(params),
      '加载历史数据...',
      (result) => {
        this.handleApiSuccess(result);
      },
      (error) => {
      this.handleApiError(error);
    }
    );
  },

  // 处理API成功响应
  handleApiSuccess(result) {
    console.log('处理API成功响应，原始数据:', result);
    
    // 统一的历史数据解析逻辑，与电费查询页面保持一致
    const normalizeHistoryData = (data) => {
      if (!data) {
        return { historyList: [], totalCount: 0 };
      }

      // 如果直接是数组格式
      if (Array.isArray(data)) {
        return { historyList: data, totalCount: data.length };
      }

      // 管理员接口格式：data.data.history
      if (data.data && Array.isArray(data.data.history)) {
        return {
          historyList: data.data.history,
          totalCount: data.data.total || data.data.history.length
        };
      }

      // 旧格式：data.history
      if (Array.isArray(data.history)) {
        return {
          historyList: data.history,
          totalCount: data.total || data.history.length
        };
      }

      // 直接取data字段（如果是数组）
      if (Array.isArray(data.data)) {
        return {
          historyList: data.data,
          totalCount: data.total || data.data.length
        };
      }

      return { historyList: [], totalCount: 0 };
    };

    const { historyList, totalCount } = normalizeHistoryData(result);
    const totalPages = Math.ceil(totalCount / this.data.limit);

    console.log('解析后的历史数据:', {
      historyList,
      historyListLength: historyList.length,
      totalCount,
      totalPages,
      isAdmin: this.data.isAdmin
    });

    // 处理数据 - 映射后端字段到前端模板字段
    const processedData = historyList.map(item => {
      const balanceNum = parseFloat(item.Balance || item.balance_num || 0);
      const dailyUsage = parseFloat(item.LastDailyUsage || item.daily_usage || 0);
      
      return Object.assign({}, item, {
        // 基础信息字段映射
        account_number: item.RoomName || item.account_number || '暂无户号',
        account_name: item.RoomOwnerName || item.account_name || '未命名',
        grid_account_phone: item.grid_account || '',
        balance: item.Balance || item.balance || '0.00',
        balance_num: balanceNum,
        address: item.ElecAddr || item.address || '未设置',
        owner_name: item.RoomOwnerName || item.owner_name || '',
        room_name: item.RoomName || item.room_name || '',
        
        // 用电数据字段映射
        current_month_power: item.MonthUsage || '0.00',
        year_total_cost: item.YearlyCharge || '0.00',
        year_total_power: item.YearlyUsage || '0.00',
        
        // 日期和用量字段
        daily_date: item.LastDailyDate || item.daily_date || item.work_date || '',
        daily_usage: dailyUsage,
        daily_usage_display: dailyUsage.toFixed(2),
        monthly_usage: parseFloat(item.MonthUsage || 0),
        formatted_date: this.formatDate(item.LastDailyDate || item.daily_date || item.work_date),
        formatted_usage: this.formatUsage(item.LastDailyUsage || dailyUsage || 0),
        
        // 状态字段
        status: 'normal',
        status_text: '正常',
        
        // 供电所信息
        org_name: item.OrgName || '未知供电所',
        
        // 时间字段
        check_time: item.CheckTime || item.check_time || item.update_time || '未知时间'
      });
    });

    // 按日期倒序排序
    processedData.sort((a, b) => {
      const dateA = new Date(a.daily_date);
      const dateB = new Date(b.daily_date);
      return dateB.getTime() - dateA.getTime();
    });

    // 根据筛选条件过滤数据
    let filteredData = processedData;
    if (this.data.selectedAccountId !== 'all') {
      filteredData = processedData.filter(item => 
        item.account_number === this.data.selectedAccountId ||
        item.room_name === this.data.selectedAccountId
      );
    }

    const newHistoryData = this.data.currentPage === 1 ? filteredData : this.data.historyData.concat(filteredData);
    
    // 提取账号选项（仅在第一页时）
    if (this.data.currentPage === 1) {
      const accountOptions = this.extractAccountOptions(processedData);
      this.setData({ accountOptions });
    }
    
    // 计算统计数据
    const stats = this.calculateStats(newHistoryData);
    
    console.log('设置历史数据到页面状态:', {
      processedDataLength: processedData.length,
      filteredDataLength: filteredData.length,
      newHistoryDataLength: newHistoryData.length,
      stats,
      sampleItem: processedData[0] || null
    });

    this.setData({ 
      historyData: newHistoryData,
      totalPages: totalPages,
      hasMoreData: this.data.currentPage < totalPages,
      loading: false,
      loadingMore: false,
      stats
    });

    wx.stopPullDownRefresh();
    
    // 延迟处理图表数据，确保DOM完全更新
    setTimeout(() => {
      this.processChartData();
    }, 300);
  },

  // 处理API错误
  handleApiError(error) {
    // 移除console.error以避免触发全局错误恢复机制
    
    // 特殊处理：用户未绑定账号的情况
    if (error.message && error.message.includes('请先绑定国网账号')) {
      this.showBindingPrompt();
    } else {
      showError(`加载失败: ${error.message || '网络错误'}`);
    }

    this.setData({ 
      loading: false,
      loadingMore: false,
      historyData: []
    });
    wx.stopPullDownRefresh();
  },

  // 刷新数据
  refreshData() {
    console.log('refreshData - 开始刷新数据');
    
    this.setData({
      currentPage: 1,
      historyData: [],
      hasMoreData: true,
      loadingMore: false,
      // 清空旧图表数据，避免显示旧数据
      chartStats: null,
      chartLegend: [],
      chartData: {}
    });
    
    // 管理员直接加载历史数据，普通用户需要先检查绑定状态
    if (this.data.isAdmin) {
      console.log('管理员刷新数据，直接加载历史');
      this.loadHistoryData();
    } else {
      console.log('普通用户刷新数据，先检查绑定状态');
      this.checkBindingStatus();
    }
    // 不在这里调用processChartData，因为数据还未加载
  },

  // 加载更多数据
  loadMore() {
    if (!this.data.hasMoreData || this.data.loading || this.data.loadingMore) {
      return;
    }

    console.log('加载更多数据，当前页:', this.data.currentPage);
    
    this.setData({
      currentPage: this.data.currentPage + 1,
      loadingMore: true
    });
    
    this.loadHistoryData();
  },

  // 处理图表数据 - 只显示本月的日用电数据
  processChartData() {
    console.log('processChartData - 开始处理本月图表数据');
    console.log('processChartData - 原始数据:', this.data.historyData.slice(0, 3));

    if (!this.data.historyData || this.data.historyData.length === 0) {
      console.log('processChartData - 无数据，清空图表');
      this.setData({
        chartStats: null,
        chartLegend: [],
        chartData: {}
      });
      return;
    }

    // 获取本月信息
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    console.log('processChartData - 筛选本月数据:', currentYearMonth);

    // 过滤本月的有效数据
    const validData = this.data.historyData.filter(item => {
      const hasDate = item.daily_date && item.daily_date !== '';
      const hasUsage = item.daily_usage >= 0;
      
      // 检查是否是本月数据
      const isCurrentMonth = item.daily_date && item.daily_date.startsWith(currentYearMonth);
      
      const isValid = hasDate && hasUsage && isCurrentMonth;
      
      // console.log(`数据过滤 - 户号: ${item.account_number}, 日期: ${item.daily_date}, 用电: ${item.daily_usage}, 本月: ${isCurrentMonth}, 有效: ${isValid}`);
      
      return isValid;
    });

    console.log(`processChartData - 有效数据数量: ${validData.length}`);
    console.log('processChartData - 有效数据:', validData.slice(0, 3));

    if (validData.length === 0) {
      console.log('processChartData - 无有效数据，清空图表');
      this.setData({
        chartStats: null,
        chartLegend: [],
        chartData: {}
      });
      return;
    }

    // 按户号分组数据
    const roomGroups = {};
    validData.forEach(item => {
      const roomName = item.account_number || '未知户号';
      if (!roomGroups[roomName]) {
        roomGroups[roomName] = [];
      }
      
      // 日期转换和验证
      let dateObj;
      try {
        dateObj = new Date(item.daily_date + 'T00:00:00');
        if (isNaN(dateObj.getTime())) {
          console.log('无效日期:', item.daily_date);
          return;
        }
      } catch (error) {
        console.log('日期转换失败:', item.daily_date, error);
        return;
      }

      const dataPoint = {
        date: item.daily_date,
        usage: item.daily_usage,
        dateObj: dateObj
      };
      
      roomGroups[roomName].push(dataPoint);
      // console.log(`添加数据点 - 户号: ${roomName}, 日期: ${item.daily_date}, 用电: ${item.daily_usage}, 转换后: ${dateObj}`);
    });

    // 为每个户号排序数据（按日期）
    Object.keys(roomGroups).forEach(roomName => {
      roomGroups[roomName].sort((a, b) => a.dateObj - b.dateObj);
    });

    // 生成图例和颜色 - 使用马卡龙配色
    const macaronColors = ['#FF9F43', '#B9FBC0', '#FFB3BA', '#E0BBE4', '#98F5E1', '#FFD93D'];
    const chartLegend = Object.keys(roomGroups).map((roomName, index) => ({
      roomName,
      color: macaronColors[index % macaronColors.length],
      count: roomGroups[roomName].length
    }));

    // 计算统计信息
    const avgDailyUsage = validData.length > 0 
      ? (validData.reduce((sum, item) => sum + item.daily_usage, 0) / validData.length).toFixed(2)
      : '0.00';

    const chartStats = {
      roomCount: Object.keys(roomGroups).length,
      dataPoints: validData.length,
      avgDailyUsage
    };

    console.log('processChartData - 设置图表数据:', { chartStats, chartLegend, roomGroups });

    // 设置数据并开始绘制图表
    this.setData({
      chartData: roomGroups,
      chartStats,
      chartLegend
    });

    // 延迟绘制图表，确保DOM更新完成
    console.log('processChartData - 开始绘制图表');
    setTimeout(() => {
      this.drawChart();
    }, 100);
  },

  // 生成随机颜色 - 使用马卡龙配色
  getRandomColor() {
    const macaronColors = ['#FF9F43', '#B9FBC0', '#FFB3BA', '#E0BBE4', '#98F5E1', '#FFD93D'];
    return macaronColors[Math.floor(Math.random() * macaronColors.length)];
  },

  // ==================== Canvas图表绘制 ====================

  /**
   * 绘制图表（Canvas 2D接口）
   */
  drawChart() {
    const chartData = this.data.chartData;
    const chartLegend = this.data.chartLegend;

    console.log('drawChart - 图表数据:', chartData);
    console.log('drawChart - 图表图例:', chartLegend);

    if (!chartData || Object.keys(chartData).length === 0) {
      console.log('drawChart - 无图表数据，跳过绘制');
      return;
    }

    // 使用Canvas 2D接口获取canvas节点
    const query = wx.createSelectorQuery().in(this);
    query.select('#dailyUsageChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.log('drawChart - 无法找到Canvas元素，可能DOM还未准备好');
          // 重试机制，但限制重试次数
          if (!this.drawChartRetryCount) this.drawChartRetryCount = 0;
          if (this.drawChartRetryCount < 5) {
            this.drawChartRetryCount++;
            console.log(`drawChart - 重试第${this.drawChartRetryCount}次`);
            setTimeout(() => {
              this.drawChart();
            }, 200);
          } else {
            console.error('drawChart - Canvas元素查找失败，已达最大重试次数');
          }
          return;
        }

        // 成功获取Canvas，重置重试计数
        this.drawChartRetryCount = 0;

        const canvas = res[0].node;
        const canvasInfo = res[0];
        const { width, height } = canvasInfo;

        console.log('drawChart - Canvas尺寸:', { width, height });

        if (!width || !height || width <= 0 || height <= 0) {
          console.log('drawChart - Canvas尺寸无效:', { width, height });
          return;
        }

        // 创建Canvas 2D上下文
        const ctx = canvas.getContext('2d');
        
        // 设置canvas实际尺寸（考虑设备像素比）
        const dpr = wx.getWindowInfo().pixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        
        console.log('drawChart - Canvas 2D上下文创建完成, 设备像素比:', dpr);

        // 清空Canvas - 使用白色背景
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 计算绘图区域 - 增加边距让图表更舒适
        const padding = {
          top: 30,
          right: 25,
          bottom: 50,
          left: 50
        };

        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        if (chartWidth <= 0 || chartHeight <= 0) {
          console.log('drawChart - 绘图区域太小:', { chartWidth, chartHeight });
          return;
        }

        // 收集所有数据点
        const allDates = [];
        const allUsages = [];
        Object.values(chartData).forEach(roomData => {
          roomData.forEach(point => {
            allDates.push(point.dateObj);
            allUsages.push(point.usage);
          });
        });

        if (allDates.length === 0) {
          console.log('drawChart - 无数据点');
          return;
        }

        // 计算日期和用电量范围
        const minDate = new Date(Math.min.apply(Math, allDates));
        const maxDate = new Date(Math.max.apply(Math, allDates));
        const maxUsage = Math.max.apply(Math, allUsages);
        const minUsage = Math.min.apply(Math, allUsages);

        console.log('drawChart - 日期范围:', { allDates: allDates.length, minDate, maxDate, maxUsage });

        // 绘制马卡龙风格坐标轴
        this.drawMacaronAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minUsage, maxUsage, this._chartColors);

        // 马卡龙配色数组
        const macaronColors = [this._chartColors.peach, this._chartColors.mint, this._chartColors.pink, this._chartColors.lavender, this._chartColors.blue, this._chartColors.yellow];

        // 收集所有点的坐标用于触摸交互
        const allPoints = [];

        // 绘制各户号的曲线（马卡龙风格）
        Object.entries(chartData).forEach(([roomName, roomData], index) => {
          const color = (chartLegend[index] ? chartLegend[index].color : undefined) || macaronColors[index % macaronColors.length];
          const points = this.drawMacaronLine(ctx, canvas, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minUsage, maxUsage, color, this._chartColors);
          if (points) {
            allPoints.push(...points);
          }
        });

        // 保存点坐标和padding用于触摸交互
        this._chartPoints = allPoints;
        this._chartPadding = padding;

        console.log('drawChart - Canvas 2D绘制完成，点数:', allPoints.length);
      });
  },

  /**
   * 绘制马卡龙风格坐标轴
   */
  drawMacaronAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, colors) {
    // 绘制水平网格线（虚线风格）
    const ySteps = 4;
    const valueRange = maxValue - minValue || 1;
    
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = colors.gridLine;
    ctx.lineWidth = 1;

    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 绘制Y轴标签（马卡龙风格字体）
    ctx.fillStyle = colors.foreground;
    ctx.font = 'bold 11px "PingFang SC", sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (valueRange * i / ySteps);
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      ctx.fillText(value.toFixed(1), padding.left - 8, y + 4);
    }

    // 绘制X轴日期标签
    const dateRange = maxDate.getTime() - minDate.getTime();
    if (dateRange > 0) {
      ctx.textAlign = 'center';
      ctx.font = 'bold 10px "PingFang SC", sans-serif';
      ctx.fillStyle = colors.foreground;
      
      const xSteps = 5;
      for (let i = 0; i <= xSteps; i++) {
        const dateTime = minDate.getTime() + (dateRange * i / xSteps);
        const date = new Date(dateTime);
        const x = padding.left + (chartWidth * i / xSteps);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(dateStr, x, padding.top + chartHeight + 20);
      }
    }
  },

  /**
   * 绘制马卡龙风格曲线（带渐变填充）- 返回点坐标用于触摸交互
   */
  drawMacaronLine(ctx, canvas, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minValue, maxValue, color, colors) {
    if (!roomData || roomData.length === 0) return [];

    const dateRange = maxDate.getTime() - minDate.getTime() || 1;
    const valueRange = maxValue - minValue || 1;

    // 按日期排序数据点
    const sortedData = [...roomData].sort((a, b) => {
      return a.dateObj.getTime() - b.dateObj.getTime();
    });

    // 计算所有点的坐标，同时保存原始数据用于tooltip显示
    const points = sortedData.map(point => {
      const x = padding.left + ((point.dateObj.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point.usage - minValue) / valueRange * chartHeight);
      
      // 格式化日期显示
      const month = String(point.dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(point.dateObj.getDate()).padStart(2, '0');
      const dateStr = `${month}-${day}`;
      
      return { 
        x, 
        y, 
        value: point.usage,
        date: dateStr
      };
    });

    if (points.length === 0) return [];

    // 绘制渐变填充区域
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, color + '50');
    gradient.addColorStop(1, color + '05');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    
    ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制折线
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    // 绘制数据点
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // 返回点坐标用于触摸交互
    return points;
  },

  /**
   * 绘制坐标轴（保留旧方法兼容）
   */
  drawAxes(ctx, padding, chartWidth, chartHeight, minDate, maxDate, minUsage, maxUsage) {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // 绘制Y轴
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    // 绘制X轴
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // 绘制Y轴刻度和标签
    const ySteps = 5;
    const usageRange = maxUsage - minUsage || 1;
    ctx.fillStyle = '#666666';
    ctx.font = '10px sans-serif';

    for (let i = 0; i <= ySteps; i++) {
      const value = minUsage + (usageRange * i / ySteps);
      const y = padding.top + chartHeight - (chartHeight * i / ySteps);
      
      // 绘制刻度线
      ctx.beginPath();
      ctx.moveTo(padding.left - 5, y);
      ctx.lineTo(padding.left, y);
      ctx.stroke();

      // 绘制标签
      ctx.fillText(value.toFixed(1), padding.left - 35, y + 3);
    }

    // 绘制X轴日期标签
    const dateRange = maxDate.getTime() - minDate.getTime();
    if (dateRange > 0) {
      const xSteps = Math.min(5, (Object.values(this.data.chartData)[0] ? Object.values(this.data.chartData)[0].length : undefined) || 5);
      
      for (let i = 0; i <= xSteps; i++) {
        const dateTime = minDate.getTime() + (dateRange * i / xSteps);
        const date = new Date(dateTime);
        const x = padding.left + (chartWidth * i / xSteps);
        
        // 绘制刻度线
        ctx.beginPath();
        ctx.moveTo(x, padding.top + chartHeight);
        ctx.lineTo(x, padding.top + chartHeight + 5);
        ctx.stroke();

        // 绘制日期标签
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(dateStr, x - 15, padding.top + chartHeight + 20);
      }
    }
  },

  /**
   * 绘制单条曲线（保留旧方法兼容）
   */
  drawLine(ctx, roomData, padding, chartWidth, chartHeight, minDate, maxDate, minUsage, maxUsage, color) {
    if (!roomData || roomData.length === 0) return;

    const dateRange = maxDate.getTime() - minDate.getTime() || 1;
    const usageRange = maxUsage - minUsage || 1;

    // 绘制趋势线
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    roomData.forEach((point, index) => {
      const x = padding.left + ((point.dateObj.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point.usage - minUsage) / usageRange * chartHeight);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = color;
    roomData.forEach(point => {
      const x = padding.left + ((point.dateObj.getTime() - minDate.getTime()) / dateRange * chartWidth);
      const y = padding.top + chartHeight - ((point.usage - minUsage) / usageRange * chartHeight);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
  },

  // ==================== Canvas事件处理 ====================

  /**
   * Canvas初始化事件
   */
  onChartInit() {
    console.log('onChartInit - Canvas初始化完成');
  },

  /**
   * Canvas触摸开始事件 - 显示tooltip
   */
  onChartTouchStart(e) {
    const touch = e.touches[0];
    const points = this._chartPoints;
    const padding = this._chartPadding;
    
    if (!points || points.length === 0) return;
    
    // 找到最近的点
    const touchX = touch.x;
    const touchY = touch.y;
    
    let nearestPoint = null;
    let minDistance = Infinity;
    
    points.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2));
      if (distance < minDistance && distance < 50) { // 50px 触摸范围
        minDistance = distance;
        nearestPoint = point;
      }
    });
    
    if (nearestPoint) {
      // 格式化数值
      const valueStr = typeof nearestPoint.value === 'number' 
        ? nearestPoint.value.toFixed(2) 
        : nearestPoint.value;
      
      // tooltip 尺寸估算（rpx 转 px，假设屏幕宽度 375px 对应 750rpx）
      const rpxRatio = wx.getSystemInfoSync().windowWidth / 750;
      const tooltipWidth = 220 * rpxRatio;  // 估算 tooltip 宽度
      const tooltipHeight = 100 * rpxRatio; // 估算 tooltip 高度
      
      // 计算 tooltip 位置，确保不超出图表边界
      let tooltipX = nearestPoint.x;
      let tooltipY = nearestPoint.y - tooltipHeight - 20; // 在点上方显示，留出间距
      
      // 获取图表区域边界
      const chartLeft = padding ? padding.left : 40;
      const chartRight = padding ? (padding.left + (e.currentTarget.offsetWidth || 300) - padding.right) : 260;
      const chartTop = padding ? padding.top : 20;
      
      // 水平边界检测：确保 tooltip 不超出左右边界
      const halfWidth = tooltipWidth / 2;
      if (tooltipX - halfWidth < chartLeft) {
        // 靠近左边界，tooltip 向右偏移
        tooltipX = chartLeft + halfWidth + 10;
      } else if (tooltipX + halfWidth > chartRight) {
        // 靠近右边界，tooltip 向左偏移
        tooltipX = chartRight - halfWidth - 10;
      }
      
      // 垂直边界检测：如果上方空间不足，显示在点下方
      if (tooltipY < chartTop) {
        tooltipY = nearestPoint.y + 20;
      }
      
      this.setData({
        chartTooltip: {
          show: true,
          x: tooltipX,
          y: tooltipY,
          date: nearestPoint.date,
          value: valueStr,
          unit: '度',
          label: '日用电量'
        }
      });
    }
  },

  /**
   * Canvas触摸移动事件
   */
  onChartTouchMove(e) {
    // 移动时也更新tooltip
    this.onChartTouchStart(e);
  },

  /**
   * Canvas触摸结束事件 - 隐藏tooltip
   */
  onChartTouchEnd(e) {
    // 延迟隐藏，让用户能看清数据
    setTimeout(() => {
      this.setData({
        'chartTooltip.show': false
      });
    }, 1500);
  },

  // 加载筛选选项
  loadFilterOptions() {
    if (!this.data.bindingStatus.hasBound) {
      return;
    }

    this.checkUserPermission();
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

    // 检查 permissions 数组中的权限
    if (Array.isArray(userInfo.permissions)) {
      return userInfo.permissions.some((permission) => {
        const code = (permission ? permission.code : undefined) || (permission ? permission.permission_code : undefined);
        return code && String(code).toLowerCase() === 'admin';
      });
    }

    return false;
  },

  // 检查用户权限
  checkUserPermission() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const isAdmin = this.isAdminUser(userInfo);
    
    console.log('电费历史权限检查:', {
      用户信息: userInfo,
      是否管理员: isAdmin
    });
    
    this.setData({
      isAdmin,
      userInfo
    });

    // 如果是管理员，加载管理员选项
    if (isAdmin) {
      this.loadAdminAccountOptions();
    }

    // 继续加载历史数据
    this.loadHistoryData();
  },

  // 格式化日期
  formatDate(dateStr) {
    if (!dateStr) return '未知';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateStr;
    }
  },

  // 格式化用电量
  formatUsage(usage) {
    const num = parseFloat(usage || 0);
    return num.toFixed(2);
  },

  // 筛选相关方法
  onFilter() {
    this.refreshData();
  },

  onClearFilter() {
    this.setData({
      filterOptions: {
        gridAccount: '',
        roomName: '',
        monthYear: ''
      },
      adminAccountIndex: -1,
      adminRoomIndex: -1,
      adminRoomOptions: [],
      adminRoomData: []
    });
    this.refreshData();
  },

  // 跳转到绑定页面
  goToBinding() {
    wx.navigateTo({
      url: '/pages/user/bind/index'
    });
  },

  // ==================== 管理员筛选功能 ====================

  /**
   * 加载管理员账号选项
   */
  loadAdminAccountOptions() {
    console.log('开始加载管理员账号选项');
    
    // 检查是否为测试模式
    if (testModeManager.isTestMode()) {
      console.log('电费历史-测试模式：使用mock管理员账号选项');
      setTimeout(() => {
        const mockAccounts = testModeManager.getMockGridAccounts();
        const options = ['全部账号'];
        const data = [null];
        
        mockAccounts.forEach(account => {
          const phone = account.PhoneName || '未知号码';
          const name = account.AccountName || '';
          const display = name ? `${phone}：${name}` : phone;
          options.push(display);
          data.push(account);
        });
        
        this.setData({
          adminAccountOptions: options,
          adminAccountData: data,
          adminAccountIndex: 0  // 默认选择"全部账号"
        });
      }, 200);
      return;
    }
    
    apiCall(
      () => API.grid.getAllAccounts(),
      '加载账号选项...',
      (result) => {
        console.log('管理员账号选项数据:', result);
        
        // 正确解析API响应数据结构 {code: 200, data: Array}
        const accounts = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        const options = ['全部账号'];
        const data = [null];
        
        console.log('解析出的账号数据:', accounts);
        
        accounts.forEach(account => {
          const phone = account.phone || account.PhoneName || account.grid_phone || '未知号码';
          const name = account.name || account.AccountName || '';
          const display = name ? `${phone}：${name}` : phone;
          options.push(display);
          data.push(account);
        });
        
        console.log('生成的账号选项:', { options, data });
        
        this.setData({
          adminAccountOptions: options,
          adminAccountData: data,
          adminAccountIndex: 0  // 默认选择"全部账号"
        });
      },
      (error) => {
        console.error('加载管理员账号选项失败:', error);
        showError('加载账号选项失败');
      }
    );
  },

  /**
   * 管理员账号选择变化
   */
  onAdminAccountChange(e) {
    const index = parseInt(e.detail.value);
    const selectedData = this.data.adminAccountData[index];
    
    console.log('管理员账号选择变化:', { index, selectedData });
    
    this.setData({
      adminAccountIndex: index,
      adminRoomOptions: [],
      adminRoomIndex: -1,
      adminRoomData: [],
      filterOptions: Object.assign({}, this.data.filterOptions, {
        gridAccount: selectedData ? (selectedData.phone || selectedData.PhoneName || selectedData.grid_phone || '') : '',
        roomName: ''
      })
    });

    if (selectedData && (selectedData.phone || selectedData.PhoneName || selectedData.grid_phone)) {
      // 加载该账号下的户号选项
      this.loadAdminRoomOptions(selectedData.phone || selectedData.PhoneName || selectedData.grid_phone);
    } else {
      // 选择了"全部账号"，自动筛选
      this.autoFilterAndRefresh();
    }
  },

  /**
   * 加载管理员指定账号下的户号选项
   */
  loadAdminRoomOptions(gridAccount) {
    console.log('加载管理员户号选项，账号:', gridAccount);
    
    apiCall(
      () => API.electric.getAdminRoomOptions({ gridAccount }),
      '获取户号列表中...',
      (result) => {
        console.log('获取管理员户号选项成功:', result);
        
        // 正确解析API响应数据结构
        const data = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
        const options = data.map(item => `${item.roomName}：${item.ownerName || '未知'}`);
    
    this.setData({
          adminRoomOptions: ['全部户号'].concat(options),
          adminRoomData: [null].concat(data),
          adminRoomIndex: 0  // 默认选择"全部户号"
        });
        
        // 自动筛选和刷新
        this.autoFilterAndRefresh();
      },
      (error) => {
        console.error('获取管理员户号选项失败:', error);
        showError('获取户号列表失败');
      }
    );
  },

  /**
   * 管理员户号选择变化
   */
  onAdminRoomChange(e) {
    const index = parseInt(e.detail.value);
    const selectedData = this.data.adminRoomData[index];
    
    console.log('管理员户号选择变化:', { index, selectedData });
    
    this.setData({
      adminRoomIndex: index,
      filterOptions: Object.assign({}, this.data.filterOptions, {
        roomName: selectedData ? selectedData.roomName || '' : ''
      })
    });

    // 自动筛选和刷新
    this.autoFilterAndRefresh();
  },

  /**
   * 清空户号筛选
   */
  onClearRoomFilter() {
    this.setData({
      adminRoomIndex: -1,
      adminRoomOptions: [],
      adminRoomData: [],
      filterOptions: Object.assign({}, this.data.filterOptions, {
        roomName: ''
      })
    });
    this.autoFilterAndRefresh();
  },

  /**
   * 数据条数选择变化
   */
  onLimitChange(e) {
    const index = parseInt(e.detail.value);
    const limitMap = { 0: 10, 1: 20, 2: 50, 3: 100 };
    const newLimit = limitMap[index] || 20;
    
    this.setData({
      limitIndex: index,
      limit: newLimit,
      currentPage: 1
    });
    
    this.autoFilterAndRefresh();
  },

  /**
   * 自动筛选和刷新
   */
  autoFilterAndRefresh() {
    console.log('自动筛选和刷新，当前筛选条件:', this.data.filterOptions);
    
    // 清空旧数据和图表
    this.setData({ 
      currentPage: 1,
      historyData: [],
      chartStats: null,
      chartLegend: [],
      chartData: {}
    });
    
    this.loadHistoryData();
  },

  // ==================== 普通用户筛选功能 ====================

  /**
   * 普通用户账号输入变化
   */
  onGridAccountInputChange(e) {
    this.setData({
      gridAccountInput: e.detail.value
    });
  },

  /**
   * 搜索国网账号
   */
  onSearchGridAccount() {
    const gridAccount = this.data.gridAccountInput.trim();
    if (!gridAccount) {
      showError('请输入国网手机号');
      return;
    }

    this.setData({
      filterOptions: Object.assign({}, this.data.filterOptions, {
        gridAccount: gridAccount
      })
    });
    
    this.autoFilterAndRefresh();
  },

  /**
   * 普通用户户号选择变化
   */
  onUserAccountChange(e) {
    const index = parseInt(e.detail.value);
    // 这里可以根据需要实现普通用户户号选择逻辑
    this.setData({
      userAccountIndex: index
    });
  },

  // 页面卸载
  onUnload() {
    // 清理资源
  },

  // 到达底部加载更多
  onReachBottom() {
    this.loadMore();
  },

  /**
   * 生成测试模式的历史数据
   */
  generateMockHistoryData() {
    // 生成30天的测试历史数据
    const mockData = [];
    const today = new Date();
    
    // 模拟3个测试账号的历史数据
    const testAccounts = [
      { phone: '13800138001', account: '测试账户1', roomName: '3208893802673' },
      { phone: '13800138002', account: '测试账户2', roomName: '3208893802674' },
      { phone: '13800138003', account: '测试账户3', roomName: '3208893802675' }
    ];
    
    testAccounts.forEach((account, accountIndex) => {
      // 为每个账号生成最近30天的数据
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // 生成随机的电费数据
        const dailyUsage = (Math.random() * 3 + 1).toFixed(2); // 1-4度电
        const balance = (200 + Math.random() * 300).toFixed(2); // 200-500元余额
        
        mockData.push({
          id: accountIndex * 30 + i + 1,
          // 使用后端期望的字段名
          LastDailyDate: date.toISOString().split('T')[0],
          LastDailyUsage: parseFloat(dailyUsage),
          Balance: parseFloat(balance),
          RoomName: account.roomName,
          RoomOwnerName: account.account,
          ElecAddr: `${account.account}用电地址`,
          grid_account: account.phone,
          
          // 用电统计数据
          MonthUsage: (parseFloat(dailyUsage) * 30).toFixed(2),
          YearlyCharge: (parseFloat(balance) * 0.5).toFixed(2),
          YearlyUsage: (parseFloat(dailyUsage) * 365).toFixed(2),
          
          // 额外字段
          daily_date: date.toISOString().split('T')[0],
          daily_usage: parseFloat(dailyUsage),
          remaining_balance: parseFloat(balance),
          account_number: account.roomName,
          room_name: account.roomName,
          account_name: account.account,
          query_time: date.toISOString().replace('T', ' ').split('.')[0],
          created_at: date.toISOString().replace('T', ' ').split('.')[0],
          updated_at: date.toISOString().replace('T', ' ').split('.')[0]
        });
      }
    });
    
    // 按日期倒序排列
    mockData.sort((a, b) => new Date(b.LastDailyDate) - new Date(a.LastDailyDate));
    
    const resultData = mockData.slice(0, this.data.limit);
    
    console.log('Mock数据生成完成:', {
      总数据条数: mockData.length,
      当前页数据条数: resultData.length,
      当前页码: this.data.currentPage,
      每页条数: this.data.limit,
      样本数据: resultData[0]
    });
    
    return {
      history: resultData, // 使用正确的字段名
      total: mockData.length,
      total_pages: Math.ceil(mockData.length / this.data.limit),
      current_page: this.data.currentPage,
      has_more: mockData.length > this.data.limit * this.data.currentPage
    };
  }
});
