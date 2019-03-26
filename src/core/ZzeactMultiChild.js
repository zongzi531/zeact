import ZzeactComponent from './ZzeactComponent'

const shouldManageExisting = (curChild, newChild) => curChild && newChild && curChild.constructor === newChild.constructor

// 这里的 insertMarkup ， moveFrom， removeAt
// 请查看 DOMChildrenOperations.js
// 这里相当于将要做的事插入队列
const ZzeactMultiChildMixin = {
  enqueueMarkupAt (markup, insertAt) {
    this.domOperations = this.domOperations || []
    this.domOperations.push({ insertMarkup: markup, finalIndex: insertAt })
  },
  enqueueMove (originalIndex, finalIndex) {
    this.domOperations = this.domOperations || []
    this.domOperations.push({ moveFrom: originalIndex, finalIndex: finalIndex })
  },
  enqueueUnmountChildByName (name, removeChild) {
    if (ZzeactComponent.isValidComponent(removeChild)) {
      this.domOperations = this.domOperations || []
      this.domOperations.push({ removeAt: removeChild._domIndex })
      removeChild.unmountComponent && removeChild.unmountComponent()
      delete this._renderedChildren[name]
    }
  },
  // 执行这个 domOperations 队列
  processChildDOMOperationsQueue () {
    if (this.domOperations) {
      ZzeactComponent.DOMIDOperations
        .manageChildrenByParentID(this._rootNodeID, this.domOperations)
      this.domOperations = null
    }
  },
  // 挂载多子节点
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
    // 缓存使用
    this._renderedChildren = children // children are in just the right form!
    this.domOperations = null
    return accum
  },
  // 卸载多子节点
  unmountMultiChild () {
    // 取出缓存，一一卸载
    const renderedChildren = this._renderedChildren
    for (const name in renderedChildren) {
      if (renderedChildren.hasOwnProperty(name) && renderedChildren[name]) {
        const renderedChild = renderedChildren[name]
        renderedChild.unmountComponent && renderedChild.unmountComponent()
      }
    }
    this._renderedChildren = null
  },
  // 更新多子节点
  updateMultiChild (nextChildren, transaction) {
    if (!nextChildren && !this._renderedChildren) {
      return
    } else if (nextChildren && !this._renderedChildren) {
      this._renderedChildren = {} // lazily allocate backing store with nothing
    } else if (!nextChildren && this._renderedChildren) {
      nextChildren = {}
    }
    const rootDomIdDot = this._rootNodeID + '.'
    let markupBuffer = null // Accumulate adjacent new children markup.
    let numPendingInsert = 0 // How many root nodes are waiting in markupBuffer
    let loopDomIndex = 0 // Index of loop through new children.
    let curChildrenDOMIndex = 0 // See (Comment 1)
    // 遍历新节点
    for (const name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) { continue }
      // 获取对应的新节点和旧节点
      const curChild = this._renderedChildren[name]
      const nextChild = nextChildren[name]
      // 新节点和旧节点是不是同一个
      if (shouldManageExisting(curChild, nextChild)) {
        // 这里开始就是 insertMarkup ， moveFrom， removeAt 的操作
        if (markupBuffer) {
          // insertMarkup
          this.enqueueMarkupAt(markupBuffer, loopDomIndex - numPendingInsert)
          markupBuffer = null
        }
        numPendingInsert = 0
        if (curChild._domIndex < curChildrenDOMIndex) { // (Comment 2)
          // moveFrom
          this.enqueueMove(curChild._domIndex, loopDomIndex)
        }
        curChildrenDOMIndex = Math.max(curChild._domIndex, curChildrenDOMIndex)
        !nextChild.props.isStatic &&
          curChild.receiveProps(nextChild.props, transaction)
        curChild._domIndex = loopDomIndex
      } else {
        if (curChild) { // !shouldUpdate && curChild => delete
          // removeAt
          this.enqueueUnmountChildByName(name, curChild)
          curChildrenDOMIndex =
            Math.max(curChild._domIndex, curChildrenDOMIndex)
        }
        if (nextChild) { // !shouldUpdate && nextChild => insert
          this._renderedChildren[name] = nextChild
          // 新的挂载节点 markup
          const nextMarkup =
            nextChild.mountComponent(rootDomIdDot + name, transaction)
          markupBuffer = markupBuffer ? markupBuffer + nextMarkup : nextMarkup
          numPendingInsert++
          nextChild._domIndex = loopDomIndex
        }
      }
      loopDomIndex = nextChild ? loopDomIndex + 1 : loopDomIndex
    }
    // 最后的 insertMarkup
    if (markupBuffer) {
      this.enqueueMarkupAt(markupBuffer, loopDomIndex - numPendingInsert)
    }
    for (const childName in this._renderedChildren) { // from other direction
      if (!this._renderedChildren.hasOwnProperty(childName)) { continue }
      const child = this._renderedChildren[childName]
      if (child && !nextChildren[childName]) {
        // 移除掉本来的节点
        this.enqueueUnmountChildByName(childName, child)
      }
    }
    // 执行这个队列
    this.processChildDOMOperationsQueue()
  },
}

const ZzeactMultiChild = {
  Mixin: ZzeactMultiChildMixin,
}

export default ZzeactMultiChild
