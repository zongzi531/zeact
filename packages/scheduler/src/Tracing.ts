let threadIDCounter: number = 0

export function unstable_getThreadID(): number {
  return ++threadIDCounter
}
