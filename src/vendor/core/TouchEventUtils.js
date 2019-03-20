const TouchEventUtils = {
  extractSingleTouch: function (nativeEvent) {
    // debugger 发现这里和之前的 AbstractEvent 有关系
    // 当然毕竟是由那边调起的
    // 如果存在 touches 说明触发了 touchstart 事件
    const touches = nativeEvent.touches
    // changedTouches 和 touches 一样，同样是返回一个数组
    const changedTouches = nativeEvent.changedTouches
    const hasTouches = touches && touches.length > 0
    const hasChangedTouches = changedTouches && changedTouches.length > 0

    // 判断若 touches 不存在并且 changedTouches 存在，返回 changedTouches 的第一个索引
    // 再若 touches 存在返回 touches 的第一个索引
    // 否则直接返回 nativeEvent，目的是只返回一个 event
    return !hasTouches && hasChangedTouches ? changedTouches[0]
      : hasTouches ? touches[0]
        : nativeEvent
  },
}

export default TouchEventUtils
