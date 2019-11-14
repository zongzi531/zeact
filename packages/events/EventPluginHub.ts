import { rethrowCaughtError } from '@/shared/ZzeactErrorUtils'
import invariant from '@/shared/invariant'

import {
  injectEventPluginOrder,
  injectEventPluginsByName,
  plugins,
} from './EventPluginRegistry'
import {
  executeDispatchesInOrder,
  getFiberCurrentPropsFromNode,
} from './EventPluginUtils'
import accumulateInto from './accumulateInto'
import forEachAccumulated from './forEachAccumulated'

import { PluginModule } from './PluginModuleType'
import { ZzeactSyntheticEvent } from './ZzeactSyntheticEventType'
import { Fiber } from '@/zzeact-reconciler/src/ZzeactFiber'
import { AnyNativeEvent } from './PluginModuleType'
import { TopLevelType } from './TopLevelEventTypes'

let eventQueue: (Array<ZzeactSyntheticEvent> | ZzeactSyntheticEvent) | null = null

const executeDispatchesAndRelease = function(event: ZzeactSyntheticEvent): void {
  if (event) {
    executeDispatchesInOrder(event)

    if (!event.isPersistent()) {
      event.constructor.release(event)
    }
  }
}

const executeDispatchesAndReleaseTopLevel = function(e): void {
  return executeDispatchesAndRelease(e)
}

function isInteractive(tag): boolean {
  return (
    tag === 'button' ||
    tag === 'input' ||
    tag === 'select' ||
    tag === 'textarea'
  )
}

function shouldPreventMouseEvent(name, type, props): boolean {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
      return !!(props.disabled && isInteractive(type))
    default:
      return false
  }
}

export const injection = {
  injectEventPluginOrder,
  injectEventPluginsByName,
}

export function getListener(inst: Fiber, registrationName: string): Function {
  const stateNode = inst.stateNode
  if (!stateNode) {
    return null
  }
  const props = getFiberCurrentPropsFromNode(stateNode)
  if (!props) {
    return null
  }
  const listener = props[registrationName]
  if (shouldPreventMouseEvent(registrationName, inst.type, props)) {
    return null
  }
  invariant(
    !listener || typeof listener === 'function',
    'Expected `%s` listener to be a function, instead got a value of `%s` type.',
    registrationName,
    typeof listener,
  )
  return listener
}

function extractEvents(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
): Array<ZzeactSyntheticEvent> | ZzeactSyntheticEvent | null {
  let events = null
  for (let i = 0; i < plugins.length; i++) {
    const possiblePlugin: PluginModule<AnyNativeEvent> = plugins[i]
    if (possiblePlugin) {
      const extractedEvents = possiblePlugin.extractEvents(
        topLevelType,
        targetInst,
        nativeEvent,
        nativeEventTarget,
      )
      if (extractedEvents) {
        events = accumulateInto(events, extractedEvents)
      }
    }
  }
  return events
}

export function runEventsInBatch(
  events: Array<ZzeactSyntheticEvent> | ZzeactSyntheticEvent | null,
): void {
  if (events !== null) {
    eventQueue = accumulateInto(eventQueue, events)
  }

  const processingEventQueue = eventQueue
  eventQueue = null

  if (!processingEventQueue) {
    return
  }

  forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel)
  invariant(
    !eventQueue,
    'processEventQueue(): Additional events were enqueued while processing ' +
      'an event queue. Support for this has not yet been implemented.',
  )
  rethrowCaughtError()
}

export function runExtractedEventsInBatch(
  topLevelType: TopLevelType,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: EventTarget,
): void {
  const events = extractEvents(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget,
  )
  runEventsInBatch(events)
}
