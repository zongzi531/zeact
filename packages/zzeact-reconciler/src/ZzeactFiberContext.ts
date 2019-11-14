import { Fiber } from './ZzeactFiber'
import { StackCursor } from './ZzeactFiberStack'

import { isFiberMounted } from '@/zzeact-reconciler/reflection'
import { ClassComponent, HostRoot } from '@/shared/ZzeactWorkTags'
import getComponentName from '@/shared/getComponentName'
import invariant from '@/shared/invariant'

import {createCursor, push, pop} from './ZzeactFiberStack'

export const emptyContextObject = {}

// eslint-disable-next-line prefer-const
let contextStackCursor: StackCursor<object> = createCursor(emptyContextObject)
// eslint-disable-next-line prefer-const
let didPerformWorkStackCursor: StackCursor<boolean> = createCursor(false)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let previousContext: object = emptyContextObject

function hasContextChanged(): boolean {
  return didPerformWorkStackCursor.current
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isContextProvider(type: Function & { childContextTypes: any }): boolean {
  const childContextTypes = type.childContextTypes
  return childContextTypes !== null && childContextTypes !== undefined
}

function popContext(/* fiber: Fiber */): void {
  pop(didPerformWorkStackCursor, /* fiber */)
  pop(contextStackCursor, /* fiber */)
}

function popTopLevelContextObject(/* fiber: Fiber */): void {
  pop(didPerformWorkStackCursor, /* fiber */)
  pop(contextStackCursor, /* fiber */)
}

function pushTopLevelContextObject(
  fiber: Fiber,
  context: object,
  didChange: boolean,
): void {
  invariant(
    contextStackCursor.current === emptyContextObject,
    'Unexpected context found on stack. ' +
      'This error is likely caused by a bug in Zzeact. Please file an issue.',
  )

  push(contextStackCursor, context/*, fiber*/)
  push(didPerformWorkStackCursor, didChange/*, fiber*/)
}

function processChildContext(
  fiber: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  parentContext: object,
): object {
  const instance = fiber.stateNode
  const childContextTypes = type.childContextTypes

  if (typeof instance.getChildContext !== 'function') {
    return parentContext
  }

  const childContext = instance.getChildContext()
  for (const contextKey in childContext) {
    invariant(
      contextKey in childContextTypes,
      '%s.getChildContext(): key "%s" is not defined in childContextTypes.',
      getComponentName(type) || 'Unknown',
      contextKey,
    )
  }

  return {...parentContext, ...childContext}
}

function pushContextProvider(workInProgress: Fiber): boolean {
  const instance = workInProgress.stateNode
  const memoizedMergedChildContext =
    (instance && instance.__zzeactInternalMemoizedMergedChildContext) ||
    emptyContextObject
  previousContext = contextStackCursor.current
  push(contextStackCursor, memoizedMergedChildContext/*, workInProgress */)
  push(
    didPerformWorkStackCursor,
    didPerformWorkStackCursor.current,
    // workInProgress,
  )

  return true
}

function findCurrentUnmaskedContext(fiber: Fiber): object {
  invariant(
    isFiberMounted(fiber) && fiber.tag === ClassComponent,
    'Expected subtree parent to be a mounted class component. ' +
      'This error is likely caused by a bug in zzeact. Please file an issue.',
  )

  let node = fiber
  do {
    switch (node.tag) {
      case HostRoot:
        return node.stateNode.context
      case ClassComponent: {
        const Component = node.type
        if (isContextProvider(Component)) {
          return node.stateNode.__zzeactInternalMemoizedMergedChildContext
        }
        break
      }
    }
    node = node.return
  } while (node !== null)
  invariant(
    false,
    'Found unexpected detached subtree parent. ' +
      'This error is likely caused by a bug in zzeact. Please file an issue.',
  )
}

export {
  // getUnmaskedContext,
  // cacheContext,
  // getMaskedContext,
  hasContextChanged,
  popContext,
  popTopLevelContextObject,
  pushTopLevelContextObject,
  processChildContext,
  isContextProvider,
  pushContextProvider,
  // invalidateContextProvider,
  findCurrentUnmaskedContext,
}
