import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

export type SuspenseState = {
  timedOutAt: ExpirationTime
}

export function shouldCaptureSuspense(workInProgress: Fiber): boolean {
  if (workInProgress.memoizedProps.fallback === undefined) {
    return false
  }
  const nextState: SuspenseState | null = workInProgress.memoizedState
  return nextState === null
}
