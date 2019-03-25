const _getNodeID = node => {
  // #document and #document-fragment do not have getAttributeNode.
  const id = node.getAttributeNode && node.getAttributeNode('id')
  return id ? id.value : null
}

const _geFromSubtree = (id, root, tag) => {
  let elem, children, ii

  if (_getNodeID(root) == id) {
    return root
  } else if (root.getElementsByTagName) {
    // All Elements implement this, which does an iterative DFS, which is
    // faster than recursion and doesn't run into stack depth issues.
    children = root.getElementsByTagName(tag || '*')
    for (ii = 0; ii < children.length; ii++) {
      if (_getNodeID(children[ii]) == id) {
        return children[ii]
      }
    }
  } else {
    // DocumentFragment does not implement getElementsByTagName, so
    // recurse over its children. Its children must be Elements, so
    // each child will use the getElementsByTagName case instead.
    children = root.childNodes
    for (ii = 0; ii < children.length; ii++) {
      elem = _geFromSubtree(id, children[ii])
      if (elem) {
        return elem
      }
    }
  }

  return null
}

const ge = (arg, root, tag) => typeof arg !== 'string' ? arg
  : !root ? document.getElementById(arg)
    : _geFromSubtree(arg, root, tag)

export default ge
