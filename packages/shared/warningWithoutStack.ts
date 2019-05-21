const warningWithoutStack = (condition, format, ...args) => {
  if (format === undefined) {
    throw new Error(
      '`warningWithoutStack(condition, format, ...args)` requires a warning ' +
        'message argument',
    )
  }
  if (args.length > 8) {
    // Check before the condition to catch violations early.
    throw new Error(
      'warningWithoutStack() currently supports at most 8 arguments.',
    )
  }
  if (condition) {
    return
  }
  if (typeof console !== 'undefined') {
    const argsWithFormat = args.map(item => '' + item)
    argsWithFormat.unshift('Warning: ' + format)

    // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // tslint:disable-next-line: no-console
    Function.prototype.apply.call(console.error, console, argsWithFormat)
  }
  try {
    // --- Welcome to debugging React ---
    // This error was thrown as a convenience so that you can use this stack
    // to find the callsite that caused this warning to fire.
    let argIndex = 0
    const message =
      'Warning: ' + format.replace(/%s/g, () => args[argIndex++])
    throw new Error(message)
  // tslint:disable-next-line: no-empty
  } catch (x) {}
}

export default warningWithoutStack
