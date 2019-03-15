const ZzeactComponent = {
  Mixin: {
    construct (initialProps, children) {
      // 这里没有使用函数默认参数时因为`initialProps`可能为`null`
      this.props = initialProps || {}
      this.props.children = children
      // **查看源码发现这里并没有写完，这个是由ReactCompositeComponentMixin下调起**
      // 会初始化state及生命周期
    },
    mountComponent (rootID) {
      this._rootNodeID = rootID
    },
    mountComponentIntoNode (rootID, container) {
      this._mountComponentIntoNode(rootID, container)
    },
    _mountComponentIntoNode (rootID, container) {
      // 调用ZzeactCompositeComponentMixin的mountComponent方法，当然这里最终返回的就是标记文本了
      const markup = this.mountComponent(rootID)
      const parent = container.parentNode
      if (parent) {
        const next = container.nextSibling
        parent.removeChild(container)
        container.innerHTML = markup
        if (next) {
          parent.insertBefore(container, next)
        } else {
          parent.appendChild(container)
        }
      } else {
        container.innerHTML = markup
      }
    },
  },
}

export default ZzeactComponent
