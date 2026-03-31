/**
 * 页面动画工具
 */

/**
 * 触发页面进入动画
 * 在页面的 onShow 生命周期中调用
 */
function triggerPageAnimation() {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  
  if (currentPage) {
    // 立即隐藏所有内容
    currentPage.setData({
      pageAnimationClass: 'page-hidden',
      cardAnimationClass: 'card-hidden'
    });
    
    // 使用 nextTick 确保 DOM 更新后再触发动画
    wx.nextTick(() => {
      setTimeout(() => {
        currentPage.setData({
          pageAnimationClass: 'page-show-animation',
          cardAnimationClass: 'card-enter'
        });
      }, 20);
    });
  }
}

module.exports = {
  triggerPageAnimation
};
