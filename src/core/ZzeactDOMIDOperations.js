import invariant from '@/vendor/core/invariant'
import ZzeactDOMNodeCache from './ZzeactDOMNodeCache'
import DOMPropertyOperations from '@/domUtils/DOMPropertyOperations'
import CSSPropertyOperations from '@/domUtils/CSSPropertyOperations'
import getTextContentAccessor from '@/domUtils/getTextContentAccessor'
import DOMChildrenOperations from '../domUtils/DOMChildrenOperations'

const textContentAccessor = getTextContentAccessor() || 'NA'

const INVALID_PROPERTY_ERRORS = {
  content: '`content` must be set using `updateTextContentByID()`.',
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.',
}

const ZzeactDOMIDOperations = {
  updatePropertyByID (id, name, value) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    )
    DOMPropertyOperations.setValueForProperty(node, name, value)
  },
  updatePropertiesByID (id, properties) {
    for (const name in properties) {
      if (!properties.hasOwnProperty(name)) {
        continue
      }
      ZzeactDOMIDOperations.updatePropertiesByID(id, name, properties[name])
    }
  },
  updateStylesByID (id, styles) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    CSSPropertyOperations.setValueForStyles(node, styles)
  },
  updateInnerHTMLByID (id, html) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    // HACK: IE8- normalize whitespace in innerHTML, removing leading spaces.
    // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html
    node.innerHTML = ((html && html.__html) || '').replace(/^ /g, '&nbsp;')
  },
  updateTextContentByID (id, content) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    node[textContentAccessor] = content
  },
  dangerouslyReplaceNodeWithMarkupByID (id, markup) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup)
    ZzeactDOMNodeCache.purgeEntireCache()
  },
  manageChildrenByParentID (parentID, domOperations) {
    const parent = ZzeactDOMNodeCache.getCachedNodeByID(parentID)
    DOMChildrenOperations.manageChildren(parent, domOperations)
    ZzeactDOMNodeCache.purgeEntireCache()
  },
  setTextNodeValueAtIndexByParentID (parentID, index, value) {
    const parent = ZzeactDOMNodeCache.getCachedNodeByID(parentID)
    DOMChildrenOperations.setTextNodeValueAtIndex(parent, index, value)
  },
}

export default ZzeactDOMIDOperations
