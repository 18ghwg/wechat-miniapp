/**
 * 用户功能使用记录工具类
 * 用于记录和获取用户功能使用频率
 */

const { request } = require('./api');
const { testModeManager } = require('./testMode');
const mockData = require('./mock-data');

/**
 * 记录用户功能使用
 * @param {string} featureKey - 功能标识（如：electric、attendance、weather等）
 * @param {string} featureName - 功能名称
 * @param {string} [featureIcon] - 功能图标emoji（可选）
 * @returns {Promise<Object>} API响应
 */
function recordFeatureUsage(featureKey, featureName, featureIcon = '') {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid');
    const testMode = testModeManager.isGlobalTestMode();
    const isGuest = mockData.isGuestMode();
    
    // ⭐ 检查是否为测试账号（openid包含test）
    const isTestAccount = openid && openid.includes('test');
    
    // ⭐ 未登录、测试账号、测试模式或体验模式下都不记录
    if (!openid || testMode || isGuest || isTestAccount) {
      const reason = !openid ? '未登录' : 
                     (isGuest ? '体验模式' : 
                     (isTestAccount ? '测试账号' : '测试模式'));
      console.warn(`[Feature Usage] ${reason}，跳过功能使用记录`);
      resolve({ code: 200, message: reason });
      return;
    }

    const data = {
      feature_key: featureKey,
      feature_name: featureName,
      feature_icon: featureIcon,
      test_mode: testMode ? 1 : 0
    };

    request('/feature-usage/record', 'POST', data)
      .then(res => {
        if (res.code === 200) {
          console.log(`[Feature Usage] 记录成功: ${featureName}`);
          resolve(res);
        } else {
          console.warn(`[Feature Usage] 记录失败: ${res.message}`);
          reject(res);
        }
      })
      .catch(err => {
        console.error('[Feature Usage] 记录请求失败:', err);
        // 不影响主流程，静默失败
        resolve({ code: 500, message: '记录失败' });
      });
  });
}

/**
 * 获取用户常用功能列表
 * @param {number} [limit=6] - 返回的功能数量限制
 * @param {number} [minUsageCount=3] - 最小使用次数阈值
 * @param {number} [days=30] - 活跃天数范围
 * @returns {Promise<Array>} 常用功能列表
 */
function getFrequentFeatures(limit = 6, minUsageCount = 3, days = 30) {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid');
    const testMode = testModeManager.isGlobalTestMode();
    const isGuest = mockData.isGuestMode();
    
    // ⭐ 检查是否为测试账号
    const isTestAccount = openid && openid.includes('test');
    
    // ⭐ 未登录、测试账号、测试模式或体验模式下都不获取
    if (!openid || testMode || isGuest || isTestAccount) {
      const reason = !openid ? '未登录' : 
                     (isGuest ? '体验模式' : 
                     (isTestAccount ? '测试账号' : '测试模式'));
      console.warn(`[Feature Usage] ${reason}，无法获取常用功能`);
      resolve([]);
      return;
    }

    const params = {
      test_mode: testMode ? 1 : 0,
      limit: limit,
      min_usage_count: minUsageCount,
      days: days
    };

    request('/feature-usage/frequent', 'GET', params)
      .then(res => {
        if (res.code === 200) {
          console.log(`[Feature Usage] 获取到 ${res.data.length} 个常用功能`);
          resolve(res.data || []);
        } else {
          console.warn(`[Feature Usage] 获取常用功能失败: ${res.message}`);
          resolve([]);
        }
      })
      .catch(err => {
        console.error('[Feature Usage] 获取常用功能请求失败:', err);
        resolve([]);
      });
  });
}

/**
 * 获取所有可用功能列表
 * @returns {Promise<Array>} 所有可用功能列表
 */
function getAvailableFeatures() {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid');
    const testMode = testModeManager.isGlobalTestMode();
    const isGuest = mockData.isGuestMode();
    
    // ⭐ 检查是否为测试账号
    const isTestAccount = openid && openid.includes('test');
    
    // ⭐ 未登录、测试账号、测试模式或体验模式下都不获取
    if (!openid || testMode || isGuest || isTestAccount) {
      const reason = !openid ? '未登录' : 
                     (isGuest ? '体验模式' : 
                     (isTestAccount ? '测试账号' : '测试模式'));
      console.warn(`[Feature Usage] ${reason}，无法获取可用功能`);
      resolve([]);
      return;
    }

    const params = {
      test_mode: testMode ? 1 : 0
    };

    request('/feature-usage/available', 'GET', params)
      .then(res => {
        if (res.code === 200) {
          console.log(`[Feature Usage] 获取到 ${res.data.length} 个可用功能`);
          resolve(res.data || []);
        } else {
          console.warn(`[Feature Usage] 获取可用功能失败: ${res.message}`);
          resolve([]);
        }
      })
      .catch(err => {
        console.error('[Feature Usage] 获取可用功能请求失败:', err);
        resolve([]);
      });
  });
}

/**
 * 获取用户功能使用统计
 * @returns {Promise<Object>} 使用统计信息
 */
function getUserUsageStatistics() {
  return new Promise((resolve, reject) => {
    const openid = wx.getStorageSync('openid');
    const testMode = testModeManager.isGlobalTestMode();
    const isGuest = mockData.isGuestMode();
    
    // ⭐ 检查是否为测试账号
    const isTestAccount = openid && openid.includes('test');
    
    // ⭐ 未登录、测试账号、测试模式或体验模式下都不获取
    if (!openid || testMode || isGuest || isTestAccount) {
      const reason = !openid ? '未登录' : 
                     (isGuest ? '体验模式' : 
                     (isTestAccount ? '测试账号' : '测试模式'));
      console.warn(`[Feature Usage] ${reason}，无法获取使用统计`);
      resolve({
        total_features: 0,
        total_usage_count: 0,
        most_used_feature: null,
        recent_features: []
      });
      return;
    }

    const params = {
      test_mode: testMode ? 1 : 0
    };

    request('/feature-usage/statistics', 'GET', params)
      .then(res => {
        if (res.code === 200) {
          console.log('[Feature Usage] 获取使用统计成功');
          resolve(res.data);
        } else {
          console.warn(`[Feature Usage] 获取使用统计失败: ${res.message}`);
          resolve({
            total_features: 0,
            total_usage_count: 0,
            most_used_feature: null,
            recent_features: []
          });
        }
      })
      .catch(err => {
        console.error('[Feature Usage] 获取使用统计请求失败:', err);
        resolve({
          total_features: 0,
          total_usage_count: 0,
          most_used_feature: null,
          recent_features: []
        });
      });
  });
}

module.exports = {
  recordFeatureUsage,
  getFrequentFeatures,
  getAvailableFeatures,
  getUserUsageStatistics
};

