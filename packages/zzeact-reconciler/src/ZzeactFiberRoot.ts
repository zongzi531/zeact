import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { noTimeout } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { createHostRootFiber } from './ZzeactFiber'
import { NoWork } from './ZzeactFiberExpirationTime'
// import { unstable_getThreadID } from '@/scheduler/tracing'

export type Batch = {
  _defer: boolean
  _expirationTime: ExpirationTime
  _onComplete: () => mixed
  _next: Batch | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BaseFiberRootProperties = any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FiberRoot = any

export function createFiberRoot(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  const uninitializedFiber = createHostRootFiber(isConcurrent)

  let root
  if (false) {
    // root = {
    //   current: uninitializedFiber,
    //   containerInfo: containerInfo,
    //   pendingChildren: null,

    //   earliestPendingTime: NoWork,
    //   latestPendingTime: NoWork,
    //   earliestSuspendedTime: NoWork,
    //   latestSuspendedTime: NoWork,
    //   latestPingedTime: NoWork,

    //   pingCache: null,

    //   didError: false,

    //   pendingCommitExpirationTime: NoWork,
    //   finishedWork: null,
    //   timeoutHandle: noTimeout,
    //   context: null,
    //   pendingContext: null,
    //   hydrate,
    //   nextExpirationTimeToWorkOn: NoWork,
    //   expirationTime: NoWork,
    //   firstBatch: null,
    //   nextScheduledRoot: null,

    //   interactionThreadID: unstable_getThreadID(),
    //   memoizedInteractions: new Set(),
    //   pendingInteractionMap: new Map(),
    // } as FiberRoot
  } else {
    root = {
      current: uninitializedFiber,
      containerInfo: containerInfo,
      pendingChildren: null,

      pingCache: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null,
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      firstBatch: null,
      nextScheduledRoot: null,
    } as BaseFiberRootProperties
  }

  uninitializedFiber.stateNode = root

  // 按照上面逻辑 root 一定会被赋值，所以忽略其 any 类型
  return root as FiberRoot
}
