/**
 * 图表渲染优化器
 * 
 * 功能：
 * 1. 防抖处理（避免频繁渲染）
 * 2. 渲染队列管理
 * 3. 性能监控集成
 * 
 * 使用：
 * ```javascript
 * const { chartOptimizer } = require('../../utils/chart-optimizer');
 * 
 * // 防抖调用
 * chartOptimizer.debounce('my-chart', () => {
 *   this.drawChart();
 * }, 300);
 * ```
 */

const { performanceMonitor, PERF_TYPES } = require('./performance-monitor');

class ChartOptimizer {
  constructor() {
    // 防抖定时器缓存
    this._timers = new Map();
    
    // 渲染队列
    this._queue = [];
    
    // 是否正在渲染
    this._rendering = false;
    
    // 默认防抖延迟（毫秒）
    this._defaultDelay = 300;
  }

  /**
   * 防抖函数
   * @param {string} key - 唯一标识
   * @param {Function} func - 要执行的函数
   * @param {number} delay - 延迟时间（毫秒）
   */
  debounce(key, func, delay = this._defaultDelay) {
    // 清除之前的定时器
    if (this._timers.has(key)) {
      clearTimeout(this._timers.get(key));
    }

    // 设置新定时器
    const timer = setTimeout(() => {
      console.log(`[图表优化] 执行防抖任务: ${key}`);
      
      // 性能监控
      const perfKey = `chart_render_${key}`;
      performanceMonitor.mark(perfKey);
      
      try {
        func();
        performanceMonitor.measure(perfKey, perfKey, PERF_TYPES.CHART_RENDER);
      } catch (error) {
        console.error(`[图表优化] 渲染失败: ${key}`, error);
      } finally {
        this._timers.delete(key);
      }
    }, delay);

    this._timers.set(key, timer);
  }

  /**
   * 节流函数（确保最多每N毫秒执行一次）
   * @param {string} key - 唯一标识
   * @param {Function} func - 要执行的函数
   * @param {number} interval - 节流间隔（毫秒）
   */
  throttle(key, func, interval = this._defaultDelay) {
    const lastKey = `${key}_last`;
    const now = Date.now();

    // 检查是否在节流期内
    if (this._timers.has(lastKey)) {
      const lastTime = this._timers.get(lastKey);
      if (now - lastTime < interval) {
        console.log(`[图表优化] 节流跳过: ${key}`);
        return;
      }
    }

    // 更新最后执行时间
    this._timers.set(lastKey, now);

    console.log(`[图表优化] 执行节流任务: ${key}`);
    
    // 性能监控
    const perfKey = `chart_render_${key}`;
    performanceMonitor.mark(perfKey);
    
    try {
      func();
      performanceMonitor.measure(perfKey, perfKey, PERF_TYPES.CHART_RENDER);
    } catch (error) {
      console.error(`[图表优化] 渲染失败: ${key}`, error);
    }
  }

  /**
   * 添加到渲染队列
   * @param {Object} task - 渲染任务
   * @param {string} task.key - 任务标识
   * @param {Function} task.func - 渲染函数
   * @param {number} task.priority - 优先级（数字越大优先级越高）
   */
  enqueue(task) {
    // 检查是否已存在相同key的任务
    const existingIndex = this._queue.findIndex(t => t.key === task.key);
    if (existingIndex !== -1) {
      // 更新现有任务
      this._queue[existingIndex] = task;
      console.log(`[图表优化] 更新队列任务: ${task.key}`);
    } else {
      // 添加新任务
      this._queue.push(task);
      console.log(`[图表优化] 添加队列任务: ${task.key}`);
    }

    // 按优先级排序（降序）
    this._queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 尝试处理队列
    this.processQueue();
  }

  /**
   * 处理渲染队列
   */
  async processQueue() {
    if (this._rendering || this._queue.length === 0) {
      return;
    }

    this._rendering = true;

    while (this._queue.length > 0) {
      const task = this._queue.shift();
      
      console.log(`[图表优化] 处理队列任务: ${task.key}`);
      
      // 性能监控
      const perfKey = `chart_render_${task.key}`;
      performanceMonitor.mark(perfKey);
      
      try {
        await this._executeTask(task.func);
        performanceMonitor.measure(perfKey, perfKey, PERF_TYPES.CHART_RENDER);
      } catch (error) {
        console.error(`[图表优化] 队列任务失败: ${task.key}`, error);
      }

      // 添加短暂延迟，避免阻塞主线程
      await this._delay(50);
    }

    this._rendering = false;
  }

  /**
   * 执行任务
   * @param {Function} func 
   * @returns {Promise}
   */
  _executeTask(func) {
    return new Promise((resolve) => {
      try {
        const result = func();
        // 如果返回Promise，等待完成
        if (result && typeof result.then === 'function') {
          result.then(resolve).catch((error) => {
            console.error('[图表优化] 任务执行出错:', error);
            resolve();
          });
        } else {
          resolve();
        }
      } catch (error) {
        console.error('[图表优化] 任务执行出错:', error);
        resolve();
      }
    });
  }

  /**
   * 延迟执行
   * @param {number} ms 
   * @returns {Promise}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清除所有定时器
   */
  clearAll() {
    this._timers.forEach((timer, key) => {
      if (typeof timer === 'number') {
        clearTimeout(timer);
      }
    });
    this._timers.clear();
    this._queue = [];
    console.log('[图表优化] 已清除所有任务');
  }

  /**
   * 清除指定任务
   * @param {string} key 
   */
  clear(key) {
    if (this._timers.has(key)) {
      const timer = this._timers.get(key);
      if (typeof timer === 'number') {
        clearTimeout(timer);
      }
      this._timers.delete(key);
      console.log(`[图表优化] 已清除任务: ${key}`);
    }

    // 从队列中移除
    const index = this._queue.findIndex(t => t.key === key);
    if (index !== -1) {
      this._queue.splice(index, 1);
      console.log(`[图表优化] 已从队列移除: ${key}`);
    }
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      pendingTimers: this._timers.size,
      queueLength: this._queue.length,
      isRendering: this._rendering
    };
  }
}

// 导出单例
const chartOptimizer = new ChartOptimizer();

module.exports = {
  chartOptimizer,
  ChartOptimizer
};

