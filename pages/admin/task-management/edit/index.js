const { API, apiCall, showError, showSuccess } = require('../../../../utils/api');
const { testModeManager } = require('../../../../utils/testMode');

Page({
  data: {
    taskId: '',
    taskData: null,
    loading: false,
    saving: false,
    cronPreview: '',
    cronValid: true,        // Cron表达式是否有效
    intervalPreview: '',    // Interval预览
    isTestMode: false,      // 测试模式标识
    
    // Cron编辑器相关
    showCronEditor: false,
    editingField: '',       // 正在编辑的字段，如 'hour', 'minute'
    editingFieldName: '',   // 字段显示名称
    editingUnit: '',        // 单位
    editingMin: 0,          // 最小值
    editingMax: 59,         // 最大值
    editingValue: '*',      // 当前值
    
    // 时区相关
    timezones: [
      { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
      { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
      { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)' },
      { value: 'Asia/Hong_Kong', label: '香港时间 (UTC+8)' },
      { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)' },
      { value: 'US/Eastern', label: '美国东部时间 (UTC-5)' },
      { value: 'US/Pacific', label: '美国西部时间 (UTC-8)' },
      { value: 'Europe/London', label: '伦敦时间 (UTC+0)' },
      { value: 'UTC', label: '协调世界时 (UTC)' }
    ],
    timezoneIndex: 0,
    currentTimezone: 'Asia/Shanghai',
    
    // 日期选择器相关
    startDatePickerValue: [0, 0, 0, 0, 0],
    endDatePickerValue: [0, 0, 0, 0, 0],
    datePickerRange: []
  },

  onLoad(options) {
    const { task_id } = options;
    if (!task_id) {
      showError('缺少任务ID');
      wx.navigateBack();
      return;
    }
    
    // 检查测试模式
    const isTestMode = testModeManager.isTestMode();
    this.setData({ 
      taskId: task_id,
      isTestMode 
    });
    console.log(`🧪 测试模式: ${isTestMode ? '开启' : '关闭'}`);
    
    // 初始化日期选择器数据
    this.initDatePickerRange();
    
    this.loadTaskDetail();
    
    // 设置测试模式热重载
    testModeManager.setupPageHotReload(this, this.loadTaskDetail);
  },

  /**
   * 初始化日期选择器范围
   */
  initDatePickerRange() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push(i.toString());
    }
    
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push(i.toString().padStart(2, '0'));
    }
    
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString().padStart(2, '0'));
    }
    
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    
    const minutes = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(i.toString().padStart(2, '0'));
    }
    
    this.setData({
      datePickerRange: [years, months, days, hours, minutes]
    });
  },

  /**
   * 加载任务详情
   */
  async loadTaskDetail() {
    console.log('📋 加载任务详情:', this.data.taskId);
    this.setData({ loading: true });
    
    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：使用Mock任务详情');
      setTimeout(() => {
        testModeManager.simulateScheduledTaskOperation('detail', this.data.taskId).then(response => {
          console.log('✅ 任务详情加载成功(测试模式):', response);
          if (response.data) {
            this.setData({
              taskData: response.data,
              loading: false,
              isTestMode: true
            });
            // 初始化时区选择器
            this.initTimezone(response.data.timezone);
            // 初始化日期选择器值
            this.initDatePickerValues(response.data.start_date, response.data.end_date);
            // 生成预览
            this.generateCronPreview();
            this.generateIntervalPreview();
          } else {
            showError('任务不存在(测试模式)');
            setTimeout(() => wx.navigateBack(), 1500);
          }
        });
      }, 300);
      return;
    }
    
    try {
      const response = await API.admin.getTaskDetail(this.data.taskId);
      
      console.log('✅ 任务详情加载成功:', response);
      
      if (response.data) {
        this.setData({
          taskData: response.data,
          loading: false
        });
        
        // 初始化时区选择器
        this.initTimezone(response.data.timezone);
        
        // 初始化日期选择器值
        this.initDatePickerValues(response.data.start_date, response.data.end_date);
        
        // 生成预览
        this.generateCronPreview();
        this.generateIntervalPreview();
      } else {
        throw new Error('返回数据格式错误');
      }
    } catch (error) {
      console.error('❌ 加载任务详情失败:', error);
      this.setData({ loading: false });
      showError(`加载失败: ${error.message || '未知错误'}`);
      
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  /**
   * 初始化时区选择器
   */
  initTimezone(timezone) {
    const timezones = this.data.timezones;
    const index = timezones.findIndex(tz => tz.value === timezone);
    const displayTimezone = index >= 0 ? timezones[index].label : timezone || 'Asia/Shanghai';
    
    this.setData({
      timezoneIndex: index >= 0 ? index : 0,
      currentTimezone: displayTimezone
    });
  },

  /**
   * 初始化日期选择器值
   */
  initDatePickerValues(startDate, endDate) {
    if (startDate) {
      const start = new Date(startDate);
      const currentYear = new Date().getFullYear();
      this.setData({
        startDatePickerValue: [
          start.getFullYear() - currentYear,
          start.getMonth(),
          start.getDate() - 1,
          start.getHours(),
          start.getMinutes()
        ]
      });
    }
    
    if (endDate) {
      const end = new Date(endDate);
      const currentYear = new Date().getFullYear();
      this.setData({
        endDatePickerValue: [
          end.getFullYear() - currentYear,
          end.getMonth(),
          end.getDate() - 1,
          end.getHours(),
          end.getMinutes()
        ]
      });
    }
  },

  /**
   * 输入框变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    console.log(`📝 字段更新: ${field} = ${value}`);
    
    this.setData({
      [`taskData.${field}`]: value
    });
    
    // 如果是cron或interval字段，更新预览
    if (field.startsWith('cron_')) {
      this.generateCronPreview();
    } else if (field.startsWith('interval_')) {
      this.generateIntervalPreview();
    }
  },

  /**
   * 开关变化处理
   */
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    console.log(`🔄 开关更新: ${field} = ${value}`);
    
    this.setData({
      [`taskData.${field}`]: value
    });
  },

  /**
   * 时区选择变化
   */
  onTimezoneChange(e) {
    const index = e.detail.value;
    const timezone = this.data.timezones[index];
    
    console.log(`🌏 时区更新:`, timezone);
    
    this.setData({
      timezoneIndex: index,
      currentTimezone: timezone.label,
      'taskData.timezone': timezone.value
    });
  },

  /**
   * 起始时间选择变化
   */
  onStartDateChange(e) {
    const values = e.detail.value;
    const ranges = this.data.datePickerRange;
    
    const year = ranges[0][values[0]];
    const month = ranges[1][values[1]];
    const day = ranges[2][values[2]];
    const hour = ranges[3][values[3]];
    const minute = ranges[4][values[4]];
    
    const dateStr = `${year}-${month}-${day} ${hour}:${minute}:00`;
    
    console.log(`📅 起始时间更新: ${dateStr}`);
    
    this.setData({
      startDatePickerValue: values,
      'taskData.start_date': dateStr
    });
  },

  /**
   * 结束时间选择变化
   */
  onEndDateChange(e) {
    const values = e.detail.value;
    const ranges = this.data.datePickerRange;
    
    const year = ranges[0][values[0]];
    const month = ranges[1][values[1]];
    const day = ranges[2][values[2]];
    const hour = ranges[3][values[3]];
    const minute = ranges[4][values[4]];
    
    const dateStr = `${year}-${month}-${day} ${hour}:${minute}:00`;
    
    console.log(`📅 结束时间更新: ${dateStr}`);
    
    this.setData({
      endDatePickerValue: values,
      'taskData.end_date': dateStr
    });
  },

  /**
   * 解析Cron字段表达式
   */
  parseCronField(value, fieldName, min, max) {
    value = (value || '*').toString().trim();
    
    // 任意值
    if (value === '*') {
      return { valid: true, desc: `每个${fieldName}` };
    }
    
    // */n 格式（间隔）
    if (/^\*\/\d+$/.test(value)) {
      const interval = parseInt(value.substring(2));
      if (interval > 0 && interval <= max) {
        return { valid: true, desc: `每${interval}${fieldName}` };
      }
      return { valid: false, desc: `间隔值无效` };
    }
    
    // a-b/c 格式（范围+间隔）
    if (/^\d+-\d+\/\d+$/.test(value)) {
      const match = value.match(/^(\d+)-(\d+)\/(\d+)$/);
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      const step = parseInt(match[3]);
      
      if (start >= min && end <= max && start < end && step > 0) {
        return { valid: true, desc: `从${start}到${end}，每${step}${fieldName}` };
      }
      return { valid: false, desc: `范围或间隔值无效` };
    }
    
    // a-b 格式（范围）
    if (/^\d+-\d+$/.test(value)) {
      const [start, end] = value.split('-').map(v => parseInt(v));
      if (start >= min && end <= max && start < end) {
        return { valid: true, desc: `${start}到${end}${fieldName}` };
      }
      return { valid: false, desc: `范围值无效` };
    }
    
    // a,b,c 格式（列表）
    if (value.includes(',')) {
      const values = value.split(',').map(v => v.trim());
      const numbers = values.map(v => parseInt(v));
      
      if (numbers.every(n => !isNaN(n) && n >= min && n <= max)) {
        return { valid: true, desc: `在${values.join('、')}${fieldName}` };
      }
      return { valid: false, desc: `列表值无效` };
    }
    
    // 单个数字
    const num = parseInt(value);
    if (!isNaN(num) && num >= min && num <= max) {
      return { valid: true, desc: `${num}${fieldName}` };
    }
    
    return { valid: false, desc: `表达式格式错误` };
  },

  /**
   * 生成Interval预览
   */
  generateIntervalPreview() {
    const { taskData } = this.data;
    if (!taskData || taskData.trigger_type !== 'interval') return;
    
    const parts = [];
    
    const weeks = parseInt(taskData.interval_weeks) || 0;
    const days = parseInt(taskData.interval_days) || 0;
    const hours = parseInt(taskData.interval_hours) || 0;
    const minutes = parseInt(taskData.interval_minutes) || 0;
    const seconds = parseInt(taskData.interval_seconds) || 0;
    
    if (weeks > 0) parts.push(`${weeks}周`);
    if (days > 0) parts.push(`${days}天`);
    if (hours > 0) parts.push(`${hours}小时`);
    if (minutes > 0) parts.push(`${minutes}分钟`);
    if (seconds > 0) parts.push(`${seconds}秒`);
    
    let preview = '';
    if (parts.length === 0) {
      preview = '❌ 请至少设置一个间隔值';
    } else {
      preview = `✅ 每 ${parts.join('')} 执行一次`;
    }
    
    this.setData({ 
      intervalPreview: preview
    });
  },

  /**
   * 生成Cron预览
   */
  generateCronPreview() {
    const { taskData } = this.data;
    if (!taskData) return;
    
    let preview = '';
    let isValid = true;
    let errorMsg = '';
    
    if (taskData.trigger_type === 'cron') {
      const month = taskData.cron_month || '*';
      const day = taskData.cron_day || '*';
      const dayOfWeek = taskData.cron_day_of_week || '*';
      const hour = taskData.cron_hour || '*';
      const minute = taskData.cron_minute || '0';
      const second = taskData.cron_second || '0';
      
      // 解析各个字段
      const monthParse = this.parseCronField(month, '月', 1, 12);
      const dayParse = this.parseCronField(day, '号', 1, 31);
      const dayOfWeekParse = this.parseCronField(dayOfWeek, '星期', 0, 6);
      const hourParse = this.parseCronField(hour, '时', 0, 23);
      const minuteParse = this.parseCronField(minute, '分', 0, 59);
      const secondParse = this.parseCronField(second, '秒', 0, 59);
      
      // 检查有效性
      const validations = [
        { valid: monthParse.valid, desc: monthParse.desc, name: '月份' },
        { valid: dayParse.valid, desc: dayParse.desc, name: '日期' },
        { valid: dayOfWeekParse.valid, desc: dayOfWeekParse.desc, name: '星期' },
        { valid: hourParse.valid, desc: hourParse.desc, name: '小时' },
        { valid: minuteParse.valid, desc: minuteParse.desc, name: '分钟' },
        { valid: secondParse.valid, desc: secondParse.desc, name: '秒' }
      ];
      
      const errors = validations.filter(v => !v.valid);
      if (errors.length > 0) {
        isValid = false;
        errorMsg = errors.map(e => `${e.name}: ${e.desc}`).join('; ');
        preview = `❌ ${errorMsg}`;
      } else {
        // 生成智能描述
        preview = this.generateSmartCronDesc(
          month, day, dayOfWeek, hour, minute, second,
          monthParse, dayParse, dayOfWeekParse, hourParse, minuteParse, secondParse
        );
        preview = `✅ ${preview}`;
      }
    } else if (taskData.trigger_type === 'interval') {
      const minutes = parseInt(taskData.interval_minutes) || 0;
      if (minutes > 0) {
        preview = `✅ 每 ${minutes} 分钟执行一次`;
      } else {
        preview = `❌ 间隔分钟数必须大于0`;
        isValid = false;
      }
    }
    
    this.setData({ 
      cronPreview: preview,
      cronValid: isValid
    });
  },

  /**
   * 生成智能的Cron描述（支持完整的cron表达式）
   */
  generateSmartCronDesc(month, day, dayOfWeek, hour, minute, second, monthParse, dayParse, dayOfWeekParse, hourParse, minuteParse, secondParse) {
    const monthIsAny = month === '*';
    const dayIsAny = day === '*';
    const dayOfWeekIsAny = dayOfWeek === '*';
    const hourIsAny = hour === '*';
    const minuteIsAny = minute === '*';
    const secondIsZero = second === '0';
    
    let description = '';
    
    // 1. 月份部分
    if (!monthIsAny) {
      description += monthParse.desc;
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
        description += `${dayParse.desc}且${this.formatDayOfWeek(dayOfWeek, dayOfWeekParse)}`;
      } else if (!dayIsAny) {
        // 只指定了日期
        description += dayParse.desc;
      } else {
        // 只指定了星期
        description += this.formatDayOfWeek(dayOfWeek, dayOfWeekParse);
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
          description += `每分钟的${secondParse.desc}`;
        }
      } else if (hourIsAny && !minuteIsAny) {
        if (secondIsZero) {
          description += `每小时的${minuteParse.desc}`;
        } else {
          description += `每小时的${minuteParse.desc}的${secondParse.desc}`;
        }
      } else if (!hourIsAny && minuteIsAny) {
        if (secondIsZero) {
          description += `${hourParse.desc}的每分钟`;
        } else {
          description += `${hourParse.desc}的每分钟的${secondParse.desc}`;
        }
      } else {
        // 小时和分钟都特定
        description += `${hourParse.desc}的${minuteParse.desc}`;
        
        if (!secondIsZero && second !== '*') {
          description += `的${secondParse.desc}`;
        }
      }
    }
    
    // 如果所有字段都是任意值
    if (monthIsAny && dayIsAny && dayOfWeekIsAny && hourIsAny && minuteIsAny) {
      description = secondIsZero ? '每分钟' : (second === '*' ? '每秒' : `每分钟的${secondParse.desc}`);
    }
    
    return description || '每天';
  },

  /**
   * 格式化星期描述
   */
  formatDayOfWeek(value, parse) {
    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    // 如果是单个数字，转换为中文
    if (/^\d$/.test(value)) {
      const num = parseInt(value);
      return weekNames[num] || parse.desc;
    }
    
    // 如果是多个值，转换每个
    if (value.includes(',')) {
      const nums = value.split(',').map(v => parseInt(v.trim()));
      const names = nums.map(n => weekNames[n]).filter(Boolean);
      return names.length > 0 ? names.join('、') : parse.desc;
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
    
    return parse.desc;
  },

  /**
   * 估算表达式会匹配的次数
   */
  estimateCount(value, min, max) {
    if (value === '*') {
      return max - min + 1;
    }
    
    // 列表
    if (value.includes(',')) {
      return value.split(',').length;
    }
    
    // 范围
    if (value.includes('-')) {
      const parts = value.split('/');
      const range = parts[0].split('-');
      const start = parseInt(range[0]);
      const end = parseInt(range[1]);
      
      if (parts.length > 1) {
        // 有间隔
        const step = parseInt(parts[1]);
        return Math.floor((end - start) / step) + 1;
      } else {
        // 纯范围
        return end - start + 1;
      }
    }
    
    // 间隔
    if (value.startsWith('*/')) {
      const interval = parseInt(value.substring(2));
      return Math.ceil((max - min + 1) / interval);
    }
    
    // 单个值
    return 1;
  },

  /**
   * 切换触发类型
   */
  switchTriggerType(e) {
    const { type } = e.currentTarget.dataset;
    const currentType = this.data.taskData.trigger_type;
    
    // 如果切换到相同类型，不做处理
    if (type === currentType) {
      return;
    }
    
    console.log(`🔄 切换触发类型: ${currentType} -> ${type}`);
    
    // 弹出确认提示
    wx.showModal({
      title: '切换触发类型',
      content: type === 'cron' 
        ? '切换到定时模式后，将使用Cron表达式配置执行时间。确认切换吗？'
        : '切换到间隔模式后，将按固定时间间隔执行任务。确认切换吗？',
      confirmText: '确认切换',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 更新触发类型
          this.setData({
            'taskData.trigger_type': type
          });
          
          // 根据新类型设置默认值
          if (type === 'interval') {
            // 切换到interval模式，设置默认间隔为30分钟
            if (!this.data.taskData.interval_minutes) {
              this.setData({
                'taskData.interval_minutes': 30
              });
            }
          } else if (type === 'cron') {
            // 切换到cron模式，设置默认值
            if (!this.data.taskData.cron_hour) {
              this.setData({
                'taskData.cron_month': '*',
                'taskData.cron_day': '*',
                'taskData.cron_day_of_week': '*',
                'taskData.cron_hour': '*/1',
                'taskData.cron_minute': '0',
                'taskData.cron_second': '0'
              });
            }
          }
          
          // 重新生成预览
          this.generateCronPreview();
          
          showSuccess(`已切换到${type === 'cron' ? '定时' : '间隔'}模式`);
        }
      }
    });
  },

  /**
   * 保存配置
   */
  async onSave() {
    console.log('💾 保存任务配置');
    
    const { taskData, cronValid } = this.data;
    
    // 检查表达式有效性
    if (!cronValid) {
      showError('Cron表达式无效，请修正后再保存');
      return;
    }
    
    this.setData({ saving: true });
    
    // 构建更新数据
    const updateData = {
      trigger_type: taskData.trigger_type
    };
    
    if (taskData.trigger_type === 'cron') {
      // Cron配置（包含所有字段）
      updateData.cron_year = taskData.cron_year || '*';
      updateData.cron_month = taskData.cron_month || '*';
      updateData.cron_week = taskData.cron_week || '*';
      updateData.cron_day = taskData.cron_day || '*';
      updateData.cron_day_of_week = taskData.cron_day_of_week || '*';
      updateData.cron_hour = taskData.cron_hour || '*';
      updateData.cron_minute = taskData.cron_minute || '0';
      updateData.cron_second = taskData.cron_second || '0';
    } else if (taskData.trigger_type === 'interval') {
      // Interval配置（完整支持）
      updateData.interval_weeks = parseInt(taskData.interval_weeks) || 0;
      updateData.interval_days = parseInt(taskData.interval_days) || 0;
      updateData.interval_hours = parseInt(taskData.interval_hours) || 0;
      updateData.interval_minutes = parseInt(taskData.interval_minutes) || 0;
      updateData.interval_seconds = parseInt(taskData.interval_seconds) || 0;
    }
    
    // 时间范围与时区
    if (taskData.start_date) {
      updateData.start_date = taskData.start_date;
    }
    if (taskData.end_date) {
      updateData.end_date = taskData.end_date;
    }
    updateData.timezone = taskData.timezone || 'Asia/Shanghai';
    
    // 抖动与延迟
    updateData.jitter = parseInt(taskData.jitter) || 0;
    updateData.random_delay_minutes = parseInt(taskData.random_delay_minutes) || 0;
    
    // 执行策略
    updateData.misfire_grace_time = parseInt(taskData.misfire_grace_time) || 60;
    updateData.max_instances = parseInt(taskData.max_instances) || 1;
    updateData.coalesce = Boolean(taskData.coalesce);
    updateData.replace_existing = Boolean(taskData.replace_existing);
    
    console.log('📤 发送更新数据:', updateData);
    
    // 测试模式
    if (testModeManager.isTestMode()) {
      console.log('🧪 测试模式：模拟保存任务配置');
      testModeManager.simulateScheduledTaskOperation('update', this.data.taskId, updateData).then(response => {
        this.setData({ saving: false });
        showSuccess('保存成功(测试模式)');
        
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      });
      return;
    }
    
    try {
      await API.admin.updateTask(this.data.taskId, updateData);
      
      this.setData({ saving: false });
      showSuccess('配置已更新并立即生效');
      
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('❌ 保存失败:', error);
      this.setData({ saving: false });
      showError(`保存失败: ${error.message || '未知错误'}`);
    }
  },

  /**
   * 取消编辑
   */
  onCancel() {
    wx.navigateBack();
  },

  /**
   * 编辑Cron字段
   */
  editCronField(e) {
    const { field } = e.currentTarget.dataset;
    console.log('🔧 打开Cron编辑器:', field);
    
    // 字段配置映射
    const fieldConfig = {
      year: {
        name: '年份',
        unit: '年',
        min: 1970,
        max: 2100,
        field: 'cron_year'
      },
      month: {
        name: '月份',
        unit: '月',
        min: 1,
        max: 12,
        field: 'cron_month'
      },
      week: {
        name: 'ISO周',
        unit: '周',
        min: 1,
        max: 53,
        field: 'cron_week'
      },
      day: {
        name: '日期',
        unit: '日',
        min: 1,
        max: 31,
        field: 'cron_day'
      },
      day_of_week: {
        name: '星期',
        unit: '',
        min: 0,
        max: 6,
        field: 'cron_day_of_week'
      },
      hour: {
        name: '小时',
        unit: '时',
        min: 0,
        max: 23,
        field: 'cron_hour'
      },
      minute: {
        name: '分钟',
        unit: '分',
        min: 0,
        max: 59,
        field: 'cron_minute'
      },
      second: {
        name: '秒',
        unit: '秒',
        min: 0,
        max: 59,
        field: 'cron_second'
      }
    };
    
    const config = fieldConfig[field];
    if (!config) {
      console.error('❌ 未知的字段:', field);
      return;
    }
    
    // 获取当前字段的值
    const currentValue = this.data.taskData[config.field] || '*';
    
    this.setData({
      showCronEditor: true,
      editingField: config.field,
      editingFieldName: config.name,
      editingUnit: config.unit,
      editingMin: config.min,
      editingMax: config.max,
      editingValue: currentValue
    });
  },

  /**
   * 关闭Cron编辑器
   */
  closeCronEditor(e) {
    // 防止重复调用
    if (!this.data.showCronEditor) {
      return;
    }
    
    console.log('❌ 关闭Cron编辑器');
    
    // ✅ 使用 nextTick 确保渲染完成，避免蒙层残留
    wx.nextTick(() => {
      this.setData({
        showCronEditor: false,
        editingField: '',
        editingFieldName: '',
        editingUnit: '',
        editingMin: 0,
        editingMax: 59,
        editingValue: '*'
      });
    });
  },

  /**
   * Cron编辑器确认
   */
  onCronEditorConfirm(e) {
    const { expression } = e.detail;
    const { editingField } = this.data;
    
    console.log(`✅ Cron编辑器确认: ${editingField} = ${expression}`);
    
    // 更新任务数据
    this.setData({
      [`taskData.${editingField}`]: expression,
      showCronEditor: false
    });
    
    // 重新生成预览
    this.generateCronPreview();
  },

  /**
   * 阻止点击弹窗内容时关闭
   */
  preventClose(e) {
    // 阻止事件冒泡到modal-overlay
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    return false;
  },
  
  /**
   * 阻止触摸滑动穿透
   */
  preventTouchMove(e) {
    // 阻止触摸事件穿透到下层
    return false;
  }
});