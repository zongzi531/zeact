import { precacheFiberNode, updateFiberProps } from './ZzeactDOMComponentTree'
import {
  createElement,
  createTextNode,
  setInitialProperties,
  diffProperties,
  updateProperties,
  diffHydratedProperties,
  diffHydratedText,
  trapClickOnNonInteractiveElement,
  // warnForUnmatchedText,
  // warnForDeletedHydratableElement,
  // warnForDeletedHydratableText,
  // warnForInsertedHydratedElement,
  // warnForInsertedHydratedText,
} from './ZzeactDOMComponent'
import { getSelectionInformation, restoreSelection } from './ZzeactInputSelection'
import setTextContent from './setTextContent'

import {
  isEnabled as ZzeactBrowserEventEmitterIsEnabled,
  setEnabled as ZzeactBrowserEventEmitterSetEnabled,
} from '../events/ZzeactBrowserEventEmitter'

import {
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
} from '@/scheduler'
export {
  unstable_now as now,
  unstable_scheduleCallback as scheduleDeferredCallback,
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
import dangerousStyleValue from '../shared/dangerousStyleValue'

import { DOMContainer } from './ZzeactDOM'


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
const SUSPENSE_END_DATA = '/$'

const STYLE = 'style'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let eventsEnabled: boolean | null = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let selectionInformation: mixed | null = null

function shouldAutoFocusHostComponent(type: string, props: Props): boolean {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus
  }
  return false
}

export const scheduleTimeout =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof setTimeout === 'function' ? setTimeout : (undefined as any)
export const noTimeout = -1

export const cancelPassiveEffects = cancelDeferredCallback

export const isPrimaryRenderer = true

export const cancelTimeout =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof clearTimeout === 'function' ? clearTimeout : (undefined as any)

export const schedulePassiveEffects = scheduleDeferredCallback

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPublicInstance(instance: Instance): any {
  return instance
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

export function createInstance(
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  internalInstanceHandle: any,
): Instance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentNamespace: string = ((hostContext as any) as HostContextProd)
  const domElement: Instance = createElement(
    type,
    props,
    rootContainerInstance,
    parentNamespace,
  )
  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)
  return domElement
}


export function appendInitialChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  parentInstance.appendChild(child)
}

export function finalizeInitialChildren(
  domElement: Instance,
  type: string,
  props: Props,
  rootContainerInstance: Container,
): boolean {
  setInitialProperties(domElement, type, props, rootContainerInstance)
  return shouldAutoFocusHostComponent(type, props)
}

export function prepareUpdate(
  domElement: Instance,
  type: string,
  oldProps: Props,
  newProps: Props,
  rootContainerInstance: Container,
): null | Array<mixed> {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
  )
}

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

export function createTextInstance(
  text: string,
  rootContainerInstance: Container,
  hostContext: HostContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  internalInstanceHandle: any,
): TextInstance {
  const textNode: TextInstance = createTextNode(text, rootContainerInstance)
  precacheFiberNode(internalInstanceHandle, textNode)
  return textNode
}

// -------------------
//     Mutation
// -------------------

export const supportsMutation = true

export function commitMount(
  domElement: Instance,
  type: string,
  newProps: Props,
): void {
  if (shouldAutoFocusHostComponent(type, newProps)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((domElement as any) as
      | HTMLButtonElement
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement).focus()
  }
}

export function commitUpdate(
  domElement: Instance,
  updatePayload: Array<mixed>,
  type: string,
  oldProps: Props,
  newProps: Props,
): void {
  updateFiberProps(domElement, newProps)
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
}

export function resetTextContent(domElement: Instance): void {
  setTextContent(domElement, '')
}

export function commitTextUpdate(
  textInstance: TextInstance,
  oldText: string,
  newText: string,
): void {
  textInstance.nodeValue = newText
}

export function appendChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  parentInstance.appendChild(child)
}

export function appendChildToContainer(
  container: DOMContainer,
  child: Instance | TextInstance,
): void {
  let parentNode
  if (container.nodeType === COMMENT_NODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentNode = (container.parentNode as any)
    parentNode.insertBefore(child, container)
  } else {
    parentNode = container
    parentNode.appendChild(child)
  }
  const zzeactRootContainer = container._zzeactRootContainer
  if (
    (zzeactRootContainer === null || zzeactRootContainer === undefined) &&
    parentNode.onclick === null
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trapClickOnNonInteractiveElement(((parentNode as any) as HTMLElement))
  }
}

export function insertBefore(
  parentInstance: Instance,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance | SuspenseInstance,
): void {
  parentInstance.insertBefore(child, beforeChild)
}

export function insertInContainerBefore(
  container: Container,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance | SuspenseInstance,
): void {
  if (container.nodeType === COMMENT_NODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (container.parentNode as any).insertBefore(child, beforeChild)
  } else {
    container.insertBefore(child, beforeChild)
  }
}

export function removeChild(
  parentInstance: Instance,
  child: Instance | TextInstance | SuspenseInstance,
): void {
  parentInstance.removeChild(child)
}

export function removeChildFromContainer(
  container: Container,
  child: Instance | TextInstance | SuspenseInstance,
): void {
  if (container.nodeType === COMMENT_NODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (container.parentNode as any).removeChild(child)
  } else {
    container.removeChild(child)
  }
}

export function clearSuspenseBoundary(
  parentInstance: Instance,
  suspenseInstance: SuspenseInstance,
): void {
  let node = suspenseInstance
  let depth = 0
  do {
    const nextNode = node.nextSibling
    parentInstance.removeChild(node)
    if (nextNode && nextNode.nodeType === COMMENT_NODE) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = ((nextNode as any).data as string)
      if (data === SUSPENSE_END_DATA) {
        if (depth === 0) {
          parentInstance.removeChild(nextNode)
          return
        } else {
          depth--
        }
      } else if (data === SUSPENSE_START_DATA) {
        depth++
      }
    }
    node = nextNode as Comment
  } while (node)
}

export function clearSuspenseBoundaryFromContainer(
  container: Container,
  suspenseInstance: SuspenseInstance,
): void {
  if (container.nodeType === COMMENT_NODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearSuspenseBoundary((container.parentNode as any), suspenseInstance)
  } else if (container.nodeType === ELEMENT_NODE) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clearSuspenseBoundary((container as any), suspenseInstance)
  }
}

export function hideInstance(instance: Instance | HTMLElement): void {
  // instance = ((instance as any) as HTMLElement)
  (instance as HTMLElement).style.display = 'none'
}

export function hideTextInstance(textInstance: TextInstance): void {
  textInstance.nodeValue = ''
}

export function unhideInstance(instance: Instance | HTMLElement, props: Props): void {
  // instance = ((instance as any) as HTMLElement)
  const styleProp = props[STYLE]
  const display =
    styleProp !== undefined &&
    styleProp !== null &&
    styleProp.hasOwnProperty('display')
      ? styleProp.display
      : null
  ;(instance as HTMLElement).style.display = dangerousStyleValue('display', display)
}

export function unhideTextInstance(
  textInstance: TextInstance,
  text: string,
): void {
  textInstance.nodeValue = text
}

// -------------------
//     Hydration
// -------------------

export const supportsHydration = true

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

export function hydrateInstance(
  instance: Instance,
  type: string,
  props: Props,
  rootContainerInstance: Container,
  hostContext: HostContext,
  internalInstanceHandle: object,
): null | Array<mixed> {
  precacheFiberNode(internalInstanceHandle, instance)
  updateFiberProps(instance, props)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentNamespace = ((hostContext as any) as HostContextProd)
  return diffHydratedProperties(
    instance,
    type,
    props,
    parentNamespace,
    rootContainerInstance,
  )
}

export function hydrateTextInstance(
  textInstance: TextInstance,
  text: string,
  internalInstanceHandle: object,
): boolean {
  precacheFiberNode(internalInstanceHandle, textInstance)
  return diffHydratedText(textInstance, text)
}

export function getNextHydratableInstanceAfterSuspenseInstance(
  suspenseInstance: SuspenseInstance,
): null | HydratableInstance {
  let node = suspenseInstance.nextSibling
  let depth = 0
  while (node) {
    if (node.nodeType === COMMENT_NODE) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = ((node as any).data as string)
      if (data === SUSPENSE_END_DATA) {
        if (depth === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return getNextHydratableSibling((node as any))
        } else {
          depth--
        }
      } else if (data === SUSPENSE_START_DATA) {
        depth++
      }
    }
    node = node.nextSibling
  }
  return null
}

export function didNotMatchHydratedContainerTextInstance(): void { return }
export function didNotMatchHydratedTextInstance(): void { return }
export function didNotHydrateContainerInstance(): void { return }
export function didNotHydrateInstance(): void { return }
export function didNotFindHydratableContainerInstance(): void { return }
export function didNotFindHydratableContainerTextInstance(): void { return }
export function didNotFindHydratableContainerSuspenseInstance(): void { return }
export function didNotFindHydratableInstance(): void { return }
export function didNotFindHydratableTextInstance(): void { return }
export function didNotFindHydratableSuspenseInstance(): void { return }
