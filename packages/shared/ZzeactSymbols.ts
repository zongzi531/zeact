const hasSymbol = typeof Symbol === 'function' && Symbol.for

export const ZZEACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('zzeact.element') : 0xeac7
export const ZZEACT_PORTAL_TYPE = hasSymbol ? Symbol.for('zzeact.portal') : 0xeaca
export const ZZEACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('zzeact.fragment') : 0xeacb
export const ZZEACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('zzeact.strict_mode') : 0xeacc
export const ZZEACT_PROFILER_TYPE = hasSymbol ? Symbol.for('zzeact.profiler') : 0xead2
export const ZZEACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('zzeact.provider') : 0xeacd
export const ZZEACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('zzeact.context') : 0xeace
export const ZZEACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('zzeact.async_mode') : 0xeacf
export const ZZEACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('zzeact.concurrent_mode') : 0xeacf
export const ZZEACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('zzeact.forward_ref') : 0xead0
export const ZZEACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('zzeact.suspense') : 0xead1
export const ZZEACT_MEMO_TYPE = hasSymbol ? Symbol.for('zzeact.memo') : 0xead3
export const ZZEACT_LAZY_TYPE = hasSymbol ? Symbol.for('zzeact.lazy') : 0xead4

const MAYBE_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator
const FAUX_ITERATOR_SYMBOL = '@@iterator'

// Iterator and Function
// Function fixed I want using '.call' function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIteratorFn(maybeIterable?: any): Iterator<any> & Function | null {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null
  }
  const maybeIterator =
    (MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL]) ||
    maybeIterable[FAUX_ITERATOR_SYMBOL]
  if (typeof maybeIterator === 'function') {
    return maybeIterator
  }
  return null
}
