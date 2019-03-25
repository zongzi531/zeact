import ZzeactCompositeComponent from './ZzeactCompositeComponent'
import ZzeactMount from './ZzeactMount'
import ZzeactDOM from './ZzeactDOM'
import ZzeactDefaultInjection from './ZzeactDefaultInjection'
import ZzeactComponent from './ZzeactComponent'

// 需要默认注入的内容
ZzeactDefaultInjection.inject()

export default {
  // 定义组件
  createClass: ZzeactCompositeComponent.createClass,
  // 渲染组件
  renderComponent: ZzeactMount.renderComponent,
  // 卸载组件
  unmountAndReleaseZzeactRootNode: ZzeactMount.unmountAndReleaseZzeactRootNode,
  // 使用函数式写法需要使用到的对象，以及 jsx 转换目标
  DOM: ZzeactDOM,
  // 用于绑定 on- 系列事件方法的 this 指向
  autoBind: ZzeactCompositeComponent.autoBind,
  // 用于修改 ZzeactMount.useTouchEvents 的方法
  // 开启 touch 事件专用，建议提前设置为 true
  // 默认是关闭的
  initializeTouchEvents (shouldUseTouch) {
    ZzeactMount.useTouchEvents = shouldUseTouch
  },
  // 另外的渲染方法，相关的示例参考 basic
  createComponentRenderer: ZzeactMount.createComponentRenderer,
  // 区别于 renderComponent 的另一种渲染组件的方法，使用方法不同罢了
  constructAndRenderComponent: ZzeactMount.constructAndRenderComponent,
  // constructAndRenderComponent 方法的高级封装
  constructAndRenderComponentByID: ZzeactMount.constructAndRenderComponentByID,
  // 验证 Zzeact 组件，相关的示例参考 basic-jsx-bind
  isValidComponent: ZzeactComponent.isValidComponent,
}
