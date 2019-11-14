import invariant from '@/shared/invariant'
import invokeGuardedCallbackImpl from './invokeGuardedCallbackImpl'

let hasError: boolean = false
let caughtError: mixed = null

let hasRethrowError: boolean = false
let rethrowError: mixed = null

const reporter = {
  onError(error: mixed): void {
    hasError = true
    caughtError = error
  },
}

export function invokeGuardedCallback<A, B, C, D, E, F, Context>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  func: (a: A, b: B, c: C, d: D, e: E, f: F) => mixed,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  a?: A,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  b?: B,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  c?: C,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  d?: D,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  e?: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  f?: F,
): void {
  hasError = false
  caughtError = null
  // eslint-disable-next-line prefer-rest-params
  invokeGuardedCallbackImpl.apply(reporter, arguments)
}

export function invokeGuardedCallbackAndCatchFirstError<
  A,
  B,
  C,
  D,
  E,
  F,
  Context,
>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  func: (a: A, b: B, c: C, d: D, e: E, f: F) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  a?: A,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  b?: B,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  c?: C,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  d?: D,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  e?: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  f?: F,
): void {
  // eslint-disable-next-line prefer-rest-params
  invokeGuardedCallback.apply(this, arguments)
  if (hasError) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const error = clearCaughtError()
    if (!hasRethrowError) {
      hasRethrowError = true
      rethrowError = error
    }
  }
}

export function rethrowCaughtError(): void {
  if (hasRethrowError) {
    const error = rethrowError
    hasRethrowError = false
    rethrowError = null
    throw error
  }
}

export function hasCaughtError(): boolean {
  return hasError
}

export function clearCaughtError(): mixed | void {
  if (hasError) {
    const error = caughtError
    hasError = false
    caughtError = null
    return error
  } else {
    invariant(
      false,
      'clearCaughtError was called but no error was captured. This error ' +
        'is likely caused by a bug in Zzeact. Please file an issue.',
    )
  }
}
