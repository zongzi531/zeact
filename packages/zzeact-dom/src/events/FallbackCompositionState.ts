let root = null
let startText = null
let fallbackText = null

export function initialize(nativeEventTarget): boolean {
  root = nativeEventTarget
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  startText = getText()
  return true
}

export function reset(): void {
  root = null
  startText = null
  fallbackText = null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getData(): any {
  if (fallbackText) {
    return fallbackText
  }

  let start
  const startValue = startText
  const startLength = startValue.length
  let end
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const endValue = getText()
  const endLength = endValue.length

  for (start = 0; start < startLength; start++) {
    if (startValue[start] !== endValue[start]) {
      break
    }
  }

  const minEnd = startLength - start
  for (end = 1; end <= minEnd; end++) {
    if (startValue[startLength - end] !== endValue[endLength - end]) {
      break
    }
  }

  const sliceTail = end > 1 ? 1 - end : undefined
  fallbackText = endValue.slice(start, sliceTail)
  return fallbackText
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getText(): any {
  if ('value' in root) {
    return root.value
  }
  return root.textContent
}
