import { ZzeactContext } from '@/shared/ZzeactTypes'
// import { Fiber } from './ZzeactFiber'
// import { StackCursor } from './ZzeactFiberStack'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

export type ContextDependencyList = {
  first: ContextDependency<mixed>
  expirationTime: ExpirationTime
}

type ContextDependency<T> = {
  context: ZzeactContext<T>
  observedBits: number
  next: ContextDependency<mixed> | null
}
