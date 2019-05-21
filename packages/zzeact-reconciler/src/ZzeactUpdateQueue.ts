import { ExpirationTime } from './ZzeactFiberExpirationTime'

export interface IUpdate<State> {
  expirationTime: ExpirationTime

  tag: 0 | 1 | 2 | 3
  payload: any
  callback: (() => mixed) | null

  next: IUpdate<State> | null
  nextEffect: IUpdate<State> | null
}

export interface IUpdateQueue<State> {
  baseState: State

  firstUpdate: IUpdate<State> | null
  lastUpdate: IUpdate<State> | null

  firstCapturedUpdate: IUpdate<State> | null
  lastCapturedUpdate: IUpdate<State> | null

  firstEffect: IUpdate<State> | null
  lastEffect: IUpdate<State> | null

  firstCapturedEffect: IUpdate<State> | null
  lastCapturedEffect: IUpdate<State> | null
}
