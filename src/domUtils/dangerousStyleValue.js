import CSSProperty from './CSSProperty'

const dangerousStyleValue = (styleName, value) => {
  if (value === null || value === false || value === true || value === '') {
    return ''
  }
  if (isNaN(value)) {
    return !value ? '' : '' + value
  }
  return CSSProperty.isNumber[styleName] ? '' + value : (value + 'px')
}

export default dangerousStyleValue
