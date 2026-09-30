describe('share utilities', () => {
  beforeEach(() => {
    jest.resetModules();
    global.wx = {
      showShareMenu: jest.fn()
    };
  });

  afterEach(() => {
    delete global.getCurrentPages;
    delete global.wx;
  });

  test('enables both friend and timeline share menus', () => {
    const { enableShareMenu } = require('../utils/share');

    expect(enableShareMenu('考勤管理')).toBe(true);
    expect(global.wx.showShareMenu).toHaveBeenCalledWith(expect.objectContaining({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    }));
  });

  test('returns false when the share API is unavailable', () => {
    global.wx = {};
    const { enableShareMenu } = require('../utils/share');

    expect(enableShareMenu('测试页面')).toBe(false);
  });

  test('keeps page query parameters when sharing to timeline', () => {
    global.getCurrentPages = jest.fn(() => [{ route: 'pages/electric/index' }]);
    const { setupPageShare } = require('../utils/share');
    const page = {};

    setupPageShare(page, {
      title: '本月电费',
      path: '/pages/electric/index?source=timeline&month=2026-09'
    });

    expect(page.onShareAppMessage()).toEqual({
      title: '本月电费',
      path: '/pages/electric/index?source=timeline&month=2026-09',
      imageUrl: undefined
    });
    expect(page.onShareTimeline()).toEqual({
      title: '本月电费',
      query: 'source=timeline&month=2026-09',
      imageUrl: undefined
    });
  });
});
