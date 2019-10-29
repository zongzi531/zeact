import { Fiber } from './ZzeactFiber'
import { StackCursor } from './ZzeactFiberStack'
import { Container, HostContext } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

import invariant from '@/shared/invariant'

import { getChildHostContext, getRootHostContext } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { createCursor, push, pop } from './ZzeactFiberStack'

declare class NoContextT {}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NO_CONTEXT: NoContextT = ({} as any)

// eslint-disable-next-line prefer-const
let contextStackCursor: StackCursor<HostContext | NoContextT> = createCursor(
  NO_CONTEXT,
)
// eslint-disable-next-line prefer-const
let contextFiberStackCursor: StackCursor<Fiber | NoContextT> = createCursor(
  NO_CONTEXT,
)
// eslint-disable-next-line prefer-const
let rootInstanceStackCursor: StackCursor<Container | NoContextT> = createCursor(
  NO_CONTEXT,
)

function requiredContext<Value>(c: Value | NoContextT): Value {
  invariant(
    c !== NO_CONTEXT,
    'Expected host context to exist. This error is likely caused by a bug ' +
      'in Zzeact. Please file an issue.',
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (c as any)
}

function getRootHostContainer(): Container {
  const rootInstance = requiredContext(rootInstanceStackCursor.current)
  return rootInstance
}

function pushHostContainer(fiber: Fiber, nextRootInstance: Container): void {
  push(rootInstanceStackCursor, nextRootInstance /* , fiber */ )
  push(contextFiberStackCursor, fiber /* , fiber */ )
  push(contextStackCursor, NO_CONTEXT /* , fiber */ )
  const nextRootContext = getRootHostContext(nextRootInstance)
  pop(contextStackCursor /* , fiber */ )
  push(contextStackCursor, nextRootContext /* , fiber */ )
}

function popHostContainer(/* fiber: Fiber */): void {
  pop(contextStackCursor /* , fiber */ )
  pop(contextFiberStackCursor /* , fiber */ )
  pop(rootInstanceStackCursor /* , fiber */ )
}

function getHostContext(): HostContext {
  const context = requiredContext(contextStackCursor.current)
  return context
}

function pushHostContext(fiber: Fiber): void {
  // const rootInstance: Container = requiredContext(
  //   rootInstanceStackCursor.current,
  // )
  const context: HostContext = requiredContext(contextStackCursor.current)
  const nextContext = getChildHostContext(context, fiber.type /*, rootInstance*/)

  if (context === nextContext) {
    return
  }

  push(contextFiberStackCursor, fiber /* , fiber */ )
  push(contextStackCursor, nextContext /* , fiber */ )
}

function popHostContext(fiber: Fiber): void {
  if (contextFiberStackCursor.current !== fiber) {
    return
  }

  pop(contextStackCursor /* , fiber */ )
  pop(contextFiberStackCursor /* , fiber */ )
}

export {
  getHostContext,
  getRootHostContainer,
  popHostContainer,
  popHostContext,
  pushHostContainer,
  pushHostContext,
}
