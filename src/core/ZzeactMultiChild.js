const ZzeactMultiChildMixin = {
  mountMultiChild (children, transaction) {
    let accum = ''
    let index = 0
    for (let name in children) {
      const child = children[name]
      if (children.hasOwnProperty(name) && child) {
        // 拼接子组件
        accum += child.mountComponent(
          this._rootNodeID + '.' + name,
          transaction
        )
        child._domIndex = index
        index++
      }
    }
    this._renderedChildren = children // children are in just the right form!
    this.domOperations = null
    return accum
  },
  unmountMultiChild () {
    const renderedChildren = this._renderedChildren
    for (const name in renderedChildren) {
      if (renderedChildren.hasOwnProperty(name) && renderedChildren[name]) {
        const renderedChild = renderedChildren[name]
        renderedChild.unmountComponent && renderedChild.unmountComponent()
      }
    }
    this._renderedChildren = null
  },
}

const ZzeactMultiChild = {
  Mixin: ZzeactMultiChildMixin,
}

export default ZzeactMultiChild
