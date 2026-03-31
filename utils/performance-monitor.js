/**
 * 性能监控系统
 * 
 * 功能：
 * 1. 页面加载时间监控
 * 2. API调用性能监控
 * 3. 数据处理性能监控
 * 4. 自动性能预警
 * 5. 性能报告生成
 * 
 * 使用：
 * ```javascript
 * const { performanceMonitor } = require('../../utils/performance-monitor');
 * 
 * // 开始计时
 * performanceMonitor.mark('page_load_start');
 * 
 * // 结束计时
 * performanceMonitor.measure('page_load', 'page_load_start');
 * ```
 */

// 性能阈值配置（毫秒）
const THRESHOLDS = {
  pageLoad: 3000,       // 页面加载 < 3s
  apiCall: 5000,        // API调用 < 5s
  dataProcess: 500,     // 数据处理 < 500ms
  chartRender: 800,     // 图表渲染 < 800ms
  interaction: 100      // 交互响应 < 100ms
};

// 性能指标类型
const METRIC_TYPES = {
  PAGE_LOAD: 'page_load',
  API_CALL: 'api_call',
  DATA_PROCESS: 'data_process',
  CHART_RENDER: 'chart_render',
  INTERACTION: 'interaction'
};

class PerformanceMonitor {
  constructor() {
    // 性能标记存储
    this._marks = new Map();
    
    // 性能测量结果
    this._measures = [];
    
    // 最大存储数量
    this._maxMeasures = 100;
    
    // 是否启用监控
    this._enabled = true;
    
    // 是否正在监控
    this._isMonitoring = false;
    
    // 是否启用预警
    this._alertEnabled = true;
    
    // 预警回调
    this._alertCallback = null;
    
    // 性能阈值（可外部设置）
    this.thresholds = {
      pageLoadTime: 3000,
      apiResponseTime: 5000,
      renderTime: 100,
      memoryWarningCount: 3,
      errorRate: 0.05
    };
  }
  
  /**
   * 是否正在监控
   */
  get isMonitoring() {
    return this._isMonitoring;
  }
  
  /**
   * 启动监控
   */
  startMonitoring() {
    this._isMonitoring = true;
    this._enabled = true;
    console.log('[性能监控] 监控已启动');
  }
  
  /**
   * 停止监控
   */
  stopMonitoring() {
    this._isMonitoring = false;
    this._enabled = false;
    console.log('[性能监控] 监控已停止');
  }
  
  /**
   * 生成性能报告（兼容旧版本API）
   * @returns {Object}
   */
  generatePerformanceReport() {
    const allStats = this.getAllStats();
    const measures = this._measures;
    
    // 计算健康分数
    let healthScore = 100;
    let warnings = [];
    
    // 检查各项指标
    Object.entries(allStats).forEach(([type, stats]) => {
      if (stats.count > 0) {
        const threshold = this._getThreshold(type);
        if (stats.avg > threshold) {
          const exceed = Math.round(((stats.avg - threshold) / threshold) * 100);
          healthScore -= 10;
          warnings.push(`${type} 平均耗时超标 ${exceed}%`);
        }
      }
    });
    
    // 确保分数不低于0
    healthScore = Math.max(0, healthScore);
    
    return {
      timestamp: Date.now(),
      healthScore,
      stats: allStats,
      warnings,
      totalMeasures: measures.length,
      isHealthy: healthScore >= 70
    };
  }

  /**
   * 设置是否启用监控
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this._enabled = enabled;
    console.log(`[性能监控] 监控${enabled ? '已启用' : '已禁用'}`);
  }

  /**
   * 设置是否启用预警
   * @param {boolean} enabled 
   */
  setAlertEnabled(enabled) {
    this._alertEnabled = enabled;
  }

  /**
   * 设置预警回调
   * @param {Function} callback 
   */
  setAlertCallback(callback) {
    this._alertCallback = callback;
  }

  /**
   * 标记性能测量起点
   * @param {string} name - 标记名称
   */
  mark(name) {
    if (!this._enabled) return;
    
    const timestamp = Date.now();
    this._marks.set(name, timestamp);
    console.log(`[性能监控] 标记: ${name} @ ${timestamp}`);
  }

  /**
   * 测量性能（从标记到现在）
   * @param {string} name - 测量名称
   * @param {string} startMark - 起始标记
   * @param {string} type - 指标类型
   * @returns {number} 耗时（毫秒）
   */
  measure(name, startMark, type = METRIC_TYPES.INTERACTION) {
    if (!this._enabled) return 0;

    const startTime = this._marks.get(startMark);
    if (!startTime) {
      console.warn(`[性能监控] 起始标记不存在: ${startMark}`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 记录测量结果
    const measure = {
      name,
      type,
      startMark,
      duration,
      timestamp: endTime
    };

    this._measures.push(measure);

    // 限制存储数量
    if (this._measures.length > this._maxMeasures) {
      this._measures.shift();
    }

    // 清除已使用的标记
    this._marks.delete(startMark);

    console.log(`[性能监控] ${name}: ${duration}ms (类型: ${type})`);

    // 检查是否超过阈值
    this._checkThreshold(measure);

    return duration;
  }

  /**
   * 测量异步操作（Promise）
   * @param {string} name - 测量名称
   * @param {Promise} promise - Promise对象
   * @param {string} type - 指标类型
   * @returns {Promise} 包装后的Promise
   */
  async measureAsync(name, promise, type = METRIC_TYPES.API_CALL) {
    if (!this._enabled) return promise;

    const startTime = Date.now();

    try {
      const result = await promise;
      const duration = Date.now() - startTime;

      const measure = {
        name,
        type,
        duration,
        timestamp: Date.now(),
        success: true
      };

      this._measures.push(measure);

      if (this._measures.length > this._maxMeasures) {
        this._measures.shift();
      }

      console.log(`[性能监控] ${name}: ${duration}ms (类型: ${type}, 成功)`);
      this._checkThreshold(measure);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      const measure = {
        name,
        type,
        duration,
        timestamp: Date.now(),
        success: false,
        error: error.message
      };

      this._measures.push(measure);
      console.error(`[性能监控] ${name}: ${duration}ms (类型: ${type}, 失败)`, error);

      throw error;
    }
  }

  /**
   * 检查性能阈值
   * @param {Object} measure - 测量结果
   */
  _checkThreshold(measure) {
    if (!this._alertEnabled) return;

    let threshold;
    switch (measure.type) {
      case METRIC_TYPES.PAGE_LOAD:
        threshold = THRESHOLDS.pageLoad;
        break;
      case METRIC_TYPES.API_CALL:
        threshold = THRESHOLDS.apiCall;
        break;
      case METRIC_TYPES.DATA_PROCESS:
        threshold = THRESHOLDS.dataProcess;
        break;
      case METRIC_TYPES.CHART_RENDER:
        threshold = THRESHOLDS.chartRender;
        break;
      case METRIC_TYPES.INTERACTION:
        threshold = THRESHOLDS.interaction;
        break;
      default:
        return;
    }

    if (measure.duration > threshold) {
      const alert = {
        name: measure.name,
        type: measure.type,
        duration: measure.duration,
        threshold,
        exceedPercent: Math.round(((measure.duration - threshold) / threshold) * 100)
      };

      console.warn(`[性能预警] ${alert.name} 超时 ${alert.exceedPercent}%: ${alert.duration}ms (阈值: ${threshold}ms)`);

      // 调用预警回调
      if (this._alertCallback) {
        this._alertCallback(alert);
      }
    }
  }

  /**
   * 获取性能统计
   * @param {string} type - 指标类型（可选）
   * @returns {Object} 统计结果
   */
  getStats(type = null) {
    let measures = this._measures;

    if (type) {
      measures = measures.filter(m => m.type === type);
    }

    if (measures.length === 0) {
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        total: 0
      };
    }

    const durations = measures.map(m => m.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);
    const avg = total / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: measures.length,
      avg: Math.round(avg),
      min,
      max,
      total
    };
  }

  /**
   * 获取所有类型的统计
   * @returns {Object} 按类型分组的统计
   */
  getAllStats() {
    const stats = {};

    Object.values(METRIC_TYPES).forEach(type => {
      stats[type] = this.getStats(type);
    });

    return stats;
  }

  /**
   * 获取最近的测量结果
   * @param {number} count - 数量
   * @returns {Array} 测量结果数组
   */
  getRecentMeasures(count = 10) {
    return this._measures.slice(-count);
  }

  /**
   * 生成性能报告
   * @returns {string} 格式化的报告
   */
  generateReport() {
    const allStats = this.getAllStats();
    
    let report = '\n========== 性能监控报告 ==========\n\n';

    Object.entries(allStats).forEach(([type, stats]) => {
      if (stats.count > 0) {
        report += `【${type}】\n`;
        report += `  样本数: ${stats.count}\n`;
        report += `  平均值: ${stats.avg}ms\n`;
        report += `  最小值: ${stats.min}ms\n`;
        report += `  最大值: ${stats.max}ms\n`;
        report += `  总耗时: ${stats.total}ms\n\n`;
      }
    });

    // 预警统计
    const warnings = this._measures.filter(m => {
      const threshold = this._getThreshold(m.type);
      return m.duration > threshold;
    });

    if (warnings.length > 0) {
      report += `【性能预警】\n`;
      report += `  预警次数: ${warnings.length}\n`;
      report += `  预警率: ${Math.round((warnings.length / this._measures.length) * 100)}%\n\n`;
    }

    report += '==================================\n';

    return report;
  }

  /**
   * 获取阈值
   * @param {string} type 
   * @returns {number}
   */
  _getThreshold(type) {
    switch (type) {
      case METRIC_TYPES.PAGE_LOAD:
        return THRESHOLDS.pageLoad;
      case METRIC_TYPES.API_CALL:
        return THRESHOLDS.apiCall;
      case METRIC_TYPES.DATA_PROCESS:
        return THRESHOLDS.dataProcess;
      case METRIC_TYPES.CHART_RENDER:
        return THRESHOLDS.chartRender;
      case METRIC_TYPES.INTERACTION:
        return THRESHOLDS.interaction;
      default:
        return Infinity;
    }
  }

  /**
   * 清除所有数据
   */
  clear() {
    this._marks.clear();
    this._measures = [];
    console.log('[性能监控] 已清除所有数据');
  }

  /**
   * 导出数据（用于上报）
   * @returns {Object} 性能数据
   */
  exportData() {
    return {
      measures: this._measures,
      stats: this.getAllStats(),
      timestamp: Date.now()
    };
  }
}

// 导出单例
const performanceMonitor = new PerformanceMonitor();

// 导出指标类型常量
const PERF_TYPES = METRIC_TYPES;

module.exports = {
  performanceMonitor,
  PerformanceMonitor,
  PERF_TYPES,
  THRESHOLDS
};
