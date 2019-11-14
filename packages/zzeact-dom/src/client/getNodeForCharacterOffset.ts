import { TEXT_NODE } from '../shared/HTMLNodeType'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLeafNode(node): any {
  while (node && node.firstChild) {
    node = node.firstChild
  }
  return node
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSiblingNode(node): any {
  while (node) {
    if (node.nextSibling) {
      return node.nextSibling
    }
    node = node.parentNode
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNodeForCharacterOffset(root: Element, offset: number): any {
  let node = getLeafNode(root)
  let nodeStart = 0
  let nodeEnd = 0

  while (node) {
    if (node.nodeType === TEXT_NODE) {
      nodeEnd = nodeStart + node.textContent.length

      if (nodeStart <= offset && nodeEnd >= offset) {
        return {
          node: node,
          offset: offset - nodeStart,
        }
      }

      nodeStart = nodeEnd
    }

    node = getLeafNode(getSiblingNode(node))
  }
}

export default getNodeForCharacterOffset
