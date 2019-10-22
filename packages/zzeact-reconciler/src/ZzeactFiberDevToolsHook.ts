// declare var __ZZEACT_DEVTOOLS_GLOBAL_HOOK__: Object | void

// 关于是否存在开发工具，我们将其默认置于 undefined

const __ZZEACT_DEVTOOLS_GLOBAL_HOOK__ = void 0

export const isDevToolsPresent =
  typeof __ZZEACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'
