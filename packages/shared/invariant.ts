const validateFormat = function(format): void {
  if (format === undefined) {
    throw new Error('invariant requires an error message argument')
  }
}

export default function invariant(condition, format, a?, b?, c?, d?, e?, f?): void {
  validateFormat(format)

  if (!condition) {
    let error
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.',
      )
    } else {
      const args = [a, b, c, d, e, f]
      let argIndex = 0
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++]
        }),
      )
      error.name = 'Invariant Violation'
    }

    error.framesToPop = 1
    throw error
  }
}
