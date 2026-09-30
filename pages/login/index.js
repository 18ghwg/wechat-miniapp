const { API, apiCall, showError, showSuccess } = require('../../utils/api');
const { miniprogramInfo } = require('../../utils/miniprogram-info');
const { normalizeMiniProgramUserInfo } = require('../../utils/mini-program-role');
const { userInfoCache } = require('../../utils/user-info-cache');

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

  return normalizeMiniProgramUserInfo(merged);
};

Page({
  data: {
    userInfo: createEmptyUserInfo(),
    hasUserInfo: false,
    loginLoading: false,
    loginMode: 'wechat',
    username: '',
    password: '',
    showPassword: false, // 新增：是否显示密码
    rememberMe: false, // 新增：记住账号
    showCaptchaModal: false,
    captchaVerified: false,
    captchaToken: '',
    appName: '出差日历',
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
    if (!this.data.agreed) {
      wx.showModal({
        title: '温馨提示',
        content: '请先阅读并同意《用户服务协议》和《隐私政策》后再登录',
        showCancel: false,
        confirmText: '我知道了'
      });
      this.setData({ loginLoading: false });
      return;
    }

    this.setData({ loginLoading: true });

    wx.login({
      success: (res) => {
        if (res.code) {
          this.doLogin(res.code);
        } else {
          this.setData({ loginLoading: false });
          showError('获取登录凭证失败，请重试');
        }
      },
      fail: (error) => {
        console.error('微信登录失败:', error);
        this.setData({ loginLoading: false });
        const errMsg = (error && error.errMsg) || '';
        if (/需要重新登录|re-?login/i.test(errMsg)) {
          showError('微信开发者工具登录状态已失效，请重新登录开发者工具后再试');
          return;
        }
        showError('微信登录失败，请重试');
      }
    });
  },

  /**
   * 在用户点击回调的同步阶段直接发起微信授权，然后继续登录。
   * 不能先等待 requirePrivacyAuthorize 的异步回调，否则 getUserProfile 会
   * 脱离 TAP 手势并被微信拒绝。
   */
  getUserProfile() {
    if (this.data.loginLoading) {
      return;
    }

    if (!this.data.agreed) {
      wx.showModal({
        title: '温馨提示',
        content: '请先阅读并同意《用户服务协议》和《隐私政策》后再登录',
        showCancel: false,
        confirmText: '我知道了'
      });
      return;
    }

    this.setData({ loginLoading: true });

    const continueWithoutProfile = () => {
      console.warn('未取得微信用户资料，继续使用 code 登录');
      this.setData({
        userInfo: createEmptyUserInfo(),
        hasUserInfo: false
      });
      this.onWechatLogin();
    };

    if (typeof wx.getUserProfile !== 'function') {
      console.warn('当前基础库不支持 wx.getUserProfile，将使用基础登录');
      continueWithoutProfile();
      return;
    }

    // 必须在 bindtap 进入后立即调用，不能放到隐私授权回调或 setTimeout 中。
    wx.getUserProfile({
      desc: '获取您的昵称用于身份识别，我们不会收集其他敏感信息',
      success: (res) => {
        console.log('获取用户信息成功:', res.userInfo);
        const normalizedUserInfo = normalizeUserInfo(res.userInfo);

        // 微信可能返回默认昵称，服务端会根据 openid 生成唯一昵称。
        if (
          normalizedUserInfo.nickName === '微信用户' ||
          !normalizedUserInfo.nickName ||
          normalizedUserInfo.nickName.trim() === ''
        ) {
          normalizedUserInfo.nickName = '微信用户';
          normalizedUserInfo.nickname = '微信用户';
        }

        this.setData({
          userInfo: normalizedUserInfo,
          hasUserInfo: true
        });

        this.onWechatLogin();
      },
      fail: (error) => {
        const errMsg = (error && error.errMsg) || '';
        console.warn('微信用户信息授权未完成:', errMsg || error);

        // 用户资料不是登录凭证。隐私声明、基础库或调用时机异常时，
        // 继续使用 wx.login，后端会生成默认用户资料。
        continueWithoutProfile();
      }
    });
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
        this.setData({ loginLoading: false });

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
        
        userInfoCache.update(safeUserInfo);
        // ⭐ 清除游客模式标识
        wx.removeStorageSync('isGuestMode');
        this.setData({
          userInfo: safeUserInfo,
          hasUserInfo: true
        });

        const isNewUser = data.data && data.data.is_new_user === true;
        const requiresAccountBinding = data.data && data.data.requires_account_binding === true;
        if (isNewUser && requiresAccountBinding) {
          this.promptExistingAccountBinding();
          return;
        }

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

  promptExistingAccountBinding() {
    wx.showModal({
      title: '注册成功',
      content: '微信账号已创建。如已有网站账号，可立即绑定并同步原账号权限。',
      confirmText: '绑定账号',
      cancelText: '暂不绑定',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/user/bind/index?source=new-user'
          });
          return;
        }
        this.redirectToHome();
      },
      fail: () => {
        this.redirectToHome();
      }
    });
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
          userInfoCache.update(safeUserInfo);
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
   * 跳过登录，以空状态预览页面
   */
  skipLogin() {
    console.log('用户选择暂不登录，进入空状态预览');
    
    // 设置游客模式标识
    wx.setStorageSync('isGuestMode', true);
    
    // 显示提示
    wx.showToast({
      title: '预览模式：数据操作需登录',
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
    const value = e.detail.value;
    const rememberMe = Array.isArray(value) && value.includes('remember');
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
