import { accumulateTwoPhaseDispatches } from '@/events/EventPropagators'
import { canUseDOM } from '@/shared/ExecutionEnvironment'
import SyntheticEvent from '@/events/SyntheticEvent'
import isTextInputElement from '@/shared/isTextInputElement'
import shallowEqual from '@/shared/shallowEqual'

import {
  TOP_BLUR,
  TOP_CONTEXT_MENU,
  TOP_DRAG_END,
  TOP_FOCUS,
  TOP_KEY_DOWN,
  TOP_KEY_UP,
  TOP_MOUSE_DOWN,
  TOP_MOUSE_UP,
  TOP_SELECTION_CHANGE,
} from './DOMTopLevelEventTypes'
import { isListeningToAllDependencies } from './ZzeactBrowserEventEmitter'
import getActiveElement from '../client/getActiveElement'
import { getNodeFromInstance } from '../client/ZzeactDOMComponentTree'
import { hasSelectionCapabilities } from '../client/ZzeactInputSelection'
import { DOCUMENT_NODE } from '../shared/HTMLNodeType'

const skipSelectionChangeEvent =
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  canUseDOM && 'documentMode' in document && (document as any).documentMode <= 11

const eventTypes = {
  select: {
    phasedRegistrationNames: {
      bubbled: 'onSelect',
      captured: 'onSelectCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_CONTEXT_MENU,
      TOP_DRAG_END,
      TOP_FOCUS,
      TOP_KEY_DOWN,
      TOP_KEY_UP,
      TOP_MOUSE_DOWN,
      TOP_MOUSE_UP,
      TOP_SELECTION_CHANGE,
    ],
  },
}

let activeElement = null
let activeElementInst = null
let lastSelection = null
let mouseDown = false

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSelection(node): any {
  if ('selectionStart' in node && hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd,
    }
  } else {
    const win =
      (node.ownerDocument && node.ownerDocument.defaultView) || window
    const selection = win.getSelection()
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset,
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEventTargetDocument(eventTarget): any {
  return eventTarget.window === eventTarget
    ? eventTarget.document
    : eventTarget.nodeType === DOCUMENT_NODE
      ? eventTarget
      : eventTarget.ownerDocument
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function constructSelectEvent(nativeEvent, nativeEventTarget): any {
  const doc = getEventTargetDocument(nativeEventTarget)

  if (
    mouseDown ||
    activeElement == null ||
    activeElement !== getActiveElement(doc)
  ) {
    return null
  }

  const currentSelection = getSelection(activeElement)
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const syntheticEvent = (SyntheticEvent as any).getPooled(
      eventTypes.select,
      activeElementInst,
      nativeEvent,
      nativeEventTarget,
    )

    syntheticEvent.type = 'select'
    syntheticEvent.target = activeElement

    accumulateTwoPhaseDispatches(syntheticEvent)

    return syntheticEvent
  }

  return null
}

const SelectEventPlugin = {
  eventTypes: eventTypes,

  extractEvents: function(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const doc = getEventTargetDocument(nativeEventTarget)
    if (!doc || !isListeningToAllDependencies('onSelect', doc)) {
      return null
    }

    const targetNode = targetInst ? getNodeFromInstance(targetInst) : window

    switch (topLevelType) {
      case TOP_FOCUS:
        if (
          isTextInputElement(targetNode) ||
          targetNode.contentEditable === 'true'
        ) {
          activeElement = targetNode
          activeElementInst = targetInst
          lastSelection = null
        }
        break
      case TOP_BLUR:
        activeElement = null
        activeElementInst = null
        lastSelection = null
        break
      case TOP_MOUSE_DOWN:
        mouseDown = true
        break
      case TOP_CONTEXT_MENU:
      case TOP_MOUSE_UP:
      case TOP_DRAG_END:
        mouseDown = false
        return constructSelectEvent(nativeEvent, nativeEventTarget)
      case TOP_SELECTION_CHANGE:
        if (skipSelectionChangeEvent) {
          break
        }
      case TOP_KEY_DOWN:
      case TOP_KEY_UP:
        return constructSelectEvent(nativeEvent, nativeEventTarget)
    }

    return null
  },
}

export default SelectEventPlugin
