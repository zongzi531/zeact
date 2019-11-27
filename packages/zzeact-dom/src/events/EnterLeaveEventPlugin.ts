/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { accumulateEnterLeaveDispatches } from '@/events/EventPropagators'

import {
  TOP_MOUSE_OUT,
  TOP_MOUSE_OVER,
  TOP_POINTER_OUT,
  TOP_POINTER_OVER,
} from './DOMTopLevelEventTypes'
import SyntheticMouseEvent from './SyntheticMouseEvent'
import SyntheticPointerEvent from './SyntheticPointerEvent'
import {
  getClosestInstanceFromNode,
  getNodeFromInstance,
} from '../client/ZzeactDOMComponentTree'

const eventTypes = {
  mouseEnter: {
    registrationName: 'onMouseEnter',
    dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER],
  },
  mouseLeave: {
    registrationName: 'onMouseLeave',
    dependencies: [TOP_MOUSE_OUT, TOP_MOUSE_OVER],
  },
  pointerEnter: {
    registrationName: 'onPointerEnter',
    dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER],
  },
  pointerLeave: {
    registrationName: 'onPointerLeave',
    dependencies: [TOP_POINTER_OUT, TOP_POINTER_OVER],
  },
}

const EnterLeaveEventPlugin = {
  eventTypes: eventTypes,

  extractEvents: function(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const isOverEvent =
      topLevelType === TOP_MOUSE_OVER || topLevelType === TOP_POINTER_OVER
    const isOutEvent =
      topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_POINTER_OUT

    if (isOverEvent && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null
    }

    if (!isOutEvent && !isOverEvent) {
      return null
    }

    let win
    if (nativeEventTarget.window === nativeEventTarget) {
      win = nativeEventTarget
    } else {
      const doc = nativeEventTarget.ownerDocument
      if (doc) {
        win = doc.defaultView || doc.parentWindow
      } else {
        win = window
      }
    }

    let from
    let to
    if (isOutEvent) {
      from = targetInst
      const related = nativeEvent.relatedTarget || nativeEvent.toElement
      to = related ? getClosestInstanceFromNode(related) : null
    } else {
      from = null
      to = targetInst
    }

    if (from === to) {
      return null
    }

    let eventInterface, leaveEventType, enterEventType, eventTypePrefix

    if (topLevelType === TOP_MOUSE_OUT || topLevelType === TOP_MOUSE_OVER) {
      eventInterface = SyntheticMouseEvent
      leaveEventType = eventTypes.mouseLeave
      enterEventType = eventTypes.mouseEnter
      eventTypePrefix = 'mouse'
    } else if (
      topLevelType === TOP_POINTER_OUT ||
      topLevelType === TOP_POINTER_OVER
    ) {
      eventInterface = SyntheticPointerEvent
      leaveEventType = eventTypes.pointerLeave
      enterEventType = eventTypes.pointerEnter
      eventTypePrefix = 'pointer'
    }

    const fromNode = from == null ? win : getNodeFromInstance(from)
    const toNode = to == null ? win : getNodeFromInstance(to)

    const leave = eventInterface.getPooled(
      leaveEventType,
      from,
      nativeEvent,
      nativeEventTarget,
    )
    leave.type = eventTypePrefix + 'leave'
    leave.target = fromNode
    leave.relatedTarget = toNode

    const enter = eventInterface.getPooled(
      enterEventType,
      to,
      nativeEvent,
      nativeEventTarget,
    )
    enter.type = eventTypePrefix + 'enter'
    enter.target = toNode
    enter.relatedTarget = fromNode

    accumulateEnterLeaveDispatches(leave, enter, from, to)

    return [leave, enter]
  },
}

export default EnterLeaveEventPlugin
