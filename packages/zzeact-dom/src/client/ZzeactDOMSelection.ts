import getNodeForCharacterOffset from './getNodeForCharacterOffset'
import { TEXT_NODE } from '../shared/HTMLNodeType'

export function getOffsets(outerNode): object {
  const {ownerDocument} = outerNode
  const win = (ownerDocument && ownerDocument.defaultView) || window
  const selection = win.getSelection && win.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection

  try {
    anchorNode.nodeType
    focusNode.nodeType
  } catch (e) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return getModernOffsetsFromPoints(
    outerNode,
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  )
}

export function getModernOffsetsFromPoints(
  outerNode,
  anchorNode,
  anchorOffset,
  focusNode,
  focusOffset,
): object {
  let length = 0
  let start = -1
  let end = -1
  let indexWithinAnchor = 0
  let indexWithinFocus = 0
  let node = outerNode
  let parentNode = null

  outer: while (true) {
    let next = null

    while (true) {
      if (
        node === anchorNode &&
        (anchorOffset === 0 || node.nodeType === TEXT_NODE)
      ) {
        start = length + anchorOffset
      }
      if (
        node === focusNode &&
        (focusOffset === 0 || node.nodeType === TEXT_NODE)
      ) {
        end = length + focusOffset
      }

      if (node.nodeType === TEXT_NODE) {
        length += node.nodeValue.length
      }

      if ((next = node.firstChild) === null) {
        break
      }
      parentNode = node
      node = next
    }

    while (true) {
      if (node === outerNode) {
        break outer
      }
      if (parentNode === anchorNode && ++indexWithinAnchor === anchorOffset) {
        start = length
      }
      if (parentNode === focusNode && ++indexWithinFocus === focusOffset) {
        end = length
      }
      if ((next = node.nextSibling) !== null) {
        break
      }
      node = parentNode
      parentNode = node.parentNode
    }

    node = next
  }

  if (start === -1 || end === -1) {
    return null
  }

  return {
    start: start,
    end: end,
  }
}

export function setOffsets(node, offsets): void {
  const doc = node.ownerDocument || document
  const win = (doc && doc.defaultView) || window

  if (!win.getSelection) {
    return
  }

  const selection = win.getSelection()
  const length = node.textContent.length
  let start = Math.min(offsets.start, length)
  let end = offsets.end === undefined ? start : Math.min(offsets.end, length)

  if (!selection.extend && start > end) {
    const temp = end
    end = start
    start = temp
  }

  const startMarker = getNodeForCharacterOffset(node, start)
  const endMarker = getNodeForCharacterOffset(node, end)

  if (startMarker && endMarker) {
    if (
      selection.rangeCount === 1 &&
      selection.anchorNode === startMarker.node &&
      selection.anchorOffset === startMarker.offset &&
      selection.focusNode === endMarker.node &&
      selection.focusOffset === endMarker.offset
    ) {
      return
    }
    const range = doc.createRange()
    range.setStart(startMarker.node, startMarker.offset)
    selection.removeAllRanges()

    if (start > end) {
      selection.addRange(range)
      selection.extend(endMarker.node, endMarker.offset)
    } else {
      range.setEnd(endMarker.node, endMarker.offset)
      selection.addRange(range)
    }
  }
}
