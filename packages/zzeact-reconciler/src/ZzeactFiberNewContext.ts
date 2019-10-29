import { ZzeactContext } from '@/shared/ZzeactTypes'
import { Fiber } from './ZzeactFiber'
import { StackCursor } from './ZzeactFiberStack'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { createCursor /*, push */, pop } from './ZzeactFiberStack'

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
