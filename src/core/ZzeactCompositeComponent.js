import invariant from '@/vendor/core/invariant'
import ZzeactComponent from './ZzeactComponent'
import ZzeactCurrentOwner from './ZzeactCurrentOwner'
import merge from '@/utils/merge'
import keyMirror from '@/utils/keyMirror'
import ZzeactPropTransferer from './ZzeactPropTransferer'
import ZzeactOwner from './ZzeactOwner'

// 对 interface 的限制
const SpecPolicy = keyMirror({
  DEFINE_ONCE: null,
  DEFINE_MANY: null,
  OVERRIDE_BASE: null,
})

// interface 在 mixinto 中会使用到，进行对应判断
const ZzeactCompositeComponentInterface = {
  mixins: SpecPolicy.DEFINE_MANY,
  props: SpecPolicy.DEFINE_ONCE,
  getInitialState: SpecPolicy.DEFINE_ONCE,
  render: SpecPolicy.DEFINE_ONCE,
  componentWillMount: SpecPolicy.DEFINE_MANY,
  componentDidMount: SpecPolicy.DEFINE_MANY,
  componentWillReceiveProps: SpecPolicy.DEFINE_MANY,
  shouldComponentUpdate: SpecPolicy.DEFINE_ONCE,
  componentWillUpdate: SpecPolicy.DEFINE_MANY,
  componentDidUpdate: SpecPolicy.DEFINE_MANY,
  componentWillUnmount: SpecPolicy.DEFINE_MANY,
  updateComponent: SpecPolicy.OVERRIDE_BASE,
}

// 对以下 key 进行的特殊操作
const RESERVED_SPEC_KEYS = {
  displayName (Constructor, displayName) {
    Constructor.displayName = displayName
  },
  // mixins 方法
  mixins (Constructor, mixins) {
    if (mixins) {
      for (let i = 0; i < mixins.length; i++) {
        mixSpecIntoComponent(Constructor, mixins[i])
      }
    }
  },
  props (Constructor, props) {
    Constructor.propDeclarations = props
  },
}

const mixSpecIntoComponent = (Constructor, spec) => {
  const proto = Constructor.prototype
  for (const name in spec) {
    if (!spec.hasOwnProperty(name)) {
      continue
    }
    const property = spec[name]
    const specPolicy = ZzeactCompositeComponentInterface[name]

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ZzeactCompositeComponentMixin.hasOwnProperty(name)) {
      invariant(
        specPolicy === SpecPolicy.OVERRIDE_BASE,
        'ReactCompositeComponentInterface: You are attempting to override ' +
        '`%s` from your class specification. Ensure that your method names ' +
        'do not overlap with React methods.',
        name
      )
    }

    // Disallow using `React.autoBind` on internal methods.
    if (specPolicy != null) {
      invariant(
        !property || !property.__zzeactAutoBind,
        'ReactCompositeComponentInterface: You are attempting to use ' +
        '`React.autoBind` on `%s`, a method that is internal to React.' +
        'Internal methods are called with the component as the context.',
        name
      )
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (proto.hasOwnProperty(name)) {
      invariant(
        specPolicy === SpecPolicy.DEFINE_MANY,
        'ReactCompositeComponentInterface: You are attempting to define ' +
        '`%s` on your component more than once. This conflict may be due ' +
        'to a mixin.',
        name
      )
    }

    if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
      // RESERVED_SPEC_KEYS 对应的方法执行
      RESERVED_SPEC_KEYS[name](Constructor, property)
    } else if (property && property.__zzeactAutoBind) {
      // 使用了 autobind 的情况
      if (!proto.__zzeactAutoBindMap) {
        proto.__zzeactAutoBindMap = {}
      }
      // 将对应的方法进行保存
      proto.__zzeactAutoBindMap[name] = property.__zzeactAutoBind
    } else if (proto.hasOwnProperty(name)) {
      // For methods which are defined more than once, call the existing methods
      // before calling the new property.
      // 若被调用时 a b 方法都进行执行
      proto[name] = createChainedFunction(proto[name], property)
    } else {
      proto[name] = property
    }
  }
}

const createChainedFunction = (one, two) => {
  return function chainedFunction (a, b, c, d, e, tooMany) {
    invariant(
      typeof tooMany === 'undefined',
      'Chained function can only take a maximum of 5 arguments.'
    )
    one.call(this, a, b, c, d, e)
    two.call(this, a, b, c, d, e)
  }
}

// 生命周期
// 挂载中，卸载中，更新 props 中，更新 state 中
const CompositeLifeCycle = keyMirror({
  MOUNTING: null,
  UNMOUNTING: null,
  RECEIVING_PROPS: null,
  RECEIVING_STATE: null,
})

const ZzeactCompositeComponentMixin = {
  construct (initialProps, children) {
    // 创建时先调用 ZzeactCompositeComponentMixin.construct
    // 再调用 ZzeactComponent.Mixin.construct
    // 在此初始化 state 和 _pendingState
    ZzeactComponent.Mixin.construct.call(this, initialProps, children)
    this.state = null
    this._pendingState = null
    this._compositeLifeCycleState = null
  },
  mountComponent (rootID, transaction) {
    ZzeactComponent.Mixin.mountComponent.call(this, rootID, transaction)

    // 此时 _lifeCycleState 为 未挂载， _compositeLifeCycleState 为挂载中
    this._lifeCycleState = ZzeactComponent.LifeCycle.UNMOUNTED
    this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING

    if (this.constructor.propDeclarations) {
      this._assertValidProps(this.props)
    }

    // autobind 存在的情况下执行绑定 this
    if (this.__zzeactAutoBindMap) {
      this._bindAutoBindMethods()
    }

    // 挂载组件时，通过 getInitialState 方法获取 state
    this.state = this.getInitialState ? this.getInitialState() : null
    this._pendingState = null

    // 生命周期相关
    if (this.componentWillMount) {
      this.componentWillMount()
      if (this._pendingState) {
        this.state = this._pendingState
        this._pendingState = null
      }
    }

    // 生命周期相关
    if (this.componentDidMount) {
      // 这个是事务先关的，将 componentDidMount 方法按顺序加入事务，在 transaction
      // close 环节进行依次执行
      transaction.getZzeactOnDOMReady().enqueue(this, this.componentDidMount)
    }

    // 返回一个 rendered 的组件
    this._renderedComponent = this._renderValidatedComponent()

    // 组件状态为已挂载， _compositeLifeCycleState 为 null
    this._compositeLifeCycleState = null
    this._lifeCycleState = ZzeactComponent.LifeCycle.MOUNTED
    // 在这里调用的是，ZzeactNativeComponent.Mixin的mountComponent方法
    return this._renderedComponent.mountComponent(rootID, transaction)
  },
  unmountComponent () {
    // _compositeLifeCycleState 为卸载中
    this._compositeLifeCycleState = CompositeLifeCycle.UNMOUNTING

    if (this.componentWillUnmount) {
      // 执行 componentWillUnmount
      this.componentWillUnmount()
    }

    // 释放 _compositeLifeCycleState 状态
    this._compositeLifeCycleState = null

    // 执行 ZzeactComponent 下的 unmountComponent 的方法
    ZzeactComponent.Mixin.unmountComponent.call(this)

    // 调用 rendered 组件的 unmountComponent 方法
    this._renderedComponent.unmountComponent()
    // 最后释放 _renderedComponent
    this._renderedComponent = null

    if (this.refs) {
      // 释放 refs
      this.refs = null
    }
  },
  _renderValidatedComponent () {
    // ZzeactCurrentOwner.current 这一步赋值我不是很理解
    ZzeactCurrentOwner.current = this
    // 返回 rendered 组件
    const renderedComponent = this.render()
    ZzeactCurrentOwner.current = null
    invariant(
      ZzeactComponent.isValidComponent(renderedComponent),
      '%s.render(): A valid ReactComponent must be returned.',
      this.constructor.displayName || 'ReactCompositeComponent'
    )
    return renderedComponent
  },
  _bindAutoBindMethods () {
    // 遍历 __zzeactAutoBindMap
    for (const autoBindKey in this.__zzeactAutoBindMap) {
      if (!this.__zzeactAutoBindMap.hasOwnProperty(autoBindKey)) {
        continue
      }
      // 取出对应方法
      const method = this.__zzeactAutoBindMap[autoBindKey]
      // 当前组件对应方法重新赋值 this._bindAutoBindMethod(method) 执行结果
      this[autoBindKey] = this._bindAutoBindMethod(method)
    }
  },
  _bindAutoBindMethod (method) {
    // 获取当前 this
    const component = this
    let hasWarned = false
    function autoBound (a, b, c, d, e, tooMany) {
      invariant(
        typeof tooMany === 'undefined',
        'React.autoBind(...): Methods can only take a maximum of 5 arguments.'
      )
      if (component._lifeCycleState === ZzeactComponent.LifeCycle.MOUNTED) {
        // 若组件生命周期为已挂载 并且参数没有超过 5 个执行方法
        return method.call(component, a, b, c, d, e)
      } else if (!hasWarned) {
        // 这是在干嘛？
        hasWarned = true
      }
    }
    return autoBound
  },
  setState (partialState) {
    // setState 方法内部，相关方法还没写
    // 现在对 _pendingState 有些不是很理解，不知道他存在的意义
    // 更新 state
    this.replaceState(merge(this._pendingState || this.state, partialState))
  },
  replaceState (completeState) {
    // 接受一个已经被 merge 的 state
    const compositeLifeCycleState = this._compositeLifeCycleState
    // 判断生命周期
    invariant(
      this._lifeCycleState === ZzeactComponent.LifeCycle.MOUNTED ||
      compositeLifeCycleState === CompositeLifeCycle.MOUNTING,
      'replaceState(...): Can only update a mounted (or mounting) component.'
    )
    invariant(
      compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_STATE &&
      compositeLifeCycleState !== CompositeLifeCycle.UNMOUNTING,
      'replaceState(...): Cannot update while unmounting component or during ' +
      'an existing state transition (such as within `render`).'
    )

    // 赋值 _pendingState
    this._pendingState = completeState

    // Do not trigger a state transition if we are in the middle of mounting or
    // receiving props because both of those will already be doing this.
    if (compositeLifeCycleState !== CompositeLifeCycle.MOUNTING &&
      compositeLifeCycleState !== CompositeLifeCycle.RECEIVING_PROPS) {
      this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_STATE

      const nextState = this._pendingState
      this._pendingState = null

      const transaction = ZzeactComponent.ZzeactReconcileTransaction.getPooled()
      // 执行 _receivePropsAndState 方法
      transaction.perform(
        this._receivePropsAndState,
        this,
        this.props,
        nextState,
        transaction
      )
      ZzeactComponent.ZzeactReconcileTransaction.release(transaction)

      // 结束周期
      this._compositeLifeCycleState = null
    }
  },
  _receivePropsAndState (nextProps, nextState, transaction) {
    // 同样是生命周期方法 shouldComponentUpdate
    if (!this.shouldComponentUpdate ||
      this.shouldComponentUpdate(nextProps, nextState)) {
      // Will set `this.props` and `this.state`.
      // 执行对应的方法
      this._performComponentUpdate(nextProps, nextState, transaction)
    } else {
      // If it's determined that a component should not update, we still want
      // to set props and state.
      this.props = nextProps
      this.state = nextState
    }
  },
  _performComponentUpdate (nextProps, nextState, transaction) {
    const prevProps = this.props
    const prevState = this.state

    if (this.componentWillUpdate) {
      // 执行生命周期 componentWillUpdate
      this.componentWillUpdate(nextProps, nextState, transaction)
    }

    this.props = nextProps
    this.state = nextState

    // 更新组件
    this.updateComponent(transaction)

    if (this.componentDidUpdate) {
      // 生命周期方法 componentDidUpdate 被加入队列
      transaction.getZzeactOnDOMReady().enqueue(
        this,
        this.componentDidUpdate.bind(this, prevProps, prevState)
      )
    }
  },
  updateComponent (transaction) {
    // 当前 rendered 组件
    const currentComponent = this._renderedComponent
    // 新的 rendered 组件
    const nextComponent = this._renderValidatedComponent()
    // 比较
    if (currentComponent.constructor === nextComponent.constructor) {
      if (!nextComponent.props.isStatic) {
        currentComponent.receiveProps(nextComponent.props, transaction)
      }
    } else {
      // These two IDs are actually the same! But nothing should rely on that.
      const thisID = this._rootNodeID
      const currentComponentID = currentComponent._rootNodeID
      // 卸载当前 rendered 组件
      currentComponent.unmountComponent()
      // 挂载新的 rendered 组件
      const nextMarkup = nextComponent.mountComponent(thisID, transaction)
      // 这一步在替换一些标记吧
      ZzeactComponent.DOMIDOperations.dangerouslyReplaceNodeWithMarkupByID(
        currentComponentID,
        nextMarkup
      )
      // 更新为新的 rendered 组件
      this._renderedComponent = nextComponent
    }
  },
  // 通更新 state 逻辑类似
  receiveProps (nextProps, transaction) {
    if (this.constructor.propDeclarations) {
      this._assertValidProps(nextProps)
    }
    ZzeactComponent.Mixin.receiveProps.call(this, nextProps, transaction)

    this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_PROPS
    if (this.componentWillReceiveProps) {
      this.componentWillReceiveProps(nextProps, transaction)
    }
    this._compositeLifeCycleState = CompositeLifeCycle.RECEIVING_STATE
    // When receiving props, calls to `setState` by `componentWillReceiveProps`
    // will set `this._pendingState` without triggering a re-render.
    const nextState = this._pendingState || this.state
    this._pendingState = null
    this._receivePropsAndState(nextProps, nextState, transaction)
    this._compositeLifeCycleState = null
  },
  forceUpdate () {
    const transaction = ZzeactComponent.ZzeactReconcileTransaction.getPooled()
    transaction.perform(
      this._performComponentUpdate,
      this,
      this.props,
      this.state,
      transaction
    )
    ZzeactComponent.ZzeactReconcileTransaction.release(transaction)
  },
  _assertValidProps (props) {
    const propDeclarations = this.constructor.propDeclarations
    const componentName = this.constructor.displayName
    for (const propName in propDeclarations) {
      const checkProp = propDeclarations[propName]
      if (checkProp) {
        checkProp(props, propName, componentName)
      }
    }
  },
}

class ZzeactCompositeComponentBase {}
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactOwner.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactPropTransferer.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactCompositeComponentMixin)

const ZzeactCompositeComponent = {
  LifeCycle: CompositeLifeCycle,
  Base: ZzeactCompositeComponentBase,
  /**
   * 类似于 16.x 版本中的 `React.Component` 方法
   * @param {*} props
   */
  createClass (spec) {
    class Constructor {
      constructor (initialProps, children) {
        // 当createClass方法返回的函数被再次调用时，也调用这个方法
        // 例如：挂在到DOM节点上
        // Zzeact.renderComponent(
        //   *ConvenienceConstructor()*,
        //   document.getElementById('container')
        // )
        this.construct(initialProps, children)
      }
    }

    /**
     * 源码`mixSpecIntoComponent`和`mixInto`，这里使用`Object.assign`代替
     * 直接对`prototype`进行赋值不能使用 **`Object.setPrototypeOf`** 代替，
     * 因为其修改的是 **`Object.prototype.__proto__`**
     * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
     */
    Constructor.prototype = new ZzeactCompositeComponentBase()
    Constructor.prototype.constructor = Constructor
    mixSpecIntoComponent(Constructor, spec)

    invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    )

    /**
     * 这里之所以没有使用 `class` 代替，是因为在后面调用时候省略 `new` 操作符
     * @param {*} props
     * @param {*} children
     */
    const ConvenienceConstructor = (props, children) => new Constructor(props, children)

    ConvenienceConstructor.componentConstructor = Constructor
    ConvenienceConstructor.originalSpec = spec

    return ConvenienceConstructor
  },

  /**
   * Marks the provided method to be automatically bound to the component.
   * This means the method's context will always be the component.
   *
   *   React.createClass({
   *     handleClick: React.autoBind(function() {
   *       this.setState({jumping: true});
   *     }),
   *     render: function() {
   *       return <a onClick={this.handleClick}>Jump</a>;
   *     }
   *   });
   *
   * @param {function} method Method to be bound.
   * @public
   */
  autoBind (method) {
    const unbound = function () {
      invariant(
        false,
        'React.autoBind(...): Attempted to invoke an auto-bound method that ' +
        'was not correctly defined on the class specification.'
      )
    }
    // 用于 mixinto 时判断
    unbound.__zzeactAutoBind = method
    return unbound
  },
}

export default ZzeactCompositeComponent
