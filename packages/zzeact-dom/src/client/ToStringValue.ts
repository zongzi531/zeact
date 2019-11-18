export /* opaque */ type ToStringValue =
  | boolean
  | number
  | object
  | string
  | null
  | void

export function toString(value: ToStringValue): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return '' + (value as any)
}

export function getToStringValue(value: mixed): ToStringValue {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'object':
    case 'string':
    case 'undefined':
      return value
    default:
      return ''
  }
}
