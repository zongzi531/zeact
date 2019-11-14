import invariant from '@/shared/invariant'

const EVENT_POOL_SIZE = 10

const EventInterface = {
  type: null,
  target: null,
  currentTarget: function(): null {
    return null
  },
  eventPhase: null,
  bubbles: null,
  cancelable: null,
  timeStamp: function(event): number {
    return event.timeStamp || Date.now()
  },
  defaultPrevented: null,
  isTrusted: null,
}

function functionThatReturnsTrue(): boolean {
  return true
}

function functionThatReturnsFalse(): boolean {
  return false
}

function SyntheticEvent(
  dispatchConfig,
  targetInst,
  nativeEvent,
  nativeEventTarget,
): void {
  this.dispatchConfig = dispatchConfig
  this._targetInst = targetInst
  this.nativeEvent = nativeEvent

  const Interface = this.constructor.Interface
  for (const propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue
    }
    const normalize = Interface[propName]
    if (normalize) {
      this[propName] = normalize(nativeEvent)
    } else {
      if (propName === 'target') {
        this.target = nativeEventTarget
      } else {
        this[propName] = nativeEvent[propName]
      }
    }
  }

  const defaultPrevented =
    nativeEvent.defaultPrevented != null
      ? nativeEvent.defaultPrevented
      : nativeEvent.returnValue === false
  if (defaultPrevented) {
    this.isDefaultPrevented = functionThatReturnsTrue
  } else {
    this.isDefaultPrevented = functionThatReturnsFalse
  }
  this.isPropagationStopped = functionThatReturnsFalse
  return this
}

type typeof_unknown = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function' | 'unknown'

Object.assign(SyntheticEvent.prototype, {
  preventDefault: function() {
    this.defaultPrevented = true
    const event = this.nativeEvent
    if (!event) {
      return
    }

    if (event.preventDefault) {
      event.preventDefault()
    } else if (typeof event.returnValue as typeof_unknown !== 'unknown') {
      event.returnValue = false
    }
    this.isDefaultPrevented = functionThatReturnsTrue
  },
  stopPropagation: function() {
    const event = this.nativeEvent
    if (!event) {
      return
    }

    if (event.stopPropagation) {
      event.stopPropagation()
    } else if (typeof event.cancelBubble as typeof_unknown !== 'unknown') {
      event.cancelBubble = true
    }

    this.isPropagationStopped = functionThatReturnsTrue
  },
  persist: function() {
    this.isPersistent = functionThatReturnsTrue
  },
  isPersistent: functionThatReturnsFalse,
  destructor: function() {
    const Interface = this.constructor.Interface
    for (const propName in Interface) {
      this[propName] = null
    }
    this.dispatchConfig = null
    this._targetInst = null
    this.nativeEvent = null
    this.isDefaultPrevented = functionThatReturnsFalse
    this.isPropagationStopped = functionThatReturnsFalse
    this._dispatchListeners = null
    this._dispatchInstances = null
  },
})

SyntheticEvent.Interface = EventInterface

// eslint-disable-next-line @typescript-eslint/no-explicit-any
SyntheticEvent.extend = function(Interface): any {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const Super = this

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const E = function(): void {}
  E.prototype = Super.prototype
  const prototype = new E()

  function Class(): void {
    // eslint-disable-next-line prefer-rest-params
    return Super.apply(this, arguments)
  }
  Object.assign(prototype, Class.prototype)
  Class.prototype = prototype
  Class.prototype.constructor = Class

  Class.Interface = Object.assign({}, Super.Interface, Interface)
  Class.extend = Super.extend
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  addEventPoolingTo(Class)

  return Class
}

// eslint-disable-next-line @typescript-eslint/no-use-before-define
addEventPoolingTo(SyntheticEvent)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPooledEvent(dispatchConfig, targetInst, nativeEvent, nativeInst): any {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const EventConstructor = this
  if (EventConstructor.eventPool.length) {
    const instance = EventConstructor.eventPool.pop()
    EventConstructor.call(
      instance,
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeInst,
    )
    return instance
  }
  return new EventConstructor(
    dispatchConfig,
    targetInst,
    nativeEvent,
    nativeInst,
  )
}

function releasePooledEvent(event): void {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const EventConstructor = this
  invariant(
    event instanceof EventConstructor,
    'Trying to release an event instance into a pool of a different type.',
  )
  event.destructor()
  if (EventConstructor.eventPool.length < EVENT_POOL_SIZE) {
    EventConstructor.eventPool.push(event)
  }
}

function addEventPoolingTo(EventConstructor): void {
  EventConstructor.eventPool = []
  EventConstructor.getPooled = getPooledEvent
  EventConstructor.release = releasePooledEvent
}

export default SyntheticEvent
