import ZzeactCurrentOwner from './ZzeactCurrentOwner'
import ZzeactReconcileTransaction from './ZzeactReconcileTransaction'
import ZzeactMount from './ZzeactMount'
import keyMirror from '@/utils/keyMirror'
import invariant from '@/vendor/core/invariant'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import ZzeactOwner from './ZzeactOwner'

const OWNER = '{owner}'

const ComponentLifeCycle = keyMirror({
  MOUNTED: null,
  UNMOUNTED: null,
})

const ZzeactComponent = {
  LifeCycle: ComponentLifeCycle,
  ZzeactReconcileTransaction,
  // 这个方法暴露出来像是可以自己修改这个 ZzeactReconcileTransaction，但是这个方法并没有暴露给外界
  setZzeactReconcileTransaction: ZzeactReconcileTransaction => { ZzeactComponent.ZzeactReconcileTransaction = ZzeactReconcileTransaction },
  Mixin: {
    getDOMNode () {
      invariant(
        ExecutionEnvironment.canUseDOM,
        'getDOMNode(): The DOM is not supported in the current environment.'
      )
      invariant(
        this._lifeCycleState === ComponentLifeCycle.MOUNTED,
        'getDOMNode(): A component must be mounted to have a DOM node.'
      )
      var rootNode = this._rootNode
      if (!rootNode) {
        rootNode = document.getElementById(this._rootNodeID)
        if (!rootNode) {
          // TODO: Log the frequency that we reach this path.
          rootNode = ZzeactMount.findZzeactRenderedDOMNodeSlow(this._rootNodeID)
        }
        this._rootNode = rootNode
      }
      return rootNode
    },
    construct (initialProps, children) {
      // 这里没有使用函数默认参数时因为`initialProps`可能为`null`
      this.props = initialProps || {}
      if (typeof children !== 'undefined') {
        this.props.children = children
      }
      // 这在干啥？
      this.props[OWNER] = ZzeactCurrentOwner.current
      // **查看源码发现这里并没有写完，这个是由ReactCompositeComponentMixin下调起**
      // 会初始化state及生命周期
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED
    },
    mountComponent (rootID, transaction) {
      invariant(
        this._lifeCycleState === ComponentLifeCycle.UNMOUNTED,
        'mountComponent(%s, ...): Can only mount an unmounted component.',
        rootID
      )

      const props = this.props
      if (props.ref != null) {
        ZzeactOwner.addComponentAsRefTo(this, props.ref, props[OWNER])
      }

      this._rootNodeID = rootID
      this._lifeCycleState = ComponentLifeCycle.MOUNTED
    },
    mountComponentIntoNode (rootID, container) {
      // 调用 getPooled 方法，在 addPoolingTo 时未传入第二参数时，默认使用 oneArgumentPooler 方法
      // 在未传入参数，并且 length 判断为假时，直接调用 new 操作符 ZzeactReconcileTransaction
      const transaction = ZzeactComponent.ZzeactReconcileTransaction.getPooled()
      // 那么看起来在这里执行方法的时候，按照 SELECTION_RESTORATION =>
      // EVENT_SUPPRESSION => ON_DOM_READY_QUEUEING 的顺序进行 initialize，
      // 然后再执行 this._mountComponentIntoNode 方法，再依次 SELECTION_RESTORATION =>
      // EVENT_SUPPRESSION => ON_DOM_READY_QUEUEING 的顺序进行 close
      transaction.perform(
        this._mountComponentIntoNode,
        this,
        rootID,
        container,
        transaction
      )
      // 所以这一步在干嘛我没看懂，我能理解 destructor 掉，但是后面这个 push 我就不是很懂在做什么
      ZzeactComponent.ZzeactReconcileTransaction.release(transaction)
    },
    _mountComponentIntoNode (rootID, container, transaction) {
      const renderStart = Date.now()
      // 调用ZzeactCompositeComponentMixin的mountComponent方法，当然这里最终返回的就是标记文本了
      const markup = this.mountComponent(rootID, transaction)
      ZzeactMount.totalInstantiationTime += (Date.now() - renderStart)
      const injectionStart = Date.now()
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
      ZzeactMount.totalInjectionTime += (Date.now() - injectionStart)
    },
    unmountComponent () {
      invariant(
        this._lifeCycleState === ComponentLifeCycle.MOUNTED,
        'unmountComponent(): Can only unmount a mounted component.'
      )

      const props = this.props
      if (props.ref != null) {
        ZzeactOwner.removeComponentAsRefFrom(this, props.ref, props[OWNER])
      }

      this._rootNode = null
      this._rootNodeID = null
      this._lifeCycleState = ComponentLifeCycle.UNMOUNTED
    },
    unmountComponentFromNode (container) {
      this.unmountComponent()
      while (container.lastChild) {
        container.removeChild(container.lastChild)
      }
    },
    isOwnedBy (owner) {
      return this.props[OWNER] === owner
    },
  },
}

export default ZzeactComponent
