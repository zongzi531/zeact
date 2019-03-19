// 这个具体做什么的，并不是很了解
const BrowserEnv = {
  currentScrollLeft: 0,
  currentScrollTop: 0,
  browserInfo: null,
  refreshAuthoritativeScrollValues () {
    BrowserEnv.currentScrollLeft =
      document.body.scrollLeft + document.documentElement.scrollLeft
    BrowserEnv.currentScrollTop =
      document.body.scrollTop + document.documentElement.scrollTop
  },
}

export default BrowserEnv
