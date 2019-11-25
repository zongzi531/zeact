import { LazyComponent, Thenable } from '@/shared/ZzeactLazyComponent'

import { Resolved, Rejected, Pending } from '@/shared/ZzeactLazyComponent'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveDefaultProps(Component: any, baseProps: any): any {
  if (Component && Component.defaultProps) {
    const props = Object.assign({}, baseProps)
    const defaultProps = Component.defaultProps
    for (const propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
    return props
  }
  return baseProps
}

export function readLazyComponentType<T>(lazyComponent: LazyComponent<T>): T {
  const status = lazyComponent._status
  const result = lazyComponent._result
  switch (status) {
    case Resolved: {
      const Component: T = result
      return Component
    }
    case Rejected: {
      const error: mixed = result
      throw error
    }
    case Pending: {
      const thenable: Thenable<T, mixed> = result
      throw thenable
    }
    default: {
      lazyComponent._status = Pending
      const ctor = lazyComponent._ctor
      const thenable = ctor()
      thenable.then(
        moduleObject => {
          if (lazyComponent._status === Pending) {
            const defaultExport = moduleObject.default
            lazyComponent._status = Resolved
            lazyComponent._result = defaultExport
          }
        },
        error => {
          if (lazyComponent._status === Pending) {
            lazyComponent._status = Rejected
            lazyComponent._result = error
          }
        },
      )
      switch (lazyComponent._status as 0 | 1 | 2) {
        case Resolved:
          return lazyComponent._result
        case Rejected:
          throw lazyComponent._result
      }
      lazyComponent._result = thenable
      throw thenable
    }
  }
}
