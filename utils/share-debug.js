/**
 * 分享功能调试工具
 * 用于诊断为什么看不到"分享到朋友圈"选项
 */

const { getSystemInfo, isDevtools, getPlatform, getWechatVersion, getSDKVersion } = require('./system-info');

/**
 * 检查分享功能环境
 */
function checkShareEnvironment() {
  console.log('\n========== 分享功能环境检查 ==========\n');
  
  // 1. 检查系统信息
  try {
    const systemInfo = getSystemInfo();
    const wechatVersion = getWechatVersion();
    const sdkVersion = getSDKVersion();
    const platform = getPlatform();
    
    console.log('📱 系统信息:');
    console.log('  微信版本:', wechatVersion);
    console.log('  基础库版本:', sdkVersion);
    console.log('  平台:', platform);
    console.log('  品牌:', systemInfo.brand);
    console.log('  型号:', systemInfo.model);
    
    // 微信版本需要 >= 7.0.12
    console.log('\n✅ 版本检查:');
    if (compareVersion(wechatVersion, '7.0.12') >= 0) {
      console.log('  微信版本: ✅ 符合要求 (>= 7.0.12)');
    } else {
      console.warn('  微信版本: ⚠️ 过低! 需要 >= 7.0.12，当前:', wechatVersion);
    }
    
    // 基础库版本需要 >= 2.11.3
    if (compareVersion(sdkVersion, '2.11.3') >= 0) {
      console.log('  基础库版本: ✅ 符合要求 (>= 2.11.3)');
    } else {
      console.warn('  基础库版本: ⚠️ 过低! 需要 >= 2.11.3，当前:', sdkVersion);
    }
    
  } catch (error) {
    console.error('❌ 获取系统信息失败:', error);
  }
  
  // 2. 检查账号信息
  try {
    const accountInfo = wx.getAccountInfoSync();
    console.log('\n📋 小程序信息:');
    console.log('  AppID:', accountInfo.miniProgram.appId);
    console.log('  环境:', accountInfo.miniProgram.envVersion);
    console.log('  版本:', accountInfo.miniProgram.version || '未知');
    
    // 检查是否在开发者工具
    if (isDevtools()) {
      console.warn('\n⚠️ 警告: 您正在开发者工具中！');
      console.warn('  朋友圈分享功能在开发者工具中不可用！');
      console.warn('  请使用真机预览测试！');
    } else {
      console.log('\n✅ 运行环境: 真机（支持朋友圈分享）');
    }
    
  } catch (error) {
    console.error('❌ 获取账号信息失败:', error);
  }
  
  console.log('\n======================================\n');
}

/**
 * 版本号比较
 */
function compareVersion(v1, v2) {
  v1 = v1.split('.');
  v2 = v2.split('.');
  const len = Math.max(v1.length, v2.length);
  
  while (v1.length < len) {
    v1.push('0');
  }
  while (v2.length < len) {
    v2.push('0');
  }
  
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i]);
    const num2 = parseInt(v2[i]);
    
    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }
  
  return 0;
}

/**
 * 测试显示分享菜单
 */
function testShowShareMenu() {
  console.log('\n========== 测试显示分享菜单 ==========\n');
  
  console.log('📱 调用 wx.showShareMenu（简化版）');
  console.log('  注意：只要定义了 onShareTimeline，就会自动显示"分享到朋友圈"');
  console.log('  不需要指定 menus 参数\n');
  
  wx.showShareMenu({
    withShareTicket: true,
    success: (res) => {
      console.log('✅ wx.showShareMenu 调用成功');
      console.log('  返回值:', res);
      console.log('  分享菜单已启用');
    },
    fail: (err) => {
      console.warn('⚠️ wx.showShareMenu 调用失败');
      console.warn('  错误信息:', err);
      console.warn('  但这不影响分享功能！');
      console.warn('  只要定义了 onShareTimeline，朋友圈分享仍然可用');
    }
  });
  
  console.log('\n======================================\n');
}

/**
 * 检查页面分享方法
 */
function checkShareMethods(page) {
  console.log('\n========== 检查页面分享方法 ==========\n');
  
  const pages = getCurrentPages();
  const currentPage = page || pages[pages.length - 1];
  
  if (!currentPage) {
    console.error('❌ 无法获取当前页面');
    return;
  }
  
  const route = currentPage.route;
  console.log('📄 当前页面:', route);
  
  // 定义需要分享功能的页面列表
  const shareEnabledPages = [
    'pages/home/home',
    'pages/electric/index',
    'pages/attendance/index',
    'pages/usercenter/index'
  ];
  
  // 判断当前页面是否需要分享功能
  const shouldHaveShare = shareEnabledPages.includes(route);
  
  if (!shouldHaveShare) {
    console.log('ℹ️ 此页面不需要分享功能（登录页、设置页等辅助页面）');
    console.log('\n======================================\n');
    return;
  }
  
  console.log('✨ 此页面应该支持分享功能\n');
  
  // 检查 onShareAppMessage
  if (typeof currentPage.onShareAppMessage === 'function') {
    console.log('✅ onShareAppMessage: 已定义');
    
    // 尝试调用看返回值
    try {
      const result = currentPage.onShareAppMessage({});
      console.log('  返回值:', result);
    } catch (error) {
      console.error('  调用出错:', error);
    }
  } else {
    console.warn('⚠️ onShareAppMessage: 未定义');
  }
  
  // 检查 onShareTimeline
  if (typeof currentPage.onShareTimeline === 'function') {
    console.log('✅ onShareTimeline: 已定义');
    
    // 尝试调用看返回值
    try {
      const result = currentPage.onShareTimeline();
      console.log('  返回值:', result);
    } catch (error) {
      console.error('  调用出错:', error);
    }
  } else {
    console.error('❌ onShareTimeline: 未定义（这是看不到朋友圈分享的主要原因！）');
  }
  
  console.log('\n======================================\n');
}

/**
 * 完整诊断
 */
function diagnoseShare() {
  console.log('\n\n');
  console.log('🔍🔍🔍 开始分享功能完整诊断 🔍🔍🔍');
  console.log('\n');
  
  // 步骤1：检查环境
  checkShareEnvironment();
  
  // 等待一下
  setTimeout(() => {
    // 步骤2：测试显示分享菜单
    testShowShareMenu();
    
    setTimeout(() => {
      // 步骤3：检查页面方法
      checkShareMethods();
      
      // 最终建议
      console.log('\n========== 诊断完成 ==========\n');
      console.log('📌 如果还是看不到"分享到朋友圈"：\n');
      console.log('1. 确认是在真机上测试（不是开发者工具）');
      console.log('2. 确认微信版本 >= 7.0.12');
      console.log('3. 确认基础库版本 >= 2.11.3');
      console.log('4. 确认页面定义了 onShareTimeline 方法');
      console.log('5. 尝试退出小程序重新进入');
      console.log('6. 尝试删除小程序重新扫码');
      console.log('\n======================================\n');
      
    }, 500);
  }, 500);
}

module.exports = {
  checkShareEnvironment,
  testShowShareMenu,
  checkShareMethods,
  diagnoseShare,
  compareVersion
};

