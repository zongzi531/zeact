export function remove(key): void {
  key._zzeactInternalFiber = undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get(key): any {
  return key._zzeactInternalFiber
}

export function has(key): boolean {
  return key._zzeactInternalFiber !== undefined
}

export function set(key, value): void {
  key._zzeactInternalFiber = value
}
