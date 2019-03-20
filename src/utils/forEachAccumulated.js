const forEachAccumulated = (arr, cb, scope) => {
  // 判断 arr 是否为数组，是的话 forEach ，否则直接调
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope)
  } else if (arr) {
    cb.call(scope, arr)
  }
}

export default forEachAccumulated
