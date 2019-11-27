import invariant from '@/shared/invariant'
import {
  getIteratorFn,
  ZZEACT_ELEMENT_TYPE,
  ZZEACT_PORTAL_TYPE,
} from '@/shared/ZzeactSymbols'

import { isValidElement, cloneAndReplaceKey } from './ZzeactElement'

const SEPARATOR = '.'
const SUBSEPARATOR = ':'

function escape(key): string {
  const escapeRegex = /[=:]/g
  const escaperLookup = {
    '=': '=0',
    ':': '=2',
  }
  const escapedString = ('' + key).replace(escapeRegex, function(match) {
    return escaperLookup[match]
  })

  return '$' + escapedString
}

const userProvidedKeyEscapeRegex = /\/+/g
function escapeUserProvidedKey(text): string {
  return ('' + text).replace(userProvidedKeyEscapeRegex, '$&/')
}

const POOL_SIZE = 10
const traverseContextPool = []
function getPooledTraverseContext(
  mapResult,
  keyPrefix,
  mapFunction,
  mapContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (traverseContextPool.length) {
    const traverseContext = traverseContextPool.pop()
    traverseContext.result = mapResult
    traverseContext.keyPrefix = keyPrefix
    traverseContext.func = mapFunction
    traverseContext.context = mapContext
    traverseContext.count = 0
    return traverseContext
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0,
    }
  }
}

function releaseTraverseContext(traverseContext): void {
  traverseContext.result = null
  traverseContext.keyPrefix = null
  traverseContext.func = null
  traverseContext.context = null
  traverseContext.count = 0
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext)
  }
}

function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext,
): number {
  const type = typeof children

  if (type === 'undefined' || type === 'boolean') {
    children = null
  }

  let invokeCallback = false

  if (children === null) {
    invokeCallback = true
  } else {
    switch (type) {
      case 'string':
      case 'number':
        invokeCallback = true
        break
      case 'object':
        switch (children.$$typeof) {
          case ZZEACT_ELEMENT_TYPE:
          case ZZEACT_PORTAL_TYPE:
            invokeCallback = true
        }
    }
  }

  if (invokeCallback) {
    callback(
      traverseContext,
      children,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
    )
    return 1
  }

  let child
  let nextName
  let subtreeCount = 0
  const nextNamePrefix =
    nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR

  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      child = children[i]
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      nextName = nextNamePrefix + getComponentKey(child, i)
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext,
      )
    }
  } else {
    const iteratorFn = getIteratorFn(children)
    if (typeof iteratorFn === 'function') {

      const iterator = iteratorFn.call(children)
      let step
      let ii = 0
      while (!(step = iterator.next()).done) {
        child = step.value
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        nextName = nextNamePrefix + getComponentKey(child, ii++)
        subtreeCount += traverseAllChildrenImpl(
          child,
          nextName,
          callback,
          traverseContext,
        )
      }
    } else if (type === 'object') {
      const addendum = ''
      const childrenString = '' + children
      invariant(
        false,
        'Objects are not valid as a Zzeact child (found: %s).%s',
        childrenString === '[object Object]'
          ? 'object with keys {' + Object.keys(children).join(', ') + '}'
          : childrenString,
        addendum,
      )
    }
  }

  return subtreeCount
}

function traverseAllChildren(children, callback, traverseContext): number {
  if (children == null) {
    return 0
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext)
}

function getComponentKey(component, index): string {
  if (
    typeof component === 'object' &&
    component !== null &&
    component.key != null
  ) {
    return escape(component.key)
  }
  return index.toString(36)
}

function forEachSingleChild(bookKeeping, child): void {
  const {func, context} = bookKeeping
  func.call(context, child, bookKeeping.count++)
}

function forEachChildren(children, forEachFunc, forEachContext): void {
  if (children == null) {
    return children
  }
  const traverseContext = getPooledTraverseContext(
    null,
    null,
    forEachFunc,
    forEachContext,
  )
  traverseAllChildren(children, forEachSingleChild, traverseContext)
  releaseTraverseContext(traverseContext)
}

function mapSingleChildIntoContext(bookKeeping, child, childKey): void {
  const {result, keyPrefix, func, context} = bookKeeping

  let mappedChild = func.call(context, child, bookKeeping.count++)
  if (Array.isArray(mappedChild)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    mapIntoWithKeyPrefixInternal(mappedChild, result, childKey, c => c)
  } else if (mappedChild != null) {
    if (isValidElement(mappedChild)) {
      mappedChild = cloneAndReplaceKey(
        mappedChild,
        keyPrefix +
          (mappedChild.key && (!child || child.key !== mappedChild.key)
            ? escapeUserProvidedKey(mappedChild.key) + '/'
            : '') +
          childKey,
      )
    }
    result.push(mappedChild)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context?: any): void {
  let escapedPrefix = ''
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + '/'
  }
  const traverseContext = getPooledTraverseContext(
    array,
    escapedPrefix,
    func,
    context,
  )
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext)
  releaseTraverseContext(traverseContext)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChildren(children, func, context): any {
  if (children == null) {
    return children
  }
  const result = []
  mapIntoWithKeyPrefixInternal(children, result, null, func, context)
  return result
}

function countChildren(children): number {
  return traverseAllChildren(children, () => null, null)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toArray(children): any {
  const result = []
  mapIntoWithKeyPrefixInternal(children, result, null, child => child)
  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onlyChild(children): any {
  invariant(
    isValidElement(children),
    'Zzeact.Children.only expected to receive a single Zzeact element child.',
  )
  return children
}

export {
  forEachChildren as forEach,
  mapChildren as map,
  countChildren as count,
  onlyChild as only,
  toArray,
}
