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
  setValueForProperty (node, name, value) {
    if (DOMProperty.isStandardName[name]) {
      const mutationMethod = DOMProperty.getMutationMethod[name]
      if (mutationMethod) {
        mutationMethod(node, value)
      } else if (DOMProperty.mustUseAttribute[name]) {
        if (DOMProperty.hasBooleanValue[name] && !value) {
          node.removeAttribute(DOMProperty.getAttributeName[name])
        } else {
          node.setAttribute(DOMProperty.getAttributeName[name], value)
        }
      } else {
        const propName = DOMProperty.getPropertyName[name]
        if (!DOMProperty.hasSideEffects[name] || node[propName] !== value) {
          node[propName] = value
        }
      }
    } else if (DOMProperty.isCustomAttribute(name)) {
      node.setAttribute(name, value)
    }
  },
}

export default DOMPropertyOperations
