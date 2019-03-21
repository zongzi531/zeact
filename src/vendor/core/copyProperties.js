const copyProperties = (obj, a, b, c, d, e, f) => {
  obj = obj || {}
  const args = [a, b, c, d, e]
  let ii = 0
  let v
  while (args[ii]) {
    v = args[ii++]
    for (const k in v) {
      obj[k] = v[k]
    }

    // IE ignores toString in object iteration.. See:
    // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
    if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
      (typeof v.toString !== 'undefined') && (obj.toString !== v.toString)) {
      obj.toString = v.toString
    }
  }

  return obj
}

export default copyProperties
