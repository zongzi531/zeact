import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { NoWork } from './ZzeactFiberExpirationTime'

import { Callback, ShouldCapture, DidCapture } from '@/shared/ZzeactSideEffectTags'

import invariant from '@/shared/invariant'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasForceUpdate = false

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

function ensureWorkInProgressQueueIsAClone<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
): UpdateQueue<State> {
  const current = workInProgress.alternate
  if (current !== null) {
    if (queue === current.updateQueue) {
      queue = workInProgress.updateQueue = cloneUpdateQueue(queue)
    }
  }
  return queue
}

function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextProps: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  switch (update.tag) {
    case ReplaceState: {
      const payload = update.payload
      if (typeof payload === 'function') {
        const nextState = payload.call(instance, prevState, nextProps)
        return nextState
      }
      return payload
    }
    case CaptureUpdate: {
      workInProgress.effectTag =
        (workInProgress.effectTag & ~ShouldCapture) | DidCapture
    }
    case UpdateState: {
      const payload = update.payload
      let partialState
      if (typeof payload === 'function') {
        partialState = payload.call(instance, prevState, nextProps)
      } else {
        partialState = payload
      }
      if (partialState === null || partialState === undefined) {
        return prevState
      }
      return Object.assign({}, prevState, partialState)
    }
    case ForceUpdate: {
      hasForceUpdate = true
      return prevState
    }
  }
  return prevState
}

export function processUpdateQueue<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any,
  renderExpirationTime: ExpirationTime,
): void {
  hasForceUpdate = false

  queue = ensureWorkInProgressQueueIsAClone(workInProgress, queue)

  let newBaseState = queue.baseState
  let newFirstUpdate = null
  let newExpirationTime = NoWork

  let update = queue.firstUpdate
  let resultState = newBaseState
  while (update !== null) {
    const updateExpirationTime = update.expirationTime
    if (updateExpirationTime < renderExpirationTime) {
      if (newFirstUpdate === null) {
        newFirstUpdate = update
        newBaseState = resultState
      }
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime
      }
    } else {
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance,
      )
      const callback = update.callback
      if (callback !== null) {
        workInProgress.effectTag |= Callback
        update.nextEffect = null
        if (queue.lastEffect === null) {
          queue.firstEffect = queue.lastEffect = update
        } else {
          queue.lastEffect.nextEffect = update
          queue.lastEffect = update
        }
      }
    }
    update = update.next
  }

  let newFirstCapturedUpdate = null
  update = queue.firstCapturedUpdate
  while (update !== null) {
    const updateExpirationTime = update.expirationTime
    if (updateExpirationTime < renderExpirationTime) {
      if (newFirstCapturedUpdate === null) {
        newFirstCapturedUpdate = update
        if (newFirstUpdate === null) {
          newBaseState = resultState
        }
      }
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime
      }
    } else {
      resultState = getStateFromUpdate(
        workInProgress,
        queue,
        update,
        resultState,
        props,
        instance,
      )
      const callback = update.callback
      if (callback !== null) {
        workInProgress.effectTag |= Callback
        update.nextEffect = null
        if (queue.lastCapturedEffect === null) {
          queue.firstCapturedEffect = queue.lastCapturedEffect = update
        } else {
          queue.lastCapturedEffect.nextEffect = update
          queue.lastCapturedEffect = update
        }
      }
    }
    update = update.next
  }

  if (newFirstUpdate === null) {
    queue.lastUpdate = null
  }
  if (newFirstCapturedUpdate === null) {
    queue.lastCapturedUpdate = null
  } else {
    workInProgress.effectTag |= Callback
  }
  if (newFirstUpdate === null && newFirstCapturedUpdate === null) {
    newBaseState = resultState
  }

  queue.baseState = newBaseState
  queue.firstUpdate = newFirstUpdate
  queue.firstCapturedUpdate = newFirstCapturedUpdate

  workInProgress.expirationTime = newExpirationTime
  workInProgress.memoizedState = resultState
}

function callCallback(callback, context): void {
  invariant(
    typeof callback === 'function',
    'Invalid argument passed as callback. Expected a function. Instead ' +
      'received: %s',
    callback,
  )
  callback.call(context)
}

export function resetHasForceUpdateBeforeProcessing(): void {
  hasForceUpdate = false
}

export function checkHasForceUpdateAfterProcessing(): boolean {
  return hasForceUpdate
}

export function commitUpdateQueue<State>(
  finishedWork: Fiber,
  finishedQueue: UpdateQueue<State>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any
): void {
  if (finishedQueue.firstCapturedUpdate !== null) {
    if (finishedQueue.lastUpdate !== null) {
      finishedQueue.lastUpdate.next = finishedQueue.firstCapturedUpdate
      finishedQueue.lastUpdate = finishedQueue.lastCapturedUpdate
    }
    finishedQueue.firstCapturedUpdate = finishedQueue.lastCapturedUpdate = null
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  commitUpdateEffects(finishedQueue.firstEffect, instance)
  finishedQueue.firstEffect = finishedQueue.lastEffect = null

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  commitUpdateEffects(finishedQueue.firstCapturedEffect, instance)
  finishedQueue.firstCapturedEffect = finishedQueue.lastCapturedEffect = null
}

function commitUpdateEffects<State>(
  effect: Update<State> | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: any,
): void {
  while (effect !== null) {
    const callback = effect.callback
    if (callback !== null) {
      effect.callback = null
      callCallback(callback, instance)
    }
    effect = effect.nextEffect
  }
}
