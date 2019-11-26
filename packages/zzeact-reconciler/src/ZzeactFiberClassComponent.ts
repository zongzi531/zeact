import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import Zzeact from '@/zzeact'
import { Update, Snapshot } from '@/shared/ZzeactSideEffectTags'

import { isMounted } from '@/zzeact-reconciler/reflection'
import { get as getInstance, set as setInstance } from '@/shared/ZzeactInstanceMap'
import shallowEqual from '@/shared/shallowEqual'

import { resolveDefaultProps } from './ZzeactFiberLazyComponent'


import {
  enqueueUpdate,
  processUpdateQueue,
  checkHasForceUpdateAfterProcessing,
  resetHasForceUpdateBeforeProcessing,
  createUpdate,
  ReplaceState,
  ForceUpdate,
} from './ZzeactUpdateQueue'
import { NoWork } from './ZzeactFiberExpirationTime'
import {
  cacheContext,
  getMaskedContext,
  getUnmaskedContext,
  hasContextChanged,
  emptyContextObject,
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

function checkShouldComponentUpdate(
  workInProgress,
  ctor,
  oldProps,
  newProps,
  oldState,
  newState,
  nextContext,
): boolean {
  const instance = workInProgress.stateNode
  if (typeof instance.shouldComponentUpdate === 'function') {
    const shouldUpdate = instance.shouldComponentUpdate(
      newProps,
      newState,
      nextContext,
    )

    return shouldUpdate
  }

  if (ctor.prototype && ctor.prototype.isPureZzeactComponent) {
    return (
      !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
    )
  }

  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  instance.updater = classComponentUpdater
  workInProgress.stateNode = instance
  setInstance(instance, workInProgress)
}

function constructClassInstance(
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let isLegacyContextConsumer = false
  let unmaskedContext = emptyContextObject
  let context = null
  const contextType = ctor.contextType

  if (typeof contextType === 'object' && contextType !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context = readContext((contextType as any))
  } else {
    unmaskedContext = getUnmaskedContext(workInProgress, ctor, true)
    const contextTypes = ctor.contextTypes
    isLegacyContextConsumer =
      contextTypes !== null && contextTypes !== undefined
    context = isLegacyContextConsumer
      ? getMaskedContext(workInProgress, unmaskedContext)
      : emptyContextObject
  }

  const instance = new ctor(props, context)
  adoptClassInstance(workInProgress, instance)

  if (isLegacyContextConsumer) {
    cacheContext(workInProgress, unmaskedContext, context)
  }

  return instance
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

function callComponentWillReceiveProps(
  workInProgress,
  instance,
  newProps,
  nextContext,
): void {
  const oldState = instance.state
  if (typeof instance.componentWillReceiveProps === 'function') {
    instance.componentWillReceiveProps(newProps, nextContext)
  }
  if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
    instance.UNSAFE_componentWillReceiveProps(newProps, nextContext)
  }

  if (instance.state !== oldState) {
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

function resumeMountClassInstance(
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newProps: any,
  renderExpirationTime: ExpirationTime,
): boolean {
  const instance = workInProgress.stateNode

  const oldProps = workInProgress.memoizedProps
  instance.props = oldProps

  const oldContext = instance.context
  const contextType = ctor.contextType
  let nextContext
  if (typeof contextType === 'object' && contextType !== null) {
    nextContext = readContext(contextType)
  } else {
    const nextLegacyUnmaskedContext = getUnmaskedContext(
      workInProgress,
      ctor,
      true,
    )
    nextContext = getMaskedContext(workInProgress, nextLegacyUnmaskedContext)
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps
  const hasNewLifecycles =
    typeof getDerivedStateFromProps === 'function' ||
    typeof instance.getSnapshotBeforeUpdate === 'function'

  if (
    !hasNewLifecycles &&
    (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
      typeof instance.componentWillReceiveProps === 'function')
  ) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      callComponentWillReceiveProps(
        workInProgress,
        instance,
        newProps,
        nextContext,
      )
    }
  }

  resetHasForceUpdateBeforeProcessing()

  const oldState = workInProgress.memoizedState
  let newState = (instance.state = oldState)
  const updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    processUpdateQueue(
      workInProgress,
      updateQueue,
      newProps,
      instance,
      renderExpirationTime,
    )
    newState = workInProgress.memoizedState
  }
  if (
    oldProps === newProps &&
    oldState === newState &&
    !hasContextChanged() &&
    !checkHasForceUpdateAfterProcessing()
  ) {
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update
    }
    return false
  }

  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    )
    newState = workInProgress.memoizedState
  }

  const shouldUpdate =
    checkHasForceUpdateAfterProcessing() ||
    checkShouldComponentUpdate(
      workInProgress,
      ctor,
      oldProps,
      newProps,
      oldState,
      newState,
      nextContext,
    )

  if (shouldUpdate) {
    if (
      !hasNewLifecycles &&
      (typeof instance.UNSAFE_componentWillMount === 'function' ||
        typeof instance.componentWillMount === 'function')
    ) {
      if (typeof instance.componentWillMount === 'function') {
        instance.componentWillMount()
      }
      if (typeof instance.UNSAFE_componentWillMount === 'function') {
        instance.UNSAFE_componentWillMount()
      }
    }
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update
    }
  } else {
    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= Update
    }

    workInProgress.memoizedProps = newProps
    workInProgress.memoizedState = newState
  }

  instance.props = newProps
  instance.state = newState
  instance.context = nextContext

  return shouldUpdate
}

function updateClassInstance(
  current: Fiber,
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctor: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newProps: any,
  renderExpirationTime: ExpirationTime,
): boolean {
  const instance = workInProgress.stateNode

  const oldProps = workInProgress.memoizedProps
  instance.props =
    workInProgress.type === workInProgress.elementType
      ? oldProps
      : resolveDefaultProps(workInProgress.type, oldProps)

  const oldContext = instance.context
  const contextType = ctor.contextType
  let nextContext
  if (typeof contextType === 'object' && contextType !== null) {
    nextContext = readContext(contextType)
  } else {
    const nextUnmaskedContext = getUnmaskedContext(workInProgress, ctor, true)
    nextContext = getMaskedContext(workInProgress, nextUnmaskedContext)
  }

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps
  const hasNewLifecycles =
    typeof getDerivedStateFromProps === 'function' ||
    typeof instance.getSnapshotBeforeUpdate === 'function'

  if (
    !hasNewLifecycles &&
    (typeof instance.UNSAFE_componentWillReceiveProps === 'function' ||
      typeof instance.componentWillReceiveProps === 'function')
  ) {
    if (oldProps !== newProps || oldContext !== nextContext) {
      callComponentWillReceiveProps(
        workInProgress,
        instance,
        newProps,
        nextContext,
      )
    }
  }

  resetHasForceUpdateBeforeProcessing()

  const oldState = workInProgress.memoizedState
  let newState = (instance.state = oldState)
  const updateQueue = workInProgress.updateQueue
  if (updateQueue !== null) {
    processUpdateQueue(
      workInProgress,
      updateQueue,
      newProps,
      instance,
      renderExpirationTime,
    )
    newState = workInProgress.memoizedState
  }

  if (
    oldProps === newProps &&
    oldState === newState &&
    !hasContextChanged() &&
    !checkHasForceUpdateAfterProcessing()
  ) {
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Update
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Snapshot
      }
    }
    return false
  }

  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps,
    )
    newState = workInProgress.memoizedState
  }

  const shouldUpdate =
    checkHasForceUpdateAfterProcessing() ||
    checkShouldComponentUpdate(
      workInProgress,
      ctor,
      oldProps,
      newProps,
      oldState,
      newState,
      nextContext,
    )

  if (shouldUpdate) {
    if (
      !hasNewLifecycles &&
      (typeof instance.UNSAFE_componentWillUpdate === 'function' ||
        typeof instance.componentWillUpdate === 'function')
    ) {
      if (typeof instance.componentWillUpdate === 'function') {
        instance.componentWillUpdate(newProps, newState, nextContext)
      }
      if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
        instance.UNSAFE_componentWillUpdate(newProps, newState, nextContext)
      }
    }
    if (typeof instance.componentDidUpdate === 'function') {
      workInProgress.effectTag |= Update
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      workInProgress.effectTag |= Snapshot
    }
  } else {
    if (typeof instance.componentDidUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Update
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (
        oldProps !== current.memoizedProps ||
        oldState !== current.memoizedState
      ) {
        workInProgress.effectTag |= Snapshot
      }
    }

    workInProgress.memoizedProps = newProps
    workInProgress.memoizedState = newState
  }

  instance.props = newProps
  instance.state = newState
  instance.context = nextContext

  return shouldUpdate
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
  constructClassInstance,
  mountClassInstance,
  resumeMountClassInstance,
  updateClassInstance,
}
