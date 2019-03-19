import EventPluginHub from '@/event/EventPluginHub'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import invariant from '@/vendor/core/invariant'
import ZzeactEvent from './ZzeactEvent'
import EventConstants from '@/event/EventConstants'
import NormalizedEventListener from '@/event/NormalizedEventListener'
import isEventSupported from '@/domUtils/isEventSupported'
import BrowserEnv from './BrowserEnv'

const { listen, capture } = NormalizedEventListener

const { topLevelTypes } = EventConstants

const { registrationNames, putListener } = EventPluginHub

let _isListening = false

const registerDocumentScrollListener = () => {
  // 监听 window 滚动事件
  listen(window, 'scroll', nativeEvent => {
    if (nativeEvent.target === window) {
      // 刷新滚动值，干什么用不知道
      BrowserEnv.refreshAuthoritativeScrollValues()
    }
  })
}

const registerDocumentResizeListener = () => {
  // 监听 window 大小调整事件
  listen(window, 'resize', nativeEvent => {
    if (nativeEvent.target === window) {
      BrowserEnv.refreshAuthoritativeScrollValues()
    }
  })
}

const trapBubbledEvent = (topLevelType, handlerBaseName, onWhat) => {
  // 各种事件的监听
  listen(
    onWhat,
    handlerBaseName,
    // 这个回调有点关键，他是在下方先赋值了 ensureListening 方法中 TopLevelCallbackCreator
    ZzeactEvent.TopLevelCallbackCreator.createTopLevelCallback(topLevelType)
  )
}

const trapCapturedEvent = (topLevelType, handlerBaseName, onWhat) => {
  capture(
    onWhat,
    handlerBaseName,
    ZzeactEvent.TopLevelCallbackCreator.createTopLevelCallback(topLevelType)
  )
}

const listenAtTopLevel = (touchNotMouse) => {
  // 监听至最高优先级
  invariant(
    !_isListening,
    'listenAtTopLevel(...): Cannot setup top-level listener more than once.'
  )
  const mountAt = document

  // 批量注册
  registerDocumentScrollListener()
  registerDocumentResizeListener()
  trapBubbledEvent(topLevelTypes.topMouseOver, 'mouseover', mountAt)
  trapBubbledEvent(topLevelTypes.topMouseDown, 'mousedown', mountAt)
  trapBubbledEvent(topLevelTypes.topMouseUp, 'mouseup', mountAt)
  trapBubbledEvent(topLevelTypes.topMouseMove, 'mousemove', mountAt)
  trapBubbledEvent(topLevelTypes.topMouseOut, 'mouseout', mountAt)
  trapBubbledEvent(topLevelTypes.topClick, 'click', mountAt)
  trapBubbledEvent(topLevelTypes.topDoubleClick, 'dblclick', mountAt)
  trapBubbledEvent(topLevelTypes.topMouseWheel, 'mousewheel', mountAt)
  if (touchNotMouse) {
    trapBubbledEvent(topLevelTypes.topTouchStart, 'touchstart', mountAt)
    trapBubbledEvent(topLevelTypes.topTouchEnd, 'touchend', mountAt)
    trapBubbledEvent(topLevelTypes.topTouchMove, 'touchmove', mountAt)
    trapBubbledEvent(topLevelTypes.topTouchCancel, 'touchcancel', mountAt)
  }
  trapBubbledEvent(topLevelTypes.topKeyUp, 'keyup', mountAt)
  trapBubbledEvent(topLevelTypes.topKeyPress, 'keypress', mountAt)
  trapBubbledEvent(topLevelTypes.topKeyDown, 'keydown', mountAt)
  trapBubbledEvent(topLevelTypes.topChange, 'change', mountAt)
  trapBubbledEvent(
    topLevelTypes.topDOMCharacterDataModified,
    'DOMCharacterDataModified',
    mountAt
  )

  // Firefox needs to capture a different mouse scroll event.
  // @see http://www.quirksmode.org/dom/events/tests/scroll.html
  trapBubbledEvent(topLevelTypes.topMouseWheel, 'DOMMouseScroll', mountAt)
  // IE < 9 doesn't support capturing so just trap the bubbled event there.
  if (isEventSupported('scroll', true)) {
    trapCapturedEvent(topLevelTypes.topScroll, 'scroll', mountAt)
  } else {
    trapBubbledEvent(topLevelTypes.topScroll, 'scroll', window)
  }

  if (isEventSupported('focus', true)) {
    trapCapturedEvent(topLevelTypes.topFocus, 'focus', mountAt)
    trapCapturedEvent(topLevelTypes.topBlur, 'blur', mountAt)
  } else if (isEventSupported('focusin')) {
    // IE has `focusin` and `focusout` events which bubble.
    // @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
    trapBubbledEvent(topLevelTypes.topFocus, 'focusin', mountAt)
    trapBubbledEvent(topLevelTypes.topBlur, 'focusout', mountAt)
  }
}

const handleTopLevel = (topLevelType, nativeEvent, renderedTargetID, renderedTarget) => {
  // 这里是事件回调的传递，相关的方法还没写
  // 对应的 topLevelType 得到相应的触发后需要执行的方法
  const abstractEvents = EventPluginHub.extractAbstractEvents(
    topLevelType,
    nativeEvent,
    renderedTargetID,
    renderedTarget
  )

  EventPluginHub.enqueueAbstractEvents(abstractEvents)
  EventPluginHub.processAbstractEventQueue()
}

const ensureListening = (touchNotMouse, TopLevelCallbackCreator) => {
  invariant(
    ExecutionEnvironment.canUseDOM,
    'ensureListening(...): Cannot toggle event listening in a Worker thread. ' +
    'This is likely a bug in the framework. Please report immediately.'
  )
  if (!_isListening) {
    // 将事件工厂注入
    ZzeactEvent.TopLevelCallbackCreator = TopLevelCallbackCreator
    listenAtTopLevel(touchNotMouse)
    // 只做一次监听
    _isListening = true
  }
}

// 这里把 EventPluginHub 挂在 window 不知用意是什么
if (ExecutionEnvironment.canUseDOM) {
  window.EventPluginHub = EventPluginHub
}

export default {
  registrationNames,
  putListener,
  handleTopLevel,
  ensureListening,
  trapBubbledEvent,
  trapCapturedEvent,
}
