import keyMirror from '@/utils/keyMirror'

// 冒泡和捕获
const PropagationPhases = keyMirror({ bubbled: null, captured: null })

// 顶级事件类型
const topLevelTypes = keyMirror({
  topBlur: null,
  topChange: null,
  topClick: null,
  topDOMCharacterDataModified: null,
  topDoubleClick: null,
  topFocus: null,
  topKeyDown: null,
  topKeyPress: null,
  topKeyUp: null,
  topMouseDown: null,
  topMouseMove: null,
  topMouseOut: null,
  topMouseOver: null,
  topMouseUp: null,
  topMouseWheel: null,
  topScroll: null,
  topSubmit: null,
  topTouchCancel: null,
  topTouchEnd: null,
  topTouchMove: null,
  topTouchStart: null,
})

export default {
  PropagationPhases,
  topLevelTypes,
}
