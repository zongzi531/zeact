type ValueTracker = {
  getValue(): string
  setValue(value: string): void
  stopTracking(): void
}
type WrapperState = { _valueTracker?: ValueTracker }
type ElementWithValueTracker = HTMLInputElement & WrapperState

function isCheckable(elem: HTMLInputElement): boolean {
  const type = elem.type
  const nodeName = elem.nodeName
  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (type === 'checkbox' || type === 'radio')
  )
}

function getTracker(node: ElementWithValueTracker): ValueTracker | null {
  return node._valueTracker
}

function detachTracker(node: ElementWithValueTracker): void {
  node._valueTracker = null
}

function getValueFromNode(node: HTMLInputElement): string {
  let value = ''
  if (!node) {
    return value
  }

  if (isCheckable(node)) {
    value = node.checked ? 'true' : 'false'
  } else {
    value = node.value
  }

  return value
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trackValueOnNode(node: any): ValueTracker | null {
  const valueField = isCheckable(node) ? 'checked' : 'value'
  const descriptor = Object.getOwnPropertyDescriptor(
    node.constructor.prototype,
    valueField,
  )

  let currentValue = '' + node[valueField]

  if (
    node.hasOwnProperty(valueField) ||
    typeof descriptor === 'undefined' ||
    typeof descriptor.get !== 'function' ||
    typeof descriptor.set !== 'function'
  ) {
    return
  }
  const { get, set } = descriptor
  Object.defineProperty(node, valueField, {
    configurable: true,
    get: function() {
      return get.call(this)
    },
    set: function(value) {
      currentValue = '' + value
      set.call(this, value)
    },
  })

  Object.defineProperty(node, valueField, {
    enumerable: descriptor.enumerable,
  })

  const tracker = {
    getValue(): string {
      return currentValue
    },
    setValue(value): void {
      currentValue = '' + value
    },
    stopTracking(): void {
      detachTracker(node)
      delete node[valueField]
    },
  }
  return tracker
}

export function track(node: ElementWithValueTracker): void {
  if (getTracker(node)) {
    return
  }

  node._valueTracker = trackValueOnNode(node)
}

export function updateValueIfChanged(node: ElementWithValueTracker): boolean {
  if (!node) {
    return false
  }

  const tracker = getTracker(node)
  if (!tracker) {
    return true
  }

  const lastValue = tracker.getValue()
  const nextValue = getValueFromNode(node)
  if (nextValue !== lastValue) {
    tracker.setValue(nextValue)
    return true
  }
  return false
}

export function stopTracking(node: ElementWithValueTracker): void {
  const tracker = getTracker(node)
  if (tracker) {
    tracker.stopTracking()
  }
}
