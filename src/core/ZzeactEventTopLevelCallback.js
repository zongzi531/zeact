import ZzeactInstanceHandles from './ZzeactInstanceHandles'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import getDOMNodeID from '@/domUtils/getDOMNodeID'
import ZzeactEvent from './ZzeactEvent'

let _topLevelListenersEnabled = true

const ZzeactEventTopLevelCallback = {
  setEnabled (enabled) {
    _topLevelListenersEnabled = !!enabled
  },
  isEnabled () {
    return _topLevelListenersEnabled
  },
  createTopLevelCallback (topLevelType) {
    // 这里是一开始注册好的对应的事件
    return function (fixedNativeEvent) {
      // 这里是注册的事件被触发后的回调，因为是挂载在 window 上，所以是最顶级的
      // 通过 target 来获取当前事件发生的具体元素，并且获取到第一个 Zzeact DOM
      // 也就是最外层的 Zzeact DOM 并且获取其 id
      // 最后调用 handleTopLevel
      if (!_topLevelListenersEnabled) {
        return
      }
      const renderedTarget = ZzeactInstanceHandles.getFirstZzeactDOM(fixedNativeEvent.target) || ExecutionEnvironment.global
      const renderedTargetID = getDOMNodeID(renderedTarget)
      const event = fixedNativeEvent
      const target = renderedTarget
      ZzeactEvent.handleTopLevel(topLevelType, event, renderedTargetID, target)
    }
  },
}

export default ZzeactEventTopLevelCallback
