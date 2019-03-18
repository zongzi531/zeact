import invariant from '@/vendor/core/invariant'
import ZzeactComponent from './ZzeactComponent'
import ZzeactCurrentOwner from './ZzeactCurrentOwner'

const ZzeactCompositeComponentMixin = {
  mountComponent (rootID, transaction) {
    ZzeactComponent.Mixin.mountComponent.call(this, rootID, transaction)
    this._renderedComponent = this._renderValidatedComponent()
    // 在这里调用的是，ZzeactNativeComponent.Mixin的mountComponent方法
    return this._renderedComponent.mountComponent(rootID, transaction)
  },
  _renderValidatedComponent () {
    // ZzeactCurrentOwner.current 这一步赋值我不是很理解
    ZzeactCurrentOwner.current = this
    const renderedComponent = this.render()
    ZzeactCurrentOwner.current = null
    return renderedComponent
  },
}

class ZzeactCompositeComponentBase {}
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactComponent.Mixin)
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactCompositeComponentMixin)

const ZzeactCompositeComponent = {
  /**
   * 类似于 16.x 版本中的 `React.Component` 方法
   * @param {*} props
   */
  createClass: (spec = {}) => {
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
    Object.assign(Constructor.prototype, spec)

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
}

export default ZzeactCompositeComponent
