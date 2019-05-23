import { IInteraction, unstable_getThreadID } from '@/scheduler/tracing'
import { enableSchedulerTracing } from '@/shared/ZzeactFeatureFlags'
import { createHostRootFiber, IFiber } from './ZzeactFiber'
import { ExpirationTime, NoWork } from './ZzeactFiberExpirationTime'
import { noTimeout, NoTimeout, TimeoutHandle } from './ZzeactFiberHostConfig'
import { IThenable } from './ZzeactFiberScheduler'

export interface IBatch {
  _defer: boolean
  _expirationTime: ExpirationTime
  _onComplete: () => mixed
  _next: IBatch | null
}

export type PendingInteractionMap = Map<ExpirationTime, Set<IInteraction>>

interface IBaseFiberRootProperties {
  containerInfo: any
  pendingChildren: any
  current: IFiber
  earliestSuspendedTime: ExpirationTime
  latestSuspendedTime: ExpirationTime
  earliestPendingTime: ExpirationTime
  latestPendingTime: ExpirationTime
  latestPingedTime: ExpirationTime
  pingCache:
    | WeakMap<IThenable, Set<ExpirationTime>>
    | Map<IThenable, Set<ExpirationTime>>
    | null
  didError: boolean
  pendingCommitExpirationTime: ExpirationTime
  finishedWork: IFiber | null
  timeoutHandle: TimeoutHandle | NoTimeout
  context: object | null
  pendingContext: object | null
  hydrate: boolean
  nextExpirationTimeToWorkOn: ExpirationTime
  expirationTime: ExpirationTime
  firstBatch: IBatch | null
  nextScheduledRoot: FiberRoot | null
}

interface IProfilingOnlyFiberRootProperties {
  interactionThreadID: number
  memoizedInteractions: Set<IInteraction>
  pendingInteractionMap: PendingInteractionMap
}

export type FiberRoot = IBaseFiberRootProperties & IProfilingOnlyFiberRootProperties

export function createFiberRoot(
  containerInfo: any,
  isConcurrent: boolean,
  hydrate: boolean,
): FiberRoot {
  const uninitializedFiber = createHostRootFiber(isConcurrent)
  let root: FiberRoot | IBaseFiberRootProperties
  if (enableSchedulerTracing) {
    root = {
      current: uninitializedFiber,
      containerInfo,
      pendingChildren: null,
      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      earliestSuspendedTime: NoWork,
      latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,
      pingCache: null,
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
      interactionThreadID: unstable_getThreadID(),
      memoizedInteractions: new Set(),
      pendingInteractionMap: new Map(),
    }
  } else {
    root = {
      current: uninitializedFiber,
      containerInfo,
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
    }
  }
  uninitializedFiber.stateNode = root
  return root as FiberRoot
}
