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
  // 这里的判断就是一级级取父级
  for (let id = start; /* until break */; id = traverse(id, stop)) {
    if ((!skipFirst || id !== start) && (!skipLast || id !== stop)) {
      // 判断通过时，执行回调方法
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
  findComponentRoot (ancestorNode, id) {
    var child = ancestorNode.firstChild
    while (child) {
      if (id === child.id) {
        return child
      } else if (id.indexOf(child.id) === 0) {
        return ZzeactInstanceHandles.findComponentRoot(child, id)
      }
      child = child.nextSibling
    }
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
      // 只有 targetID 存在的情况下才会去执行下面方法， targetID 存在代表是在 Zzeact DOM 上进行操作
      // 这个很有意思 先执行的是捕获再执行的是冒泡
      // 获取对应的 Zzeact Dom 的抽象事件逻辑也同样
      // 比如:
      // .zzeactRoot[0].[3].0
      // 捕获阶段： .zzeactRoot[0] => .zzeactRoot[0].[3] => .zzeactRoot[0].[3].0
      // 冒泡阶段： .zzeactRoot[0].[3].0 => .zzeactRoot[0].[3] => .zzeactRoot[0]
      // 他里面是通过前后 '.' 来控制判断的
      // 捕获
      traverseParentPath('', targetID, cb, arg, true, false)
      // 冒泡
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
  traverseEnterLeave (leaveID, enterID, cb, upArg, downArg) {
    const longestCommonID = ZzeactInstanceHandles.getFirstCommonAncestorID(
      leaveID,
      enterID
    )
    if (longestCommonID !== leaveID) {
      traverseParentPath(leaveID, longestCommonID, cb, upArg, false, true)
    }
    if (longestCommonID !== enterID) {
      traverseParentPath(longestCommonID, enterID, cb, downArg, true, false)
    }
  },
}

export default ZzeactInstanceHandles
