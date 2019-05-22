import { IZzeactContext } from '@/shared/ZzeactTypes'
import { IFiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { isPrimaryRenderer } from './ZzeactFiberHostConfig'
import { createCursor, IStackCursor, pop } from './ZzeactFiberStack'

const valueCursor: IStackCursor<mixed> = createCursor(null)

export interface IContextDependencyList {
  first: IContextDependency<mixed>,
  expirationTime: ExpirationTime,
}

interface IContextDependency<T> {
  context: IZzeactContext<T>,
  observedBits: number,
  next: IContextDependency<mixed> | null,
}

export function popProvider(providerFiber: IFiber): void {
  const currentValue = valueCursor.current

  pop(valueCursor, providerFiber)

  const context: IZzeactContext<any> = providerFiber.type._context
  if (isPrimaryRenderer) {
    context._currentValue = currentValue
  } else {
    context._currentValue2 = currentValue
  }
}
