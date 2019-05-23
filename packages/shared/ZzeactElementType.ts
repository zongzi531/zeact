export interface ISource {
  fileName: string
  lineNumber: number
}

export interface IZzeactElement {
  $$typeof: any
  type: any
  key: any
  ref: any
  props: any
  _owner: any
  _store: {
    validated: boolean,
  }
  _self: Zzeact$Element<any>
  _shadowChildren: any
  _source: ISource
}
