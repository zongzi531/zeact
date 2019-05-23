import { ExpirationTime, NoWork } from './ZzeactFiberExpirationTime'

export function markPendingPriorityLevel(
  root: FiberRoot,
  expirationTime: ExpirationTime,
): void {
  root.didError = false
  const earliestPendingTime = root.earliestPendingTime
  if (earliestPendingTime === NoWork) {
    root.earliestPendingTime = root.latestPendingTime = expirationTime
  } else {
    if (earliestPendingTime < expirationTime) {
      root.earliestPendingTime = expirationTime
    } else {
      const latestPendingTime = root.latestPendingTime
      if (latestPendingTime > expirationTime) {
        root.latestPendingTime = expirationTime
      }
    }
  }
  findNextExpirationTimeToWorkOn(expirationTime, root)
}

function findNextExpirationTimeToWorkOn(completedExpirationTime, root) {
  const earliestSuspendedTime = root.earliestSuspendedTime
  const latestSuspendedTime = root.latestSuspendedTime
  const earliestPendingTime = root.earliestPendingTime
  const latestPingedTime = root.latestPingedTime
  let nextExpirationTimeToWorkOn =
    earliestPendingTime !== NoWork ? earliestPendingTime : latestPingedTime
  if (
    nextExpirationTimeToWorkOn === NoWork &&
    (completedExpirationTime === NoWork ||
      latestSuspendedTime < completedExpirationTime)
  ) {
    nextExpirationTimeToWorkOn = latestSuspendedTime
  }

  let expirationTime = nextExpirationTimeToWorkOn
  if (expirationTime !== NoWork && earliestSuspendedTime > expirationTime) {
    expirationTime = earliestSuspendedTime
  }

  root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn
  root.expirationTime = expirationTime
}
