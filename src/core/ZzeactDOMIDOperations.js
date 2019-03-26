import invariant from '@/vendor/core/invariant'
import ZzeactDOMNodeCache from './ZzeactDOMNodeCache'
import DOMPropertyOperations from '@/domUtils/DOMPropertyOperations'
import CSSPropertyOperations from '@/domUtils/CSSPropertyOperations'
import getTextContentAccessor from '@/domUtils/getTextContentAccessor'
import DOMChildrenOperations from '@/domUtils/DOMChildrenOperations'

const textContentAccessor = getTextContentAccessor() || 'NA'

const INVALID_PROPERTY_ERRORS = {
  content: '`content` must be set using `updateTextContentByID()`.',
  dangerouslySetInnerHTML:
    '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
  style: '`style` must be set using `updateStylesByID()`.',
}

/**
 * 仔细看其实不难发现，这里就是对上面一些方法的进一步封装
 */
const ZzeactDOMIDOperations = {
  // 通过 ID 更新属性的 方法
  updatePropertyByID (id, name, value) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    invariant(
      !INVALID_PROPERTY_ERRORS.hasOwnProperty(name),
      'updatePropertyByID(...): %s',
      INVALID_PROPERTY_ERRORS[name]
    )
    // DOM 操作相关的更新属性
    DOMPropertyOperations.setValueForProperty(node, name, value)
  },
  // 这个方法在干嘛呢？我也没看懂，我怎么觉着他在无限循环呢
  updatePropertiesByID (id, properties) {
    for (const name in properties) {
      if (!properties.hasOwnProperty(name)) {
        continue
      }
      ZzeactDOMIDOperations.updatePropertiesByID(id, name, properties[name])
    }
  },
  // 通过 ID 更新 CSS 样式
  updateStylesByID (id, styles) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    CSSPropertyOperations.setValueForStyles(node, styles)
  },
  // 通过 ID 更新 innerHTML
  updateInnerHTMLByID (id, html) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    // HACK: IE8- normalize whitespace in innerHTML, removing leading spaces.
    // @see quirksmode.org/bugreports/archives/2004/11/innerhtml_and_t.html
    node.innerHTML = ((html && html.__html) || '').replace(/^ /g, '&nbsp;')
  },
  // 通过 ID 更新 innerText 或 textContent
  updateTextContentByID (id, content) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    node[textContentAccessor] = content
  },
  // 危险的更新
  dangerouslyReplaceNodeWithMarkupByID (id, markup) {
    const node = ZzeactDOMNodeCache.getCachedNodeByID(id)
    DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup)
    ZzeactDOMNodeCache.purgeEntireCache()
  },
  // 通过 parentID 管理 children
  manageChildrenByParentID (parentID, domOperations) {
    const parent = ZzeactDOMNodeCache.getCachedNodeByID(parentID)
    DOMChildrenOperations.manageChildren(parent, domOperations)
    // 以上 2 个方法都会清空 cache
    ZzeactDOMNodeCache.purgeEntireCache()
  },
  setTextNodeValueAtIndexByParentID (parentID, index, value) {
    const parent = ZzeactDOMNodeCache.getCachedNodeByID(parentID)
    DOMChildrenOperations.setTextNodeValueAtIndex(parent, index, value)
  },
}

export default ZzeactDOMIDOperations
