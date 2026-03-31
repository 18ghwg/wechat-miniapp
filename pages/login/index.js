const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { miniprogramInfo } = require('../../utils/miniprogram-info');

const createEmptyUserInfo = () => ({
  nickname: '',
  nickName: '',
  avatar_url: '',
  avatarUrl: '',
  permissions: [],
  is_admin: false,
  is_web_bound: false,
  bound_username: '',
  register_time: '',
  last_login: ''
});

const normalizeUserInfo = (info) => {
  const base = createEmptyUserInfo();

  if (!info || typeof info !== 'object') {
    return base;
  }

  const merged = Object.assign({}, base, info);
  merged.permissions = Array.isArray(info.permissions) ? info.permissions : [];

  // 统一昵称字段
  merged.nickName = merged.nickName || merged.nickname || '';
  merged.nickname = merged.nickName;

  // 统一头像字段
  merged.avatarUrl = merged.avatarUrl || merged.avatar_url || '';
  merged.avatar_url = merged.avatarUrl;

  return merged;
};

Page({
  data: {
    userInfo: createEmptyUserInfo(),
    hasUserInfo: false,
    loginLoading: false,
    loginMode: 'account', // 默认账号密码登录模式，匹配 Weixin-main
    username: '',
    password: '',
    showPassword: false, // 新增：是否显示密码
    rememberMe: false, // 新增：记住账号
    showCaptchaModal: false,
    captchaVerified: false,
    captchaToken: '',
    appName: '无感tool',
    appDesc: '便捷的工作管理小程序',
    appVersion: '1.0.0',
    agreed: false
  },

   onLoad() {
     // 获取小程序名称
     const appName = miniprogramInfo.getAppName();
     const appDesc = miniprogramInfo.getAppDescription();
     const appVersion = miniprogramInfo.getVersion();
     
     this.setData({
       appName: appName,
     appDesc: appDesc,
     appVersion: appVersion
   });
   
   console.log('登录页面已加载，初始状态：');
   // this.logButtonState(); // 已移除输入检测日志
   
   // 检查是否已登录
   const openid = wx.getStorageSync('openid');
   if (openid) {
     const cachedUserInfo = normalizeUserInfo(wx.getStorageSync('userInfo'));
       this.setData({
         userInfo: cachedUserInfo,
         hasUserInfo: !!cachedUserInfo.nickName || !!cachedUserInfo.nickname
       });
       this.redirectToHome();
     }
  },

  /**
   * 微信登录
   */
   onWechatLogin() {
     // ⭐ 新增：检查协议同意状态
     if (!this.data.agreed) {
       wx.showModal({
         title: '温馨提示',
         content: '请先阅读并同意《用户协议》和《隐私政策》后再登录',
         showCancel: false,
         confirmText: '我知道了'
       });
       this.setData({ loginLoading: false });
       return;
     }

     this.setData({ loginLoading: true });

     // 在开发环境中，使用测试code并设置管理员权限
     if (wx.getDeviceInfo().platform === 'devtools') {
       console.log('开发环境，使用测试code，设置管理员权限');
       this.doTestLogin();
       return;
     }

     // 生产环境，获取真实微信登录code
     wx.login({
       success: (res) => {
         if (res.code) {
           this.doLogin(res.code);
         } else {
           this.setData({ loginLoading: false });
           showError('获取登录凭证失败');
         }
       },
       fail: () => {
         this.setData({ loginLoading: false });
         showError('微信登录失败');
       }
     });
   },

  /**
   * 微信一键授权登录（恢复旧方式）
   */
  getUserProfile() {
    // ⭐ 新增：检查协议同意状态
    if (!this.data.agreed) {
      wx.showModal({
        title: '温馨提示',
        content: '请先阅读并同意《用户协议》和《隐私政策》后再登录',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    wx.getUserProfile({
      desc: '获取您的昵称用于身份识别，我们不会收集其他敏感信息',
      success: (res) => {
        console.log('获取用户信息成功:', res.userInfo);
        let normalizedUserInfo = normalizeUserInfo(res.userInfo);
        
        // 处理微信默认昵称，使用openid后五位区分用户
        if (normalizedUserInfo.nickName === '微信用户' || !normalizedUserInfo.nickName || normalizedUserInfo.nickName.trim() === '') {
          const openid = wx.getStorageSync('openid');
          if (openid && openid.length >= 5) {
            normalizedUserInfo.nickName = `微信用户${openid.slice(-5)}`;
            normalizedUserInfo.nickname = normalizedUserInfo.nickName;
          } else {
            normalizedUserInfo.nickName = '微信用户';
            normalizedUserInfo.nickname = '微信用户';
          }
          console.log('使用区分昵称:', normalizedUserInfo.nickName);
        }
        
        this.setData({
          userInfo: normalizedUserInfo,
          hasUserInfo: true
        });
        
        // 开始登录流程
        this.onWechatLogin();
      },
      fail: (error) => {
        console.log('获取用户信息失败，使用微信登录获取基础信息:', error);
        
        // 如果用户拒绝授权，直接进行微信登录
        // 后端会使用微信ID作为用户名，前端使用生成头像
        wx.showToast({
          title: '将使用默认信息登录',
          icon: 'none',
          duration: 2000
        });
        
        this.onWechatLogin();
      }
    });
  },

  /**
   * 测试环境登录 - 直接设置管理员权限
   */
  doTestLogin() {
    console.log('测试环境：设置管理员账号');
    
    // 模拟管理员用户信息
    const testAdminUser = {
      openid: 'test_openid_001',
      userInfo: {
        nickname: '测试管理员',
        avatar_url: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
        is_admin: true,
        is_web_bound: true,
        permissions: ['electric', 'attendance', 'admin'],
        bound_username: 'test_admin',
        register_time: '2025-09-23 20:00:00'
      }
    };
    
    // ⭐ 清除游客模式标识
    wx.removeStorageSync('isGuestMode');
    
    // 直接保存管理员登录信息
    wx.setStorageSync('openid', testAdminUser.openid);
    const normalizedUserInfo = normalizeUserInfo(testAdminUser.userInfo);
    wx.setStorageSync('userInfo', normalizedUserInfo);
    this.setData({
      userInfo: normalizedUserInfo,
      hasUserInfo: true
    });
    wx.setStorageSync('isTestMode', true);
    
    this.setData({ loginLoading: false });
    showSuccess('测试模式登录成功(管理员)');
    
    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      this.redirectToHome();
    }, 1000);
  },

  /**
   * 执行登录
   */
  doLogin(code) {
    const userInfo = this.data.hasUserInfo ? normalizeUserInfo(this.data.userInfo) : createEmptyUserInfo();
    
    console.log('发送登录请求 - 原始用户信息:', {
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl
    });
    
    apiCall(
      () => API.auth.login(code, userInfo),
      '登录中...',
      (data) => {
        // ⭐ 清除游客模式标识
        wx.removeStorageSync('isGuestMode');
        
        // 保存登录信息
        const openid = data.data.openid;
        wx.setStorageSync('openid', openid);
        
        let safeUserInfo = normalizeUserInfo(data.data && data.data.userInfo);
        
        console.log('后端返回用户信息:', {
          nickname: safeUserInfo.nickname || safeUserInfo.nickName,
          openid: openid
        });
        
        // 不使用微信API返回的头像，使用openid最后一位生成头像标识
        safeUserInfo.avatarUrl = '';
        safeUserInfo.avatar_url = '';
        safeUserInfo.useGeneratedAvatar = true; // 标记需要生成头像
        safeUserInfo.avatarSeed = openid ? openid.slice(-1) : '0'; // 使用openid最后一位作为头像种子
        
        console.log('最终用户信息:', {
          nickname: safeUserInfo.nickname || safeUserInfo.nickName,
          avatarSeed: safeUserInfo.avatarSeed,
          useGeneratedAvatar: safeUserInfo.useGeneratedAvatar
        });
        
        wx.setStorageSync('userInfo', safeUserInfo);
        // ⭐ 清除游客模式标识
        wx.removeStorageSync('isGuestMode');
        this.setData({
          userInfo: safeUserInfo,
          hasUserInfo: true
        });
        
        showSuccess('登录成功');
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.redirectToHome();
        }, 1000);
      },
      (error) => {
        this.setData({ loginLoading: false });
        showError(error.message || '登录失败');
      }
    );
  },

  /**
   * 切换登录方式
   */
  switchLoginMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      loginMode: mode,
      loginLoading: false,
      username: '',
      password: '',
      captchaVerified: false,
      captchaToken: ''
    });
  },

   /**
    * 用户名输入
    */
   onUsernameInput(e) {
     this.setData({
       username: e.detail.value
     });
     // this.logButtonState(); // 已移除输入检测日志
   },

   /**
    * 密码输入
    */
   onPasswordInput(e) {
     this.setData({
       password: e.detail.value
     });
     // this.logButtonState(); // 已移除输入检测日志
   },

  /**
   * 滑块验证码验证成功
   */
  onCaptchaSuccess(e) {
    console.log('验证码验证成功:', e.detail);
    this.setData({
      captchaVerified: true,
      captchaToken: e.detail.captchaToken,
      showCaptchaModal: false  // 关闭模态窗口
    });
    
    wx.showToast({
      title: '验证成功',
      icon: 'success',
      duration: 1500
    });
    
    // 验证成功后，执行登录
    setTimeout(() => {
      this.doAccountLogin();
    }, 1500);
  },

   /**
    * 滑块验证码验证失败
    */
   onCaptchaFail(e) {
     console.log('验证码验证失败:', e.detail);
     this.setData({
       captchaVerified: false,
       captchaToken: ''
     });
   },

   /**
    * 输出登录按钮的可点击状态
    */
   logButtonState() {
     const { username, password, agreed, loginLoading } = this.data;
     const isButtonEnabled = !loginLoading && !!username && !!password && !!agreed;
     
    //  console.log('=== 登录按钮状态 ===');
    //  console.log('账号:', username ? `已输入 (${username.length}字)` : '未输入');
    //  console.log('密码:', password ? `已输入 (${password.length}字)` : '未输入');
    //  console.log('协议勾选:', agreed ? '✓ 已勾选' : '✗ 未勾选');
    //  console.log('登录中:', loginLoading ? '是' : '否');
    //  console.log('按钮可点击:', isButtonEnabled ? '✓ 可点击' : '✗ 不可点击');
    //  console.log('===================');
   },

   /**
    * 点击登录按钮 - 显示滑块验证码
    */
   onAccountLogin() {
     const { username, password } = this.data;
     
     // this.logButtonState(); // 已移除输入检测日志
     
     if (!username || !password) {
       showError('请输入用户名和密码');
       return;
     }

    // 显示验证码模态窗口
    this.setData({
      showCaptchaModal: true,
      captchaVerified: false,
      captchaToken: ''
    });
    
    // 禁用页面滚动
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    });
  },

  /**
   * 关闭验证码模态窗口
   */
  onCloseCaptchaModal() {
    this.setData({
      showCaptchaModal: false
    });
  },

  /**
   * 阻止弹窗内的滚动穿透
   */
  preventModalScroll() {
    return false;
  },

  /**
   * 执行实际的登录请求
   */
  doAccountLogin() {
    const { username, password, captchaVerified, captchaToken } = this.data;
    
    if (!captchaVerified) {
      showError('请先完成滑块验证');
      return;
    }

    this.setData({ loginLoading: true });

    // 显示加载提示
    wx.showLoading({
      title: '登录中...',
      mask: true
    });

    API.auth.accountLogin(username, password, captchaToken)
      .then((data) => {
        wx.hideLoading();
        this.setData({ loginLoading: false });
        
        if (data.code === 200) {
          // ⭐ 清除游客模式标识
          wx.removeStorageSync('isGuestMode');
          
          // 保存登录信息
          wx.setStorageSync('openid', data.data.openid);
          const safeUserInfo = normalizeUserInfo(data.data && data.data.userInfo);
          wx.setStorageSync('userInfo', safeUserInfo);
          this.setData({
            userInfo: safeUserInfo,
            hasUserInfo: true
          });
          wx.setStorageSync('loginMode', 'account');
          
          showSuccess('登录成功');
          
          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            this.redirectToHome();
          }, 1000);
        } else {
          // 登录失败，显示具体错误信息
          showError(data.msg || '登录失败');
        }
      })
      .catch((error) => {
        wx.hideLoading();
        this.setData({ loginLoading: false });
        showError(error.message || '网络请求失败');
      });
  },

  /**
   * 跳转到首页
   */
  redirectToHome() {
    wx.reLaunch({
      url: '/pages/attendance/index'
    });
  },

   /**
    * ⭐ 新增：协议同意状态变化
    */
   onAgreeChange(e) {
     // checkbox 的 bindchange 事件返回 checked 属性
     const agreed = e.detail.checked;
     console.log('协议勾选状态变化:', agreed);
     this.setData({ agreed });
     // this.logButtonState(); // 已移除输入检测日志
   },

   /**
    * ⭐ 通过 bindtap 手动切换协议勾选状态
    */
   onAgreeToggle() {
     const agreed = !this.data.agreed;
     console.log('协议勾选状态切换:', agreed);
     this.setData({ agreed });
     // this.logButtonState(); // 已移除输入检测日志
   },

  /**
   * ⭐ 新增：跳转到用户协议
   */
  goToTerms() {
    wx.navigateTo({
      url: '/pages/terms/index'
    });
  },

  /**
   * ⭐ 新增：跳转到隐私政策
   */
  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/index'
    });
  },

  /**
   * ⭐ 新增：跳过登录，以游客模式进入
   * 符合微信规范：用户可以先浏览体验，再决定是否登录
   */
  skipLogin() {
    console.log('用户选择暂不登录，以游客模式进入');
    
    // 设置游客模式标识
    wx.setStorageSync('isGuestMode', true);
    
    // 显示提示
    wx.showToast({
      title: '体验模式：部分功能受限',
      icon: 'none',
      duration: 2000
    });
    
    // 跳转到考勤页面
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/attendance/index'
      });
    }, 2000);
  },

  /**
   * 切换密码显示/隐藏
   */
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  /**
   * 记住账号状态变化
   */
  onRememberChange(e) {
    const rememberMe = e.detail.value.includes('remember');
    this.setData({ rememberMe });
    
    if (rememberMe && this.data.username) {
      // 保存账号到本地存储
      wx.setStorageSync('savedUsername', this.data.username);
    } else {
      // 清除保存的账号
      wx.removeStorageSync('savedUsername');
    }
  },

  /**
   * 忘记密码
   */
  onForgotPassword() {
    wx.showModal({
      title: '忘记密码',
      content: '请联系管理员重置密码',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  /**
   * 切换到微信登录模式
   */
  switchToWechat() {
    this.setData({
      loginMode: 'wechat',
      loginLoading: false,
      username: '',
      password: '',
      captchaVerified: false,
      captchaToken: ''
    });
  },

  /**
   * 切换到账号密码登录模式
   */
  switchToAccount() {
    this.setData({
      loginMode: 'account',
      loginLoading: false,
      captchaVerified: false,
      captchaToken: ''
    });
    
    // 如果之前保存了账号，自动填充
    const savedUsername = wx.getStorageSync('savedUsername');
    if (savedUsername) {
      this.setData({
        username: savedUsername,
        rememberMe: true
      });
    }
  },

  /**
   * 跳转到注册页面
   */
  goToRegister() {
    wx.showModal({
      title: '注册账号',
      content: '请联系管理员开通账号',
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
