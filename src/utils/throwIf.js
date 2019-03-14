const throwIf = (condition, err) => {
  if (condition) {
    throw new Error(err)
  }
}

export default throwIf
