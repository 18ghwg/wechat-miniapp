/**
 * 异步Storage操作工具类
 * 用于替代同步Storage操作，避免阻塞主线程
 */

/**
 * 异步读取单个Storage值
 * @param {string} key - Storage键名
 * @param {any} defaultValue - 默认值（可选）
 * @returns {Promise<any>} Storage值
 */
export function getStorageAsync(key, defaultValue = null) {
  return new Promise((resolve) => {
    wx.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: () => resolve(defaultValue)
    });
  });
}

/**
 * 批量读取Storage值
 * @param {string[]} keys - Storage键名数组
 * @returns {Promise<Object>} 键值对对象
 * 
 * @example
 * const data = await getStorageBatch(['openid', 'userInfo', 'token']);
 * console.log(data.openid, data.userInfo, data.token);
 */
export async function getStorageBatch(keys) {
  const results = {};
  const promises = keys.map(key => 
    new Promise((resolve) => {
      wx.getStorage({
        key,
        success: (res) => { 
          results[key] = res.data; 
          resolve(); 
        },
        fail: () => { 
          results[key] = null; 
          resolve(); 
        }
      });
    })
  );
  
  await Promise.all(promises);
  return results;
}

/**
 * 异步写入单个Storage值
 * @param {string} key - Storage键名
 * @param {any} data - 要存储的数据
 * @returns {Promise<boolean>} 是否成功
 */
export function setStorageAsync(key, data) {
  return new Promise((resolve) => {
    wx.setStorage({
      key,
      data,
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

/**
 * 批量写入Storage值
 * @param {Object} data - 键值对对象
 * @returns {Promise<boolean>} 是否全部成功
 * 
 * @example
 * await setStorageBatch({
 *   openid: 'xxx',
 *   userInfo: {...},
 *   token: 'yyy'
 * });
 */
export async function setStorageBatch(data) {
  const promises = Object.keys(data).map(key =>
    new Promise((resolve) => {
      wx.setStorage({
        key,
        data: data[key],
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    })
  );
  
  const results = await Promise.all(promises);
  return results.every(r => r === true);
}

/**
 * 异步删除Storage值
 * @param {string} key - Storage键名
 * @returns {Promise<boolean>} 是否成功
 */
export function removeStorageAsync(key) {
  return new Promise((resolve) => {
    wx.removeStorage({
      key,
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

/**
 * 异步清空Storage
 * @returns {Promise<boolean>} 是否成功
 */
export function clearStorageAsync() {
  return new Promise((resolve) => {
    wx.clearStorage({
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

/**
 * 获取Storage信息
 * @returns {Promise<Object>} Storage信息
 */
export function getStorageInfoAsync() {
  return new Promise((resolve, reject) => {
    wx.getStorageInfo({
      success: (res) => resolve(res),
      fail: (err) => reject(err)
    });
  });
}

