import { registrationNameModules } from '@/events/EventPluginRegistry'

import {
  setValueForProperty,
} from './DOMPropertyOperations'
import {
  initWrapperState as ZzeactDOMInputInitWrapperState,
  getHostProps as ZzeactDOMInputGetHostProps,
  postMountWrapper as ZzeactDOMInputPostMountWrapper,
  updateChecked as ZzeactDOMInputUpdateChecked,
  updateWrapper as ZzeactDOMInputUpdateWrapper,
  restoreControlledState as ZzeactDOMInputRestoreControlledState,
} from './ZzeactDOMInput'
import {
  getHostProps as ZzeactDOMOptionGetHostProps,
  postMountWrapper as ZzeactDOMOptionPostMountWrapper,
} from './ZzeactDOMOption'
import {
  initWrapperState as ZzeactDOMSelectInitWrapperState,
  getHostProps as ZzeactDOMSelectGetHostProps,
  postMountWrapper as ZzeactDOMSelectPostMountWrapper,
  restoreControlledState as ZzeactDOMSelectRestoreControlledState,
  postUpdateWrapper as ZzeactDOMSelectPostUpdateWrapper,
} from './ZzeactDOMSelect'
import {
  initWrapperState as ZzeactDOMTextareaInitWrapperState,
  getHostProps as ZzeactDOMTextareaGetHostProps,
  postMountWrapper as ZzeactDOMTextareaPostMountWrapper,
  updateWrapper as ZzeactDOMTextareaUpdateWrapper,
  restoreControlledState as ZzeactDOMTextareaRestoreControlledState,
} from './ZzeactDOMTextarea'
import { track } from './inputValueTracking'
import setInnerHTML from './setInnerHTML'
import setTextContent from './setTextContent'
import {
  TOP_ERROR,
  TOP_INVALID,
  TOP_LOAD,
  TOP_RESET,
  TOP_SUBMIT,
  TOP_TOGGLE,
} from '../events/DOMTopLevelEventTypes'
import { listenTo, trapBubbledEvent } from '../events/ZzeactBrowserEventEmitter'
import { mediaEventTypes } from '../events/DOMTopLevelEventTypes'
import {
  setValueForStyles,
} from '../shared/CSSPropertyOperations'
import { Namespaces, getIntrinsicNamespace } from '../shared/DOMNamespaces'
import assertValidProps from '../shared/assertValidProps'
import { DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE } from '../shared/HTMLNodeType'
import isCustomComponent from '../shared/isCustomComponent'

const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML'
const SUPPRESS_CONTENT_EDITABLE_WARNING = 'suppressContentEditableWarning'
const SUPPRESS_HYDRATION_WARNING = 'suppressHydrationWarning'
const AUTOFOCUS = 'autoFocus'
const CHILDREN = 'children'
const STYLE = 'style'
const HTML = '__html'

const {html: HTML_NAMESPACE} = Namespaces

function ensureListeningTo(rootContainerElement, registrationName): void {
  const isDocumentOrFragment =
    rootContainerElement.nodeType === DOCUMENT_NODE ||
    rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE
  const doc = isDocumentOrFragment
    ? rootContainerElement
    : rootContainerElement.ownerDocument
  listenTo(registrationName, doc)
}

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Element | Document,
): Document {
  return rootContainerElement.nodeType === DOCUMENT_NODE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (rootContainerElement as any)
    : rootContainerElement.ownerDocument
}

function noop(): void { return }

export function trapClickOnNonInteractiveElement(node: HTMLElement): void {
  node.onclick = noop
}

function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement: Element | Document,
  nextProps: object,
  isCustomComponentTag: boolean,
): void {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue
    }
    const nextProp = nextProps[propKey]
    if (propKey === STYLE) {
      setValueForStyles(domElement, nextProp)
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined
      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml)
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        const canSetTextContent = tag !== 'textarea' || nextProp !== ''
        if (canSetTextContent) {
          setTextContent(domElement, nextProp)
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp)
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
    } else if (propKey === AUTOFOCUS) {
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey)
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag)
    }
  }
}

function updateDOMProperties(
  domElement: Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePayload: Array<any>,
  wasCustomComponentTag: boolean,
  isCustomComponentTag: boolean,
): void {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i]
    const propValue = updatePayload[i + 1]
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue)
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      setInnerHTML(domElement, propValue)
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag)
    }
  }
}

export function createElement(
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  rootContainerElement: Element | Document,
  parentNamespace: string,
): Element {
  const ownerDocument: Document = getOwnerDocumentFromRootContainer(
    rootContainerElement,
  )
  let domElement: Element
  let namespaceURI = parentNamespace
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(type)
  }
  if (namespaceURI === HTML_NAMESPACE) {

    if (type === 'script') {
      const div = ownerDocument.createElement('div')
      div.innerHTML = '<script><' + '/script>'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firstChild = ((div.firstChild as any) as HTMLScriptElement)
      domElement = div.removeChild(firstChild)
    } else if (typeof props.is === 'string') {
      domElement = ownerDocument.createElement(type, { is: props.is })
    } else {
      domElement = ownerDocument.createElement(type)
      if (type === 'select') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const node = ((domElement as any) as HTMLSelectElement)
        if (props.multiple) {
          node.multiple = true
        } else if (props.size) {
          node.size = props.size
        }
      }
    }
  } else {
    domElement = ownerDocument.createElementNS(namespaceURI, type)
  }

  return domElement
}

export function createTextNode(
  text: string,
  rootContainerElement: Element | Document,
): Text {
  return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(
    text,
  )
}

export function setInitialProperties(
  domElement: Element,
  tag: string,
  rawProps: object,
  rootContainerElement: Element | Document,
): void {
  const isCustomComponentTag = isCustomComponent(tag, rawProps)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let props: any
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent(TOP_LOAD, domElement)
      props = rawProps
      break
    case 'video':
    case 'audio':
      for (let i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement)
      }
      props = rawProps
      break
    case 'source':
      trapBubbledEvent(TOP_ERROR, domElement)
      props = rawProps
      break
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent(TOP_ERROR, domElement)
      trapBubbledEvent(TOP_LOAD, domElement)
      props = rawProps
      break
    case 'form':
      trapBubbledEvent(TOP_RESET, domElement)
      trapBubbledEvent(TOP_SUBMIT, domElement)
      props = rawProps
      break
    case 'details':
      trapBubbledEvent(TOP_TOGGLE, domElement)
      props = rawProps
      break
    case 'input':
      ZzeactDOMInputInitWrapperState(domElement, rawProps)
      props = ZzeactDOMInputGetHostProps(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
    case 'option':
      props = ZzeactDOMOptionGetHostProps(domElement, rawProps)
      break
    case 'select':
      ZzeactDOMSelectInitWrapperState(domElement, rawProps)
      props = ZzeactDOMSelectGetHostProps(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
    case 'textarea':
      ZzeactDOMTextareaInitWrapperState(domElement, rawProps)
      props = ZzeactDOMTextareaGetHostProps(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
    default:
      props = rawProps
  }

  assertValidProps(tag, props)

  setInitialDOMProperties(
    tag,
    domElement,
    rootContainerElement,
    props,
    isCustomComponentTag,
  )

  switch (tag) {
    case 'input':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track((domElement as any))
      ZzeactDOMInputPostMountWrapper(domElement, rawProps, false)
      break
    case 'textarea':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track((domElement as any))
      ZzeactDOMTextareaPostMountWrapper(domElement)
      break
    case 'option':
      ZzeactDOMOptionPostMountWrapper(domElement, rawProps)
      break
    case 'select':
      ZzeactDOMSelectPostMountWrapper(domElement, rawProps)
      break
    default:
      if (typeof props.onClick === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trapClickOnNonInteractiveElement(((domElement as any) as HTMLElement))
      }
      break
  }
}

export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: object,
  nextRawProps: object,
  rootContainerElement: Element | Document,
): null | Array<mixed> {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let updatePayload: null | Array<any> = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastProps: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextProps: any
  switch (tag) {
    case 'input':
      lastProps = ZzeactDOMInputGetHostProps(domElement, lastRawProps)
      nextProps = ZzeactDOMInputGetHostProps(domElement, nextRawProps)
      updatePayload = []
      break
    case 'option':
      lastProps = ZzeactDOMOptionGetHostProps(domElement, lastRawProps)
      nextProps = ZzeactDOMOptionGetHostProps(domElement, nextRawProps)
      updatePayload = []
      break
    case 'select':
      lastProps = ZzeactDOMSelectGetHostProps(domElement, lastRawProps)
      nextProps = ZzeactDOMSelectGetHostProps(domElement, nextRawProps)
      updatePayload = []
      break
    case 'textarea':
      lastProps = ZzeactDOMTextareaGetHostProps(domElement, lastRawProps)
      nextProps = ZzeactDOMTextareaGetHostProps(domElement, nextRawProps)
      updatePayload = []
      break
    default:
      lastProps = lastRawProps
      nextProps = nextRawProps
      if (
        typeof lastProps.onClick !== 'function' &&
        typeof nextProps.onClick === 'function'
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trapClickOnNonInteractiveElement(((domElement as any) as HTMLElement))
      }
      break
  }

  assertValidProps(tag, nextProps)

  let propKey
  let styleName
  let styleUpdates = null
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue
    }
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey]
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {}
          }
          styleUpdates[styleName] = ''
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
    } else if (propKey === AUTOFOCUS) {
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (!updatePayload) {
        updatePayload = []
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey]
    const lastProp = lastProps != null ? lastProps[propKey] : undefined
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue
    }
    if (propKey === STYLE) {
      if (lastProp) {
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = ''
          }
        }
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = []
          }
          updatePayload.push(propKey, styleUpdates)
        }
        styleUpdates = nextProp
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined
      const lastHtml = lastProp ? lastProp[HTML] : undefined
      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, '' + nextHtml)
        }
      }
    } else if (propKey === CHILDREN) {
      if (
        lastProp !== nextProp &&
        (typeof nextProp === 'string' || typeof nextProp === 'number')
      ) {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else if (
      propKey === SUPPRESS_CONTENT_EDITABLE_WARNING ||
      propKey === SUPPRESS_HYDRATION_WARNING
    ) {
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey)
      }
      if (!updatePayload && lastProp !== nextProp) {
        updatePayload = []
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }
  return updatePayload
}

export function updateProperties(
  domElement: Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePayload: Array<any>,
  tag: string,
  lastRawProps: object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextRawProps: any,
): void {
  if (
    tag === 'input' &&
    nextRawProps.type === 'radio' &&
    nextRawProps.name != null
  ) {
    ZzeactDOMInputUpdateChecked(domElement, nextRawProps)
  }

  const wasCustomComponentTag = isCustomComponent(tag, lastRawProps)
  const isCustomComponentTag = isCustomComponent(tag, nextRawProps)

  updateDOMProperties(
    domElement,
    updatePayload,
    wasCustomComponentTag,
    isCustomComponentTag,
  )

  switch (tag) {
    case 'input':
      ZzeactDOMInputUpdateWrapper(domElement, nextRawProps)
      break
    case 'textarea':
      ZzeactDOMTextareaUpdateWrapper(domElement, nextRawProps)
      break
    case 'select':
      ZzeactDOMSelectPostUpdateWrapper(domElement, nextRawProps)
      break
  }
}

export function diffHydratedProperties(
  domElement: Element,
  tag: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawProps: any,
  parentNamespace: string,
  rootContainerElement: Element | Document,
): null | Array<mixed> {
  switch (tag) {
    case 'iframe':
    case 'object':
      trapBubbledEvent(TOP_LOAD, domElement)
      break
    case 'video':
    case 'audio':
      for (let i = 0; i < mediaEventTypes.length; i++) {
        trapBubbledEvent(mediaEventTypes[i], domElement)
      }
      break
    case 'source':
      trapBubbledEvent(TOP_ERROR, domElement)
      break
    case 'img':
    case 'image':
    case 'link':
      trapBubbledEvent(TOP_ERROR, domElement)
      trapBubbledEvent(TOP_LOAD, domElement)
      break
    case 'form':
      trapBubbledEvent(TOP_RESET, domElement)
      trapBubbledEvent(TOP_SUBMIT, domElement)
      break
    case 'details':
      trapBubbledEvent(TOP_TOGGLE, domElement)
      break
    case 'input':
      ZzeactDOMInputInitWrapperState(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
    case 'option':
      break
    case 'select':
      ZzeactDOMSelectInitWrapperState(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
    case 'textarea':
      ZzeactDOMTextareaInitWrapperState(domElement, rawProps)
      trapBubbledEvent(TOP_INVALID, domElement)
      ensureListeningTo(rootContainerElement, 'onChange')
      break
  }

  assertValidProps(tag, rawProps)

  let updatePayload = null
  for (const propKey in rawProps) {
    if (!rawProps.hasOwnProperty(propKey)) {
      continue
    }
    const nextProp = rawProps[propKey]
    if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        if (domElement.textContent !== nextProp) {
          updatePayload = [CHILDREN, nextProp]
        }
      } else if (typeof nextProp === 'number') {
        if (domElement.textContent !== '' + nextProp) {
          updatePayload = [CHILDREN, '' + nextProp]
        }
      }
    } else if (registrationNameModules.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        ensureListeningTo(rootContainerElement, propKey)
      }
    }
  }

  switch (tag) {
    case 'input':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track((domElement as any))
      ZzeactDOMInputPostMountWrapper(domElement, rawProps, true)
      break
    case 'textarea':
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track((domElement as any))
      ZzeactDOMTextareaPostMountWrapper(domElement)
      break
    case 'select':
    case 'option':
      break
    default:
      if (typeof rawProps.onClick === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trapClickOnNonInteractiveElement(((domElement as any) as HTMLElement))
      }
      break
  }

  return updatePayload
}

export function diffHydratedText(textNode: Text, text: string): boolean {
  const isDifferent = textNode.nodeValue !== text
  return isDifferent
}

export function warnForUnmatchedText(): void { return }
export function warnForDeletedHydratableElement(): void { return }
export function warnForDeletedHydratableText(): void { return }
export function warnForInsertedHydratedElement(): void { return }
export function warnForInsertedHydratedText(): void { return }

export function restoreControlledState(
  domElement: Element,
  tag: string,
  props: object,
): void {
  switch (tag) {
    case 'input':
      ZzeactDOMInputRestoreControlledState(domElement, props)
      return
    case 'textarea':
      ZzeactDOMTextareaRestoreControlledState(domElement, props)
      return
    case 'select':
      ZzeactDOMSelectRestoreControlledState(domElement, props)
      return
  }
}
