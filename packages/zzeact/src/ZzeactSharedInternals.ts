// import assign from 'object-assign'
import {
  unstable_cancelCallback,
  unstable_shouldYield,
  unstable_now,
  // unstable_scheduleCallback,
  // unstable_runWithPriority,
  // unstable_next,
  // unstable_getFirstCallbackNode,
  // unstable_pauseExecution,
  // unstable_continueExecution,
  // unstable_wrapCallback,
  unstable_getCurrentPriorityLevel,
  unstable_IdlePriority,
  unstable_ImmediatePriority,
  unstable_LowPriority,
  unstable_NormalPriority,
  unstable_UserBlockingPriority,
} from '@/scheduler'
import {
  // __interactionsRef,
  // __subscriberRef,
  // unstable_clear,
  // unstable_getCurrent,
  // unstable_getThreadID,
  // unstable_subscribe,
  // unstable_trace,
  // unstable_unsubscribe,
  // unstable_wrap,
} from '@/scheduler/tracing'
import ZzeactCurrentDispatcher from './ZzeactCurrentDispatcher'
import ZzeactCurrentOwner from './ZzeactCurrentOwner'
// import ZzeactDebugCurrentFrame from './ZzeactDebugCurrentFrame'

const ZzeactSharedInternals = {
  ZzeactCurrentDispatcher,
  ZzeactCurrentOwner,
  // assign,
}

if (true/* __UMD__ */) {
  Object.assign(ZzeactSharedInternals, {
    Scheduler: {
      unstable_cancelCallback,
      unstable_shouldYield,
      unstable_now,
      // unstable_scheduleCallback,
      // unstable_runWithPriority,
      // unstable_next,
      // unstable_wrapCallback,
      // unstable_getFirstCallbackNode,
      // unstable_pauseExecution,
      // unstable_continueExecution,
      unstable_getCurrentPriorityLevel,
      unstable_IdlePriority,
      unstable_ImmediatePriority,
      unstable_LowPriority,
      unstable_NormalPriority,
      unstable_UserBlockingPriority,
    },
    SchedulerTracing: {
      // __interactionsRef,
      // __subscriberRef,
      // unstable_clear,
      // unstable_getCurrent,
      // unstable_getThreadID,
      // unstable_subscribe,
      // unstable_trace,
      // unstable_unsubscribe,
      // unstable_wrap,
    },
  })
}

export default ZzeactSharedInternals
