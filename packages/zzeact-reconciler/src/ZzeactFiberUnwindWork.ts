import { Fiber } from './ZzeactFiber'
import { FiberRoot } from './ZzeactFiberRoot'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import {
  ClassComponent,
  HostRoot,
  HostComponent,
  HostPortal,
  ContextProvider,
  // SuspenseComponent,
  // DehydratedSuspenseComponent,
  // IncompleteClassComponent,
} from '@/shared/ZzeactWorkTags'

import { popHostContainer, popHostContext } from './ZzeactFiberHostContext'
import {
  // isContextProvider as isLegacyContextProvider,
  popContext as popLegacyContext,
  popTopLevelContextObject as popTopLevelLegacyContextObject,
} from './ZzeactFiberContext'
import { popProvider } from './ZzeactFiberNewContext'

function throwException(
  root: FiberRoot,
  returnFiber: Fiber,
  sourceFiber: Fiber,
  value: mixed,
  renderExpirationTime: ExpirationTime,
): void {
  console.log('2019/11/6 Reading skip throwException:', root, returnFiber, sourceFiber, value, renderExpirationTime)
  // sourceFiber.effectTag |= Incomplete
  // sourceFiber.firstEffect = sourceFiber.lastEffect = null

  // if (
  //   value !== null &&
  //   typeof value === 'object' &&
  //   typeof value.then === 'function'
  // ) {
  //   const thenable: Thenable = value as any
  //   let workInProgress = returnFiber
  //   let earliestTimeoutMs = -1;
  //   let startTimeMs = -1;
  //   do {
  //     if (workInProgress.tag === SuspenseComponent) {
  //       const current = workInProgress.alternate
  //       if (current !== null) {
  //         const currentState: SuspenseState | null = current.memoizedState;
  //         if (currentState !== null) {
  //           // Reached a boundary that already timed out. Do not search
  //           // any further.
  //           const timedOutAt = currentState.timedOutAt;
  //           startTimeMs = expirationTimeToMs(timedOutAt);
  //           // Do not search any further.
  //           break;
  //         }
  //       }
  //       let timeoutPropMs = workInProgress.pendingProps.maxDuration;
  //       if (typeof timeoutPropMs === 'number') {
  //         if (timeoutPropMs <= 0) {
  //           earliestTimeoutMs = 0;
  //         } else if (
  //           earliestTimeoutMs === -1 ||
  //           timeoutPropMs < earliestTimeoutMs
  //         ) {
  //           earliestTimeoutMs = timeoutPropMs;
  //         }
  //       }
  //     }
  //     // If there is a DehydratedSuspenseComponent we don't have to do anything because
  //     // if something suspends inside it, we will simply leave that as dehydrated. It
  //     // will never timeout.
  //     workInProgress = workInProgress.return;
  //   } while (workInProgress !== null);

  //   // Schedule the nearest Suspense to re-render the timed out view.
  //   workInProgress = returnFiber;
  //   do {
  //     if (
  //       workInProgress.tag === SuspenseComponent &&
  //       shouldCaptureSuspense(workInProgress)
  //     ) {
  //       // Found the nearest boundary.

  //       // Stash the promise on the boundary fiber. If the boundary times out, we'll
  //       // attach another listener to flip the boundary back to its normal state.
  //       const thenables: Set<Thenable> = (workInProgress.updateQueue as any);
  //       if (thenables === null) {
  //         const updateQueue = (new Set() as any);
  //         updateQueue.add(thenable);
  //         workInProgress.updateQueue = updateQueue;
  //       } else {
  //         thenables.add(thenable);
  //       }

  //       if ((workInProgress.mode & ConcurrentMode) === NoEffect) {
  //         workInProgress.effectTag |= DidCapture;

  //         // We're going to commit this fiber even though it didn't complete.
  //         // But we shouldn't call any lifecycle methods or callbacks. Remove
  //         // all lifecycle effect tags.
  //         sourceFiber.effectTag &= ~(LifecycleEffectMask | Incomplete);

  //         if (sourceFiber.tag === ClassComponent) {
  //           const currentSourceFiber = sourceFiber.alternate;
  //           if (currentSourceFiber === null) {
  //             // This is a new mount. Change the tag so it's not mistaken for a
  //             // completed class component. For example, we should not call
  //             // componentWillUnmount if it is deleted.
  //             sourceFiber.tag = IncompleteClassComponent;
  //           } else {
  //             // When we try rendering again, we should not reuse the current fiber,
  //             // since it's known to be in an inconsistent state. Use a force updte to
  //             // prevent a bail out.
  //             const update = createUpdate(Sync);
  //             update.tag = ForceUpdate;
  //             enqueueUpdate(sourceFiber, update);
  //           }
  //         }

  //         // The source fiber did not complete. Mark it with Sync priority to
  //         // indicate that it still has pending work.
  //         sourceFiber.expirationTime = Sync;

  //         // Exit without suspending.
  //         return;
  //       }

  //       // Confirmed that the boundary is in a concurrent mode tree. Continue
  //       // with the normal suspend path.

  //       attachPingListener(root, renderExpirationTime, thenable);

  //       let absoluteTimeoutMs;
  //       if (earliestTimeoutMs === -1) {
  //         // If no explicit threshold is given, default to an arbitrarily large
  //         // value. The actual size doesn't matter because the threshold for the
  //         // whole tree will be clamped to the expiration time.
  //         absoluteTimeoutMs = maxSigned31BitInt;
  //       } else {
  //         if (startTimeMs === -1) {
  //           // This suspend happened outside of any already timed-out
  //           // placeholders. We don't know exactly when the update was
  //           // scheduled, but we can infer an approximate start time from the
  //           // expiration time. First, find the earliest uncommitted expiration
  //           // time in the tree, including work that is suspended. Then subtract
  //           // the offset used to compute an async update's expiration time.
  //           // This will cause high priority (interactive) work to expire
  //           // earlier than necessary, but we can account for this by adjusting
  //           // for the Just Noticeable Difference.
  //           const earliestExpirationTime = findEarliestOutstandingPriorityLevel(
  //             root,
  //             renderExpirationTime,
  //           );
  //           const earliestExpirationTimeMs = expirationTimeToMs(
  //             earliestExpirationTime,
  //           );
  //           startTimeMs = earliestExpirationTimeMs - LOW_PRIORITY_EXPIRATION;
  //         }
  //         absoluteTimeoutMs = startTimeMs + earliestTimeoutMs;
  //       }

  //       // Mark the earliest timeout in the suspended fiber's ancestor path.
  //       // After completing the root, we'll take the largest of all the
  //       // suspended fiber's timeouts and use it to compute a timeout for the
  //       // whole tree.
  //       renderDidSuspend(root, absoluteTimeoutMs, renderExpirationTime);

  //       workInProgress.effectTag |= ShouldCapture;
  //       workInProgress.expirationTime = renderExpirationTime;
  //       return;
  //     } else if (
  //       enableSuspenseServerRenderer &&
  //       workInProgress.tag === DehydratedSuspenseComponent
  //     ) {
  //       attachPingListener(root, renderExpirationTime, thenable);

  //       // Since we already have a current fiber, we can eagerly add a retry listener.
  //       let retryCache = workInProgress.memoizedState;
  //       if (retryCache === null) {
  //         retryCache = workInProgress.memoizedState = new PossiblyWeakSet();
  //         const current = workInProgress.alternate;
  //         invariant(
  //           current,
  //           'A dehydrated suspense boundary must commit before trying to render. ' +
  //             'This is probably a bug in React.',
  //         );
  //         current.memoizedState = retryCache;
  //       }
  //       // Memoize using the boundary fiber to prevent redundant listeners.
  //       if (!retryCache.has(thenable)) {
  //         retryCache.add(thenable);
  //         let retry = retryTimedOutBoundary.bind(
  //           null,
  //           workInProgress,
  //           thenable,
  //         );
  //         if (enableSchedulerTracing) {
  //           retry = Schedule_tracing_wrap(retry);
  //         }
  //         thenable.then(retry, retry);
  //       }
  //       workInProgress.effectTag |= ShouldCapture;
  //       workInProgress.expirationTime = renderExpirationTime;
  //       return;
  //     }
  //     // This boundary already captured during this render. Continue to the next
  //     // boundary.
  //     workInProgress = workInProgress.return;
  //   } while (workInProgress !== null);
  //   // No boundary was found. Fallthrough to error mode.
  //   // TODO: Use invariant so the message is stripped in prod?
  //   value = new Error(
  //     (getComponentName(sourceFiber.type) || 'A React component') +
  //       ' suspended while rendering, but no fallback UI was specified.\n' +
  //       '\n' +
  //       'Add a <Suspense fallback=...> component higher in the tree to ' +
  //       'provide a loading indicator or placeholder to display.' +
  //       getStackByFiberInDevAndProd(sourceFiber),
  //   );
  // }

  // renderDidError();
  // value = createCapturedValue(value, sourceFiber);
  // let workInProgress = returnFiber;
  // do {
  //   switch (workInProgress.tag) {
  //     case HostRoot: {
  //       const errorInfo = value;
  //       workInProgress.effectTag |= ShouldCapture;
  //       workInProgress.expirationTime = renderExpirationTime;
  //       const update = createRootErrorUpdate(
  //         workInProgress,
  //         errorInfo,
  //         renderExpirationTime,
  //       );
  //       enqueueCapturedUpdate(workInProgress, update);
  //       return;
  //     }
  //     case ClassComponent:
  //       // Capture and retry
  //       const errorInfo = value;
  //       const ctor = workInProgress.type;
  //       const instance = workInProgress.stateNode;
  //       if (
  //         (workInProgress.effectTag & DidCapture) === NoEffect &&
  //         (typeof ctor.getDerivedStateFromError === 'function' ||
  //           (instance !== null &&
  //             typeof instance.componentDidCatch === 'function' &&
  //             !isAlreadyFailedLegacyErrorBoundary(instance)))
  //       ) {
  //         workInProgress.effectTag |= ShouldCapture;
  //         workInProgress.expirationTime = renderExpirationTime;
  //         // Schedule the error boundary to re-render using updated state
  //         const update = createClassErrorUpdate(
  //           workInProgress,
  //           errorInfo,
  //           renderExpirationTime,
  //         );
  //         enqueueCapturedUpdate(workInProgress, update);
  //         return;
  //       }
  //       break;
  //     default:
  //       break;
  //   }
  //   workInProgress = workInProgress.return;
  // } while (workInProgress !== null)
}

function unwindInterruptedWork(interruptedWork: Fiber): void {
  switch (interruptedWork.tag) {
    case ClassComponent: {
      const childContextTypes = interruptedWork.type.childContextTypes
      if (childContextTypes !== null && childContextTypes !== undefined) {
        popLegacyContext(/* interruptedWork */)
      }
      break
    }
    case HostRoot: {
      popHostContainer(/* interruptedWork */)
      popTopLevelLegacyContextObject(/* interruptedWork */)
      break
    }
    case HostComponent: {
      popHostContext(interruptedWork)
      break
    }
    case HostPortal:
      popHostContainer(/* interruptedWork */)
      break
    case ContextProvider:
      popProvider(interruptedWork)
      break
    default:
      break
  }
}

export {
  throwException,
  // unwindWork,
  unwindInterruptedWork,
  // createRootErrorUpdate,
  // createClassErrorUpdate,
}