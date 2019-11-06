// TODO: Use symbols? 所以最后为什么没用
const ImmediatePriority = 1
const UserBlockingPriority = 2
const NormalPriority = 3
const LowPriority = 4
const IdlePriority = 5

let firstCallbackNode = null

// eslint-disable-next-line prefer-const
let currentDidTimeout = false

// eslint-disable-next-line prefer-const
let currentPriorityLevel = NormalPriority
let currentEventStartTime = -1
// eslint-disable-next-line prefer-const
let currentExpirationTime = -1

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isExecutingCallback = false

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isHostCallbackScheduled = false


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

let shouldYieldToHost


function flushImmediateWork(): void {
  if (
    currentEventStartTime === -1 &&
    firstCallbackNode !== null &&
    firstCallbackNode.priorityLevel === ImmediatePriority
  ) {
    isExecutingCallback = true
    try {
      do {
        console.log('2019/11/6 Reading skip flushFirstCallback')
        // flushFirstCallback()
      } while (
        firstCallbackNode !== null &&
        firstCallbackNode.priorityLevel === ImmediatePriority
      )
    } finally {
      isExecutingCallback = false
      if (firstCallbackNode !== null) {
        console.log('2019/11/6 Reading skip ensureHostCallbackIsScheduled')
        // ensureHostCallbackIsScheduled()
      } else {
        isHostCallbackScheduled = false
      }
    }
  }
}

function unstable_shouldYield(): boolean {
  return (
    !currentDidTimeout &&
    ((firstCallbackNode !== null &&
      firstCallbackNode.expirationTime < currentExpirationTime) ||
      shouldYieldToHost())
  )
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

function unstable_runWithPriority(priorityLevel, eventHandler): void {
  switch (priorityLevel) {
    case ImmediatePriority:
    case UserBlockingPriority:
    case NormalPriority:
    case LowPriority:
    case IdlePriority:
      break
    default:
      priorityLevel = NormalPriority
  }

  const previousPriorityLevel = currentPriorityLevel
  const previousEventStartTime = currentEventStartTime
  currentPriorityLevel = priorityLevel
  currentEventStartTime = getCurrentTime()

  try {
    return eventHandler()
  } finally {
    currentPriorityLevel = previousPriorityLevel
    currentEventStartTime = previousEventStartTime

    flushImmediateWork()
  }
}

export {
  ImmediatePriority as unstable_ImmediatePriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
  NormalPriority as unstable_NormalPriority,
  IdlePriority as unstable_IdlePriority,
  LowPriority as unstable_LowPriority,
  unstable_runWithPriority,
  // unstable_next,
  // unstable_scheduleCallback,
  unstable_cancelCallback,
  // unstable_wrapCallback,
  unstable_getCurrentPriorityLevel,
  unstable_shouldYield,
  // unstable_continueExecution,
  // unstable_pauseExecution,
  // unstable_getFirstCallbackNode,
  getCurrentTime as unstable_now,
}
