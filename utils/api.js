/**
 * API请求工具类
 */

// 导入环境管理器
const { environmentManager, getEnvironmentInfo } = require('./environment');
// 导入签名工具
const SignatureUtil = require('./signature');
// 导入mock数据工具（用于检查游客模式）
const mockData = require('./mock-data');

// 调试日志工具（统一控制所有API日志输出）
// 在 app.js 中设置 globalData.enableApiDebug = true 开启调试日志
const apiLog = {
  isEnabled() {
    try {
      const app = getApp();
      return app && app.globalData && app.globalData.enableApiDebug;
    } catch (e) {
      return false;
    }
  },
  log() {
    if (this.isEnabled()) {
      console.log.apply(console, arguments);
    }
  }
};

// 获取API基础URL（动态获取，支持环境切换）
const getBaseUrl = () => {
  return environmentManager.getFullApiUrl();
};

// 动态获取超时时间
const getTimeout = (isLongTimeout = false) => {
  return environmentManager.getTimeout(isLongTimeout);
};

/**
 * 通用请求方法
 * @param {string} url 接口地址
 * @param {string} method 请求方法
 * @param {object} data 请求参数
 * @param {boolean} needAuth 是否需要登录
 */
function request(url, method = 'GET', data = {}, needAuth = true) {
  return new Promise((resolve, reject) => {
    const header = {};

    // 对于POST/PUT等方法，始终设置JSON内容类型
    if (method !== 'GET') {
      header['Content-Type'] = 'application/json';
    }

    // 添加认证头（openid）
    if (needAuth) {
      const openid = wx.getStorageSync('openid');
      if (openid) {
        header['X-Wechat-Openid'] = openid;
      }
    }

    // ✅ 对于GET请求，将data参数构建到URL中
    let finalUrl = url;
    let requestData = data;
    
    if (method === 'GET' && data && Object.keys(data).length > 0) {
      // 构建查询字符串（按key排序）
      const keys = Object.keys(data).sort();
      const queryString = keys.map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
      finalUrl = `${url}?${queryString}`;
      requestData = {};  // GET请求不需要body
    }

    // 添加API签名（防止抓包攻击）
    // 所有请求都添加签名，包括登录接口
    // 测试模式下后端会跳过签名验证
    try {
      // ✅ 使用完整路径生成签名（包含 /api/wechat 前缀）
      const fullUrl = getBaseUrl() + finalUrl;  // 完整URL（包含查询参数）
      const {timestamp: signTimestamp, signature} = SignatureUtil.generateSignature(method, fullUrl, requestData);
      header['X-Timestamp'] = signTimestamp;
      header['X-Signature'] = signature;
    } catch (err) {
      console.error('⚠️ 签名生成失败:', err);
      // 签名生成失败时，仍然发送请求（测试模式下可能不需要签名）
      // 正式环境如果签名失败，后端会拒绝请求
    }

    // API请求日志（仅在开启调试模式时打印）
    const timestamp = new Date().toLocaleTimeString();
    apiLog.log('🚀 ===== API请求发送 =====');
    apiLog.log(`📤 时间: ${timestamp}`);
    apiLog.log(`🎯 URL: ${method} ${finalUrl}`);
    apiLog.log(`🌐 完整地址: ${getBaseUrl() + finalUrl}`);
    if (Object.keys(requestData).length > 0) {
      apiLog.log(`📦 请求数据:`, requestData);
    }
    if (Object.keys(header).length > 0) {
      apiLog.log(`📋 请求头:`, header);
    }
    apiLog.log('========================');

    wx.request({
      url: getBaseUrl() + finalUrl,
      method,
      data: requestData,
      header,
      timeout: getTimeout(),
      success: (res) => {
        // API响应日志（仅在开启调试模式时打印）
        const responseTimestamp = new Date().toLocaleTimeString();
        const isSuccess = res.statusCode === 200;
        const statusIcon = isSuccess ? '✅' : '❌';
        
        apiLog.log(`${statusIcon} ===== API响应接收 =====`);
        apiLog.log(`📥 时间: ${responseTimestamp}`);
        apiLog.log(`🎯 URL: ${method} ${url}`);
        apiLog.log(`📊 状态码: ${res.statusCode}`);
        if (res.data) {
          apiLog.log(`📦 响应数据:`, res.data);
        }
        apiLog.log('========================');
        
        if (res.statusCode === 200) {
          const { code, msg, data: responseData } = res.data;
          apiLog.log(`🔍 业务状态码: ${code} | 消息: ${msg || '无'}`);
          if (code === 200) {
            resolve({ code, msg, data: responseData });
          } else if (code === 401) {
            // 检查是否是网盘认证失败，而不是用户身份认证失败
            apiLog.log('🔍 401错误调试 - responseData:', responseData);
            apiLog.log('🔍 401错误调试 - need_netdisk_update:', responseData ? responseData.need_netdisk_update : 'responseData is null');
            
            if (responseData && responseData.need_netdisk_update) {
              // 这是网盘认证失败，不是用户身份认证失败，正常返回给业务层处理
              apiLog.log('⚠️ 网盘账号认证失败，由业务层处理');
              resolve({ code, msg, data: responseData });
            } else {
              // ⭐ 检查是否为游客模式
              const isGuest = mockData.isGuestMode();
              if (isGuest) {
                // 游客模式下，不跳转登录页，只是返回错误
                apiLog.log('🎭 游客模式：401错误，不跳转登录页');
                reject(new Error(msg || '该功能需要登录'));
              } else {
                // 用户身份认证失败，跳转到登录页
                apiLog.log('❌ 用户身份认证失败，跳转登录页');
                wx.removeStorageSync('openid');
                wx.removeStorageSync('userInfo');
                wx.reLaunch({
                  url: '/pages/login/index'
                });
                reject(new Error(msg || '请先登录'));
              }
            }
          } else if (code === 403) {
            // 权限不足，显示友好提示
            const errorMsg = msg || '权限不足';
            wx.showModal({
              title: '权限提示',
              content: `${errorMsg}\n\n如需使用此功能，请：\n1. 绑定管理员账号\n2. 联系管理员授权`,
              showCancel: true,
              cancelText: '知道了',
              confirmText: '去绑定',
              success(res) {
                if (res.confirm) {
                  // 跳转到绑定页面
                  wx.navigateTo({
                    url: '/pages/user/bind/index'
                  });
                }
              }
            });
            reject(new Error(errorMsg));
          } else if (code === 404) {
            // 404错误，特殊处理（如姓名未完善等）
            const error = new Error(msg || '资源未找到');
            error.need_complete_name = res.data.need_complete_name;
            reject(error);
          } else if (code >= 500) {
            // 服务器内部错误（500+）- 应该作为真正的错误处理
            apiLog.log('❌ 服务器内部错误');
            reject(new Error(msg || '服务器内部错误'));
          } else {
            // 其他业务错误（如密码错误等）- 返回完整的响应数据供业务层处理
            apiLog.log('⚠️ API业务错误');
            resolve({ code, msg, data: responseData });
          }
        } else {
          reject(new Error(`网络错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 改进的请求失败日志格式
        const failTimestamp = new Date().toLocaleTimeString();
        apiLog.log('❌ ===== API请求失败 =====');
        apiLog.log(`📤 时间: ${failTimestamp}`);
        apiLog.log(`🎯 URL: ${method} ${url}`);
        apiLog.log(`💥 失败原因: 网络连接失败`);
        console.log('========================');
        
        reject(new Error('网络连接失败'));
      }
    });
  });
}

/**
 * 长超时时间请求方法（用于电费查询等耗时操作）
 * @param {string} url 接口地址
 * @param {string} method 请求方法
 * @param {object} data 请求参数
 * @param {boolean} needAuth 是否需要登录
 */
function requestWithLongTimeout(url, method = 'GET', data = {}, needAuth = true) {
  return new Promise((resolve, reject) => {
    const header = {};

    // 对于POST/PUT等方法，始终设置JSON内容类型
    if (method !== 'GET') {
      header['Content-Type'] = 'application/json';
    }

    // 添加认证头
    if (needAuth) {
      const openid = wx.getStorageSync('openid');
      if (openid) {
        header['X-Wechat-Openid'] = openid;
      }
    }

    // ✅ 对于GET请求，将data参数构建到URL中
    let finalUrl = url;
    let requestData = data;
    
    if (method === 'GET' && data && Object.keys(data).length > 0) {
      // 构建查询字符串（按key排序）
      const keys = Object.keys(data).sort();
      const queryString = keys.map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
      finalUrl = `${url}?${queryString}`;
      requestData = {};  // GET请求不需要body
    }

    // 添加API签名（防止抓包攻击）
    try {
      // ✅ 使用完整路径生成签名（包含 /api/wechat 前缀）
      const fullUrl = getBaseUrl() + finalUrl;  // 完整URL（包含查询参数）
      const {timestamp: signTimestamp, signature} = SignatureUtil.generateSignature(method, fullUrl, requestData);
      header['X-Timestamp'] = signTimestamp;
      header['X-Signature'] = signature;
    } catch (err) {
      console.error('⚠️ 签名生成失败:', err);
      // 签名生成失败时，仍然发送请求（测试模式下可能不需要签名）
    }

    // 长超时API请求日志（仅在开启调试模式时打印）
    const timestamp = new Date().toLocaleTimeString();
    apiLog.log('🚀 ===== 长超时API请求发送 =====');
    apiLog.log(`📤 时间: ${timestamp}`);
    apiLog.log(`🎯 URL: ${method} ${finalUrl}`);
    apiLog.log(`🌐 完整地址: ${getBaseUrl() + finalUrl}`);
    apiLog.log(`⏰ 超时时间: ${getTimeout(true) / 1000}秒`);
    if (Object.keys(requestData).length > 0) {
      apiLog.log(`📦 请求数据:`, requestData);
    }
    if (Object.keys(header).length > 0) {
      apiLog.log(`📋 请求头:`, header);
    }
    apiLog.log('==========================');

    wx.request({
      url: getBaseUrl() + finalUrl,
      method,
      data: requestData,
      header,
      timeout: getTimeout(true), // 电费查询使用长超时时间
      success: (res) => {
        // 长超时API响应日志（仅在开启调试模式时打印）
        const responseTimestamp = new Date().toLocaleTimeString();
        const isSuccess = res.statusCode === 200;
        const statusIcon = isSuccess ? '✅' : '❌';
        
        apiLog.log(`${statusIcon} ===== 长超时API响应接收 =====`);
        apiLog.log(`📥 时间: ${responseTimestamp}`);
        apiLog.log(`🎯 URL: ${method} ${finalUrl}`);
        apiLog.log(`📊 状态码: ${res.statusCode}`);
        if (res.data) {
          apiLog.log(`📦 响应数据:`, res.data);
        }
        apiLog.log('==========================');
        
        if (res.statusCode === 200) {
          const { code, msg, data: responseData } = res.data;
          apiLog.log(`🔍 业务状态码: ${code} | 消息: ${msg || '无'}`);
          if (code === 200) {
            resolve({ code, msg, data: responseData });
          } else if (code === 401) {
            // 检查是否是网盘认证失败，而不是用户身份认证失败
            apiLog.log('🔍 401错误调试 - responseData:', responseData);
            apiLog.log('🔍 401错误调试 - need_netdisk_update:', responseData ? responseData.need_netdisk_update : 'responseData is null');
            
            if (responseData && responseData.need_netdisk_update) {
              // 这是网盘认证失败，不是用户身份认证失败，正常返回给业务层处理
              apiLog.log('⚠️ 网盘账号认证失败，由业务层处理');
              resolve({ code, msg, data: responseData });
            } else {
              // ⭐ 检查是否为游客模式
              const isGuest = mockData.isGuestMode();
              if (isGuest) {
                // 游客模式下，不跳转登录页，只是返回错误
                apiLog.log('🎭 游客模式：401错误，不跳转登录页');
                reject(new Error(msg || '该功能需要登录'));
              } else {
                // 用户身份认证失败，跳转到登录页
                apiLog.log('❌ 用户身份认证失败，跳转登录页');
                wx.removeStorageSync('openid');
                wx.removeStorageSync('userInfo');
                wx.reLaunch({
                  url: '/pages/login/index'
                });
                reject(new Error(msg || '请先登录'));
              }
            }
          } else if (code === 403) {
            // 权限不足，显示友好提示
            const errorMsg = msg || '权限不足';
            wx.showModal({
              title: '权限提示',
              content: `${errorMsg}\n\n如需使用此功能，请：\n1. 绑定管理员账号\n2. 联系管理员授权`,
              showCancel: true,
              cancelText: '知道了',
              confirmText: '去绑定',
              success(res) {
                if (res.confirm) {
                  // 跳转到绑定页面
                  wx.navigateTo({
                    url: '/pages/user/bind/index'
                  });
                }
              }
            });
            reject(new Error(errorMsg));
          } else if (code === 404) {
            // 404错误，特殊处理（如姓名未完善等）
            const error = new Error(msg || '资源未找到');
            error.need_complete_name = res.data.need_complete_name;
            reject(error);
          } else if (code >= 500) {
            // 服务器内部错误（500+）- 应该作为真正的错误处理
            apiLog.log('❌ 长超时API服务器内部错误');
            reject(new Error(msg || '服务器内部错误'));
          } else {
            // 其他业务错误（如密码错误等）- 返回完整的响应数据供业务层处理
            apiLog.log('⚠️ 长超时API业务错误');
            resolve({ code, msg, data: responseData });
          }
        } else {
          reject(new Error(`网络错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        // 改进的长超时请求失败日志格式
        const failTimestamp = new Date().toLocaleTimeString();
        const isTimeout = err.errMsg && err.errMsg.includes('timeout');
        const failReason = isTimeout ? '请求超时' : '网络连接失败';
        
        apiLog.log('❌ ===== 长超时API请求失败 =====');
        apiLog.log(`📤 时间: ${failTimestamp}`);
        apiLog.log(`🎯 URL: ${method} ${url}`);
        apiLog.log(`💥 失败原因: ${failReason}`);
        console.log('==========================');
        
        if (isTimeout) {
          reject(new Error('请求超时，请检查网络连接或稍后重试'));
        } else {
          reject(new Error('网络连接失败'));
        }
      }
    });
  });
}

/**
 * 显示加载提示
 */
function showLoading(title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  wx.hideLoading();
}

/**
 * 显示错误提示
 */
function showError(message) {
  wx.showToast({
    title: message,
    icon: 'error',
    duration: 2000
  });
}

/**
 * 显示成功提示
 */
function showSuccess(message) {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  });
}

/**
 * API接口定义
 */
const API = {
  // 用户认证相关
  auth: {
    // 微信登录
    login(code, userInfo) {
      return request('/auth/login', 'POST', { code, userInfo }, false);
    },

    // 账号密码登录（使用统一的request函数，自动添加签名）
    accountLogin(username, password, captchaToken) {
      return request('/auth/account-login', 'POST', { 
        username, 
        password,
        captcha_token: captchaToken 
      }, false);  // false表示不需要openid认证（用户还未登录），但仍会生成签名
    },

    // 绑定Web用户
    bind(username, password) {
      return request('/auth/bind', 'POST', { username, password });
    },

    // 解绑Web用户
    unbind() {
      return request('/auth/unbind', 'POST');
    }
  },

  // 用户信息相关
  user: {
    // 获取用户信息
    getInfo() {
      return request('/user/info', 'GET');
    },

    // 调试用户权限信息
    debugPermissions() {
      return request('/user/debug-permissions', 'GET');
    },

    // 更新真实姓名
    updateRealName(realName) {
      return request('/user/update_real_name', 'POST', { real_name: realName });
    },

    // 注销账号
    deleteAccount() {
      return request('/user/delete-account', 'POST');
    }
  },

  // 电费查询相关
  electric: {
    // 查询电费（使用更长的超时时间）
    query() {
      return requestWithLongTimeout('/electric/query', 'POST');
    },

    // 获取历史记录
    getHistory(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/electric/history', 'GET', params);
    },

    // 获取账号统计信息（管理员功能）
    getAccountStats() {
      return request('/electric/account-stats', 'GET');
    },

    // 获取管理员账号选项（管理员权限）
    getAdminAccountOptions() {
      return request('/electric/admin-account-options', 'GET');
    },

    // 获取用户户号选项（普通用户权限）
    getUserAccountOptions(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/electric/user-account-options', 'GET', params);
    },

    // 获取管理员指定账号下的户号选项（管理员权限）
    getAdminRoomOptions(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/electric/admin-room-options', 'GET', params);
    },

    // 获取实体电表数据（响应中已包含今日用电量 today_kwh 字段）
    getPhysicalMeters() {
      return request('/physical-meters', 'GET');
    }
  },

  // 国网账号绑定相关
  grid: {
    // 获取用户绑定的国网账号
    getAccounts() {
      return request('/grid/accounts', 'GET');
    },

    // 绑定国网账号（新版本，支持密码验证）
    bind(data) {
      return request('/grid/accounts/bind', 'POST', data);
    },

    // 绑定国网账号（旧版本，保持兼容）
    bindAccount(data) {
      return request('/grid/accounts/bind', 'POST', data);
    },

    // 解绑国网账号
    unbind(data) {
      return request(`/grid/accounts/${data.account_id}`, 'DELETE');
    },

    // 解绑国网账号（旧版本，保持兼容）
    unbindAccount(accountId) {
      return request(`/grid/accounts/${accountId}`, 'DELETE');
    },

    // 编辑国网账号
    updateAccount(accountId, data) {
      return request(`/grid/accounts/${accountId}`, 'PUT', data);
    },

    // 获取所有国网账号（管理员功能）
    getAllAccounts() {
      return request('/grid/accounts/all', 'GET');
    },

    // 设置账号为使用状态
    setActiveAccount(accountId) {
      return request(`/grid/accounts/${accountId}/set-active`, 'POST');
    },

    // 检测电表IP是否在线并获取SN号码
    checkMeterIP(ip) {
      return request('/grid/check-meter-ip', 'POST', { ip });
    }
  },

  // 考勤管理相关
  attendance: {
    // 获取用户真实姓名
    getRealName() {
      return request('/attendance/get_real_name', 'GET');
    },

    // 获取今日考勤状态
    getTodayAttendance(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/attendance/today', 'GET', params);
    },

    // 获取所有考勤人员列表（管理员功能）
    getEmployees() {
      return request('/attendance/employees', 'GET');
    },

    // 获取WorkKaoQinUsers表中的考勤人员列表
    getKaoqinUsers() {
      return request('/attendance/kaoqin-users', 'GET');
    },

    // 提交考勤
    submit(data) {
      return request('/attendance/submit', 'POST', data);
    },

    // 根据ID获取考勤记录详情
    getById(id) {
      return request(`/attendance/${id}`, 'GET');
    },

    // 更新考勤（编辑模式）
    update(id, data) {
      return request(`/attendance/${id}`, 'PUT', data);
    },

    // 删除考勤记录
    delete(id) {
      return request(`/attendance/${id}`, 'DELETE');
    },

    // 获取考勤历史
    getHistory(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/attendance/history', 'GET', params);
    },

    // 获取用户网盘账号信息
    getNetdiskInfo(userName = '') {
      const query = userName ? `?user_name=${encodeURIComponent(userName)}` : '';
      return request(`/attendance/netdisk-info${query}`, 'GET');
    },

    // 更新用户网盘账号信息
    updateNetdiskInfo(data) {
      return request('/attendance/netdisk-info', 'POST', data);
    },

    // 删除用户网盘账号信息
    deleteNetdiskInfo(userName) {
      return request(`/attendance/netdisk-info?user_name=${encodeURIComponent(userName)}`, 'DELETE');
    },

    // ⭐ 批量补打卡完成后，统一上传到公盘
    uploadToNetdisk(data) {
      return request('/attendance/upload-to-netdisk', 'POST', data);
    }
  },

  // 系统相关
  system: {
    // 获取系统配置
    getConfig() {
      return request('/system/config', 'GET');
    },

    // 健康检查
    healthCheck() {
      return request('/system/health', 'GET', {}, false);
    }
  },

  // 公告管理相关
  announcement: {
    // 获取公告列表
    getList() {
      return request('/announcement/list', 'GET');
    },

    // 管理员获取所有公告
    getManageList() {
      return request('/announcement/manage', 'GET');
    },

    // 创建公告
    create(data) {
      return request('/announcement/create', 'POST', data);
    },

    // 更新公告
    update(id, data) {
      return request(`/announcement/update/${id}`, 'PUT', data);
    },

    // 删除公告
    delete(id) {
      return request(`/announcement/delete/${id}`, 'DELETE');
    }
  },

  // 意见反馈相关
  feedback: {
    // 获取反馈设置
    getSetting() {
      return request('/feedback/setting', 'GET');
    },

    // 提交反馈
    submit(data) {
      return request('/feedback/submit', 'POST', data);
    },

    // 获取用户反馈列表
    getList() {
      return request('/feedback/list', 'GET');
    },

    // 管理员获取所有反馈
    getManageList(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/feedback/manage', 'GET', params);
    },

    // 管理员回复反馈
    reply(id, data) {
      return request(`/feedback/reply/${id}`, 'POST', data);
    },

    // 更新反馈设置
    updateSetting(data) {
      return request('/feedback/setting/update', 'PUT', data);
    }
  },

  // 小程序账号管理相关（管理员功能）
  miniprogramAdmin: {
    // 获取所有小程序用户列表
    getUsers(params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request('/admin/miniprogram-users', 'GET', params);
    },

    // 创建小程序用户
    createUser(data) {
      return request('/admin/miniprogram-users', 'POST', data);
    },

    // 更新小程序用户信息
    updateUser(userId, data) {
      return request(`/admin/miniprogram-users/${userId}`, 'PUT', data);
    },

    // 删除小程序用户
    deleteUser(userId) {
      return request(`/admin/miniprogram-users/${userId}`, 'DELETE');
    },

    // 获取用户权限详情
    getUserPermissions(userId) {
      return request(`/admin/miniprogram-users/${userId}/permissions`, 'GET');
    },

    // 获取用户操作日志
    getUserLogs(userId, params = {}) {
      // ✅ 将params作为data传递，让request函数处理查询参数和签名
      return request(`/admin/miniprogram-users/${userId}/operation-logs`, 'GET', params);
    }
  },

  // 定时任务管理相关（管理员功能）
  admin: {
    // 获取任务列表（默认包含所有任务，包括禁用的）
    getTasks(includeDisabled = true) {
      const url = `/admin/tasks${includeDisabled ? '?include_disabled=true' : '?include_disabled=false'}`;
      return request(url, 'GET');
    },

    // 获取任务详情
    getTaskDetail(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}`, 'GET');
    },

    // 更新任务配置
    updateTask(taskId, data) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}`, 'PUT', data);
    },

    // 暂停任务
    pauseTask(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}/pause`, 'POST');
    },

    // 恢复任务
    resumeTask(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}/resume`, 'POST');
    },

    // 立即执行任务
    runTaskNow(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}/run`, 'POST');
    },
    
    // 获取任务执行状态
    getTaskStatus(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}/status`, 'GET');
    },

    // 删除任务
    deleteTask(taskId) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}`, 'DELETE');
    },

    // 获取任务日志
    getTaskLogs(taskId, params = {}) {
      return request(`/admin/tasks/${encodeURIComponent(taskId)}/logs`, 'GET', params);
    },

    // 获取可用日志日期列表
    getLogDates() {
      return request('/admin/logs/dates', 'GET');
    },

    // 使用记录管理相关
    // 获取使用记录列表
    getUsageRecords(params) {
      const queryString = Object.keys(params)
        .filter(key => params[key])
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      const url = `/admin/usage-records${queryString ? '?' + queryString : ''}`;
      return request(url, 'GET');
    },

    // 获取使用统计
    getUsageStats() {
      return request('/admin/usage-records/stats', 'GET');
    },

    // 获取使用记录总数
    getUsageRecordsCount() {
      return request('/feature-usage/total-count', 'GET');
    },

    // 清理旧的使用记录
    cleanupUsageRecords(data) {
      return request('/feature-usage/cleanup', 'POST', data);
    },

    // 创建使用记录
    createUsageRecord(data) {
      return request('/admin/usage-records', 'POST', data);
    },

    // 更新使用记录
    updateUsageRecord(id, data) {
      return request(`/admin/usage-records/${id}`, 'PUT', data);
    },

    // 删除使用记录
    deleteUsageRecord(id) {
      return request(`/admin/usage-records/${id}`, 'DELETE');
    }
  },

  // 天气通知设置相关
  weatherNotification: {
    // 获取天气通知设置
    getSettings() {
      return request('/weather-notification-settings', 'GET');
    },
    
    // 保存天气通知设置
    saveSettings(settings) {
      return request('/weather-notification-settings', 'POST', settings);
    }
  },

  // 城市搜索相关
  location: {
    // 搜索城市（模糊搜索）
    searchCity(query, number = 10) {
      return request(`/search-city?query=${encodeURIComponent(query)}&number=${number}`, 'GET');
    }
  },

  // 天气严重程度配置相关
  weatherSeverity: {
    // 获取严重程度配置
    getConfig() {
      return request('/weather-severity-config', 'GET');
    },
    
    // 应用预设配置
    applyPreset(presetName) {
      return request('/weather-severity-config/apply-preset', 'POST', { preset_name: presetName });
    },
    
    // 保存自定义配置
    saveConfig(config) {
      return request('/weather-severity-config', 'POST', config);
    }
  },

  // 电费通知设置相关
  dfNotification: {
    // 获取电费通知设置
    getSettings() {
      return request('/df-notification-settings', 'GET');
    },
    
    // 保存电费通知设置
    saveSettings(settings) {
      return request('/df-notification-settings', 'POST', settings);
    }
  }
};

/**
 * 统一错误处理的API调用方法
 */
function apiCall(apiFunction, showLoadingText, successCallback, errorCallback) {
  if (showLoadingText) {
    showLoading(showLoadingText);
  }

  return apiFunction()
    .then(data => {
      if (showLoadingText) {
        hideLoading();
      }
      if (successCallback) {
        successCallback(data);
      }
      return data;
    })
    .catch(error => {
      if (showLoadingText) {
        hideLoading();
      }
      // 移除console.error调用以避免触发全局错误恢复机制
      if (errorCallback) {
        errorCallback(error);
        // 如果提供了errorCallback，则不再抛出错误，由调用方处理
        return Promise.reject(error);
      } else {
        showError(error.message || '操作失败');
        // 如果没有提供errorCallback，抛出错误供上层处理
        throw error;
      }
    });
}

/**
 * iOS兼容的日期格式化工具
 */
function formatDateTimeCompatible(dateTimeStr) {
  if (!dateTimeStr) return '未知';
  
  try {
    // 处理iOS不兼容的日期格式
    let processedDateStr = dateTimeStr;
    
    // 如果是 "yyyy-MM-dd HH:mm:ss" 格式，转换为ISO格式
    if (typeof processedDateStr === 'string' && processedDateStr.includes(' ')) {
      // 将空格替换为T以符合ISO标准
      processedDateStr = processedDateStr.replace(' ', 'T');
      
      // 如果没有时区信息，添加本地时区（避免时区转换问题）
      if (!processedDateStr.includes('+') && !processedDateStr.includes('Z')) {
        processedDateStr += '+08:00'; // 中国时区
      }
    }
    
    const date = new Date(processedDateStr);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn('日期解析失败:', dateTimeStr);
      return dateTimeStr;
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  } catch (error) {
    console.warn('日期格式化错误:', error, dateTimeStr);
    return dateTimeStr;
  }
}

module.exports = {
  API,
  request,
  apiCall,
  showLoading,
  hideLoading,
  showError,
  showSuccess,
  formatDateTimeCompatible
};
