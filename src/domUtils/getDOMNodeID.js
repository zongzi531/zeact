const getDOMNodeID = domNode => {
  if (domNode.getAttributeNode) {
    const attributeNode = domNode.getAttributeNode('id')
    return (attributeNode && attributeNode.value) || ''
  } else {
    return domNode.id || ''
  }
}

export default getDOMNodeID
