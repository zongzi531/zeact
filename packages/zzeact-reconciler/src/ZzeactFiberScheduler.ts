import { Fiber } from './ZzeactFiber'
import {/* Batch, */ FiberRoot } from './ZzeactFiberRoot'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import {
  // unstable_next as Scheduler_next,
  unstable_getCurrentPriorityLevel as getCurrentPriorityLevel,
  // unstable_runWithPriority as runWithPriority,
  unstable_ImmediatePriority as ImmediatePriority,
  unstable_UserBlockingPriority as UserBlockingPriority,
  unstable_NormalPriority as NormalPriority,
  unstable_LowPriority as LowPriority,
  unstable_IdlePriority as IdlePriority,
} from '@/scheduler'
import {
  // ClassComponent,
  // HostComponent,
  // ContextProvider,
  // ForwardRef,
  // FunctionComponent,
  // HostPortal,
  HostRoot,
  // MemoComponent,
  // SimpleMemoComponent,
  // SuspenseComponent,
  // DehydratedSuspenseComponent,
} from '@/shared/ZzeactWorkTags'
import {
  // enableSchedulerTracing,
  // enableProfilerTimer,
  // enableUserTimingAPI,
  // replayFailedUnitOfWorkWithInvokeGuardedCallback,
  // warnAboutDeprecatedLifecycles,
  // enableSuspenseServerRenderer,
} from '@/shared/ZzeactFeatureFlags'
import invariant from '@/shared/invariant'

import {
  now,
  // scheduleDeferredCallback,
  // cancelDeferredCallback,
  // shouldYield,
  // prepareForCommit,
  // resetAfterCommit,
  // scheduleTimeout,
  // cancelTimeout,
  // noTimeout,
  // schedulePassiveEffects,
  cancelPassiveEffects,
} from  '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import {
  markPendingPriorityLevel,
  // markCommittedPriorityLevels,
  // markSuspendedPriorityLevel,
  // markPingedPriorityLevel,
  // hasLowerPriorityWork,
  // isPriorityLevelSuspended,
  // findEarliestOutstandingPriorityLevel,
  // didExpireAtExpirationTime,
} from './ZzeactFiberPendingPriority'
import {
  // recordEffect,
  recordScheduleUpdate,
  // startRequestCallbackTimer,
  // stopRequestCallbackTimer,
  // startWorkTimer,
  // stopWorkTimer,
  // stopFailedWorkTimer,
  // startWorkLoopTimer,
  // stopWorkLoopTimer,
  // startCommitTimer,
  // stopCommitTimer,
  // startCommitSnapshotEffectsTimer,
  // stopCommitSnapshotEffectsTimer,
  // startCommitHostEffectsTimer,
  // stopCommitHostEffectsTimer,
  // startCommitLifeCyclesTimer,
  // stopCommitLifeCyclesTimer,
} from './ZzeactDebugFiberPerf'

import {
  NoWork,
  Sync,
  Never,
  msToExpirationTime,
  // expirationTimeToMs,
  computeAsyncExpiration,
  computeInteractiveExpiration,
} from './ZzeactFiberExpirationTime'
import { ConcurrentMode, /*ProfileMode,*/ NoContext } from './ZzeactTypeOfMode'
import {
  // throwException,
  // unwindWork,
  unwindInterruptedWork,
  // createRootErrorUpdate,
  // createClassErrorUpdate,
} from './ZzeactFiberUnwindWork'

// eslint-disable-next-line prefer-const
let isWorking: boolean = false

let nextUnitOfWork: Fiber | null = null
// eslint-disable-next-line prefer-const
let nextRoot: FiberRoot | null = null
// eslint-disable-next-line prefer-const
let nextRenderExpirationTime: ExpirationTime = NoWork
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextLatestAbsoluteTimeoutMs: number = -1
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextRenderDidError: boolean = false

// eslint-disable-next-line prefer-const
let isCommitting: boolean = false
// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
let passiveEffectCallbackHandle: any = null
// eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
let passiveEffectCallback: any = null

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let interruptedBy: Fiber | null = null

let firstScheduledRoot: FiberRoot | null = null
let lastScheduledRoot: FiberRoot | null = null

// eslint-disable-next-line prefer-const
let isRendering: boolean = false

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextFlushedRoot: FiberRoot | null = null
let nextFlushedExpirationTime: ExpirationTime = NoWork
let lowestPriorityPendingInteractiveExpirationTime: ExpirationTime = NoWork

// eslint-disable-next-line prefer-const
let isBatchingUpdates: boolean = false
let isUnbatchingUpdates: boolean = false

// eslint-disable-next-line prefer-const
let originalStartTimeMs: number = now()
// eslint-disable-next-line prefer-const
let currentRendererTime: ExpirationTime = msToExpirationTime(
  originalStartTimeMs,
)
let currentSchedulerTime: ExpirationTime = currentRendererTime

const NESTED_UPDATE_LIMIT = 50
let nestedUpdateCount: number = 0

function resetStack(): void {
  if (nextUnitOfWork !== null) {
    let interruptedWork = nextUnitOfWork.return
    while (interruptedWork !== null) {
      unwindInterruptedWork(interruptedWork)
      interruptedWork = interruptedWork.return
    }
  }

  nextRoot = null
  nextRenderExpirationTime = NoWork
  nextLatestAbsoluteTimeoutMs = -1
  nextRenderDidError = false
  nextUnitOfWork = null
}

function flushPassiveEffects(): void {
  if (passiveEffectCallbackHandle !== null) {
    cancelPassiveEffects(passiveEffectCallbackHandle)
  }
  if (passiveEffectCallback !== null) {
    passiveEffectCallback()
  }
}

function computeExpirationForFiber(currentTime: ExpirationTime, fiber: Fiber): ExpirationTime {
  const priorityLevel = getCurrentPriorityLevel()

  let expirationTime
  if ((fiber.mode & ConcurrentMode) === NoContext) {
    expirationTime = Sync
  } else if (isWorking && !isCommitting) {
    expirationTime = nextRenderExpirationTime
  } else {
    switch (priorityLevel) {
      case ImmediatePriority:
        expirationTime = Sync
        break
      case UserBlockingPriority:
        expirationTime = computeInteractiveExpiration(currentTime)
        break
      case NormalPriority:
        expirationTime = computeAsyncExpiration(currentTime)
        break
      case LowPriority:
      case IdlePriority:
        expirationTime = Never
        break
      default:
        invariant(
          false,
          'Unknown priority level. This error is likely caused by a bug in ' +
            'Zzeact. Please file an issue.',
        )
    }

    if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
      expirationTime -= 1
    }
  }

  if (
    priorityLevel === UserBlockingPriority &&
    (lowestPriorityPendingInteractiveExpirationTime === NoWork ||
      expirationTime < lowestPriorityPendingInteractiveExpirationTime)
  ) {
    lowestPriorityPendingInteractiveExpirationTime = expirationTime
  }

  return expirationTime
}

function findHighestPriorityRoot(): void {
  let highestPriorityWork = NoWork
  let highestPriorityRoot = null
  if (lastScheduledRoot !== null) {
    let previousScheduledRoot = lastScheduledRoot
    let root = firstScheduledRoot
    while (root !== null) {
      const remainingExpirationTime = root.expirationTime
      if (remainingExpirationTime === NoWork) {
        invariant(
          previousScheduledRoot !== null && lastScheduledRoot !== null,
          'Should have a previous and last root. This error is likely ' +
            'caused by a bug in Zzeact. Please file an issue.',
        )
        if (root === root.nextScheduledRoot) {
          root.nextScheduledRoot = null
          firstScheduledRoot = lastScheduledRoot = null
          break
        } else if (root === firstScheduledRoot) {
          const next = root.nextScheduledRoot
          firstScheduledRoot = next
          lastScheduledRoot.nextScheduledRoot = next
          root.nextScheduledRoot = null
        } else if (root === lastScheduledRoot) {
          lastScheduledRoot = previousScheduledRoot
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
          root.nextScheduledRoot = null
          break
        } else {
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot
          root.nextScheduledRoot = null
        }
        root = previousScheduledRoot.nextScheduledRoot
      } else {
        if (remainingExpirationTime > highestPriorityWork) {
          highestPriorityWork = remainingExpirationTime
          highestPriorityRoot = root
        }
        if (root === lastScheduledRoot) {
          break
        }
        if (highestPriorityWork === Sync) {
          break
        }
        previousScheduledRoot = root
        root = root.nextScheduledRoot
      }
    }
  }

  nextFlushedRoot = highestPriorityRoot
  nextFlushedExpirationTime = highestPriorityWork
}

function recomputeCurrentRendererTime(): void {
  const currentTimeMs = now() - originalStartTimeMs
  currentRendererTime = msToExpirationTime(currentTimeMs)
}

function requestCurrentTime(): ExpirationTime {
  if (isRendering) {
    return currentSchedulerTime
  }
  findHighestPriorityRoot()
  if (
    nextFlushedExpirationTime === NoWork ||
    nextFlushedExpirationTime === Never
  ) {
    recomputeCurrentRendererTime()
    currentSchedulerTime = currentRendererTime
    return currentSchedulerTime
  }
  return currentSchedulerTime
}

function unbatchedUpdates<A, R>(fn: (a?: A) => R, a?: A): R {
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    isUnbatchingUpdates = true
    try {
      return fn(a)
    } finally {
      isUnbatchingUpdates = false
    }
  }
  return fn(a)
}

function scheduleWorkToRoot(fiber: Fiber, expirationTime): FiberRoot | null {
  recordScheduleUpdate()

  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime
  }
  let alternate = fiber.alternate
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime
  }
  let node = fiber.return
  let root = null
  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode
  } else {
    while (node !== null) {
      alternate = node.alternate
      if (node.childExpirationTime < expirationTime) {
        node.childExpirationTime = expirationTime
        if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime
        }
      } else if (
        alternate !== null &&
        alternate.childExpirationTime < expirationTime
      ) {
        alternate.childExpirationTime = expirationTime
      }
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode
        break
      }
      node = node.return
    }
  }

  if (false/* enableSchedulerTracing */) {
    // if (root !== null) {
    //   const interactions = __interactionsRef.current
    //   if (interactions.size > 0) {
    //     const pendingInteractionMap = root.pendingInteractionMap
    //     const pendingInteractions = pendingInteractionMap.get(expirationTime)
    //     if (pendingInteractions != null) {
    //       interactions.forEach(interaction => {
    //         if (!pendingInteractions.has(interaction)) {
    //           // Update the pending async work count for previously unscheduled interaction.
    //           interaction.__count++
    //         }

    //         pendingInteractions.add(interaction)
    //       })
    //     } else {
    //       pendingInteractionMap.set(expirationTime, new Set(interactions))

    //       // Update the pending async work count for the current interactions.
    //       interactions.forEach(interaction => {
    //         interaction.__count++
    //       })
    //     }

    //     const subscriber = __subscriberRef.current
    //     if (subscriber !== null) {
    //       const threadID = computeThreadID(
    //         expirationTime,
    //         root.interactionThreadID,
    //       )
    //       subscriber.onWorkScheduled(interactions, threadID)
    //     }
    //   }
    // }
  }
  return root
}

function requestWork(root: FiberRoot, expirationTime: ExpirationTime): void {
  console.log('2019/10/29 Reading stop at requestWork (!important):', root, expirationTime)
  // addRootToSchedule(root, expirationTime)
  if (isRendering) {
    return
  }

  if (isBatchingUpdates) {
    if (isUnbatchingUpdates) {
      nextFlushedRoot = root
      nextFlushedExpirationTime = Sync
      // performWorkOnRoot(root, Sync, false)
    }
    return
  }

  if (expirationTime === Sync) {
    // performSyncWork()
  } else {
    // scheduleCallbackWithExpirationTime(root, expirationTime)
  }
}

function scheduleWork(fiber: Fiber, expirationTime: ExpirationTime): void {
  const root = scheduleWorkToRoot(fiber, expirationTime)
  if (root === null) {
    return
  }

  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    interruptedBy = fiber
    resetStack()
  }
  markPendingPriorityLevel(root, expirationTime)
  if (
    !isWorking ||
    isCommitting ||
    nextRoot !== root
  ) {
    const rootExpirationTime = root.expirationTime
    requestWork(root, rootExpirationTime)
  }
  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0
    invariant(
      false,
      'Maximum update depth exceeded. This can happen when a ' +
        'component repeatedly calls setState inside ' +
        'componentWillUpdate or componentDidUpdate. Zzeact limits ' +
        'the number of nested updates to prevent infinite loops.',
    )
  }
}

export {
  requestCurrentTime,
  computeExpirationForFiber,
  // captureCommitPhaseError,
  // onUncaughtError,
  // renderDidSuspend,
  // renderDidError,
  // pingSuspendedRoot,
  // retryTimedOutBoundary,
  // markLegacyErrorBoundaryAsFailed,
  // isAlreadyFailedLegacyErrorBoundary,
  scheduleWork,
  requestWork,
  // flushRoot,
  // batchedUpdates,
  unbatchedUpdates,
  // flushSync,
  // flushControlled,
  // Scheduler_next as deferredUpdates,
  // syncUpdates,
  // interactiveUpdates,
  // flushInteractiveUpdates,
  // computeUniqueAsyncExpiration,
  flushPassiveEffects,
}
