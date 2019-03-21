import invariant from '@/vendor/core/invariant'
import ZzeactComponent from './ZzeactComponent'
import ZzeactCurrentOwner from './ZzeactCurrentOwner'
import merge from '@/utils/merge'
import keyMirror from '@/utils/keyMirror'
import ZzeactPropTransferer from './ZzeactPropTransferer'
import ZzeactOwner from './ZzeactOwner'

const SpecPolicy = keyMirror({
  DEFINE_ONCE: null,
  DEFINE_MANY: null,
  OVERRIDE_BASE: null,
})

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

const RESERVED_SPEC_KEYS = {
  displayName (Constructor, displayName) {
    Constructor.displayName = displayName
  },
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
      RESERVED_SPEC_KEYS[name](Constructor, property)
    } else if (property && property.__zzeactAutoBind) {
      if (!proto.__zzeactAutoBindMap) {
        proto.__zzeactAutoBindMap = {}
      }
      proto.__zzeactAutoBindMap[name] = property.__zzeactAutoBind
    } else if (proto.hasOwnProperty(name)) {
      // For methods which are defined more than once, call the existing methods
      // before calling the new property.
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

    this._lifeCycleState = ZzeactComponent.LifeCycle.UNMOUNTED
    this._compositeLifeCycleState = CompositeLifeCycle.MOUNTING

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
      transaction.getZzeactOnDOMReady().enqueue(this, this.componentDidMount)
    }

    this._renderedComponent = this._renderValidatedComponent()

    this._compositeLifeCycleState = null
    this._lifeCycleState = ZzeactComponent.LifeCycle.MOUNTED
    // 在这里调用的是，ZzeactNativeComponent.Mixin的mountComponent方法
    return this._renderedComponent.mountComponent(rootID, transaction)
  },
  unmountComponent () {
    this._compositeLifeCycleState = CompositeLifeCycle.UNMOUNTING

    if (this.componentWillUnmount) {
      this.componentWillUnmount()
    }

    this._compositeLifeCycleState = null

    ZzeactComponent.Mixin.unmountComponent.call(this)

    this._renderedComponent.unmountComponent()
    this._renderedComponent = null

    if (this.refs) {
      this.refs = null
    }
  },
  _renderValidatedComponent () {
    // ZzeactCurrentOwner.current 这一步赋值我不是很理解
    ZzeactCurrentOwner.current = this
    const renderedComponent = this.render()
    ZzeactCurrentOwner.current = null
    return renderedComponent
  },
  _bindAutoBindMethods () {
    for (const autoBindKey in this.__zzeactAutoBindMap) {
      if (!this.__zzeactAutoBindMap.hasOwnProperty(autoBindKey)) {
        continue
      }
      const method = this.__zzeactAutoBindMap[autoBindKey]
      this[autoBindKey] = this._bindAutoBindMethod(method)
    }
  },
  _bindAutoBindMethod (method) {
    const component = this
    let hasWarned = false
    function autoBound (a, b, c, d, e, tooMany) {
      invariant(
        typeof tooMany === 'undefined',
        'React.autoBind(...): Methods can only take a maximum of 5 arguments.'
      )
      if (component._lifeCycleState === ZzeactComponent.LifeCycle.MOUNTED) {
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
    this.replaceState(merge(this._pendingState || this.state, partialState))
  },
}

class ZzeactCompositeComponentBase {}
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactOwner.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactPropTransferer.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactCompositeComponentMixin)

const ZzeactCompositeComponent = {
  /**
   * 类似于 16.x 版本中的 `React.Component` 方法
   * @param {*} props
   */
  createClass (spec = {}) {
    invariant(
      spec.render,
      'createClass(...): Class specification must implement a `render` method.'
    )

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
    // autoBind 这个方法在做些什么事情，暂时还没理解
    unbound.__zzeactAutoBind = method
    return unbound
  },
}

export default ZzeactCompositeComponent
