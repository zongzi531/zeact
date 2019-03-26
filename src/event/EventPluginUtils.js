import EventConstants from './EventConstants'
import AbstractEvent from './AbstractEvent'
import invariant from '@/vendor/core/invariant'

const { topLevelTypes } = EventConstants

const isEndish = topLevelType => topLevelType === topLevelTypes.topMouseUp ||
    topLevelType === topLevelTypes.topTouchEnd ||
    topLevelType === topLevelTypes.topTouchCancel

const isMoveish = topLevelType => topLevelType === topLevelTypes.topMouseMove ||
    topLevelType === topLevelTypes.topTouchMove

const isStartish = topLevelType => topLevelType === topLevelTypes.topMouseDown ||
    topLevelType === topLevelTypes.topTouchStart

const storePageCoordsIn = (obj, nativeEvent) => {
  const pageX = AbstractEvent.eventPageX(nativeEvent)
  const pageY = AbstractEvent.eventPageY(nativeEvent)
  obj.pageX = pageX
  obj.pageY = pageY
}

const eventDistance = (coords, nativeEvent) => {
  const pageX = AbstractEvent.eventPageX(nativeEvent)
  const pageY = AbstractEvent.eventPageY(nativeEvent)
  return Math.pow(
    Math.pow(pageX - coords.pageX, 2) + Math.pow(pageY - coords.pageY, 2),
    0.5
  )
}

const forEachEventDispatch = (abstractEvent, cb) => {
  const dispatchListeners = abstractEvent._dispatchListeners
  const dispatchIDs = abstractEvent._dispatchIDs
  if (Array.isArray(dispatchListeners)) {
    for (
      let i = 0;
      i < dispatchListeners.length && !abstractEvent.isPropagationStopped;
      i++) {
      // Listeners and IDs are two parallel arrays that are always in sync.
      cb(abstractEvent, dispatchListeners[i], dispatchIDs[i])
    }
  } else if (dispatchListeners) {
    cb(abstractEvent, dispatchListeners, dispatchIDs)
  }
}

const executeDispatchesInOrderStopAtTrue = abstractEvent => {
  const dispatchListeners = abstractEvent._dispatchListeners
  const dispatchIDs = abstractEvent._dispatchIDs
  if (Array.isArray(dispatchListeners)) {
    for (
      let i = 0;
      i < dispatchListeners.length && !abstractEvent.isPropagationStopped;
      i++) {
      // Listeners and IDs are two parallel arrays that are always in sync.
      if (dispatchListeners[i](abstractEvent, dispatchIDs[i])) {
        return dispatchIDs[i]
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(abstractEvent, dispatchIDs)) {
      return dispatchIDs
    }
  }
  return null
}

const executeDirectDispatch = abstractEvent => {
  const dispatchListener = abstractEvent._dispatchListeners
  const dispatchID = abstractEvent._dispatchIDs
  invariant(
    !Array.isArray(dispatchListener),
    'executeDirectDispatch(...): Invalid `abstractEvent`.'
  )
  const res = dispatchListener
    ? dispatchListener(abstractEvent, dispatchID)
    : null
  abstractEvent._dispatchListeners = null
  abstractEvent._dispatchIDs = null
  return res
}

const hasDispatches = abstractEvent => !!abstractEvent._dispatchListeners

export default {
  isEndish,
  isMoveish,
  isStartish,
  storePageCoordsIn,
  eventDistance,
  // 这个方法在干嘛?
  executeDispatch (abstractEvent, listener, domID) {
    listener(abstractEvent, domID)
  },
  executeDispatchesInOrder (abstractEvent, executeDispatch) {
    // 遍历事件 dispatch
    forEachEventDispatch(abstractEvent, executeDispatch)
    // 执行完后释放
    abstractEvent._dispatchListeners = null
    abstractEvent._dispatchIDs = null
  },
  executeDispatchesInOrderStopAtTrue,
  executeDirectDispatch,
  hasDispatches,
}
