const createMicrosoftUnsafeLocalFunction = function(func): Function {
  if (typeof MSApp !== 'undefined' && MSApp.execUnsafeLocalFunction) {
    return function(arg0, arg1, arg2, arg3): void {
      MSApp.execUnsafeLocalFunction(function() {
        return func(arg0, arg1, arg2, arg3)
      })
    }
  } else {
    return func
  }
}

export default createMicrosoftUnsafeLocalFunction
