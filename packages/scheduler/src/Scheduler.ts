// TODO: Use symbols? 所以最后为什么没用
const ImmediatePriority = 1
const UserBlockingPriority = 2
const NormalPriority = 3
const LowPriority = 4
const IdlePriority = 5

let firstCallbackNode = null

// eslint-disable-next-line prefer-const
let currentPriorityLevel = NormalPriority

// 个人猜测固定返回 Number
function unstable_getCurrentPriorityLevel(): number {
  return currentPriorityLevel
}

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


function unstable_cancelCallback(callbackNode): void {
  const next = callbackNode.next
  if (next === null) {
    return
  }

  if (next === callbackNode) {
    firstCallbackNode = null
  } else {
    if (callbackNode === firstCallbackNode) {
      firstCallbackNode = next
    }
    const previous = callbackNode.previous
    previous.next = next
    next.previous = previous
  }

  callbackNode.next = callbackNode.previous = null
}


export {
  ImmediatePriority as unstable_ImmediatePriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
  NormalPriority as unstable_NormalPriority,
  IdlePriority as unstable_IdlePriority,
  LowPriority as unstable_LowPriority,
  // unstable_runWithPriority,
  // unstable_next,
  // unstable_scheduleCallback,
  unstable_cancelCallback,
  // unstable_wrapCallback,
  unstable_getCurrentPriorityLevel,
  // unstable_shouldYield,
  // unstable_continueExecution,
  // unstable_pauseExecution,
  // unstable_getFirstCallbackNode,
  getCurrentTime as unstable_now,
}
