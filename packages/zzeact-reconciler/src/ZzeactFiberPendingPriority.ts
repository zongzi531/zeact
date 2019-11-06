import { FiberRoot } from './ZzeactFiberRoot'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { NoWork } from './ZzeactFiberExpirationTime'

function findNextExpirationTimeToWorkOn(completedExpirationTime, root): void {
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

function clearPing(root, completedTime): void {
  const latestPingedTime = root.latestPingedTime
  if (latestPingedTime >= completedTime) {
    root.latestPingedTime = NoWork
  }
}

export function findEarliestOutstandingPriorityLevel(
  root: FiberRoot,
  renderExpirationTime: ExpirationTime,
): ExpirationTime {
  let earliestExpirationTime = renderExpirationTime

  const earliestPendingTime = root.earliestPendingTime
  const earliestSuspendedTime = root.earliestSuspendedTime
  if (earliestPendingTime > earliestExpirationTime) {
    earliestExpirationTime = earliestPendingTime
  }
  if (earliestSuspendedTime > earliestExpirationTime) {
    earliestExpirationTime = earliestSuspendedTime
  }
  return earliestExpirationTime
}

export function hasLowerPriorityWork(
  root: FiberRoot,
  erroredExpirationTime: ExpirationTime,
): boolean {
  const latestPendingTime = root.latestPendingTime
  const latestSuspendedTime = root.latestSuspendedTime
  const latestPingedTime = root.latestPingedTime
  return (
    (latestPendingTime !== NoWork &&
      latestPendingTime < erroredExpirationTime) ||
    (latestSuspendedTime !== NoWork &&
      latestSuspendedTime < erroredExpirationTime) ||
    (latestPingedTime !== NoWork && latestPingedTime < erroredExpirationTime)
  )
}

export function markSuspendedPriorityLevel(
  root: FiberRoot,
  suspendedTime: ExpirationTime,
): void {
  root.didError = false
  clearPing(root, suspendedTime)

  const earliestPendingTime = root.earliestPendingTime
  const latestPendingTime = root.latestPendingTime
  if (earliestPendingTime === suspendedTime) {
    if (latestPendingTime === suspendedTime) {
      root.earliestPendingTime = root.latestPendingTime = NoWork
    } else {
      root.earliestPendingTime = latestPendingTime
    }
  } else if (latestPendingTime === suspendedTime) {
    root.latestPendingTime = earliestPendingTime
  }

  const earliestSuspendedTime = root.earliestSuspendedTime
  const latestSuspendedTime = root.latestSuspendedTime
  if (earliestSuspendedTime === NoWork) {
    root.earliestSuspendedTime = root.latestSuspendedTime = suspendedTime
  } else {
    if (earliestSuspendedTime < suspendedTime) {
      root.earliestSuspendedTime = suspendedTime
    } else if (latestSuspendedTime > suspendedTime) {
      root.latestSuspendedTime = suspendedTime
    }
  }

  findNextExpirationTimeToWorkOn(suspendedTime, root)
}

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
