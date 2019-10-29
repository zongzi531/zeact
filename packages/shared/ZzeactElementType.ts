export type Source = {
  fileName: string
  lineNumber: number
}

export type ZzeactElement = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $$typeof: any
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
  _store: {
    validated: boolean
  }
  _self: Zzeact$Element
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _shadowChildren: any
  _source: Source
}
