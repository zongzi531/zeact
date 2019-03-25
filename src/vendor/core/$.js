import ge from './ge'

const $ = arg => {
  const element = ge(arg)
  if (!element) {
    if (typeof arg == 'undefined') {
      arg = 'undefined'
    } else if (arg === null) {
      arg = 'null'
    }
    throw new Error(
      'Tried to get element "' + arg.toString() + '" but it is not present ' +
      'on the page.'
    )
  }
  return element
}

export default $
