import ZzeactComponent from './ZzeactComponent'

const shouldManageExisting = (curChild, newChild) => curChild && newChild && curChild.constructor === newChild.constructor

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
  processChildDOMOperationsQueue () {
    if (this.domOperations) {
      ZzeactComponent.DOMIDOperations
        .manageChildrenByParentID(this._rootNodeID, this.domOperations)
      this.domOperations = null
    }
  },
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
    for (const name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) { continue }
      const curChild = this._renderedChildren[name]
      const nextChild = nextChildren[name]
      if (shouldManageExisting(curChild, nextChild)) {
        if (markupBuffer) {
          this.enqueueMarkupAt(markupBuffer, loopDomIndex - numPendingInsert)
          markupBuffer = null
        }
        numPendingInsert = 0
        if (curChild._domIndex < curChildrenDOMIndex) { // (Comment 2)
          this.enqueueMove(curChild._domIndex, loopDomIndex)
        }
        curChildrenDOMIndex = Math.max(curChild._domIndex, curChildrenDOMIndex)
        !nextChild.props.isStatic &&
          curChild.receiveProps(nextChild.props, transaction)
        curChild._domIndex = loopDomIndex
      } else {
        if (curChild) { // !shouldUpdate && curChild => delete
          this.enqueueUnmountChildByName(name, curChild)
          curChildrenDOMIndex =
            Math.max(curChild._domIndex, curChildrenDOMIndex)
        }
        if (nextChild) { // !shouldUpdate && nextChild => insert
          this._renderedChildren[name] = nextChild
          const nextMarkup =
            nextChild.mountComponent(rootDomIdDot + name, transaction)
          markupBuffer = markupBuffer ? markupBuffer + nextMarkup : nextMarkup
          numPendingInsert++
          nextChild._domIndex = loopDomIndex
        }
      }
      loopDomIndex = nextChild ? loopDomIndex + 1 : loopDomIndex
    }
    if (markupBuffer) {
      this.enqueueMarkupAt(markupBuffer, loopDomIndex - numPendingInsert)
    }
    for (const childName in this._renderedChildren) { // from other direction
      if (!this._renderedChildren.hasOwnProperty(childName)) { continue }
      const child = this._renderedChildren[childName]
      if (child && !nextChildren[childName]) {
        this.enqueueUnmountChildByName(childName, child)
      }
    }
    this.processChildDOMOperationsQueue()
  },
}

const ZzeactMultiChild = {
  Mixin: ZzeactMultiChildMixin,
}

export default ZzeactMultiChild
