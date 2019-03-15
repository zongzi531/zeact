import DOMProperty from './DOMProperty'
import memoizeStringOnly from '@/utils/memoizeStringOnly'
import escapeTextForBrowser from '@/utils/escapeTextForBrowser'

const processAttributeNameAndPrefix = memoizeStringOnly(name => escapeTextForBrowser(name) + '="')

const DOMPropertyOperations = {
  createMarkupForProperty (name, value) {
    if (DOMProperty.isStandardName[name]) {
      if ((value == null || DOMProperty.hasBooleanValue[name]) && !value) {
        return ''
      }
      const attributeName = DOMProperty.getAttributeName[name]
      return processAttributeNameAndPrefix(attributeName) +
        escapeTextForBrowser(value) + '"'
    } else if (DOMProperty.isCustomAttribute(name)) {
      if (value == null) {
        return ''
      }
      return processAttributeNameAndPrefix(name) +
        escapeTextForBrowser(value) + '"'
    } else {
      return null
    }
  },
}

export default DOMPropertyOperations
