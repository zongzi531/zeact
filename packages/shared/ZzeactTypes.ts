export interface IRefObject {
  current: any
}

export interface IZzeactContext<T> {
  $$typeof: symbol | number
  Consumer: IZzeactContext<T>
  Provider: IZzeactProviderType<T>
  _calculateChangedBits: ((a: T, b: T) => number) | null
  _currentValue: T
  _currentValue2: T
  _threadCount: number
  _currentRenderer?: object | null
  _currentRenderer2?: object | null
}

export interface IZzeactProviderType<T> {
  $$typeof: symbol | number
  _context: IZzeactContext<T>
}
