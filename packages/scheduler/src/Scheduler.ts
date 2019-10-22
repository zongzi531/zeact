const hasNativePerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function'

const localDate = Date

let getCurrentTime

if (hasNativePerformanceNow) {
  const Performance = performance
  getCurrentTime = function(): number {
    return Performance.now()
  }
} else {
  getCurrentTime = function(): number {
    return localDate.now()
  }
}

export {
  // ImmediatePriority as unstable_ImmediatePriority,
  // UserBlockingPriority as unstable_UserBlockingPriority,
  // NormalPriority as unstable_NormalPriority,
  // IdlePriority as unstable_IdlePriority,
  // LowPriority as unstable_LowPriority,
  // unstable_runWithPriority,
  // unstable_next,
  // unstable_scheduleCallback,
  // unstable_cancelCallback,
  // unstable_wrapCallback,
  // unstable_getCurrentPriorityLevel,
  // unstable_shouldYield,
  // unstable_continueExecution,
  // unstable_pauseExecution,
  // unstable_getFirstCallbackNode,
  getCurrentTime as unstable_now,
}
