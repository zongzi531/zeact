import { ExpirationTime } from './ZzeactFiberExpirationTime'

export type Update<State> = {
  expirationTime: ExpirationTime

  tag: 0 | 1 | 2 | 3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  callback: (() => mixed) | null

  next: Update<State> | null
  nextEffect: Update<State> | null
}

export type UpdateQueue<State> = {
  baseState: State

  firstUpdate: Update<State> | null
  lastUpdate: Update<State> | null

  firstCapturedUpdate: Update<State> | null
  lastCapturedUpdate: Update<State> | null

  firstEffect: Update<State> | null
  lastEffect: Update<State> | null

  firstCapturedEffect: Update<State> | null
  lastCapturedEffect: Update<State> | null
}
