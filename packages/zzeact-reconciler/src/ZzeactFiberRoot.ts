import { ExpirationTime } from './ZzeactFiberExpirationTime'

export type Batch = {
  _defer: boolean
  _expirationTime: ExpirationTime
  _onComplete: () => mixed
  _next: Batch | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FiberRoot = any
