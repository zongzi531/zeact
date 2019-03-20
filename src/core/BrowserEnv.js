// 这个对象是用来存储浏览器环境数据
const BrowserEnv = {
  // 初始化浏览器环境数据
  // 滚动值
  currentScrollLeft: 0,
  currentScrollTop: 0,
  // 浏览器信息
  browserInfo: null,
  // 手动刷新浏览器环境滚动值
  refreshAuthoritativeScrollValues () {
    // 分别设置 left 和 top
    BrowserEnv.currentScrollLeft =
      document.body.scrollLeft + document.documentElement.scrollLeft
    BrowserEnv.currentScrollTop =
      document.body.scrollTop + document.documentElement.scrollTop
  },
}

export default BrowserEnv
