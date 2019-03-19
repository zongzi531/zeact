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
}

PooledClass.addPoolingTo(AbstractEvent, PooledClass.fiveArgumentPooler)
