import keyOf from '@/vendor/core/keyOf'
import EventConstants from '@/event/EventConstants'
import AbstractEvent from '@/event/AbstractEvent'
import EventPropagators from '@/event/EventPropagators'

const { topLevelTypes } = EventConstants

// 简单事件类型的定义
const SimpleEventPlugin = {
  abstractEventTypes: {
    // Note: We do not allow listening to mouseOver events. Instead, use the
    // onMouseEnter/onMouseLeave created by `EnterLeaveEventPlugin`.
    mouseDown: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onMouseDown: true }),
        captured: keyOf({ onMouseDownCapture: true }),
      },
    },
    mouseUp: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onMouseUp: true }),
        captured: keyOf({ onMouseUpCapture: true }),
      },
    },
    mouseMove: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onMouseMove: true }),
        captured: keyOf({ onMouseMoveCapture: true }),
      },
    },
    doubleClick: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onDoubleClick: true }),
        captured: keyOf({ onDoubleClickCapture: true }),
      },
    },
    click: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onClick: true }),
        captured: keyOf({ onClickCapture: true }),
      },
    },
    mouseWheel: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onMouseWheel: true }),
        captured: keyOf({ onMouseWheelCapture: true }),
      },
    },
    touchStart: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onTouchStart: true }),
        captured: keyOf({ onTouchStartCapture: true }),
      },
    },
    touchEnd: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onTouchEnd: true }),
        captured: keyOf({ onTouchEndCapture: true }),
      },
    },
    touchCancel: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onTouchCancel: true }),
        captured: keyOf({ onTouchCancelCapture: true }),
      },
    },
    touchMove: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onTouchMove: true }),
        captured: keyOf({ onTouchMoveCapture: true }),
      },
    },
    keyUp: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onKeyUp: true }),
        captured: keyOf({ onKeyUpCapture: true }),
      },
    },
    keyPress: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onKeyPress: true }),
        captured: keyOf({ onKeyPressCapture: true }),
      },
    },
    keyDown: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onKeyDown: true }),
        captured: keyOf({ onKeyDownCapture: true }),
      },
    },
    focus: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onFocus: true }),
        captured: keyOf({ onFocusCapture: true }),
      },
    },
    blur: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onBlur: true }),
        captured: keyOf({ onBlurCapture: true }),
      },
    },
    scroll: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onScroll: true }),
        captured: keyOf({ onScrollCapture: true }),
      },
    },
    change: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onChange: true }),
        captured: keyOf({ onChangeCapture: true }),
      },
    },
    submit: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onSubmit: true }),
        captured: keyOf({ onSubmitCapture: true }),
      },
    },
    DOMCharacterDataModified: {
      phasedRegistrationNames: {
        bubbled: keyOf({ onDOMCharacterDataModified: true }),
        captured: keyOf({ onDOMCharacterDataModifiedCapture: true }),
      },
    },
  },

  /**
   * Same as the default implementation, except cancels the event when return
   * value is false.
   * @param {AbstractEvent} AbstractEvent to handle
   * @param {function} Application-level callback
   * @param {string} domID DOM id to pass to the callback.
   */
  executeDispatch (abstractEvent, listener, domID) {
    // 这看起来是在监听事件的时候用的，并且挂在 listener 之前，像是会放在 putListener
    // 假如返回 false 的情况，
    // 默认调用 stopPropagation 和 preventDefault
    // 来阻止捕获和冒泡传播，同时阻止默认事件行为
    const returnValue = listener(abstractEvent, domID)
    if (returnValue === false) {
      abstractEvent.stopPropagation()
      abstractEvent.preventDefault()
    }
  },

  /**
   * @see EventPluginHub.extractAbstractEvents
   */
  extractAbstractEvents (topLevelType, nativeEvent, renderedTargetID, renderedTarget) {
    // 这个方法在干嘛暂时没看
    let data
    const abstractEventType =
      SimpleEventPlugin.topLevelTypesToAbstract[topLevelType]
    if (!abstractEventType) {
      return null
    }
    switch (topLevelType) {
      case topLevelTypes.topMouseWheel:
        data = AbstractEvent.normalizeMouseWheelData(nativeEvent)
        break
      case topLevelTypes.topScroll:
        data = AbstractEvent.normalizeScrollDataFromTarget(renderedTarget)
        break
      case topLevelTypes.topClick:
      case topLevelTypes.topDoubleClick:
      case topLevelTypes.topChange:
      case topLevelTypes.topDOMCharacterDataModified:
      case topLevelTypes.topMouseDown:
      case topLevelTypes.topMouseUp:
      case topLevelTypes.topMouseMove:
      case topLevelTypes.topTouchMove:
      case topLevelTypes.topTouchStart:
      case topLevelTypes.topTouchEnd:
        data = AbstractEvent.normalizePointerData(nativeEvent)
        break
      default:
        data = null
    }
    // 在这里 new 了 AbstractEvent
    const abstractEvent = AbstractEvent.getPooled(
      abstractEventType,
      renderedTargetID,
      topLevelType,
      nativeEvent,
      data
    )
    EventPropagators.accumulateTwoPhaseDispatches(abstractEvent)
    return abstractEvent
  },
}

// 算是创建一些快捷方式吧
SimpleEventPlugin.topLevelTypesToAbstract = {
  topMouseDown: SimpleEventPlugin.abstractEventTypes.mouseDown,
  topMouseUp: SimpleEventPlugin.abstractEventTypes.mouseUp,
  topMouseMove: SimpleEventPlugin.abstractEventTypes.mouseMove,
  topClick: SimpleEventPlugin.abstractEventTypes.click,
  topDoubleClick: SimpleEventPlugin.abstractEventTypes.doubleClick,
  topMouseWheel: SimpleEventPlugin.abstractEventTypes.mouseWheel,
  topTouchStart: SimpleEventPlugin.abstractEventTypes.touchStart,
  topTouchEnd: SimpleEventPlugin.abstractEventTypes.touchEnd,
  topTouchMove: SimpleEventPlugin.abstractEventTypes.touchMove,
  topTouchCancel: SimpleEventPlugin.abstractEventTypes.touchCancel,
  topKeyUp: SimpleEventPlugin.abstractEventTypes.keyUp,
  topKeyPress: SimpleEventPlugin.abstractEventTypes.keyPress,
  topKeyDown: SimpleEventPlugin.abstractEventTypes.keyDown,
  topFocus: SimpleEventPlugin.abstractEventTypes.focus,
  topBlur: SimpleEventPlugin.abstractEventTypes.blur,
  topScroll: SimpleEventPlugin.abstractEventTypes.scroll,
  topChange: SimpleEventPlugin.abstractEventTypes.change,
  topSubmit: SimpleEventPlugin.abstractEventTypes.submit,
  topDOMCharacterDataModified: SimpleEventPlugin.abstractEventTypes.DOMCharacterDataModified,
}

export default SimpleEventPlugin
