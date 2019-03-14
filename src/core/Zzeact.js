import ZzeactCompositeComponent from './ZzeactCompositeComponent'
import ZzeactMount from './ZzeactMount'
import ZzeactDOM from './ZzeactDOM'

export default {
  createClass: ZzeactCompositeComponent.createClass,
  renderComponent: ZzeactMount.renderComponent,
  DOM: ZzeactDOM,
}
