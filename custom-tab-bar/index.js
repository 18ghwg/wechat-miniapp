import TabMenu from './data';

Component({
  data: {
    active: 0,
    list: TabMenu,
  },

  methods: {
    switchTab(e) {
      const { index, url } = e.currentTarget.dataset;
      this.setData({ active: index });
      wx.switchTab({
        url: url.startsWith('/') ? url : ('/' + url),
      });
    },

    init() {
      const page = getCurrentPages().pop();
      const route = page && page.route ? page.route.split('?')[0] : '';
      const active = this.data.list.findIndex(
        (item) => (item.url.startsWith('/') ? item.url.substr(1) : item.url) === route,
      );
      if (active !== -1) this.setData({ active });
    },
  },
});