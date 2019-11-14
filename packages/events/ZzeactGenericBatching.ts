import {
  needsStateRestore,
  restoreStateIfNeeded,
} from './ZzeactControlledComponent'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _batchedUpdatesImpl = function(fn, bookkeeping): any {
  return fn(bookkeeping)
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _interactiveUpdatesImpl = function(fn, a, b): any {
  return fn(a, b)
}
let _flushInteractiveUpdatesImpl = function(): void { return }

let isBatching = false
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function batchedUpdates(fn, bookkeeping): any {
  if (isBatching) {
    return fn(bookkeeping)
  }
  isBatching = true
  try {
    return _batchedUpdatesImpl(fn, bookkeeping)
  } finally {
    isBatching = false
    const controlledComponentsHavePendingUpdates = needsStateRestore()
    if (controlledComponentsHavePendingUpdates) {
      _flushInteractiveUpdatesImpl()
      restoreStateIfNeeded()
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function interactiveUpdates(fn, a, b): any {
  return _interactiveUpdatesImpl(fn, a, b)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function flushInteractiveUpdates(): any {
  return _flushInteractiveUpdatesImpl()
}

export function setBatchingImplementation(
  batchedUpdatesImpl,
  interactiveUpdatesImpl,
  flushInteractiveUpdatesImpl,
): void {
  _batchedUpdatesImpl = batchedUpdatesImpl
  _interactiveUpdatesImpl = interactiveUpdatesImpl
  _flushInteractiveUpdatesImpl = flushInteractiveUpdatesImpl
}
