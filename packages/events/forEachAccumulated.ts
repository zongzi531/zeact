function forEachAccumulated<T>(
  arr: (Array<T> | T),
  cb: (elem: T) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scope?: any,
): void {
  if (Array.isArray(arr)) {
    arr.forEach(cb, scope)
  } else if (arr) {
    cb.call(scope, arr)
  }
}

export default forEachAccumulated
