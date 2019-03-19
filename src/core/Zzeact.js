import ZzeactCompositeComponent from './ZzeactCompositeComponent'
import ZzeactMount from './ZzeactMount'
import ZzeactDOM from './ZzeactDOM'
import ZzeactDefaultInjection from './ZzeactDefaultInjection'

// 需要默认注入的内容
ZzeactDefaultInjection.inject()

export default {
  createClass: ZzeactCompositeComponent.createClass,
  renderComponent: ZzeactMount.renderComponent,
  DOM: ZzeactDOM,
  autoBind: ZzeactCompositeComponent.autoBind,
}
