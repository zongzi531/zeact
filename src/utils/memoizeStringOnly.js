// 一个缓存方法，针对键为 string 类型的
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
