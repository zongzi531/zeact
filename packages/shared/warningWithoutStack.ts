const warningWithoutStack = (condition, format, ...args) => {
  if (format === undefined) {
    throw new Error(
      '`warningWithoutStack(condition, format, ...args)` requires a warning ' +
        'message argument',
    )
  }
  if (args.length > 8) {
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
    // tslint:disable-next-line: no-console
    Function.prototype.apply.call(console.error, console, argsWithFormat)
  }
  try {
    let argIndex = 0
    const message =
      'Warning: ' + format.replace(/%s/g, () => args[argIndex++])
    throw new Error(message)
  // tslint:disable-next-line: no-empty
  } catch (x) {}
}

export default warningWithoutStack
