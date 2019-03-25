// 这里在干嘛没看懂
import PooledClass from '@/utils/PooledClass'
import BrowserEnv from '@/core/BrowserEnv'
import TouchEventUtils from '@/vendor/core/TouchEventUtils'

const MAX_POOL_SIZE = 20

export default class AbstractEvent {
  constructor (abstractEventType, abstractTargetID, originatingTopLevelEventType, nativeEvent, data) {
    this.type = abstractEventType
    this.abstractTargetID = abstractTargetID || ''
    this.originatingTopLevelEventType = originatingTopLevelEventType
    this.nativeEvent = nativeEvent
    this.data = data
    // TODO: Deprecate storing target - doesn't always make sense for some types
    this.target = nativeEvent && nativeEvent.target

    /**
     * As a performance optimization, we tag the existing event with the listeners
     * (or listener [singular] if only one). This avoids having to package up an
     * abstract event along with the set of listeners into a wrapping "dispatch"
     * object. No one should ever read this property except event system and
     * plugin/dispatcher code. We also tag the abstract event with a parallel
     * ID array. _dispatchListeners[i] is being dispatched to a DOM node at ID
     * _dispatchIDs[i]. The lengths should never, ever, ever be different.
     */
    this._dispatchListeners = null
    this._dispatchIDs = null

    this.isPropagationStopped = false
  }
  destructor () {
    this.target = null
    this._dispatchListeners = null
    this._dispatchIDs = null
  }
  static poolSize = MAX_POOL_SIZE
  static eventPageX (nativeEvent) {
    const singleTouch = TouchEventUtils.extractSingleTouch(nativeEvent)
    if (singleTouch) {
      return singleTouch.pageX
    } else if (typeof nativeEvent.pageX !== 'undefined') {
      return nativeEvent.pageX
    } else {
      return nativeEvent.clientX + BrowserEnv.currentPageScrollLeft
    }
  }

  static eventPageY (nativeEvent) {
    const singleTouch = TouchEventUtils.extractSingleTouch(nativeEvent)
    if (singleTouch) {
      return singleTouch.pageY
    } else if (typeof nativeEvent.pageY !== 'undefined') {
      return nativeEvent.pageY
    } else {
      return nativeEvent.clientY + BrowserEnv.currentPageScrollTop
    }
  }

  static isNativeClickEventRightClick (nativeEvent) {
    // 只读属性 MouseEvent.which 显示了鼠标事件是由哪个鼠标按键被按下所触发的。其他获得该信息的标准属性是 MouseEvent.button 与 MouseEvent.buttons 。
    // 表示一个特定按键的数字：
    // 0: 无
    // 1: 左键
    // 2: 中间滚轮（如果有的话）
    // 3: 右键   <==
    // =======
    // MouseEvent.button是只读属性，它返回一个值，代表用户按下并触发了事件的鼠标按键。
    // 一个数值，代表按下的鼠标按键：
    // 0：主按键被按下，通常指鼠标左键 or the un-initialized state
    // 1：辅助按键被按下，通常指鼠标滚轮 or the middle button (if present)
    // 2：次按键被按下，通常指鼠标右键   <==
    // 3：第四个按钮被按下，通常指浏览器后退按钮
    // 4：第五个按钮被按下，通常指浏览器的前进按钮
    return nativeEvent.which ? nativeEvent.which === 3
      : nativeEvent.button ? nativeEvent.button === 2
        : false
  }

  static normalizeMouseWheelData (nativeEvent) {
    let delta = 0
    let deltaX = 0
    let deltaY = 0

    /* traditional scroll wheel data */
    if (nativeEvent.wheelDelta) { delta = nativeEvent.wheelDelta / 120 }
    if (nativeEvent.detail) { delta = -nativeEvent.detail / 3 }

    /* Multidimensional scroll (touchpads) with deltas */
    deltaY = delta

    /* Gecko based browsers */
    if (nativeEvent.axis !== undefined &&
      nativeEvent.axis === nativeEvent.HORIZONTAL_AXIS) {
      deltaY = 0
      deltaX = -delta
    }

    /* Webkit based browsers */
    if (nativeEvent.wheelDeltaY !== undefined) {
      deltaY = nativeEvent.wheelDeltaY / 120
    }
    if (nativeEvent.wheelDeltaX !== undefined) {
      deltaX = -nativeEvent.wheelDeltaX / 120
    }

    return { delta: delta, deltaX: deltaX, deltaY: deltaY }
  }

  static normalizeScrollDataFromTarget (target) {
    return {
      scrollTop: target.scrollTop,
      scrollLeft: target.scrollLeft,
      clientWidth: target.clientWidth,
      clientHeight: target.clientHeight,
      scrollHeight: target.scrollHeight,
      scrollWidth: target.scrollWidth,
    }
  }

  static normalizePointerData (nativeEvent) {
    return {
      globalX: AbstractEvent.eventPageX(nativeEvent),
      globalY: AbstractEvent.eventPageY(nativeEvent),
      rightMouseButton:
        AbstractEvent.isNativeClickEventRightClick(nativeEvent),
    }
  }

  static normalizeDragEventData (nativeEvent, globalX, globalY, startX, startY) {
    return {
      globalX: globalX,
      globalY: globalY,
      startX: startX,
      startY: startY,
    }
  }

  stopPropagation () {
    this.isPropagationStopped = true
    if (this.nativeEvent.stopPropagation) {
      this.nativeEvent.stopPropagation()
    }
    // IE8 only understands cancelBubble, not stopPropagation().
    this.nativeEvent.cancelBubble = true
  }

  preventDefault () {
    AbstractEvent.preventDefaultOnNativeEvent(this.nativeEvent)
  }

  static preventDefaultOnNativeEvent (nativeEvent) {
    if (nativeEvent.preventDefault) {
      nativeEvent.preventDefault()
    } else {
      nativeEvent.returnValue = false
    }
  }

  static persistentCloneOf (abstractEvent) {
    return new AbstractEvent(
      abstractEvent.type,
      abstractEvent.abstractTargetID,
      abstractEvent.originatingTopLevelEventType,
      abstractEvent.nativeEvent,
      abstractEvent.data,
      abstractEvent.target
    )
  }
}

PooledClass.addPoolingTo(AbstractEvent, PooledClass.fiveArgumentPooler)
