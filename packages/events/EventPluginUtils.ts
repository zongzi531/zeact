import { invokeGuardedCallbackAndCatchFirstError } from '@/shared/ZzeactErrorUtils'
import invariant from '@/shared/invariant'

export let getFiberCurrentPropsFromNode = null
export let getInstanceFromNode = null
export let getNodeFromInstance = null

export function setComponentTree(
  getFiberCurrentPropsFromNodeImpl,
  getInstanceFromNodeImpl,
  getNodeFromInstanceImpl,
): void {
  getFiberCurrentPropsFromNode = getFiberCurrentPropsFromNodeImpl
  getInstanceFromNode = getInstanceFromNodeImpl
  getNodeFromInstance = getNodeFromInstanceImpl
}

function executeDispatch(event, listener, inst): void {
  const type = event.type || 'unknown-event'
  event.currentTarget = getNodeFromInstance(inst)
  invokeGuardedCallbackAndCatchFirstError(type, listener, undefined, event)
  event.currentTarget = null
}

export function executeDispatchesInOrder(event): void {
  const dispatchListeners = event._dispatchListeners
  const dispatchInstances = event._dispatchInstances
  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break
      }
      executeDispatch(event, dispatchListeners[i], dispatchInstances[i])
    }
  } else if (dispatchListeners) {
    executeDispatch(event, dispatchListeners, dispatchInstances)
  }
  event._dispatchListeners = null
  event._dispatchInstances = null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function executeDispatchesInOrderStopAtTrueImpl(event): any {
  const dispatchListeners = event._dispatchListeners
  const dispatchInstances = event._dispatchInstances
  if (Array.isArray(dispatchListeners)) {
    for (let i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break
      }
      if (dispatchListeners[i](event, dispatchInstances[i])) {
        return dispatchInstances[i]
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchInstances)) {
      return dispatchInstances
    }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeDispatchesInOrderStopAtTrue(event): any {
  const ret = executeDispatchesInOrderStopAtTrueImpl(event)
  event._dispatchInstances = null
  event._dispatchListeners = null
  return ret
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function executeDirectDispatch(event): any {
  const dispatchListener = event._dispatchListeners
  const dispatchInstance = event._dispatchInstances
  invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `event`.',
  )
  event.currentTarget = dispatchListener
    ? getNodeFromInstance(dispatchInstance)
    : null
  const res = dispatchListener ? dispatchListener(event) : null
  event.currentTarget = null
  event._dispatchListeners = null
  event._dispatchInstances = null
  return res
}

export function hasDispatches(event): boolean {
  return !!event._dispatchListeners
}
