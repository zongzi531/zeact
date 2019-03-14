const objMapKeyVal = (obj, func) => {
  if (!obj) { return null }
  let i = 0
  const ret = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret[key] = func(key, obj[key], i++)
    }
  }
  return ret
}

export default objMapKeyVal
