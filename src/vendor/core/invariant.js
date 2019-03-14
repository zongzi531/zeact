const invariant = (condition, format) => {
  if (!condition) {
    throw new Error(
      'Invariant Violation: ' +
      format
    )
  }
}

export default invariant
