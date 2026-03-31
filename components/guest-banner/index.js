// components/guest-banner/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示横幅
    show: {
      type: Boolean,
      value: false
    },
    // 提示消息
    message: {
      type: String,
      value: '当前显示演示数据'
    },
    // 是否显示登录按钮
    showLoginBtn: {
      type: Boolean,
      value: true
    },
    // 是否显示关闭按钮
    showCloseBtn: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击登录按钮
     */
    onLogin() {
      this.triggerEvent('login');
      // 默认跳转到登录页
      wx.reLaunch({
        url: '/pages/login/index'
      });
    },

    /**
     * 点击关闭按钮
     */
    onClose() {
      this.triggerEvent('close');
    }
  }
});

