/**
 * 小程序分享配置工具
 * 支持分享给好友和分享到朋友圈
 */

const { miniprogramInfo } = require('./miniprogram-info');

/**
 * 获取分享配置
 * @param {Object} options 配置选项
 * @param {String} options.title 分享标题
 * @param {String} options.desc 分享描述（仅好友可见）
 * @param {String} options.path 分享路径
 * @param {String} options.imageUrl 分享图片URL
 * @returns {Object} 分享配置
 */
function getShareConfig(options = {}) {
  const appName = miniprogramInfo.getAppName();
  const appDesc = miniprogramInfo.getAppDescription();
  
  const defaultConfig = {
    title: appName,
    desc: appDesc,
    path: '/pages/home/home',
    imageUrl: '/images/share-cover.png' // 需要准备分享封面图
  };

  return {
    title: options.title || defaultConfig.title,
    desc: options.desc || defaultConfig.desc,
    path: options.path || defaultConfig.path,
    imageUrl: options.imageUrl || defaultConfig.imageUrl
  };
}

/**
 * 获取页面分享配置映射（动态生成）
 * 为不同页面提供定制化的分享内容
 */
function getShareConfigs() {
  const appName = miniprogramInfo.getAppName();
  const appDesc = miniprogramInfo.getAppDescription();
  
  return {
    // 首页
    'pages/home/home': {
      title: `${appName} - ${appDesc}`,
      desc: '电费查询、考勤管理、公告通知，一站式管理解决方案',
      path: '/pages/home/home'
    },
    
    // 电费查询
    'pages/electric/index': {
      title: `电费查询 - ${appName}`,
      desc: '实时查询电费余额，历史账单一目了然',
      path: '/pages/electric/index'
    },
    
    // 考勤管理
    'pages/attendance/index': {
      title: `考勤管理 - ${appName}`,
      desc: '快速打卡，考勤记录随时查看',
      path: '/pages/attendance/index'
    },
    
    // 用户中心
    'pages/usercenter/index': {
      title: `个人中心 - ${appName}`,
      desc: '账号管理、常用功能、个性化设置',
      path: '/pages/usercenter/index'
    },
    
    // 公告管理
    'pages/announcement/manage': {
      title: `公告管理 - ${appName}`,
      desc: '重要通知及时发布，信息传达高效便捷',
      path: '/pages/announcement/manage'
    },
    
    // 反馈建议
    'pages/feedback/index': {
      title: `反馈建议 - ${appName}`,
      desc: '您的建议是我们进步的动力',
      path: '/pages/feedback/index'
    }
  };
}

/**
 * 为页面添加分享功能
 * @param {Object} page 页面实例
 * @param {Object} customConfig 自定义配置
 */
function setupPageShare(page, customConfig = {}) {
  // 获取当前页面路径
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const route = currentPage ? currentPage.route : '';
  
  // 获取页面默认配置（动态生成）
  const shareConfigs = getShareConfigs();
  const defaultConfig = shareConfigs[route] || shareConfigs['pages/home/home'];
  
  // 合并配置
  const finalConfig = {
    ...defaultConfig,
    ...customConfig
  };
  
  // 分享给好友
  page.onShareAppMessage = function(res) {
    console.log('📤 分享给好友:', finalConfig.title);
    
    return {
      title: finalConfig.title,
      path: finalConfig.path,
      imageUrl: finalConfig.imageUrl || undefined
    };
  };
  
  // 分享到朋友圈
  page.onShareTimeline = function() {
    console.log('📤 分享到朋友圈:', finalConfig.title);
    
    return {
      title: finalConfig.title,
      query: '', // 朋友圈不支持带参数
      imageUrl: finalConfig.imageUrl || undefined
    };
  };
  
  console.log('✅ 页面分享功能已启用:', route);
}

/**
 * 主动触发分享（可选）
 * 可在页面中调用此方法打开分享面板
 */
function triggerShare() {
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  });
}

/**
 * 更新分享信息（可选）
 * 在页面数据变化时动态更新分享内容
 * @param {Object} newConfig 新的分享配置
 */
function updateShareConfig(newConfig) {
  wx.updateShareMenu({
    withShareTicket: true,
    success() {
      console.log('✅ 分享信息已更新');
    }
  });
}

module.exports = {
  getShareConfig,
  getShareConfigs,
  setupPageShare,
  triggerShare,
  updateShareConfig
};

