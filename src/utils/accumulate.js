// 这里在干嘛没看懂
const accumulate = (cur, next) => {
  const curValIsEmpty = cur == null // Will test for emptiness (null/undef)
  const nextValIsEmpty = next === null
  if (nextValIsEmpty) {
    return cur
  } else {
    if (curValIsEmpty) {
      return next
    } else {
      // Both are not empty. Warning: Never call x.concat(y) when you are not
      // certain that x is an Array (x could be a string with concat method).
      const curIsArray = Array.isArray(cur)
      const nextIsArray = Array.isArray(next)
      if (curIsArray) {
        return cur.concat(next)
      } else {
        if (nextIsArray) {
          return [cur].concat(next)
        } else {
          return [cur, next]
        }
      }
    }
  }
}

export default accumulate
