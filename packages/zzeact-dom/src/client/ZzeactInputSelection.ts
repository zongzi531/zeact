import getActiveElement from './getActiveElement'

import { getOffsets, setOffsets } from './ZzeactDOMSelection'
import { ELEMENT_NODE, TEXT_NODE } from '../shared/HTMLNodeType'

function isTextNode(node): boolean {
  return node && node.nodeType === TEXT_NODE
}

function containsNode(outerNode, innerNode): boolean {
  if (!outerNode || !innerNode) {
    return false
  } else if (outerNode === innerNode) {
    return true
  } else if (isTextNode(outerNode)) {
    return false
  } else if (isTextNode(innerNode)) {
    return containsNode(outerNode, innerNode.parentNode)
  } else if ('contains' in outerNode) {
    return outerNode.contains(innerNode)
  } else if (outerNode.compareDocumentPosition) {
    return !!(outerNode.compareDocumentPosition(innerNode) & 16)
  } else {
    return false
  }
}

function isInDocument(node): boolean {
  return (
    node &&
    node.ownerDocument &&
    containsNode(node.ownerDocument.documentElement, node)
  )
}

function isSameOriginFrame(iframe): boolean {
  try {
    return typeof iframe.contentWindow.location.href === 'string'
  } catch (err) {
    return false
  }
}

function getActiveElementDeep(): Element {
  let win = window
  let element = getActiveElement()
  while (element instanceof win.HTMLIFrameElement) {
    if (isSameOriginFrame(element)) {
      win = element.contentWindow as Window & typeof globalThis
    } else {
      return element
    }
    element = getActiveElement(win.document)
  }
  return element
}

export function hasSelectionCapabilities(elem): boolean {
  const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase()
  return (
    nodeName &&
    ((nodeName === 'input' &&
      (elem.type === 'text' ||
        elem.type === 'search' ||
        elem.type === 'tel' ||
        elem.type === 'url' ||
        elem.type === 'password')) ||
      nodeName === 'textarea' ||
      elem.contentEditable === 'true')
  )
}

export function getSelectionInformation(): object {
  const focusedElem = getActiveElementDeep()
  return {
    focusedElem: focusedElem,
    selectionRange: hasSelectionCapabilities(focusedElem)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      ? getSelection(focusedElem)
      : null,
  }
}

export function restoreSelection(priorSelectionInformation): void {
  const curFocusedElem = getActiveElementDeep()
  const priorFocusedElem = priorSelectionInformation.focusedElem
  const priorSelectionRange = priorSelectionInformation.selectionRange
  if (curFocusedElem !== priorFocusedElem && isInDocument(priorFocusedElem)) {
    if (
      priorSelectionRange !== null &&
      hasSelectionCapabilities(priorFocusedElem)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setSelection(priorFocusedElem, priorSelectionRange)
    }

    const ancestors = []
    let ancestor = priorFocusedElem
    while ((ancestor = ancestor.parentNode)) {
      if (ancestor.nodeType === ELEMENT_NODE) {
        ancestors.push({
          element: ancestor,
          left: ancestor.scrollLeft,
          top: ancestor.scrollTop,
        })
      }
    }

    if (typeof priorFocusedElem.focus === 'function') {
      priorFocusedElem.focus()
    }

    for (let i = 0; i < ancestors.length; i++) {
      const info = ancestors[i]
      info.element.scrollLeft = info.left
      info.element.scrollTop = info.top
    }
  }
}

export function getSelection(input): object {
  let selection

  if ('selectionStart' in input) {
    selection = {
      start: input.selectionStart,
      end: input.selectionEnd,
    }
  } else {
    selection = getOffsets(input)
  }

  return selection || {start: 0, end: 0}
}

export function setSelection(input, offsets): void {
  let { end } = offsets
  const { start } = offsets
  if (end === undefined) {
    end = start
  }

  if ('selectionStart' in input) {
    input.selectionStart = start
    input.selectionEnd = Math.min(end, input.value.length)
  } else {
    setOffsets(input, offsets)
  }
}
