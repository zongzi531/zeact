import { IZzeactContext } from '@/shared/ZzeactTypes'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

export interface IContextDependencyList {
  first: IContextDependency<mixed>,
  expirationTime: ExpirationTime,
}

interface IContextDependency<T> {
  context: IZzeactContext<T>,
  observedBits: number,
  next: IContextDependency<mixed> | null,
}
