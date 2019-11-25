import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import Zzeact from '@/zzeact'
import { Update/* , Snapshot */ } from '@/shared/ZzeactSideEffectTags'

import { isMounted } from '@/zzeact-reconciler/reflection'
import { get as getInstance, set as setInstance } from '@/shared/ZzeactInstanceMap'

import {
  enqueueUpdate,
  processUpdateQueue,
  // checkHasForceUpdateAfterProcessing,
  // resetHasForceUpdateBeforeProcessing,
  createUpdate,
  ReplaceState,
  ForceUpdate,
} from './ZzeactUpdateQueue'
import { NoWork } from './ZzeactFiberExpirationTime'
import {
  // cacheContext,
  getMaskedContext,
  getUnmaskedContext,
  // hasContextChanged,
  // emptyContextObject,
} from './ZzeactFiberContext'
import { readContext } from './ZzeactFiberNewContext'
import {
  requestCurrentTime,
  computeExpirationForFiber,
  scheduleWork,
  flushPassiveEffects,
} from './ZzeactFiberScheduler'

export const emptyRefsObject = new Zzeact.Component().refs

export function applyDerivedStateFromProps(
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDerivedStateFromProps: (props: any, state: any) => any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextProps: any,
): void {
  const prevState = workInProgress.memoizedState

  const partialState = getDerivedStateFromProps(nextProps, prevState)

  const memoizedState =
    partialState === null || partialState === undefined
      ? prevState
      : Object.assign({}, prevState, partialState)
  workInProgress.memoizedState = memoizedState

  const updateQueue = workInProgress.updateQueue
  if (updateQueue !== null && workInProgress.expirationTime === NoWork) {
    updateQueue.baseState = memoizedState
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  instance.updater = classComponentUpdater
  workInProgress.stateNode = instance
  setInstance(instance, workInProgress)
}

function callComponentWillMount(workInProgress, instance): void {
  const oldState = instance.state

  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount()
  }
  if (typeof instance.UNSAFE_componentWillMount === 'function') {
    instance.UNSAFE_componentWillMount()
  }

  if (oldState !== instance.state) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    classComponentUpdater.enqueueReplaceState(instance, instance.state, null)
  }
}

function mountClassInstance(
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newProps: any,
  renderExpirationTime: ExpirationTime,
): void {

  const instance = workInProgress.stateNode
  instance.props = newProps
  instance.state = workInProgress.memoizedState
  instance.refs = emptyRefsObject

  const contextType = ctor.contextType
  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType)
  } else {
    const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true)
    instance.context = getMaskedContext(workInProgress, unmaskedContext)
  }

  let updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    processUpdateQueue(
      workInProgress,
      updateQueue,
      newProps,
      instance,
      renderExpirationTime,
    )
    instance.state = workInProgress.memoizedState
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    )
    instance.state = workInProgress.memoizedState
  }

  if (
    typeof ctor.getDerivedStateFromProps !== 'function' &&
    typeof instance.getSnapshotBeforeUpdate !== 'function' &&
    (typeof instance.UNSAFE_componentWillMount === 'function' ||
      typeof instance.componentWillMount === 'function')
  ) {
    callComponentWillMount(workInProgress, instance)
    updateQueue = workInProgress.updateQueue
    if (updateQueue !== null) {
      processUpdateQueue(
        workInProgress,
        updateQueue,
        newProps,
        instance,
        renderExpirationTime,
      )
      instance.state = workInProgress.memoizedState
    }
  }

  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update
  }
}

const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback): void {
    const fiber = getInstance(inst)
    const currentTime = requestCurrentTime()
    const expirationTime = computeExpirationForFiber(currentTime, fiber)

    const update = createUpdate(expirationTime)
    update.payload = payload
    if (callback !== undefined && callback !== null) {
      update.callback = callback
    }

    flushPassiveEffects()
    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
  enqueueReplaceState(inst, payload, callback): void {
    const fiber = getInstance(inst)
    const currentTime = requestCurrentTime()
    const expirationTime = computeExpirationForFiber(currentTime, fiber)

    const update = createUpdate(expirationTime)
    update.tag = ReplaceState
    update.payload = payload

    if (callback !== undefined && callback !== null) {
      update.callback = callback
    }

    flushPassiveEffects()
    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
  enqueueForceUpdate(inst, callback): void {
    const fiber = getInstance(inst)
    const currentTime = requestCurrentTime()
    const expirationTime = computeExpirationForFiber(currentTime, fiber)

    const update = createUpdate(expirationTime)
    update.tag = ForceUpdate

    if (callback !== undefined && callback !== null) {
      update.callback = callback
    }

    flushPassiveEffects()
    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
}

export {
  adoptClassInstance,
  // constructClassInstance,
  mountClassInstance,
  // resumeMountClassInstance,
  // updateClassInstance,
}
