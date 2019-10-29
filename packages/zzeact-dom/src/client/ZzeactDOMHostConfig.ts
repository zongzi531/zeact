import {
  // unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from '@/scheduler'
export {
  unstable_now as now,
  // unstable_scheduleCallback as scheduleDeferredCallback,
  // unstable_shouldYield as shouldYield,
  unstable_cancelCallback as cancelDeferredCallback,
} from '@/scheduler'

import { getChildNamespace } from '../shared/DOMNamespaces'
import {
  // ELEMENT_NODE,
  // TEXT_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from '../shared/HTMLNodeType'

export type Container = Element | Document

type HostContextDev = {
  namespace: string
  ancestorInfo: mixed
}
type HostContextProd = string
export type HostContext = HostContextDev | HostContextProd

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
