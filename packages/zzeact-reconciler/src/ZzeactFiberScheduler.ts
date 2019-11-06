import { Fiber } from './ZzeactFiber'
import { Batch, FiberRoot } from './ZzeactFiberRoot'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { Interaction } from '@/scheduler/src/Tracing'

import {
  // unstable_next as Scheduler_next,
  unstable_getCurrentPriorityLevel as getCurrentPriorityLevel,
  unstable_runWithPriority as runWithPriority,
  unstable_ImmediatePriority as ImmediatePriority,
  unstable_UserBlockingPriority as UserBlockingPriority,
  unstable_NormalPriority as NormalPriority,
  unstable_LowPriority as LowPriority,
  unstable_IdlePriority as IdlePriority,
} from '@/scheduler'
import ZzeactSharedInternals from '@/shared/ZzeactSharedInternals'
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
  shouldYield,
  // prepareForCommit,
  // resetAfterCommit,
  scheduleTimeout,
  // cancelTimeout,
  noTimeout,
  // schedulePassiveEffects,
  cancelPassiveEffects,
} from  '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ZzeactFiberHostConfig */
import {
  markPendingPriorityLevel,
  // markCommittedPriorityLevels,
  markSuspendedPriorityLevel,
  // markPingedPriorityLevel,
  hasLowerPriorityWork,
  // isPriorityLevelSuspended,
  findEarliestOutstandingPriorityLevel,
  // didExpireAtExpirationTime,
} from './ZzeactFiberPendingPriority'
import {
  // recordEffect,
  recordScheduleUpdate,
  // startRequestCallbackTimer,
  // stopRequestCallbackTimer,
  startWorkTimer,
  // stopWorkTimer,
  // stopFailedWorkTimer,
  startWorkLoopTimer,
  stopWorkLoopTimer,
  // startCommitTimer,
  // stopCommitTimer,
  // startCommitSnapshotEffectsTimer,
  // stopCommitSnapshotEffectsTimer,
  // startCommitHostEffectsTimer,
  // stopCommitHostEffectsTimer,
  // startCommitLifeCyclesTimer,
  // stopCommitLifeCyclesTimer,
} from './ZzeactDebugFiberPerf'
import { createWorkInProgress /*, assignFiberPropertiesInDEV */ } from './ZzeactFiber'
import {
  NoWork,
  Sync,
  Never,
  msToExpirationTime,
  expirationTimeToMs,
  computeAsyncExpiration,
  computeInteractiveExpiration,
} from './ZzeactFiberExpirationTime'
import { ConcurrentMode, /* ProfileMode, */ NoContext } from './ZzeactTypeOfMode'
import { /* popProvider, */resetContextDependences } from './ZzeactFiberNewContext'
import { resetHooks } from './ZzeactFiberHooks'
import {
  // recordCommitTime,
  // startProfilerTimer,
  // stopProfilerTimerIfRunningAndRecordDelta,
} from './ZzeactProfilerTimer'
import { beginWork } from './ZzeactFiberBeginWork'
import {
  throwException,
  // unwindWork,
  unwindInterruptedWork,
  // createRootErrorUpdate,
  // createClassErrorUpdate,
} from './ZzeactFiberUnwindWork'
import { ContextOnlyDispatcher } from './ZzeactFiberHooks'

const { ZzeactCurrentDispatcher /* , ZzeactCurrentOwner */ } = ZzeactSharedInternals

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let callbackExpirationTime: ExpirationTime
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let callbackID
// eslint-disable-next-line prefer-const
let isRendering: boolean = false

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextFlushedRoot: FiberRoot | null = null
let nextFlushedExpirationTime: ExpirationTime = NoWork
let lowestPriorityPendingInteractiveExpirationTime: ExpirationTime = NoWork
let hasUnhandledError: boolean = false
let unhandledError: mixed | null = null

// eslint-disable-next-line prefer-const
let isBatchingUpdates: boolean = false
let isUnbatchingUpdates: boolean = false

let completedBatches: Array<Batch> | null = null

// eslint-disable-next-line prefer-const
let originalStartTimeMs: number = now()
// eslint-disable-next-line prefer-const
let currentRendererTime: ExpirationTime = msToExpirationTime(
  originalStartTimeMs,
)
let currentSchedulerTime: ExpirationTime = currentRendererTime

const NESTED_UPDATE_LIMIT = 50
let nestedUpdateCount: number = 0
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let lastCommittedRootDuringThisBatch: FiberRoot | null = null

// eslint-disable-next-line prefer-const
let didYield: boolean = false
function shouldYieldToRenderer(): boolean {
  if (didYield) {
    return true
  }
  if (shouldYield()) {
    didYield = true
    return true
  }
  return false
}

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

function addRootToSchedule(root: FiberRoot, expirationTime: ExpirationTime): void {
  if (root.nextScheduledRoot === null) {
    root.expirationTime = expirationTime
    if (lastScheduledRoot === null) {
      firstScheduledRoot = lastScheduledRoot = root
      root.nextScheduledRoot = root
    } else {
      lastScheduledRoot.nextScheduledRoot = root
      lastScheduledRoot = root
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
    }
  } else {
    const remainingExpirationTime = root.expirationTime
    if (expirationTime > remainingExpirationTime) {
      root.expirationTime = expirationTime
    }
  }
}

function finishRendering(): void {
  nestedUpdateCount = 0
  lastCommittedRootDuringThisBatch = null

  if (completedBatches !== null) {
    const batches = completedBatches
    completedBatches = null
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      try {
        batch._onComplete()
      } catch (error) {
        if (!hasUnhandledError) {
          hasUnhandledError = true
          unhandledError = error
        }
      }
    }
  }

  if (hasUnhandledError) {
    const error = unhandledError
    unhandledError = null
    hasUnhandledError = false
    throw error
  }
}

function flushRoot(root: FiberRoot, expirationTime: ExpirationTime): void {
  invariant(
    !isRendering,
    'work.commit(): Cannot commit while already rendering. This likely ' +
      'means you attempted to commit from inside a lifecycle method.',
  )
  nextFlushedRoot = root
  nextFlushedExpirationTime = expirationTime
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  performWorkOnRoot(root, expirationTime, false)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  performSyncWork()
}

function onTimeout(root, finishedWork, suspendedExpirationTime): void {
  root.pendingCommitExpirationTime = suspendedExpirationTime
  root.finishedWork = finishedWork
  recomputeCurrentRendererTime()
  currentSchedulerTime = currentRendererTime
  flushRoot(root, suspendedExpirationTime)
}

function onSuspend(
  root: FiberRoot,
  finishedWork: Fiber,
  suspendedExpirationTime: ExpirationTime,
  rootExpirationTime: ExpirationTime,
  msUntilTimeout: number,
): void {
  root.expirationTime = rootExpirationTime
  if (msUntilTimeout === 0 && !shouldYieldToRenderer()) {
    root.pendingCommitExpirationTime = suspendedExpirationTime
    root.finishedWork = finishedWork
  } else if (msUntilTimeout > 0) {
    root.timeoutHandle = scheduleTimeout(
      onTimeout.bind(null, root, finishedWork, suspendedExpirationTime),
      msUntilTimeout,
    )
  }
}

function performUnitOfWork(workInProgress: Fiber): Fiber | null {
  const current = workInProgress.alternate

  startWorkTimer(workInProgress)

  let next
  if (false/* enableProfilerTimer */) {
    // if (workInProgress.mode & ProfileMode) {
    //   startProfilerTimer(workInProgress)
    // }

    // next = beginWork(current, workInProgress, nextRenderExpirationTime)
    // workInProgress.memoizedProps = workInProgress.pendingProps

    // if (workInProgress.mode & ProfileMode) {
    //   // Record the render duration assuming we didn't bailout (or error).
    //   stopProfilerTimerIfRunningAndRecordDelta(workInProgress, true)
    // }
  } else {
    next = beginWork(current, workInProgress, nextRenderExpirationTime)
    workInProgress.memoizedProps = workInProgress.pendingProps
  }

  // if (next === null) {
  //   next = completeUnitOfWork(workInProgress)
  // }

  // ZzeactCurrentOwner.current = null

  return next
}

function onFatal(root): void {
  root.finishedWork = null
}

function onYield(root): void {
  root.finishedWork = null
}

function workLoop(isYieldy): void {
  if (!isYieldy) {
    while (nextUnitOfWork !== null) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  } else {
    while (nextUnitOfWork !== null && !shouldYieldToRenderer()) {
      console.log('2019/10/31 Reading skip performUnitOfWork:', nextUnitOfWork)
      // nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  }
}

function onUncaughtError(error: mixed): void {
  invariant(
    nextFlushedRoot !== null,
    'Should be working on a root. This error is likely caused by a bug in ' +
      'React. Please file an issue.',
  )
  nextFlushedRoot.expirationTime = NoWork
  if (!hasUnhandledError) {
    hasUnhandledError = true
    unhandledError = error
  }
}

function onComplete(
  root: FiberRoot,
  finishedWork: Fiber,
  expirationTime: ExpirationTime,
): void {
  root.pendingCommitExpirationTime = expirationTime
  root.finishedWork = finishedWork
}

function renderRoot(root: FiberRoot, isYieldy: boolean): void {
  invariant(
    !isWorking,
    'renderRoot was called recursively. This error is likely caused ' +
      'by a bug in Zzeact. Please file an issue.',
  )

  flushPassiveEffects()

  isWorking = true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const previousDispatcher = ZzeactCurrentDispatcher.current
  ZzeactCurrentDispatcher.current = ContextOnlyDispatcher

  const expirationTime = root.nextExpirationTimeToWorkOn

  if (
    expirationTime !== nextRenderExpirationTime ||
    root !== nextRoot ||
    nextUnitOfWork === null
  ) {
    resetStack()
    nextRoot = root
    nextRenderExpirationTime = expirationTime
    nextUnitOfWork = createWorkInProgress(
      nextRoot.current,
      null,
      /* nextRenderExpirationTime, */
    )
    root.pendingCommitExpirationTime = NoWork

    if (false/* enableSchedulerTracing */) {
      // const interactions: Set<Interaction> = new Set()
      // root.pendingInteractionMap.forEach(
      //   (scheduledInteractions, scheduledExpirationTime) => {
      //     if (scheduledExpirationTime >= expirationTime) {
      //       scheduledInteractions.forEach(interaction =>
      //         interactions.add(interaction),
      //       )
      //     }
      //   },
      // )

      // root.memoizedInteractions = interactions

      // if (interactions.size > 0) {
      //   const subscriber = __subscriberRef.current
      //   if (subscriber !== null) {
      //     const threadID = computeThreadID(
      //       expirationTime,
      //       root.interactionThreadID,
      //     )
      //     try {
      //       subscriber.onWorkStarted(interactions, threadID)
      //     } catch (error) {
      //       if (!hasUnhandledError) {
      //         hasUnhandledError = true
      //         unhandledError = error
      //       }
      //     }
      //   }
      // }
    }
  }

  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  let prevInteractions: Set<Interaction> = (null as any)
  if (false/* enableSchedulerTracing */) {
    // prevInteractions = __interactionsRef.current
    // __interactionsRef.current = root.memoizedInteractions
  }

  // eslint-disable-next-line prefer-const, @typescript-eslint/no-unused-vars
  let didFatal = false

  startWorkLoopTimer(nextUnitOfWork)

  do {
    try {
      workLoop(isYieldy)
    } catch (thrownValue) {
      resetContextDependences()
      resetHooks()

      if (nextUnitOfWork === null) {
        didFatal = true
        onUncaughtError(thrownValue)
      } else {
        if (false/* enableProfilerTimer && nextUnitOfWork.mode & ProfileMode */) {
          // stopProfilerTimerIfRunningAndRecordDelta(nextUnitOfWork, true)
        }
        invariant(
          nextUnitOfWork !== null,
          'Failed to replay rendering after an error. This ' +
            'is likely caused by a bug in Zzeact. Please file an issue ' +
            'with a reproducing case to help us find it.',
        )

        const sourceFiber: Fiber = nextUnitOfWork
        const returnFiber = sourceFiber.return
        if (returnFiber === null) {
          didFatal = true
          onUncaughtError(thrownValue)
        } else {
          throwException(
            root,
            returnFiber,
            sourceFiber,
            thrownValue,
            nextRenderExpirationTime,
          )
          console.log('2019/11/6 Reading skip completeUnitOfWork:', sourceFiber)
          // nextUnitOfWork = completeUnitOfWork(sourceFiber)
          continue
        }
      }
    }
    break
  } while (true)

  if (false/* enableSchedulerTracing */) {
    // __interactionsRef.current = prevInteractions
  }

  isWorking = false
  ZzeactCurrentDispatcher.current = previousDispatcher
  resetContextDependences()
  resetHooks()

  if (didFatal) {
    const didCompleteRoot = false
    stopWorkLoopTimer(interruptedBy, didCompleteRoot)
    interruptedBy = null
    nextRoot = null
    onFatal(root)
    return
  }

  if (nextUnitOfWork !== null) {
    const didCompleteRoot = false
    stopWorkLoopTimer(interruptedBy, didCompleteRoot)
    interruptedBy = null
    onYield(root)
    return
  }

  const didCompleteRoot = true
  stopWorkLoopTimer(interruptedBy, didCompleteRoot)
  const rootWorkInProgress = root.current.alternate
  invariant(
    rootWorkInProgress !== null,
    'Finished root should have a work-in-progress. This error is likely ' +
      'caused by a bug in Zzeact. Please file an issue.',
  )

  nextRoot = null
  interruptedBy = null

  if (nextRenderDidError) {
    if (hasLowerPriorityWork(root, expirationTime)) {
      markSuspendedPriorityLevel(root, expirationTime)
      const suspendedExpirationTime = expirationTime
      const rootExpirationTime = root.expirationTime
      onSuspend(
        root,
        rootWorkInProgress,
        suspendedExpirationTime,
        rootExpirationTime,
        -1,
      )
      return
    } else if (
      !root.didError &&
      isYieldy
    ) {
      root.didError = true
      const suspendedExpirationTime = (root.nextExpirationTimeToWorkOn = expirationTime)
      const rootExpirationTime = (root.expirationTime = Sync)
      onSuspend(
        root,
        rootWorkInProgress,
        suspendedExpirationTime,
        rootExpirationTime,
        -1,
      )
      return
    }
  }

  if (isYieldy && nextLatestAbsoluteTimeoutMs !== -1) {
    const suspendedExpirationTime = expirationTime
    markSuspendedPriorityLevel(root, suspendedExpirationTime)

    const earliestExpirationTime = findEarliestOutstandingPriorityLevel(
      root,
      expirationTime,
    )
    const earliestExpirationTimeMs = expirationTimeToMs(earliestExpirationTime)
    if (earliestExpirationTimeMs < nextLatestAbsoluteTimeoutMs) {
      nextLatestAbsoluteTimeoutMs = earliestExpirationTimeMs
    }

    const currentTimeMs = expirationTimeToMs(requestCurrentTime())
    let msUntilTimeout = nextLatestAbsoluteTimeoutMs - currentTimeMs
    msUntilTimeout = msUntilTimeout < 0 ? 0 : msUntilTimeout

    const rootExpirationTime = root.expirationTime
    onSuspend(
      root,
      rootWorkInProgress,
      suspendedExpirationTime,
      rootExpirationTime,
      msUntilTimeout,
    )
    return
  }

  onComplete(root, rootWorkInProgress, expirationTime)
}

function completeRoot(
  root: FiberRoot,
  finishedWork: Fiber,
  expirationTime: ExpirationTime,
): void {
  const firstBatch = root.firstBatch
  if (firstBatch !== null && firstBatch._expirationTime >= expirationTime) {
    if (completedBatches === null) {
      completedBatches = [firstBatch]
    } else {
      completedBatches.push(firstBatch)
    }
    if (firstBatch._defer) {
      root.finishedWork = finishedWork
      root.expirationTime = NoWork
      return
    }
  }

  root.finishedWork = null

  if (root === lastCommittedRootDuringThisBatch) {
    nestedUpdateCount++
  } else {
    lastCommittedRootDuringThisBatch = root
    nestedUpdateCount = 0
  }
  runWithPriority(ImmediatePriority, () => {
    console.log('2019/11/6 Reading stop at commitRoot (!important):', root, finishedWork)
    debugger
    // commitRoot(root, finishedWork)
  })
}

function performWorkOnRoot(
  root: FiberRoot,
  expirationTime: ExpirationTime,
  isYieldy: boolean,
): void {
  invariant(
    !isRendering,
    'performWorkOnRoot was called recursively. This error is likely caused ' +
      'by a bug in Zzeact. Please file an issue.',
  )

  isRendering = true

  if (!isYieldy) {
    let finishedWork = root.finishedWork
    if (finishedWork !== null) {
      console.log('2019/10/31 Reading skip completeRoot:', root)
      debugger
      // completeRoot(root, finishedWork, expirationTime)
    } else {
      root.finishedWork = null
      const timeoutHandle = root.timeoutHandle
      if (timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout
        console.log('2019/10/31 Reading skip cancelTimeout:', timeoutHandle)
        // cancelTimeout(timeoutHandle)
      }
      renderRoot(root, isYieldy)
      finishedWork = root.finishedWork
      if (finishedWork !== null) {
        completeRoot(root, finishedWork, expirationTime)
      }
    }
  } else {
    let finishedWork = root.finishedWork
    if (finishedWork !== null) {
      console.log('2019/10/31 Reading skip completeRoot:', root)
      debugger
      // completeRoot(root, finishedWork, expirationTime)
    } else {
      root.finishedWork = null
      const timeoutHandle = root.timeoutHandle
      if (timeoutHandle !== noTimeout) {
        root.timeoutHandle = noTimeout
        console.log('2019/10/31 Reading skip cancelTimeout:', timeoutHandle)
        // cancelTimeout(timeoutHandle)
      }
      console.log('2019/10/31 Reading skip renderRoot:', root)
      // renderRoot(root, isYieldy)
      finishedWork = root.finishedWork
      if (finishedWork !== null) {
        if (!shouldYieldToRenderer()) {
          console.log('2019/10/31 Reading skip completeRoot:', root)
          debugger
          // completeRoot(root, finishedWork, expirationTime)
        } else {
          root.finishedWork = finishedWork
        }
      }
    }
  }

  isRendering = false
}

function performWork(minExpirationTime: ExpirationTime, isYieldy: boolean): void {
  findHighestPriorityRoot()

  if (isYieldy) {
    recomputeCurrentRendererTime()
    currentSchedulerTime = currentRendererTime

    if (false/* enableUserTimingAPI */) {
      // const didExpire = nextFlushedExpirationTime > currentRendererTime
      // const timeout = expirationTimeToMs(nextFlushedExpirationTime)
      // stopRequestCallbackTimer(didExpire, timeout)
    }

    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      minExpirationTime <= nextFlushedExpirationTime &&
      !(didYield && currentRendererTime > nextFlushedExpirationTime)
    ) {
      console.log('2019/10/31 Reading skip performWorkOnRoot:', nextFlushedRoot)
      // performWorkOnRoot(
      //   nextFlushedRoot,
      //   nextFlushedExpirationTime,
      //   currentRendererTime > nextFlushedExpirationTime,
      // )
      findHighestPriorityRoot()
      recomputeCurrentRendererTime()
      currentSchedulerTime = currentRendererTime
    }
  } else {
    while (
      nextFlushedRoot !== null &&
      nextFlushedExpirationTime !== NoWork &&
      minExpirationTime <= nextFlushedExpirationTime
    ) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false)
      findHighestPriorityRoot()
    }
  }

  if (isYieldy) {
    callbackExpirationTime = NoWork
    callbackID = null
  }
  if (nextFlushedExpirationTime !== NoWork) {
    console.log('2019/10/31 Reading skip scheduleCallbackWithExpirationTime:', nextFlushedRoot)
    // scheduleCallbackWithExpirationTime(
    //   // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
    //   ((nextFlushedRoot as any) as FiberRoot),
    //   nextFlushedExpirationTime,
    // )
  }

  finishRendering()
}

function performSyncWork(): void {
  performWork(Sync, false)
}

function requestWork(root: FiberRoot, expirationTime: ExpirationTime): void {
  addRootToSchedule(root, expirationTime)
  if (isRendering) {
    return
  }
  if (isBatchingUpdates) {
    if (isUnbatchingUpdates) {
      nextFlushedRoot = root
      nextFlushedExpirationTime = Sync
      console.log('2019/10/31 Reading skip performWorkOnRoot:', root)
      // performWorkOnRoot(root, Sync, false)
    }
    return
  }

  if (expirationTime === Sync) {
    performSyncWork()
  } else {
    console.log('2019/10/31 Reading skip scheduleCallbackWithExpirationTime:', root)
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
  onUncaughtError,
  // renderDidSuspend,
  // renderDidError,
  // pingSuspendedRoot,
  // retryTimedOutBoundary,
  // markLegacyErrorBoundaryAsFailed,
  // isAlreadyFailedLegacyErrorBoundary,
  scheduleWork,
  requestWork,
  flushRoot,
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
