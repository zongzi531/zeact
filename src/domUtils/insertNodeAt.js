const insertNodeAt = (root, node, atIndex) => {
  const childNodes = root.childNodes
  // Remove from parent so that if node is already child of root,
  // `childNodes[atIndex]` already takes into account the removal.
  const curAtIndex = root.childNodes[atIndex]
  if (curAtIndex === node) {
    return node
  }
  if (node.parentNode) {
    node.parentNode.removeChild(node)
  }
  if (atIndex >= childNodes.length) {
    root.appendChild(node)
  } else {
    root.insertBefore(node, childNodes[atIndex])
  }
  return node
}

export default insertNodeAt
