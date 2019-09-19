export type ZzeactNode =
  | Zzeact$Element
  | ZzeactPortal
  | ZzeactText
  // TS: 2456
  // | ZzeactFragment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ZzeactProvider<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ZzeactConsumer<any>

export type ZzeactEmpty = null | void | boolean

export type ZzeactFragment = ZzeactEmpty | Iterable<ZzeactNode>

export type ZzeactNodeList = ZzeactEmpty | ZzeactNode

export type ZzeactText = string | number

export type ZzeactProvider<T> = {
  $$typeof: symbol | number
  type: ZzeactProviderType<T>
  key: null | string
  ref: null
  props: {
    value: T
    children?: ZzeactNodeList
  }
}

export type ZzeactProviderType<T> = {
  $$typeof: symbol | number
  _context: ZzeactContext<T>
}

export type ZzeactConsumer<T> = {
  $$typeof: symbol | number
  type: ZzeactContext<T>
  key: null | string
  ref: null
  props: {
    children: (value: T) => ZzeactNodeList
    unstable_observedBits?: number
  }
}

export type ZzeactContext<T> = {
  $$typeof: symbol | number
  Consumer: ZzeactContext<T>
  Provider: ZzeactProviderType<T>

  _calculateChangedBits: ((a: T, b: T) => number) | null

  _currentValue: T
  _currentValue2: T
  _threadCount: number
}

export type ZzeactPortal = {
  $$typeof: symbol | number
  key: null | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  containerInfo: any
  children: ZzeactNodeList
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implementation: any
}

export type RefObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  current: any
}
