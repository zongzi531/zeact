const joinClasses = (className, ...rest) => {
  if (!className) {
    className = ''
  }
  let nextClass
  const argLength = rest.length
  if (argLength > 0) {
    for (let ii = 0; ii < argLength; ii++) {
      nextClass = rest[ii]
      nextClass && (className += ' ' + nextClass)
    }
  }
  return className
}

export default joinClasses
