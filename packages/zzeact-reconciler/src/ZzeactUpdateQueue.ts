import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

export type Update<State> = {
  expirationTime: ExpirationTime

  tag: 0 | 1 | 2 | 3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  callback: (() => mixed) | null

  next: Update<State> | null
  nextEffect: Update<State> | null
}

export type UpdateQueue<State> = {
  baseState: State

  firstUpdate: Update<State> | null
  lastUpdate: Update<State> | null

  firstCapturedUpdate: Update<State> | null
  lastCapturedUpdate: Update<State> | null

  firstEffect: Update<State> | null
  lastEffect: Update<State> | null

  firstCapturedEffect: Update<State> | null
  lastCapturedEffect: Update<State> | null
}

export const UpdateState = 0
export const ReplaceState = 1
export const ForceUpdate = 2
export const CaptureUpdate = 3

export function createUpdateQueue<State>(baseState: State): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    baseState,
    firstUpdate: null,
    lastUpdate: null,
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,
    firstEffect: null,
    lastEffect: null,
    firstCapturedEffect: null,
    lastCapturedEffect: null,
  }
  return queue
}

function cloneUpdateQueue<State>(
  currentQueue: UpdateQueue<State>,
): UpdateQueue<State> {
  const queue: UpdateQueue<State> = {
    baseState: currentQueue.baseState,
    firstUpdate: currentQueue.firstUpdate,
    lastUpdate: currentQueue.lastUpdate,
    firstCapturedUpdate: null,
    lastCapturedUpdate: null,

    firstEffect: null,
    lastEffect: null,

    firstCapturedEffect: null,
    lastCapturedEffect: null,
  }
  return queue
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createUpdate(expirationTime: ExpirationTime): Update<any> {
  return {
    expirationTime: expirationTime,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
    nextEffect: null,
  }
}

function appendUpdateToQueue<State>(
  queue: UpdateQueue<State>,
  update: Update<State>,
): void {
  if (queue.lastUpdate === null) {
    queue.firstUpdate = queue.lastUpdate = update
  } else {
    queue.lastUpdate.next = update
    queue.lastUpdate = update
  }
}

export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>): void {
  const alternate = fiber.alternate
  let queue1
  let queue2
  if (alternate === null) {
    queue1 = fiber.updateQueue
    queue2 = null
    if (queue1 === null) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
    }
  } else {
    queue1 = fiber.updateQueue
    queue2 = alternate.updateQueue
    if (queue1 === null) {
      if (queue2 === null) {
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
        queue2 = alternate.updateQueue = createUpdateQueue(
          alternate.memoizedState,
        )
      } else {
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2)
      }
    } else {
      if (queue2 === null) {
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1)
      } else {
      }
    }
  }
  if (queue2 === null || queue1 === queue2) {
    appendUpdateToQueue(queue1, update)
  } else {
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      appendUpdateToQueue(queue1, update)
      appendUpdateToQueue(queue2, update)
    } else {
      appendUpdateToQueue(queue1, update)
      queue2.lastUpdate = update
    }
  }
}
