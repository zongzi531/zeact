// 这里在干嘛没看懂
// 没看懂这几个事件插件是做什么用的
import keyOf from '../vendor/core/keyOf'

const DefaultEventPluginOrder = [
  keyOf({ ResponderEventPlugin: null }),
  keyOf({ SimpleEventPlugin: null }),
  keyOf({ TapEventPlugin: null }),
  keyOf({ EnterLeaveEventPlugin: null }),
  keyOf({ AnalyticsEventPlugin: null }),
]

export default DefaultEventPluginOrder
