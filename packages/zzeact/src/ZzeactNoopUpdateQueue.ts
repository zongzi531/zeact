const ZzeactNoopUpdateQueue = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMounted: function(publicInstance): false { return false },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  enqueueForceUpdate: function(publicInstance, callback, callerName): void {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  enqueueReplaceState: function(publicInstance, completeState, callback, callerName): void {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  enqueueSetState: function(publicInstance, partialState, callback, callerName): void {},
}

export default ZzeactNoopUpdateQueue
