import throwIf from './throwIf'

const NOT_OBJECT_ERROR = 'NOT_OBJECT_ERROR'

const keyMirror = obj => {
  const ret = {}

  throwIf(!(obj instanceof Object) || Array.isArray(obj), NOT_OBJECT_ERROR)

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue
    }
    ret[key] = key
  }
  return ret
}

export default keyMirror
