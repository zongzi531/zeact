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

export default {
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
}
