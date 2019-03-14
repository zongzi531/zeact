const keyOf = oneKeyObj => {
  for (const key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue
    }
    return key
  }
  return null
}

export default keyOf
