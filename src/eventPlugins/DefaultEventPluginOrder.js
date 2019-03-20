// inject 时 PluginsName 必须包含在其中
import keyOf from '@/vendor/core/keyOf'

const DefaultEventPluginOrder = [
  keyOf({ ResponderEventPlugin: null }),
  keyOf({ SimpleEventPlugin: null }),
  keyOf({ TapEventPlugin: null }),
  keyOf({ EnterLeaveEventPlugin: null }),
  keyOf({ AnalyticsEventPlugin: null }),
]

export default DefaultEventPluginOrder
