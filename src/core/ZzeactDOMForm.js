// sumbit event not be solved
import ZzeactCompositeComponent from './ZzeactCompositeComponent'
import ZzeactDOM from './ZzeactDOM'
import ZzeactEvent from './ZzeactEvent'
import EventConstants from '../event/EventConstants'

const { form } = ZzeactDOM

const ZzeactDOMForm = ZzeactCompositeComponent.createClass({
  render () {
    return this.transferPropsTo(form(null, this.props.children))
  },

  componentDidMount (node) {
    ZzeactEvent.trapBubbledEvent(
      EventConstants.topLevelTypes.topSubmit,
      'submit',
      node
    )
  },
})

export default ZzeactDOMForm
