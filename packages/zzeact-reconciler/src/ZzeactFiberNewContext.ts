import { ZzeactContext } from '@/shared/ZzeactTypes'
import { Fiber } from './ZzeactFiber'
import { StackCursor } from './ZzeactFiberStack'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { createCursor, push, pop } from './ZzeactFiberStack'

import { isPrimaryRenderer } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import MAX_SIGNED_31_BIT_INT from './maxSigned31BitInt'

import invariant from '@/shared/invariant'

import { NoWork } from './ZzeactFiberExpirationTime'

import { markWorkInProgressReceivedUpdate } from './ZzeactFiberBeginWork'

const valueCursor: StackCursor<mixed> = createCursor(null)

export type ContextDependencyList = {
  first: ContextDependency<mixed>
  expirationTime: ExpirationTime
}

type ContextDependency<T> = {
  context: ZzeactContext<T>
  observedBits: number
  next: ContextDependency<mixed> | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let currentlyRenderingFiber: Fiber | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let lastContextDependency: ContextDependency<mixed> | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
let lastContextWithAllBitsObserved: ZzeactContext<any> | null = null

export function resetContextDependences(): void {
  currentlyRenderingFiber = null
  lastContextDependency = null
  lastContextWithAllBitsObserved = null
}

export function pushProvider<T>(providerFiber: Fiber, nextValue: T): void {
  const context: ZzeactContext<T> = providerFiber.type._context

  if (isPrimaryRenderer) {
    push(valueCursor, context._currentValue/* , providerFiber */)

    context._currentValue = nextValue
  } else {
    push(valueCursor, context._currentValue2/* , providerFiber */)

    context._currentValue2 = nextValue
  }
}

export function popProvider(providerFiber: Fiber): void {
  const currentValue = valueCursor.current

  pop(valueCursor /*, providerFiber */)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context: ZzeactContext<any> = providerFiber.type._context
  if (isPrimaryRenderer) {
    context._currentValue = currentValue
  } else {
    context._currentValue2 = currentValue
  }
}

export function prepareToReadContext(
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): void {
  currentlyRenderingFiber = workInProgress
  lastContextDependency = null
  lastContextWithAllBitsObserved = null

  const currentDependencies = workInProgress.contextDependencies
  if (
    currentDependencies !== null &&
    currentDependencies.expirationTime >= renderExpirationTime
  ) {
    markWorkInProgressReceivedUpdate()
  }

  workInProgress.contextDependencies = null
}

export function readContext<T>(
  context: ZzeactContext<T>,
  observedBits: void | number | boolean,
): T {
  if (lastContextWithAllBitsObserved === context) {
  } else if (observedBits === false || observedBits === 0) {
  } else {
    let resolvedObservedBits
    if (
      typeof observedBits !== 'number' ||
      observedBits === MAX_SIGNED_31_BIT_INT
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lastContextWithAllBitsObserved = ((context as any) as ZzeactContext<mixed>)
      resolvedObservedBits = MAX_SIGNED_31_BIT_INT
    } else {
      resolvedObservedBits = observedBits
    }

    const contextItem = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: ((context as any) as ZzeactContext<mixed>),
      observedBits: resolvedObservedBits,
      next: null,
    }

    if (lastContextDependency === null) {
      invariant(
        currentlyRenderingFiber !== null,
        'Context can only be read while Zzeact is rendering. ' +
          'In classes, you can read it in the render method or getDerivedStateFromProps. ' +
          'In function components, you can read it directly in the function body, but not ' +
          'inside Hooks like useReducer() or useMemo().',
      )

      lastContextDependency = contextItem
      currentlyRenderingFiber.contextDependencies = {
        first: contextItem,
        expirationTime: NoWork,
      }
    } else {
      lastContextDependency = lastContextDependency.next = contextItem
    }
  }
  return isPrimaryRenderer ? context._currentValue : context._currentValue2
}
