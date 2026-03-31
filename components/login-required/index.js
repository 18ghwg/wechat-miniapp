Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '需要登录'
    },
    message: {
      type: String,
      value: '登录后即可查看完整数据'
    }
  },
  data: {},
  methods: {
    goToLogin() {
      wx.reLaunch({
        url: '/pages/login/index'
      });
    }
  }
});

