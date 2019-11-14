import invariant from '@/shared/invariant'

function accumulateInto<T>(
  current: (Array<T> | T),
  next: T | Array<T>,
): T | Array<T> {
  invariant(
    next != null,
    'accumulateInto(...): Accumulated items must not be null or undefined.',
  )

  if (current == null) {
    return next
  }

  if (Array.isArray(current)) {
    if (Array.isArray(next)) {
      // eslint-disable-next-line prefer-spread
      current.push.apply(current, next)
      return current
    }
    current.push(next)
    return current
  }

  if (Array.isArray(next)) {
    return [current].concat(next)
  }

  return [current, next]
}

export default accumulateInto
