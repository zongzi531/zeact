// 这里在干嘛没看懂
const TouchEventUtils = {
  extractSingleTouch: function (nativeEvent) {
    // debugger 发现这里和之前的 AbstractEvent 有关系
    // 当然毕竟是由那边调起的
    const touches = nativeEvent.touches
    const changedTouches = nativeEvent.changedTouches
    const hasTouches = touches && touches.length > 0
    const hasChangedTouches = changedTouches && changedTouches.length > 0

    return !hasTouches && hasChangedTouches ? changedTouches[0]
      : hasTouches ? touches[0]
        : nativeEvent
  },
}

export default TouchEventUtils
