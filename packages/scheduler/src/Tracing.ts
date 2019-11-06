export type Interaction = {
  __count: number
  id: number
  name: string
  timestamp: number
}

let threadIDCounter: number = 0

export function unstable_getThreadID(): number {
  return ++threadIDCounter
}
