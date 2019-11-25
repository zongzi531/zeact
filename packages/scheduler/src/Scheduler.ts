// TODO: Use symbols? 所以最后为什么没用
const ImmediatePriority = 1
const UserBlockingPriority = 2
const NormalPriority = 3
const LowPriority = 4
const IdlePriority = 5

const maxSigned31BitInt = 1073741823

const IMMEDIATE_PRIORITY_TIMEOUT = -1
const USER_BLOCKING_PRIORITY = 250
const NORMAL_PRIORITY_TIMEOUT = 5000
const LOW_PRIORITY_TIMEOUT = 10000
const IDLE_PRIORITY = maxSigned31BitInt

let firstCallbackNode = null

// eslint-disable-next-line prefer-const
let currentDidTimeout = false

// eslint-disable-next-line prefer-const
let isSchedulerPaused = false

// eslint-disable-next-line prefer-const
let currentPriorityLevel = NormalPriority
let currentEventStartTime = -1
// eslint-disable-next-line prefer-const
let currentExpirationTime = -1

let isExecutingCallback = false

let isHostCallbackScheduled = false

const localSetTimeout = typeof setTimeout === 'function' ? setTimeout : undefined
const localClearTimeout =
  typeof clearTimeout === 'function' ? clearTimeout : undefined

const localRequestAnimationFrame =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : undefined
const localCancelAnimationFrame =
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : undefined

const ANIMATION_FRAME_TIMEOUT = 100
let rAFID
let rAFTimeoutID
const requestAnimationFrameWithTimeout = function(callback): void {
  rAFID = localRequestAnimationFrame(function(timestamp) {
    localClearTimeout(rAFTimeoutID)
    callback(timestamp)
  })
  rAFTimeoutID = localSetTimeout(function() {
    localCancelAnimationFrame(rAFID)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    callback(getCurrentTime())
  }, ANIMATION_FRAME_TIMEOUT)
}

if (typeof console !== 'undefined') {
  // TODO: Remove fb.me link
  if (typeof localRequestAnimationFrame !== 'function') {
    console.error(
      'This browser doesn\'t support requestAnimationFrame. ' +
        'Make sure that you load a ' +
        'polyfill in older browsers. https://fb.me/react-polyfills',
    )
  }
  if (typeof localCancelAnimationFrame !== 'function') {
    console.error(
      'This browser doesn\'t support cancelAnimationFrame. ' +
        'Make sure that you load a ' +
        'polyfill in older browsers. https://fb.me/react-polyfills',
    )
  }
}

let scheduledHostCallback = null
let isMessageEventScheduled = false
let timeoutTime = -1

let isAnimationFrameScheduled = false

let isFlushingHostCallback = false

let frameDeadline = 0
let previousFrameTime = 33
let activeFrameTime = 33

const shouldYieldToHost = function(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return frameDeadline <= getCurrentTime()
}

const channel = new MessageChannel()
const port = channel.port2
channel.port1.onmessage = function(): void {
  isMessageEventScheduled = false

  const prevScheduledCallback = scheduledHostCallback
  const prevTimeoutTime = timeoutTime
  scheduledHostCallback = null
  timeoutTime = -1

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const currentTime = getCurrentTime()

  let didTimeout = false
  if (frameDeadline - currentTime <= 0) {
    if (prevTimeoutTime !== -1 && prevTimeoutTime <= currentTime) {
      didTimeout = true
    } else {
      if (!isAnimationFrameScheduled) {
        isAnimationFrameScheduled = true
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        requestAnimationFrameWithTimeout(animationTick)
      }
      scheduledHostCallback = prevScheduledCallback
      timeoutTime = prevTimeoutTime
      return
    }
  }

  if (prevScheduledCallback !== null) {
    isFlushingHostCallback = true
    try {
      prevScheduledCallback(didTimeout)
    } finally {
      isFlushingHostCallback = false
    }
  }
}

const animationTick = function(rafTime): void {
  if (scheduledHostCallback !== null) {
    requestAnimationFrameWithTimeout(animationTick)
  } else {
    isAnimationFrameScheduled = false
    return
  }

  let nextFrameTime = rafTime - frameDeadline + activeFrameTime
  if (
    nextFrameTime < activeFrameTime &&
    previousFrameTime < activeFrameTime
  ) {
    if (nextFrameTime < 8) {
      nextFrameTime = 8
    }
    activeFrameTime =
      nextFrameTime < previousFrameTime ? previousFrameTime : nextFrameTime
  } else {
    previousFrameTime = nextFrameTime
  }
  frameDeadline = rafTime + activeFrameTime
  if (!isMessageEventScheduled) {
    isMessageEventScheduled = true
    port.postMessage(undefined)
  }
}

const requestHostCallback = function(callback, absoluteTimeout): void {
  scheduledHostCallback = callback
  timeoutTime = absoluteTimeout
  if (isFlushingHostCallback || absoluteTimeout < 0) {
    port.postMessage(undefined)
  } else if (!isAnimationFrameScheduled) {
    isAnimationFrameScheduled = true
    requestAnimationFrameWithTimeout(animationTick)
  }
}

const cancelHostCallback = function(): void {
  scheduledHostCallback = null
  isMessageEventScheduled = false
  timeoutTime = -1
}

function ensureHostCallbackIsScheduled(): void {
  if (isExecutingCallback) {
    return
  }
  const expirationTime = firstCallbackNode.expirationTime
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true
  } else {
    cancelHostCallback()
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  requestHostCallback(flushWork, expirationTime)
}

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

function flushFirstCallback(): void {
  const flushedNode = firstCallbackNode

  let next = firstCallbackNode.next
  if (firstCallbackNode === next) {
    firstCallbackNode = null
    next = null
  } else {
    const lastCallbackNode = firstCallbackNode.previous
    firstCallbackNode = lastCallbackNode.next = next
    next.previous = lastCallbackNode
  }

  flushedNode.next = flushedNode.previous = null

  const callback = flushedNode.callback
  const expirationTime = flushedNode.expirationTime
  const priorityLevel = flushedNode.priorityLevel
  const previousPriorityLevel = currentPriorityLevel
  const previousExpirationTime = currentExpirationTime
  currentPriorityLevel = priorityLevel
  currentExpirationTime = expirationTime
  let continuationCallback
  try {
    continuationCallback = callback()
  } finally {
    currentPriorityLevel = previousPriorityLevel
    currentExpirationTime = previousExpirationTime
  }

  if (typeof continuationCallback === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const continuationNode: any/* CallbackNode */ = {
      callback: continuationCallback,
      priorityLevel,
      expirationTime,
      next: null,
      previous: null,
    }

    if (firstCallbackNode === null) {
      firstCallbackNode = continuationNode.next = continuationNode.previous = continuationNode
    } else {
      let nextAfterContinuation = null
      let node = firstCallbackNode
      do {
        if (node.expirationTime >= expirationTime) {
          nextAfterContinuation = node
          break
        }
        node = node.next
      } while (node !== firstCallbackNode)

      if (nextAfterContinuation === null) {
        nextAfterContinuation = firstCallbackNode
      } else if (nextAfterContinuation === firstCallbackNode) {
        firstCallbackNode = continuationNode
        ensureHostCallbackIsScheduled()
      }

      const previous = nextAfterContinuation.previous
      previous.next = nextAfterContinuation.previous = continuationNode
      continuationNode.next = nextAfterContinuation
      continuationNode.previous = previous
    }
  }
}

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

function flushWork(didTimeout): void {
  if (isSchedulerPaused) {
    return
  }

  isExecutingCallback = true
  const previousDidTimeout = currentDidTimeout
  currentDidTimeout = didTimeout
  try {
    if (didTimeout) {
      while (
        firstCallbackNode !== null &&
        !(isSchedulerPaused)
      ) {
        const currentTime = getCurrentTime()
        if (firstCallbackNode.expirationTime <= currentTime) {
          do {
            flushFirstCallback()
          } while (
            firstCallbackNode !== null &&
            firstCallbackNode.expirationTime <= currentTime &&
            !(isSchedulerPaused)
          )
          continue
        }
        break
      }
    } else {
      if (firstCallbackNode !== null) {
        do {
          if (isSchedulerPaused) {
            break
          }
          flushFirstCallback()
        } while (firstCallbackNode !== null && !shouldYieldToHost())
      }
    }
  } finally {
    isExecutingCallback = false
    currentDidTimeout = previousDidTimeout
    if (firstCallbackNode !== null) {
      ensureHostCallbackIsScheduled()
    } else {
      isHostCallbackScheduled = false
    }
    flushImmediateWork()
  }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unstable_scheduleCallback(callback, deprecated_options?: any): any {
  const startTime =
    currentEventStartTime !== -1 ? currentEventStartTime : getCurrentTime()

  let expirationTime
  if (
    typeof deprecated_options === 'object' &&
    deprecated_options !== null &&
    typeof deprecated_options.timeout === 'number'
  ) {
    expirationTime = startTime + deprecated_options.timeout
  } else {
    switch (currentPriorityLevel) {
      case ImmediatePriority:
        expirationTime = startTime + IMMEDIATE_PRIORITY_TIMEOUT
        break
      case UserBlockingPriority:
        expirationTime = startTime + USER_BLOCKING_PRIORITY
        break
      case IdlePriority:
        expirationTime = startTime + IDLE_PRIORITY
        break
      case LowPriority:
        expirationTime = startTime + LOW_PRIORITY_TIMEOUT
        break
      case NormalPriority:
      default:
        expirationTime = startTime + NORMAL_PRIORITY_TIMEOUT
    }
  }

  const newNode = {
    callback,
    priorityLevel: currentPriorityLevel,
    expirationTime,
    next: null,
    previous: null,
  }

  if (firstCallbackNode === null) {
    firstCallbackNode = newNode.next = newNode.previous = newNode
    ensureHostCallbackIsScheduled()
  } else {
    let next = null
    let node = firstCallbackNode
    do {
      if (node.expirationTime > expirationTime) {
        next = node
        break
      }
      node = node.next
    } while (node !== firstCallbackNode)

    if (next === null) {
      next = firstCallbackNode
    } else if (next === firstCallbackNode) {
      firstCallbackNode = newNode
      ensureHostCallbackIsScheduled()
    }

    const previous = next.previous
    previous.next = next.previous = newNode
    newNode.next = next
    newNode.previous = previous
  }

  return newNode
}

export {
  ImmediatePriority as unstable_ImmediatePriority,
  UserBlockingPriority as unstable_UserBlockingPriority,
  NormalPriority as unstable_NormalPriority,
  IdlePriority as unstable_IdlePriority,
  LowPriority as unstable_LowPriority,
  unstable_runWithPriority,
  // unstable_next,
  unstable_scheduleCallback,
  unstable_cancelCallback,
  // unstable_wrapCallback,
  unstable_getCurrentPriorityLevel,
  unstable_shouldYield,
  // unstable_continueExecution,
  // unstable_pauseExecution,
  // unstable_getFirstCallbackNode,
  getCurrentTime as unstable_now,
}
