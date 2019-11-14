const invokeGuardedCallbackImpl = function<A, B, C, D, E, F, Context>(
  name: string | null,
  func: (a: A, b: B, c: C, d: D, e: E, f: F) => mixed,
  context: Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  a: A,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  b: B,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  c: C,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  d: D,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  e: E,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  f: F,
): void {
  // eslint-disable-next-line prefer-rest-params
  const funcArgs = Array.prototype.slice.call(arguments, 3)
  try {
    func.apply(context, funcArgs)
  } catch (error) {
    this.onError(error)
  }
}

export default invokeGuardedCallbackImpl
