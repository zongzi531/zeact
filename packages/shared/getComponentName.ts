import { LazyComponent } from '@/shared/ZzeactLazyComponent'

import {
  ZZEACT_CONCURRENT_MODE_TYPE,
  ZZEACT_CONTEXT_TYPE,
  ZZEACT_FORWARD_REF_TYPE,
  ZZEACT_FRAGMENT_TYPE,
  ZZEACT_PORTAL_TYPE,
  ZZEACT_MEMO_TYPE,
  ZZEACT_PROFILER_TYPE,
  ZZEACT_PROVIDER_TYPE,
  ZZEACT_STRICT_MODE_TYPE,
  ZZEACT_SUSPENSE_TYPE,
  ZZEACT_LAZY_TYPE,
} from '@/shared/ZzeactSymbols'
import { refineResolvedLazyComponent } from '@/shared/ZzeactLazyComponent'

function getWrappedName(
  outerType: mixed,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerType: any,
  wrapperName: string,
): string {
  const functionName = innerType.displayName || innerType.name || ''
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (outerType as any).displayName ||
    (functionName !== '' ? `${wrapperName}(${functionName})` : wrapperName)
  )
}

function getComponentName(type: mixed): string | null {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null
  }
  if (typeof type === 'function') {
    return type.displayName || type.name || null
  }
  if (typeof type === 'string') {
    return type
  }
  switch (type) {
    case ZZEACT_CONCURRENT_MODE_TYPE:
      return 'ConcurrentMode'
    case ZZEACT_FRAGMENT_TYPE:
      return 'Fragment'
    case ZZEACT_PORTAL_TYPE:
      return 'Portal'
    case ZZEACT_PROFILER_TYPE:
      return 'Profiler'
    case ZZEACT_STRICT_MODE_TYPE:
      return 'StrictMode'
    case ZZEACT_SUSPENSE_TYPE:
      return 'Suspense'
  }
  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case ZZEACT_CONTEXT_TYPE:
        return 'Context.Consumer'
      case ZZEACT_PROVIDER_TYPE:
        return 'Context.Provider'
      case ZZEACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef')
      case ZZEACT_MEMO_TYPE:
        return getComponentName(type.type)
      case ZZEACT_LAZY_TYPE: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const thenable: LazyComponent<mixed> = (type as any)
        const resolvedThenable = refineResolvedLazyComponent(thenable)
        if (resolvedThenable) {
          return getComponentName(resolvedThenable)
        }
      }
    }
  }
  return null
}

export default getComponentName
