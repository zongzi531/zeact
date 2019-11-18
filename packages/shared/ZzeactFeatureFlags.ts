/**
 * 详见 react/scripts/rollup/build.js/getPlugins
 * 可见如下代码：
 * 
 * // Turn __DEV__ and process.env checks into constants.
    replace({
      __DEV__: isProduction ? 'false' : 'true',
      __PROFILE__: isProfiling || !isProduction ? 'true' : 'false',
      __UMD__: isUMDBundle ? 'true' : 'false',
      'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
    }),
 * 
 * 此环境下，将默认设置：
 * __DEV__ = false
 * __PROFILE__ = false
 */

const __DEV__ = false
const __PROFILE__ = false

export const enableUserTimingAPI = __DEV__

export const enableProfilerTimer = __PROFILE__

export const enableSchedulerTracing = __PROFILE__

export const enableSuspenseServerRenderer = false

export const disableInputAttributeSyncing = false
