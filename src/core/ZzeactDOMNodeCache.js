import ZzeactMount from './ZzeactMount'

let nodeCache = {}

export default {
  purgeEntireCache () {
    nodeCache = {}
    return nodeCache
  },
  getCachedNodeByID (id) {
    return nodeCache[id] ||
      (nodeCache[id] =
        document.getElementById(id) ||
        ZzeactMount.findZzeactRenderedDOMNodeSlow(id))
  },
}
