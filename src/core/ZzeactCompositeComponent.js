import invariant from '@/vendor/invariant'
import ZzeactComponent from './ZzeactComponent'

class ZzeactCompositeComponentBase {}
Object.assign(ZzeactCompositeComponentBase.prototype, ZzeactComponent.Mixin)

const ZzeactCompositeComponent = {
  /**
   * 类似于 16.x 版本中的 `React.Component` 方法
   * @param {*} props
   */
  createClass: (spec = {}) => {
    class Constructor {
      constructor(initialProps, children) {
        this.initialProps = initialProps
        this.children = children
      }
    }

    /**
     * 源码这个位置使用的是 `mixSpecIntoComponent` 方法，
     * 在上方合并 `CompositeComponentBase` 时使用的 `mixInto` 方法，
     * 这些方法功能有所雷同在关于为类添加 `prototype` 属性时，
     * 这里使用 `Object.assign` 方法来实现，覆盖 `prototype` 属性则使用 `Object.setPrototypeOf` 来实现
     */
    Object.setPrototypeOf(Constructor.prototype, Object.getPrototypeOf(new ZzeactCompositeComponentBase()))
    Object.assign(Constructor.prototype, { constructor: Constructor }, spec)

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
  }
}

export default ZzeactCompositeComponent
