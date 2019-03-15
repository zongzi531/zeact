const ZzeactInstanceHandles = {
  getZzeactRootID: mountPointCount => `.zzeactRoot[${mountPointCount}]`,
  getZzeactRootIDFromNodeID: id => {
    const regexResult = /\.zzeactRoot\[[^\]]+\]/.exec(id)
    return regexResult && regexResult[0]
  },
}

export default ZzeactInstanceHandles
