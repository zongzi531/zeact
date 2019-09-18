declare module '*.json' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any
  export default value
  export const version: string
}

// ZzeactElement<any>
interface ZzeactElement {
  $$typeof: symbol | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  key: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _owner: any
}

interface UsingDefault {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any
}
