import { TopLevelType } from '@/events/TopLevelEventTypes'

import { accumulateTwoPhaseDispatches } from '@/events/EventPropagators'
import { canUseDOM } from '@/shared/ExecutionEnvironment'

import {
  TOP_BLUR,
  TOP_COMPOSITION_START,
  TOP_COMPOSITION_END,
  TOP_COMPOSITION_UPDATE,
  TOP_KEY_DOWN,
  TOP_KEY_PRESS,
  TOP_KEY_UP,
  TOP_MOUSE_DOWN,
  TOP_TEXT_INPUT,
  TOP_PASTE,
} from './DOMTopLevelEventTypes'
import {
  getData as FallbackCompositionStateGetData,
  initialize as FallbackCompositionStateInitialize,
  reset as FallbackCompositionStateReset,
} from './FallbackCompositionState'
import SyntheticCompositionEvent from './SyntheticCompositionEvent'
import SyntheticInputEvent from './SyntheticInputEvent'

const END_KEYCODES = [9, 13, 27, 32] // Tab, Return, Esc, Space
const START_KEYCODE = 229

const canUseCompositionEvent = canUseDOM && 'CompositionEvent' in window

let documentMode = null
if (canUseDOM && 'documentMode' in document) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documentMode = (document as any).documentMode
}

const canUseTextInputEvent =
  canUseDOM && 'TextEvent' in window && !documentMode

const useFallbackCompositionData =
  canUseDOM &&
  (!canUseCompositionEvent ||
    (documentMode && documentMode > 8 && documentMode <= 11))

const SPACEBAR_CODE = 32
const SPACEBAR_CHAR = String.fromCharCode(SPACEBAR_CODE)

const eventTypes = {
  beforeInput: {
    phasedRegistrationNames: {
      bubbled: 'onBeforeInput',
      captured: 'onBeforeInputCapture',
    },
    dependencies: [
      TOP_COMPOSITION_END,
      TOP_KEY_PRESS,
      TOP_TEXT_INPUT,
      TOP_PASTE,
    ],
  },
  compositionEnd: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionEnd',
      captured: 'onCompositionEndCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_COMPOSITION_END,
      TOP_KEY_DOWN,
      TOP_KEY_PRESS,
      TOP_KEY_UP,
      TOP_MOUSE_DOWN,
    ],
  },
  compositionStart: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionStart',
      captured: 'onCompositionStartCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_COMPOSITION_START,
      TOP_KEY_DOWN,
      TOP_KEY_PRESS,
      TOP_KEY_UP,
      TOP_MOUSE_DOWN,
    ],
  },
  compositionUpdate: {
    phasedRegistrationNames: {
      bubbled: 'onCompositionUpdate',
      captured: 'onCompositionUpdateCapture',
    },
    dependencies: [
      TOP_BLUR,
      TOP_COMPOSITION_UPDATE,
      TOP_KEY_DOWN,
      TOP_KEY_PRESS,
      TOP_KEY_UP,
      TOP_MOUSE_DOWN,
    ],
  },
}

let hasSpaceKeypress = false

function isKeypressCommand(nativeEvent): boolean {
  return (
    (nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) &&
    // ctrlKey && altKey is equivalent to AltGr, and is not a command.
    !(nativeEvent.ctrlKey && nativeEvent.altKey)
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCompositionEventType(topLevelType): any {
  switch (topLevelType) {
    case TOP_COMPOSITION_START:
      return eventTypes.compositionStart
    case TOP_COMPOSITION_END:
      return eventTypes.compositionEnd
    case TOP_COMPOSITION_UPDATE:
      return eventTypes.compositionUpdate
  }
}

function isFallbackCompositionStart(topLevelType, nativeEvent): boolean {
  return topLevelType === TOP_KEY_DOWN && nativeEvent.keyCode === START_KEYCODE
}

function isFallbackCompositionEnd(topLevelType, nativeEvent): boolean {
  switch (topLevelType) {
    case TOP_KEY_UP:
      return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1
    case TOP_KEY_DOWN:
      return nativeEvent.keyCode !== START_KEYCODE
    case TOP_KEY_PRESS:
    case TOP_MOUSE_DOWN:
    case TOP_BLUR:
      return true
    default:
      return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDataFromCustomEvent(nativeEvent): any {
  const detail = nativeEvent.detail
  if (typeof detail === 'object' && 'data' in detail) {
    return detail.data
  }
  return null
}

function isUsingKoreanIME(nativeEvent): boolean {
  return nativeEvent.locale === 'ko'
}

let isComposing = false

function extractCompositionEvent(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let eventType
  let fallbackData

  if (canUseCompositionEvent) {
    eventType = getCompositionEventType(topLevelType)
  } else if (!isComposing) {
    if (isFallbackCompositionStart(topLevelType, nativeEvent)) {
      eventType = eventTypes.compositionStart
    }
  } else if (isFallbackCompositionEnd(topLevelType, nativeEvent)) {
    eventType = eventTypes.compositionEnd
  }

  if (!eventType) {
    return null
  }

  if (useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)) {
    if (!isComposing && eventType === eventTypes.compositionStart) {
      isComposing = FallbackCompositionStateInitialize(nativeEventTarget)
    } else if (eventType === eventTypes.compositionEnd) {
      if (isComposing) {
        fallbackData = FallbackCompositionStateGetData()
      }
    }
  }

  const event = SyntheticCompositionEvent.getPooled(
    eventType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  )

  if (fallbackData) {
    event.data = fallbackData
  } else {
    const customData = getDataFromCustomEvent(nativeEvent)
    if (customData !== null) {
      event.data = customData
    }
  }

  accumulateTwoPhaseDispatches(event)
  return event
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNativeBeforeInputChars(topLevelType: TopLevelType, nativeEvent): any {
  switch (topLevelType) {
    case TOP_COMPOSITION_END:
      return getDataFromCustomEvent(nativeEvent)
    case TOP_KEY_PRESS:
      const which = nativeEvent.which
      if (which !== SPACEBAR_CODE) {
        return null
      }

      hasSpaceKeypress = true
      return SPACEBAR_CHAR

    case TOP_TEXT_INPUT:
      const chars = nativeEvent.data

      if (chars === SPACEBAR_CHAR && hasSpaceKeypress) {
        return null
      }

      return chars

    default:
      return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFallbackBeforeInputChars(topLevelType: TopLevelType, nativeEvent): any {
  if (isComposing) {
    if (
      topLevelType === TOP_COMPOSITION_END ||
      (!canUseCompositionEvent &&
        isFallbackCompositionEnd(topLevelType, nativeEvent))
    ) {
      const chars = FallbackCompositionStateGetData()
      FallbackCompositionStateReset()
      isComposing = false
      return chars
    }
    return null
  }

  switch (topLevelType) {
    case TOP_PASTE:
      return null
    case TOP_KEY_PRESS:
      if (!isKeypressCommand(nativeEvent)) {
        if (nativeEvent.char && nativeEvent.char.length > 1) {
          return nativeEvent.char
        } else if (nativeEvent.which) {
          return String.fromCharCode(nativeEvent.which)
        }
      }
      return null
    case TOP_COMPOSITION_END:
      return useFallbackCompositionData && !isUsingKoreanIME(nativeEvent)
        ? null
        : nativeEvent.data
    default:
      return null
  }
}

function extractBeforeInputEvent(
  topLevelType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let chars

  if (canUseTextInputEvent) {
    chars = getNativeBeforeInputChars(topLevelType, nativeEvent)
  } else {
    chars = getFallbackBeforeInputChars(topLevelType, nativeEvent)
  }

  if (!chars) {
    return null
  }

  const event = SyntheticInputEvent.getPooled(
    eventTypes.beforeInput,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  )

  event.data = chars
  accumulateTwoPhaseDispatches(event)
  return event
}

const BeforeInputEventPlugin = {
  eventTypes: eventTypes,

  extractEvents: function(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any {
    const composition = extractCompositionEvent(
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    )

    const beforeInput = extractBeforeInputEvent(
      topLevelType,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    )

    if (composition === null) {
      return beforeInput
    }

    if (beforeInput === null) {
      return composition
    }

    return [composition, beforeInput]
  },
}

export default BeforeInputEventPlugin
