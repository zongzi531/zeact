import { runEventsInBatch } from '@/events/EventPluginHub'
import { accumulateTwoPhaseDispatches } from '@/events/EventPropagators'
import { enqueueStateRestore } from '@/events/ZzeactControlledComponent'
import { batchedUpdates } from '@/events/ZzeactGenericBatching'
import SyntheticEvent from '@/events/SyntheticEvent'
import isTextInputElement from '@/shared/isTextInputElement'
import { canUseDOM } from '@/shared/ExecutionEnvironment'

import {
  TOP_BLUR,
  TOP_CHANGE,
  TOP_CLICK,
  TOP_FOCUS,
  TOP_INPUT,
  TOP_KEY_DOWN,
  TOP_KEY_UP,
  TOP_SELECTION_CHANGE,
} from './DOMTopLevelEventTypes'
import getEventTarget from './getEventTarget'
import isEventSupported from './isEventSupported'
import { getNodeFromInstance } from '../client/ZzeactDOMComponentTree'
import { updateValueIfChanged } from '../client/inputValueTracking'
import { setDefaultValue } from '../client/ZzeactDOMInput'
import { disableInputAttributeSyncing } from '@/shared/ZzeactFeatureFlags'

const eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: 'onChange',
      captured: 'onChangeCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_CHANGE,
      TOP_CLICK,
      TOP_FOCUS,
      TOP_INPUT,
      TOP_KEY_DOWN,
      TOP_KEY_UP,
      TOP_SELECTION_CHANGE,
    ],
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createAndAccumulateChangeEvent(inst, nativeEvent, target): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = (SyntheticEvent as any).getPooled(
    eventTypes.change,
    inst,
    nativeEvent,
    target,
  )
  event.type = 'change'
  enqueueStateRestore(target)
  accumulateTwoPhaseDispatches(event)
  return event
}

let activeElement = null
let activeElementInst = null

function shouldUseChangeEvent(elem): boolean {
  const nodeName = elem.nodeName && elem.nodeName.toLowerCase()
  return (
    nodeName === 'select' || (nodeName === 'input' && elem.type === 'file')
  )
}

function manualDispatchChangeEvent(nativeEvent): void {
  const event = createAndAccumulateChangeEvent(
    activeElementInst,
    nativeEvent,
    getEventTarget(nativeEvent),
  )

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  batchedUpdates(runEventInBatch, event)
}

function runEventInBatch(event): void {
  runEventsInBatch(event)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getInstIfValueChanged(targetInst): any {
  const targetNode = getNodeFromInstance(targetInst)
  if (updateValueIfChanged(targetNode)) {
    return targetInst
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTargetInstForChangeEvent(topLevelType, targetInst): any {
  if (topLevelType === TOP_CHANGE) {
    return targetInst
  }
}

let isInputEventSupported = false
if (canUseDOM) {
  isInputEventSupported =
    isEventSupported('input') &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (!(document as any).documentMode || (document as any).documentMode > 9)
}

function startWatchingForValueChange(target, targetInst): void {
  activeElement = target
  activeElementInst = targetInst
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  activeElement.attachEvent('onpropertychange', handlePropertyChange)
}

function stopWatchingForValueChange(): void {
  if (!activeElement) {
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  activeElement.detachEvent('onpropertychange', handlePropertyChange)
  activeElement = null
  activeElementInst = null
}

function handlePropertyChange(nativeEvent): void {
  if (nativeEvent.propertyName !== 'value') {
    return
  }
  if (getInstIfValueChanged(activeElementInst)) {
    manualDispatchChangeEvent(nativeEvent)
  }
}

function handleEventsForInputEventPolyfill(topLevelType, target, targetInst): void {
  if (topLevelType === TOP_FOCUS) {
    stopWatchingForValueChange()
    startWatchingForValueChange(target, targetInst)
  } else if (topLevelType === TOP_BLUR) {
    stopWatchingForValueChange()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTargetInstForInputEventPolyfill(topLevelType): any {
  if (
    topLevelType === TOP_SELECTION_CHANGE ||
    topLevelType === TOP_KEY_UP ||
    topLevelType === TOP_KEY_DOWN
  ) {
    return getInstIfValueChanged(activeElementInst)
  }
}

function shouldUseClickEvent(elem): boolean {
  const nodeName = elem.nodeName
  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTargetInstForClickEvent(topLevelType, targetInst): any {
  if (topLevelType === TOP_CLICK) {
    return getInstIfValueChanged(targetInst)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTargetInstForInputOrChangeEvent(topLevelType, targetInst): any {
  if (topLevelType === TOP_INPUT || topLevelType === TOP_CHANGE) {
    return getInstIfValueChanged(targetInst)
  }
}

function handleControlledInputBlur(node): void {
  const state = node._wrapperState

  if (!state || !state.controlled || node.type !== 'number') {
    return
  }

  if (!disableInputAttributeSyncing) {
    setDefaultValue(node, 'number', node.value)
  }
}

const ChangeEventPlugin = {
  eventTypes: eventTypes,

  _isInputEventSupported: isInputEventSupported,

  extractEvents: function(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const targetNode = targetInst ? getNodeFromInstance(targetInst) : window

    let getTargetInstFunc, handleEventFunc
    if (shouldUseChangeEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForChangeEvent
    } else if (isTextInputElement(targetNode)) {
      if (isInputEventSupported) {
        getTargetInstFunc = getTargetInstForInputOrChangeEvent
      } else {
        getTargetInstFunc = getTargetInstForInputEventPolyfill
        handleEventFunc = handleEventsForInputEventPolyfill
      }
    } else if (shouldUseClickEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForClickEvent
    }

    if (getTargetInstFunc) {
      const inst = getTargetInstFunc(topLevelType, targetInst)
      if (inst) {
        const event = createAndAccumulateChangeEvent(
          inst,
          nativeEvent,
          nativeEventTarget,
        )
        return event
      }
    }

    if (handleEventFunc) {
      handleEventFunc(topLevelType, targetNode, targetInst)
    }

    if (topLevelType === TOP_BLUR) {
      handleControlledInputBlur(targetNode)
    }
  },
}

export default ChangeEventPlugin
