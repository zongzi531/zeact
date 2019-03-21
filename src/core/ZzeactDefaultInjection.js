import EventPluginHub from '@/event/EventPluginHub'
import DefaultEventPluginOrder from '@/eventPlugins/DefaultEventPluginOrder'
import ZzeactInstanceHandles from './ZzeactInstanceHandles'
import SimpleEventPlugin from '@/eventPlugins/SimpleEventPlugin'
import EnterLeaveEventPlugin from '@/eventPlugins/EnterLeaveEventPlugin'
import ZzeactDOMForm from './ZzeactDOMForm'
import ZzeactDOM from './ZzeactDOM'

export default {
  inject () {
    // 默认注入内容
    // 以下三项均为事件
    EventPluginHub.injection.injectEventPluginOrder(DefaultEventPluginOrder)
    EventPluginHub.injection.injectInstanceHandle(ZzeactInstanceHandles)

    EventPluginHub.injection.injectEventPluginsByName({
      'SimpleEventPlugin': SimpleEventPlugin,
      'EnterLeaveEventPlugin': EnterLeaveEventPlugin,
    })

    ZzeactDOM.injection.injectComponentClasses({
      form: ZzeactDOMForm,
    })
  },
}
