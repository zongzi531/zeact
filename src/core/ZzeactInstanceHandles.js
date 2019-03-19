// 这里有一堆方法是没看懂的
import getDOMNodeID from '@/domUtils/getDOMNodeID'
import invariant from '@/vendor/core/invariant'

const SEPARATOR = '.'
const SEPARATOR_LENGTH = SEPARATOR.length

const MAX_TREE_DEPTH = 100

const isRenderedByZzeact = node => {
  const id = getDOMNodeID(node)
  return id && id.charAt(0) === SEPARATOR
}

const isMarker = (id, index) => id.charAt(index) === SEPARATOR || index === id.length

const isValidID = id => id === '' || (
  id.charAt(0) === SEPARATOR && id.charAt(id.length - 1) !== SEPARATOR
)

const parentID = id => id ? id.substr(0, id.lastIndexOf(SEPARATOR)) : ''

const traverseParentPath = (start, stop, cb, arg, skipFirst, skipLast) => {
  start = start || ''
  stop = stop || ''
  invariant(
    start !== stop,
    'traverseParentPath(...): Cannot traverse from and to the same ID, `%s`.',
    start
  )
  const ancestorID = ZzeactInstanceHandles.getFirstCommonAncestorID(start, stop)
  const traverseUp = ancestorID === stop
  invariant(
    traverseUp || ancestorID === start,
    'traverseParentPath(%s, %s, ...): Cannot traverse from two IDs that do ' +
    'not have a parent path.',
    start,
    stop
  )
  // Traverse from `start` to `stop` one depth at a time.
  let depth = 0
  const traverse = traverseUp ? parentID : ZzeactInstanceHandles.nextDescendantID
  for (let id = start; /* until break */; id = traverse(id, stop)) {
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      cb(id, traverseUp, arg)
    }
    if (id === stop) {
      // Only break //after// visiting `stop`.
      break
    }
    invariant(
      depth++ < MAX_TREE_DEPTH,
      'traverseParentPath(%s, %s, ...): Detected an infinite loop while ' +
      'traversing the React DOM ID tree. This may be due to malformed IDs: %s',
      start, stop
    )
  }
}

const ZzeactInstanceHandles = {
  getFirstZzeactDOM (node) {
    // 这个方法我理解就是在当前 node 下，获取最早的 Zzeact 节点
    let current = node
    while (current && current.parentNode !== current) {
      if (isRenderedByZzeact(node)) {
        return current
      }
      current = current.parentNode
    }
    return null
  },
  getFirstCommonAncestorID (oneID, twoID) {
    const minLength = Math.min(oneID.length, twoID.length)
    if (minLength === 0) {
      return ''
    }
    let lastCommonMarkerIndex = 0
    // Use `<=` to traverse until the "EOL" of the shorter string.
    for (let i = 0; i <= minLength; i++) {
      if (isMarker(oneID, i) && isMarker(twoID, i)) {
        lastCommonMarkerIndex = i
      } else if (oneID.charAt(i) !== twoID.charAt(i)) {
        break
      }
    }
    const longestCommonID = oneID.substr(0, lastCommonMarkerIndex)
    invariant(
      isValidID(longestCommonID),
      'getFirstCommonAncestorID(%s, %s): Expected a valid React DOM ID: %s',
      oneID,
      twoID,
      longestCommonID
    )
    return longestCommonID
  },
  getZzeactRootID: mountPointCount => `.zzeactRoot[${mountPointCount}]`,
  getZzeactRootIDFromNodeID: id => {
    const regexResult = /\.zzeactRoot\[[^\]]+\]/.exec(id)
    return regexResult && regexResult[0]
  },
  traverseTwoPhase (targetID, cb, arg) {
    if (targetID) {
      traverseParentPath('', targetID, cb, arg, true, false)
      traverseParentPath(targetID, '', cb, arg, false, true)
    }
  },
  nextDescendantID (ancestorID, destinationID) {
    invariant(
      isValidID(ancestorID) && isValidID(destinationID),
      'nextDescendantID(%s, %s): Received an invalid React DOM ID.',
      ancestorID,
      destinationID
    )
    const longestCommonID = ZzeactInstanceHandles.getFirstCommonAncestorID(
      ancestorID,
      destinationID
    )
    invariant(
      longestCommonID === ancestorID,
      'nextDescendantID(...): React has made an invalid assumption about the ' +
      'DOM hierarchy. Expected `%s` to be an ancestor of `%s`.',
      ancestorID,
      destinationID
    )
    if (ancestorID === destinationID) {
      return ancestorID
    }
    // Skip over the ancestor and the immediate separator. Traverse until we hit
    // another separator or we reach the end of `destinationID`.
    const start = ancestorID.length + SEPARATOR_LENGTH
    let i = start
    for (; i < destinationID.length; i++) {
      if (isMarker(destinationID, i)) {
        break
      }
    }
    return destinationID.substr(0, i)
  },
}

export default ZzeactInstanceHandles
