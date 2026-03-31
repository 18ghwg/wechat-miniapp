Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '公告中心' },
    notices: { type: Array, value: [] }
  },
  methods: {
    onClose() {
      this.triggerEvent('close');
    },
    onMaskTap() {
      this.triggerEvent('close');
    }
  }
});
