
const dummies = {}

const getParentDummy = parent => {
  const parentTag = parent.tagName
  return dummies[parentTag] ||
    (dummies[parentTag] = document.createElement(parentTag))
}

/**
 * Inserts node after 'after'. If 'after' is null, inserts it after nothing,
 * which is inserting it at the beginning.
 *
 * @param {Element} elem Parent element.
 * @param {Element} insert Element to insert.
 * @param {Element} after Element to insert after.
 * @returns {Element} Element that was inserted.
 */
const insertNodeAfterNode = (elem, insert, after) => {
  if (after) {
    if (after.nextSibling) {
      return elem.insertBefore(insert, after.nextSibling)
    } else {
      return elem.appendChild(insert)
    }
  } else {
    return elem.insertBefore(insert, elem.firstChild)
  }
}

/**
 * Slow: Should only be used when it is known there are a few (or one) element
 * in the node list.
 * @param {Element} parentRootDomNode Parent element.
 * @param {HTMLCollection} htmlCollection HTMLCollection to insert.
 * @param {Element} after Element to insert the node list after.
 */
const inefficientlyInsertHTMLCollectionAfter = (
  parentRootDomNode,
  htmlCollection,
  after) => {
  let ret
  const originalLength = htmlCollection.length
  // Access htmlCollection[0] because htmlCollection shrinks as we remove items.
  // `insertNodeAfterNode` will remove items from the htmlCollection.
  for (let i = 0; i < originalLength; i++) {
    ret =
      insertNodeAfterNode(parentRootDomNode, htmlCollection[0], ret || after)
  }
}

/**
 * Super-dangerously inserts markup into existing DOM structure. Seriously, you
 * don't want to use this module unless you are building a framework. This
 * requires that the markup that you are inserting represents the root of a
 * tree. We do not support the case where there `markup` represents several
 * roots.
 *
 * @param {Element} parentNode Parent DOM element.
 * @param {string} markup Markup to dangerously insert.
 * @param {number} index Position to insert markup at.
 */
const dangerouslyInsertMarkupAt = (parentNode, markup, index) => {
  const parentDummy = getParentDummy(parentNode)
  parentDummy.innerHTML = markup
  const htmlCollection = parentDummy.childNodes
  const afterNode = index ? parentNode.childNodes[index - 1] : null
  inefficientlyInsertHTMLCollectionAfter(parentNode, htmlCollection, afterNode)
}

/**
 * Replaces a node with a string of markup at its current position within its
 * parent. `childNode` must be in the document (or at least within a parent
 * node). The string of markup must represent a tree of markup with a single
 * root.
 *
 * @param {Element} childNode Child node to replace.
 * @param {string} markup Markup to dangerously replace child with.
 */
const dangerouslyReplaceNodeWithMarkup = (childNode, markup) => {
  const parentNode = childNode.parentNode
  const parentDummy = getParentDummy(parentNode)
  parentDummy.innerHTML = markup
  const htmlCollection = parentDummy.childNodes
  parentNode.replaceChild(htmlCollection[0], childNode)
}

export default {
  dangerouslyInsertMarkupAt,
  dangerouslyReplaceNodeWithMarkup,
}
