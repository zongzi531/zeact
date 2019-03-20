import keyOf from '@/vendor/core/keyOf'
import EventConstants from '@/event/EventConstants'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import AbstractEvent from '@/event/AbstractEvent'
import getDOMNodeID from '@/domUtils/getDOMNodeID'
import ZzeactInstanceHandles from '@/core/ZzeactInstanceHandles'
import EventPropagators from '@/event/EventPropagators'

const { getFirstZzeactDOM } = ZzeactInstanceHandles

const { topLevelTypes } = EventConstants

const abstractEventTypes = {
  mouseEnter: { registrationName: keyOf({ onMouseEnter: null }) },
  mouseLeave: { registrationName: keyOf({ onMouseLeave: null }) },
}

const extractAbstractEvents = (topLevelType, nativeEvent, renderedTargetID, renderedTarget) => {
  if (topLevelType === topLevelTypes.topMouseOver &&
    (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
    return
  }
  if (topLevelType !== topLevelTypes.topMouseOut &&
    topLevelType !== topLevelTypes.topMouseOver) {
    return null // Must not be a mouse in or mouse out - ignoring.
  }

  let to, from
  if (topLevelType === topLevelTypes.topMouseOut) {
    to = getFirstZzeactDOM(nativeEvent.relatedTarget || nativeEvent.toElement) ||
      ExecutionEnvironment.global
    from = renderedTarget
  } else {
    to = renderedTarget
    from = ExecutionEnvironment.global
  }

  // Nothing pertains to our managed components.
  if (from === to) {
    return
  }

  const fromID = from ? getDOMNodeID(from) : ''
  const toID = to ? getDOMNodeID(to) : ''
  const leave = AbstractEvent.getPooled(
    abstractEventTypes.mouseLeave,
    fromID,
    topLevelType,
    nativeEvent
  )
  const enter = AbstractEvent.getPooled(
    abstractEventTypes.mouseEnter,
    toID,
    topLevelType,
    nativeEvent
  )
  EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID)
  return [leave, enter]
}

export default {
  abstractEventTypes,
  extractAbstractEvents,
}
