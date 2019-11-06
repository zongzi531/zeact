import { ZzeactContext } from '@/shared/ZzeactTypes'
import { Fiber } from './ZzeactFiber'
import { StackCursor } from './ZzeactFiberStack'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { createCursor, push, pop } from './ZzeactFiberStack'

import { isPrimaryRenderer } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

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
