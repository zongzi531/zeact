export type Thenable<T, R> = {
  then(resolve: (T) => mixed, reject: (mixed) => mixed): R
}

export type LazyComponent<T> = {
  $$typeof: symbol | number
  _ctor: () => Thenable<{default: T}, mixed>
  _status: 0 | 1 | 2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _result: any
}

type ResolvedLazyComponent<T> = {
  $$typeof: symbol | number
  _ctor: () => Thenable<{default: T}, mixed>
  _status: 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _result: any
}

export const Pending = 0
export const Resolved = 1
export const Rejected = 2

export function refineResolvedLazyComponent<T>(
  lazyComponent: LazyComponent<T>,
): ResolvedLazyComponent<T> | null {
  return lazyComponent._status === Resolved ? lazyComponent._result : null
}
