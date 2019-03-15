const memoizeStringOnly = callback => {
  const cache = {}
  return string => {
    if (cache.hasOwnProperty(string)) {
      return cache[string]
    } else {
      return (cache[string] = callback.call(this, string))
    }
  }
}

export default memoizeStringOnly
