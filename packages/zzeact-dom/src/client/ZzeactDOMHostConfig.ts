import { getSelectionInformation, restoreSelection } from './ZzeactInputSelection'

import {
  isEnabled as ZzeactBrowserEventEmitterIsEnabled,
  setEnabled as ZzeactBrowserEventEmitterSetEnabled,
} from '../events/ZzeactBrowserEventEmitter'

import {
  // unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from '@/scheduler'
export {
  unstable_now as now,
  // unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_shouldYield as shouldYield,
  unstable_cancelCallback as cancelDeferredCallback,
} from '@/scheduler'

import { getChildNamespace } from '../shared/DOMNamespaces'
import {
  ELEMENT_NODE,
  TEXT_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from '../shared/HTMLNodeType'

export type Type = string
export type Props = {
  autoFocus?: boolean
  children?: mixed
  hidden?: boolean
  suppressHydrationWarning?: boolean
  dangerouslySetInnerHTML?: mixed
  style?: {
    display?: string
  }
}
export type Container = Element | Document
export type Instance = Element
export type TextInstance = Text
export type SuspenseInstance = Comment
export type HydratableInstance = Instance | TextInstance | SuspenseInstance

type HostContextDev = {
  namespace: string
  ancestorInfo: mixed
}
type HostContextProd = string
export type HostContext = HostContextDev | HostContextProd
export type UpdatePayload = Array<mixed>
export type ChildSet = void // Unused
export type TimeoutHandle = TimeoutID
export type NoTimeout = -1

const SUSPENSE_START_DATA = '$'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let eventsEnabled: boolean | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let selectionInformation: mixed | null = null

export const scheduleTimeout =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof setTimeout === 'function' ? setTimeout : (undefined as any)
export const noTimeout = -1

export const cancelPassiveEffects = cancelDeferredCallback

export const isPrimaryRenderer = true

export function getRootHostContext(
  rootContainerInstance: Container,
): HostContext {
  let type
  let namespace
  const nodeType = rootContainerInstance.nodeType
  switch (nodeType) {
    case DOCUMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE: {
      type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment'
      // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
      let root = (rootContainerInstance as any).documentElement
      namespace = root ? root.namespaceURI : getChildNamespace(null, '')
      break
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const container: any =
        nodeType === COMMENT_NODE
          ? rootContainerInstance.parentNode
          : rootContainerInstance
      const ownNamespace = container.namespaceURI || null
      type = container.tagName
      namespace = getChildNamespace(ownNamespace, type)
      break
    }
  }
  return namespace
}

export function getChildHostContext(
  parentHostContext: HostContext,
  type: string,
): HostContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentNamespace = ((parentHostContext as any) as HostContextProd)
  return getChildNamespace(parentNamespace, type)
}

export function prepareForCommit(): void {
  eventsEnabled = ZzeactBrowserEventEmitterIsEnabled()
  selectionInformation = getSelectionInformation()
  ZzeactBrowserEventEmitterSetEnabled(false)
}

export function resetAfterCommit(): void {
  restoreSelection(selectionInformation)
  selectionInformation = null
  ZzeactBrowserEventEmitterSetEnabled(eventsEnabled)
  eventsEnabled = null
}

export const supportsHydration = true

export function shouldSetTextContent(type: string, props: Props): boolean {
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  )
}

export function shouldDeprioritizeSubtree(type: string, props: Props): boolean {
  return !!props.hidden
}

export function canHydrateInstance(
  instance: HydratableInstance,
  type: string,
  // props: Props,
): null | Instance {
  if (
    instance.nodeType !== ELEMENT_NODE ||
    type.toLowerCase() !== instance.nodeName.toLowerCase()
  ) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((instance as any) as Instance)
}

export function canHydrateTextInstance(
  instance: HydratableInstance,
  text: string,
): null | TextInstance {
  if (text === '' || instance.nodeType !== TEXT_NODE) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((instance as any) as TextInstance)
}

export function canHydrateSuspenseInstance(
  instance: HydratableInstance,
): null | SuspenseInstance {
  if (instance.nodeType !== COMMENT_NODE) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((instance as any) as SuspenseInstance)
}

export function getNextHydratableSibling(
  instance: HydratableInstance,
): null | HydratableInstance {
  let node = instance.nextSibling
  while (
    node &&
    node.nodeType !== ELEMENT_NODE &&
    node.nodeType !== TEXT_NODE &&
    (node.nodeType !== COMMENT_NODE ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any).data !== SUSPENSE_START_DATA)
  ) {
    node = node.nextSibling
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (node as any)
}

export function getFirstHydratableChild(
  parentInstance: Container | Instance,
): null | HydratableInstance {
  let next = parentInstance.firstChild
  while (
    next &&
    next.nodeType !== ELEMENT_NODE &&
    next.nodeType !== TEXT_NODE &&
    (next.nodeType !== COMMENT_NODE ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next as any).data !== SUSPENSE_START_DATA)
  ) {
    next = next.nextSibling
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (next as any)
}
