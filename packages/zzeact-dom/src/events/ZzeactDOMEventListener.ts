import { AnyNativeEvent } from '@/events/PluginModuleType'
import { Fiber } from '@/zzeact-reconciler/src/ZzeactFiber'
import { DOMTopLevelEventType } from '@/events/TopLevelEventTypes'

import { batchedUpdates, interactiveUpdates } from '@/events/ZzeactGenericBatching'
import { runExtractedEventsInBatch } from '@/events/EventPluginHub'
import { isFiberMounted } from '@/zzeact-reconciler/reflection'
import { HostRoot } from '@/shared/ZzeactWorkTags'

import { addEventBubbleListener, addEventCaptureListener } from './EventListener'
import getEventTarget from './getEventTarget'
import { getClosestInstanceFromNode } from '../client/ZzeactDOMComponentTree'
import SimpleEventPlugin from './SimpleEventPlugin'
import { getRawEventName } from './DOMTopLevelEventTypes'

const { isInteractiveTopLevelEventType } = SimpleEventPlugin

const CALLBACK_BOOKKEEPING_POOL_SIZE = 10
const callbackBookkeepingPool = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRootContainerNode(inst): any {
  while (inst.return) {
    inst = inst.return
  }
  if (inst.tag !== HostRoot) {
    return null
  }
  return inst.stateNode.containerInfo
}

function getTopLevelCallbackBookKeeping(
  topLevelType,
  nativeEvent,
  targetInst,
): {
  topLevelType: DOMTopLevelEventType
  nativeEvent: AnyNativeEvent
  targetInst: Fiber | null
  ancestors: Array<Fiber>
} {
  if (callbackBookkeepingPool.length) {
    const instance = callbackBookkeepingPool.pop()
    instance.topLevelType = topLevelType
    instance.nativeEvent = nativeEvent
    instance.targetInst = targetInst
    return instance
  }
  return {
    topLevelType,
    nativeEvent,
    targetInst,
    ancestors: [],
  }
}

function releaseTopLevelCallbackBookKeeping(instance): void {
  instance.topLevelType = null
  instance.nativeEvent = null
  instance.targetInst = null
  instance.ancestors.length = 0
  if (callbackBookkeepingPool.length < CALLBACK_BOOKKEEPING_POOL_SIZE) {
    callbackBookkeepingPool.push(instance)
  }
}

function handleTopLevel(bookKeeping): void {
  let targetInst = bookKeeping.targetInst
  let ancestor = targetInst
  do {
    if (!ancestor) {
      bookKeeping.ancestors.push(ancestor)
      break
    }
    const root = findRootContainerNode(ancestor)
    if (!root) {
      break
    }
    bookKeeping.ancestors.push(ancestor)
    ancestor = getClosestInstanceFromNode(root)
  } while (ancestor)

  for (let i = 0; i < bookKeeping.ancestors.length; i++) {
    targetInst = bookKeeping.ancestors[i]
    runExtractedEventsInBatch(
      bookKeeping.topLevelType,
      targetInst,
      bookKeeping.nativeEvent,
      getEventTarget(bookKeeping.nativeEvent),
    )
  }
}

export let _enabled = true

export function setEnabled(enabled?: boolean): void {
  _enabled = !!enabled
}

export function isEnabled(): boolean {
  return _enabled
}

export function dispatchEvent(
  topLevelType: DOMTopLevelEventType,
  nativeEvent: AnyNativeEvent,
): void {
  if (!_enabled) {
    return
  }

  const nativeEventTarget = getEventTarget(nativeEvent)
  let targetInst = getClosestInstanceFromNode(nativeEventTarget)
  if (
    targetInst !== null &&
    typeof targetInst.tag === 'number' &&
    !isFiberMounted(targetInst)
  ) {
    targetInst = null
  }

  const bookKeeping = getTopLevelCallbackBookKeeping(
    topLevelType,
    nativeEvent,
    targetInst,
  )

  try {
    batchedUpdates(handleTopLevel, bookKeeping)
  } finally {
    releaseTopLevelCallbackBookKeeping(bookKeeping)
  }
}

function dispatchInteractiveEvent(topLevelType, nativeEvent): void {
  interactiveUpdates(dispatchEvent, topLevelType, nativeEvent)
}

export function trapBubbledEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element,
): void | null {
  if (!element) {
    return null
  }
  const dispatch = isInteractiveTopLevelEventType(topLevelType)
    ? dispatchInteractiveEvent
    : dispatchEvent

  addEventBubbleListener(
    element,
    getRawEventName(topLevelType),
    dispatch.bind(null, topLevelType),
  )
}

export function trapCapturedEvent(
  topLevelType: DOMTopLevelEventType,
  element: Document | Element,
): void | null {
  if (!element) {
    return null
  }
  const dispatch = isInteractiveTopLevelEventType(topLevelType)
    ? dispatchInteractiveEvent
    : dispatchEvent

  addEventCaptureListener(
    element,
    getRawEventName(topLevelType),
    dispatch.bind(null, topLevelType),
  )
}