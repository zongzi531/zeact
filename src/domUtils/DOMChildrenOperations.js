import keyOf from '../vendor/core/keyOf'
import insertNodeAt from './insertNodeAt'
import Danger from './Danger'

const MOVE_NODE_AT_ORIG_INDEX = keyOf({ moveFrom: null })
const INSERT_MARKUP = keyOf({ insertMarkup: null })
const REMOVE_AT = keyOf({ removeAt: null })

const _getNodesByOriginalIndex = (parent, childOperations) => {
  let nodesByOriginalIndex // Sparse array.
  let childOperation
  let origIndex
  for (let i = 0; i < childOperations.length; i++) {
    childOperation = childOperations[i]
    if (MOVE_NODE_AT_ORIG_INDEX in childOperation) {
      nodesByOriginalIndex = nodesByOriginalIndex || []
      origIndex = childOperation.moveFrom
      nodesByOriginalIndex[origIndex] = parent.childNodes[origIndex]
    } else if (REMOVE_AT in childOperation) {
      nodesByOriginalIndex = nodesByOriginalIndex || []
      origIndex = childOperation.removeAt
      nodesByOriginalIndex[origIndex] = parent.childNodes[origIndex]
    }
  }
  return nodesByOriginalIndex
}

const _removeChildrenByOriginalIndex = (parent, nodesByOriginalIndex) => {
  for (let j = 0; j < nodesByOriginalIndex.length; j++) {
    const nodeToRemove = nodesByOriginalIndex[j]
    if (nodeToRemove) { // We used a sparse array.
      parent.removeChild(nodesByOriginalIndex[j])
    }
  }
}

const _placeNodesAtDestination = (parent, childOperations, nodesByOriginalIndex) => {
  let origNode
  let finalIndex
  let childOperation
  for (let k = 0; k < childOperations.length; k++) {
    childOperation = childOperations[k]
    if (MOVE_NODE_AT_ORIG_INDEX in childOperation) {
      origNode = nodesByOriginalIndex[childOperation.moveFrom]
      finalIndex = childOperation.finalIndex
      insertNodeAt(parent, origNode, finalIndex)
    } else if (REMOVE_AT in childOperation) {
    } else if (INSERT_MARKUP in childOperation) {
      finalIndex = childOperation.finalIndex
      const markup = childOperation.insertMarkup
      Danger.dangerouslyInsertMarkupAt(parent, markup, finalIndex)
    }
  }
}

const manageChildren = (parent, childOperations) => {
  const nodesByOriginalIndex = _getNodesByOriginalIndex(parent, childOperations)
  if (nodesByOriginalIndex) {
    _removeChildrenByOriginalIndex(parent, nodesByOriginalIndex)
  }
  _placeNodesAtDestination(parent, childOperations, nodesByOriginalIndex)
}

const setTextNodeValueAtIndex = (parent, index, val) => {
  parent.childNodes[index].nodeValue = val
}

const DOMChildrenOperations = {
  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,
  manageChildren: manageChildren,
  setTextNodeValueAtIndex: setTextNodeValueAtIndex,
}

export default DOMChildrenOperations
