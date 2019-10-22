import {/* Batch, */ FiberRoot } from './ZzeactFiberRoot'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

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
  // cancelPassiveEffects,
} from  '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

import {
  NoWork,
  Sync,
  Never,
  msToExpirationTime,
  // expirationTimeToMs,
  // computeAsyncExpiration,
  // computeInteractiveExpiration,
} from './ZzeactFiberExpirationTime'

let firstScheduledRoot: FiberRoot | null = null
let lastScheduledRoot: FiberRoot | null = null

// eslint-disable-next-line prefer-const
let isRendering: boolean = false

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextFlushedRoot: FiberRoot | null = null
let nextFlushedExpirationTime: ExpirationTime = NoWork

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
            'caused by a bug in React. Please file an issue.',
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

export {
  requestCurrentTime,
  // computeExpirationForFiber,
  // captureCommitPhaseError,
  // onUncaughtError,
  // renderDidSuspend,
  // renderDidError,
  // pingSuspendedRoot,
  // retryTimedOutBoundary,
  // markLegacyErrorBoundaryAsFailed,
  // isAlreadyFailedLegacyErrorBoundary,
  // scheduleWork,
  // requestWork,
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
  // flushPassiveEffects,
}
