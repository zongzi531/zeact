import ZzeactCompositeComponent from './ZzeactCompositeComponent'
import ZzeactDOM from './ZzeactDOM'
import ZzeactEvent from './ZzeactEvent'
import EventConstants from '@/event/EventConstants'

const { form } = ZzeactDOM

const ZzeactDOMForm = ZzeactCompositeComponent.createClass({
  render () {
    // 对 from 的 props 参数进行相应的过滤
    // 详见 ZzeactPropTransferer
    return this.transferPropsTo(form(null, this.props.children))
  },

  componentDidMount (node) {
    // 对 form 进行单独的 submit 冒泡监听
    ZzeactEvent.trapBubbledEvent(
      EventConstants.topLevelTypes.topSubmit,
      'submit',
      node
    )
  },
})

export default ZzeactDOMForm
