const { API, apiCall, showError, showSuccess } = require('../../../../utils/api');
const { testModeManager } = require('../../../../utils/testMode');
const featureUsage = require('../../../../utils/feature-usage');

Page({
  data: {
    tasks: [],
    loading: false,
    isAdmin: false,
    isTestMode: false,  // 测试模式标识
    runningTasks: {},   // 正在执行的任务 { taskId: { timer, startTime } }
  },

  onLoad() {
    console.log('⏰ 定时任务管理页面加载');
    
    // 记录功能使用
    featureUsage.recordFeatureUsage('task-management', '任务管理', '⏰');
    
    // 检查测试模式
    const isTestMode = testModeManager.isTestMode();
    this.setData({ isTestMode });
    console.log(`🧪 测试模式: ${isTestMode ? '开启' : '关闭'}`);
    
    // 权限检查
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
    
    // 加载任务列表
    this.loadTasks();
    
    // 设置测试模式热重载
    testModeManager.setupPageHotReload(this, this.loadTasks);
  },

  onShow() {
    // 页面显示时刷新数据
    if (this.data.isAdmin) {
      this.loadTasks();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('🔄 下拉刷新任务列表');
    this.loadTasks().then(() => {
      // 停止下拉刷新动画
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    }).catch(() => {
      // 即使失败也要停止刷新动画
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 权限检查
   */
  checkPermission() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      console.log('❌ 未找到用户信息');
      return false;
    }
    
    const isAdmin = this.isAdminUser(userInfo);
    this.setData({ isAdmin });
    
    console.log('🔍 权限检查:', isAdmin ? '✅ 管理员' : '❌ 非管理员');
    return isAdmin;
  },

  /**
   * 判断是否为管理员
   */
  isAdminUser(userInfo) {
    // 方法1: 检查is_admin字段
    if (userInfo.is_admin === true || userInfo.is_admin === 1) {
      return true;
    }
    
    // 方法2: 检查user_level字段
    if (['admin', 'Admin', 'ADMIN'].includes(userInfo.user_level)) {
      return true;
    }
    
    return false;
  },

  /**
   * 加载任务列表
   */
  async loadTasks() {
    console.log('📋 开始加载任务列表...');
    this.setData({ loading: true });
    
    // 检查测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：使用Mock任务数据');
      return new Promise((resolve) => {
        setTimeout(() => {
          testModeManager.simulateScheduledTaskOperation('list').then(response => {
            console.log('✅ 任务列表加载成功(测试模式):', response);
            
            // 生成触发器描述
            const processedTasks = response.data.map(task => {
              const triggerDesc = this.generateTriggerDesc(task);
              return Object.assign({}, task, {
                is_enabled: Boolean(task.is_enabled),
                trigger_desc: triggerDesc
              });
            });
            
            this.setData({
              tasks: processedTasks,
              loading: false,
              isTestMode: true
            });
            console.log(`📊 共加载 ${response.data.length} 个任务(测试模式)`);
            resolve();
          });
        }, 300);
      });
    }
    
    try {
      const response = await API.admin.getTasks();
      
      console.log('✅ 任务列表加载成功:', response);
      
      if (response.data) {
        // ✅ 确保 is_enabled 是布尔值（修复潜在的类型问题）
        // ✅ 生成触发器描述
        const processedTasks = response.data.map(task => {
          const triggerDesc = this.generateTriggerDesc(task);
          return Object.assign({}, task, {
            is_enabled: Boolean(task.is_enabled),  // 明确转换为布尔值
            trigger_desc: triggerDesc  // 添加触发器描述
          });
        });
        
        this.setData({
          tasks: processedTasks,
          loading: false
        });
        console.log(`📊 共加载 ${response.data.length} 个任务`);
      } else {
        throw new Error('返回数据格式错误');
      }
    } catch (error) {
      console.error('❌ 加载任务列表失败:', error);
      this.setData({ loading: false });
      showError(`加载失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 切换任务启用/禁用状态
   */
  async onToggleTask(e) {
    const { taskId, index } = e.currentTarget.dataset;
    const task = this.data.tasks[index];
    const newStatus = !task.is_enabled;
    
    console.log(`🔄 切换任务状态: ${taskId}, 新状态: ${newStatus}`);
    
    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：模拟切换任务状态');
      testModeManager.simulateScheduledTaskOperation('update', taskId, { is_enabled: newStatus }).then(response => {
        showSuccess(newStatus ? '任务已启用(测试模式)' : '任务已禁用(测试模式)');
        this.loadTasks();
      });
      return;
    }
    
    try {
      await API.admin.updateTask(taskId, { is_enabled: newStatus });
      
      showSuccess(newStatus ? '任务已启用' : '任务已禁用');
      
      // 刷新列表以获取最新状态
      this.loadTasks();
    } catch (error) {
      console.error('❌ 切换任务状态失败:', error);
      showError(`操作失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 暂停/恢复任务
   */
  async onTogglePause(e) {
    const { taskId, isPaused, index } = e.currentTarget.dataset;
    const action = isPaused ? 'resume' : 'pause';
    const actionText = isPaused ? '恢复' : '暂停';
    
    console.log(`⏸️ ${actionText}任务: ${taskId}`);
    
    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log(`🧪 测试模式：模拟${actionText}任务`);
      testModeManager.simulateScheduledTaskOperation(action, taskId).then(response => {
        showSuccess(`任务已${actionText}(测试模式)`);
        this.loadTasks();
      });
      return;
    }
    
    try {
      if (isPaused) {
        await API.admin.resumeTask(taskId);
      } else {
        await API.admin.pauseTask(taskId);
      }
      
      showSuccess(`任务已${actionText}`);
      
      // 刷新列表
      this.loadTasks();
    } catch (error) {
      console.error(`❌ ${actionText}任务失败:`, error);
      showError(`${actionText}失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 立即执行任务
   */
  async onRunNow(e) {
    const { taskId } = e.currentTarget.dataset;
    
    console.log(`🚀 立即执行任务: ${taskId}`);
    
    wx.showModal({
      title: '确认执行',
      content: '确定要立即执行此任务吗？',
      success: async (res) => {
        if (res.confirm) {
          // 测试模式
          if (testModeManager.isTestMode()) {
            console.log('🧪 测试模式：模拟立即执行任务');
            testModeManager.simulateScheduledTaskOperation('run', taskId).then(response => {
              showSuccess('任务将在几秒内执行(测试模式)');
              this.loadTasks();
            });
            return;
          }
          
          try {
            // 显示loading
            wx.showLoading({
              title: '正在启动任务...',
              mask: true
            });
            
            await API.admin.runTaskNow(taskId);
            
            wx.hideLoading();
            
            // 标记任务开始执行
            console.log(`✅ 任务已触发: ${taskId}，开始监控执行状态`);
            showSuccess('任务正在执行中...');
            
            // 开始监控任务执行
            this.startMonitorTask(taskId);
            
          } catch (error) {
            wx.hideLoading();
            console.error('❌ 立即执行任务失败:', error);
            showError(`执行失败: ${error.message || '未知错误'}`);
          }
        }
      }
    });
  },
  
  /**
   * 开始监控任务执行状态
   */
  startMonitorTask(taskId) {
    const that = this;
    
    // 如果已经在监控，先停止
    if (this.data.runningTasks[taskId]) {
      this.stopMonitorTask(taskId);
    }
    
    console.log(`🔍 开始监控任务: ${taskId}`);
    
    // 记录开始时间和初始next_run_time
    const currentTask = this.data.tasks.find(t => t.task_id === taskId);
    const initialNextRunTime = currentTask ? currentTask.next_run_time : null;
    
    // 显示执行中状态
    wx.showToast({
      title: '任务执行中...',
      icon: 'loading',
      duration: 30000  // 最长显示30秒
    });
    
    // 设置定时器，每2秒查询一次任务执行状态
    const timer = setInterval(async () => {
      try {
        // 查询任务执行状态
        const response = await API.admin.getTaskStatus(taskId);
        
        if (response && response.data) {
          const { status, start_time, end_time, error } = response.data;
          
          console.log(`📊 任务状态检查: ${taskId}`, {
            状态: status,
            开始时间: start_time,
            结束时间: end_time,
            错误: error
          });
          
          // 检查任务是否完成
          if (status === 'completed') {
            console.log(`✅ 任务执行完成: ${taskId}`);
            
            // 停止监控
            that.stopMonitorTask(taskId);
            
            // 隐藏loading
            wx.hideToast();
            
            // 显示完成提示
            wx.showToast({
              title: '任务执行完成',
              icon: 'success',
              duration: 2000
            });
            
            // 刷新列表
            that.loadTasks();
            
          } else if (status === 'failed') {
            console.log(`❌ 任务执行失败: ${taskId}`, error);
            
            // 停止监控
            that.stopMonitorTask(taskId);
            
            // 隐藏loading
            wx.hideToast();
            
            // 显示失败提示
            wx.showToast({
              title: `任务执行失败: ${error || '未知错误'}`,
              icon: 'none',
              duration: 3000
            });
            
            // 刷新列表
            that.loadTasks();
          }
          // status === 'running' 时继续监控
        }
      } catch (error) {
        console.error(`❌ 监控任务失败: ${taskId}`, error);
        // 如果是404错误（无执行记录），继续监控
        // 其他错误也继续，不中断监控
      }
    }, 2000);  // 每2秒查询一次
    
    // 保存定时器
    const runningTasks = Object.assign({}, this.data.runningTasks);
    runningTasks[taskId] = {
      timer,
      startTime: Date.now(),
      initialNextRunTime
    };
    this.setData({ runningTasks });
    
    // 30秒后自动停止监控（超时保护）
    setTimeout(() => {
      if (this.data.runningTasks[taskId]) {
        console.log(`⏱️ 任务监控超时: ${taskId}`);
        this.stopMonitorTask(taskId);
        wx.hideToast();
        wx.showToast({
          title: '监控超时，请手动刷新',
          icon: 'none',
          duration: 2000
        });
      }
    }, 30000);
  },
  
  /**
   * 停止监控任务
   */
  stopMonitorTask(taskId) {
    const runningTasks = Object.assign({}, this.data.runningTasks);
    
    if (runningTasks[taskId]) {
      console.log(`🛑 停止监控任务: ${taskId}`);
      clearInterval(runningTasks[taskId].timer);
      delete runningTasks[taskId];
      this.setData({ runningTasks });
    }
  },
  
  /**
   * 页面卸载时清理所有定时器
   */
  onUnload() {
    Object.keys(this.data.runningTasks).forEach(taskId => {
      this.stopMonitorTask(taskId);
    });
  },

  /**
   * 编辑任务
   */
  onEditTask(e) {
    const { taskId } = e.currentTarget.dataset;
    console.log(`📝 编辑任务: ${taskId}`);
    
    wx.navigateTo({
      url: `/pages/admin/task-management/edit/index?task_id=${taskId}`
    });
  },

  /**
   * 查看任务日志
   */
  onViewLogs(e) {
    const { taskId, taskName } = e.currentTarget.dataset;
    console.log(`📋 查看任务日志: ${taskId}`);
    
    wx.navigateTo({
      url: `/pages/admin/task-management/logs/index?task_id=${taskId}&task_name=${encodeURIComponent(taskName)}`
    });
  },

  /**
   * 生成触发器描述
   */
  generateTriggerDesc(task) {
    if (task.trigger_type === 'cron') {
      return this.generateCronDesc(task);
    } else if (task.trigger_type === 'interval') {
      return this.generateIntervalDesc(task);
    } else if (task.trigger_type === 'date') {
      return '单次执行';
    }
    return '未知类型';
  },

  /**
   * 生成Cron描述
   */
  generateCronDesc(task) {
    const month = task.cron_month || '*';
    const day = task.cron_day || '*';
    const dayOfWeek = task.cron_day_of_week || '*';
    const hour = task.cron_hour || '*';
    const minute = task.cron_minute || '0';
    const second = task.cron_second || '0';

    const monthIsAny = month === '*';
    const dayIsAny = day === '*';
    const dayOfWeekIsAny = dayOfWeek === '*';
    const hourIsAny = hour === '*';
    const minuteIsAny = minute === '*';
    const secondIsZero = second === '0';

    let description = '';

    // 1. 月份部分
    if (!monthIsAny) {
      description += this.formatCronValue(month, '月');
    }

    // 2. 日期部分（日期和星期是OR关系）
    const hasDayOrWeek = !dayIsAny || !dayOfWeekIsAny;
    if (hasDayOrWeek) {
      if (description) {
        description += '的';
      } else if (!dayIsAny && monthIsAny) {
        // 月份为任意，但指定了日期，添加"每月"前缀
        description = '每月';
      } else if (!dayOfWeekIsAny && monthIsAny && dayIsAny) {
        // 月份和日期都任意，但指定了星期，添加"每周"前缀
        description = '每周';
      }

      if (!dayIsAny && !dayOfWeekIsAny) {
        // 同时指定了日期和星期
        description += `${this.formatCronValue(day, '号')}且${this.formatDayOfWeek(dayOfWeek)}`;
      } else if (!dayIsAny) {
        // 只指定了日期
        description += this.formatCronValue(day, '号');
      } else {
        // 只指定了星期
        description += this.formatDayOfWeek(dayOfWeek);
      }
    } else {
      // 都是任意
      if (!monthIsAny) {
        description += '每天';
      }
    }

    // 3. 时间部分
    // 检查是否是简单的固定时间（如 13:00）
    const isSimpleFixedTime = hour !== '*' && minute !== '*' &&
      !hour.includes(',') && !minute.includes(',') &&
      !hour.includes('/') && !minute.includes('/') &&
      !hour.includes('-') && !minute.includes('-') &&
      secondIsZero;

    if (isSimpleFixedTime) {
      const h = parseInt(hour);
      const m = parseInt(minute);
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      if (!description) {
        description = `每天 ${timeStr}`;
      } else {
        description += ` ${timeStr}`;
      }
    } else {
      // 复杂时间表达式
      if (description) description += '的';

      if (hourIsAny && minuteIsAny) {
        if (secondIsZero) {
          description += '每分钟';
        } else if (second === '*') {
          description += '每秒';
        } else {
          description += `每分钟的${this.formatCronValue(second, '秒')}`;
        }
      } else if (hourIsAny && !minuteIsAny) {
        if (secondIsZero) {
          description += `每小时的${this.formatCronValue(minute, '分')}`;
        } else {
          description += `每小时的${this.formatCronValue(minute, '分')}的${this.formatCronValue(second, '秒')}`;
        }
      } else if (!hourIsAny && minuteIsAny) {
        if (secondIsZero) {
          description += `${this.formatCronValue(hour, '时')}的每分钟`;
        } else {
          description += `${this.formatCronValue(hour, '时')}的每分钟的${this.formatCronValue(second, '秒')}`;
        }
      } else {
        // 小时和分钟都特定
        description += `${this.formatCronValue(hour, '时')}的${this.formatCronValue(minute, '分')}`;

        if (!secondIsZero && second !== '*') {
          description += `的${this.formatCronValue(second, '秒')}`;
        }
      }
    }

    // 如果所有字段都是任意值
    if (monthIsAny && dayIsAny && dayOfWeekIsAny && hourIsAny && minuteIsAny) {
      description = secondIsZero ? '每分钟' : (second === '*' ? '每秒' : `每分钟的${this.formatCronValue(second, '秒')}`);
    }

    return description || '每天';
  },

  /**
   * 格式化Cron值
   */
  formatCronValue(value, unit) {
    value = (value || '*').toString().trim();

    // 任意值
    if (value === '*') {
      return `每个${unit}`;
    }

    // */n 格式（间隔）
    if (/^\*\/\d+$/.test(value)) {
      const interval = parseInt(value.substring(2));
      return `每${interval}${unit}`;
    }

    // a-b/c 格式（范围+间隔）
    if (/^\d+-\d+\/\d+$/.test(value)) {
      const match = value.match(/^(\d+)-(\d+)\/(\d+)$/);
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      const step = parseInt(match[3]);
      return `从${start}到${end}，每${step}${unit}`;
    }

    // a-b 格式（范围）
    if (/^\d+-\d+$/.test(value)) {
      const [start, end] = value.split('-').map(v => parseInt(v));
      return `${start}到${end}${unit}`;
    }

    // a,b,c 格式（列表）
    if (value.includes(',')) {
      const values = value.split(',').map(v => v.trim());
      return `在${values.join('、')}${unit}`;
    }

    // 单个数字
    const num = parseInt(value);
    if (!isNaN(num)) {
      return `${num}${unit}`;
    }

    return value;
  },

  /**
   * 格式化星期描述
   */
  formatDayOfWeek(value) {
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    // 如果是单个数字，转换为中文
    if (/^\d$/.test(value)) {
      const num = parseInt(value);
      return weekNames[num] || value;
    }

    // 如果是多个值，转换每个
    if (value.includes(',')) {
      const nums = value.split(',').map(v => parseInt(v.trim()));
      const names = nums.map(n => weekNames[n]).filter(Boolean);
      return names.length > 0 ? names.join('、') : value;
    }

    // 范围表达式
    if (value.includes('-')) {
      const parts = value.split('-');
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end)) {
        return `${weekNames[start]}到${weekNames[end]}`;
      }
    }

    return value;
  },

  /**
   * 生成Interval描述
   */
  generateIntervalDesc(task) {
    const parts = [];

    if (task.interval_weeks) {
      parts.push(`${task.interval_weeks}周`);
    }
    if (task.interval_days) {
      parts.push(`${task.interval_days}天`);
    }
    if (task.interval_hours) {
      parts.push(`${task.interval_hours}小时`);
    }
    if (task.interval_minutes) {
      parts.push(`${task.interval_minutes}分钟`);
    }
    if (task.interval_seconds) {
      parts.push(`${task.interval_seconds}秒`);
    }

    if (parts.length === 0) {
      return '间隔未配置';
    }

    return `每${parts.join('')}`;
  }
});
