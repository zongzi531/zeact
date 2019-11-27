import { Fiber } from './ZzeactFiber'
import { FiberRoot } from './ZzeactFiberRoot'
import {
  // Instance,
  // TextInstance,
  Container,
  PublicInstance,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { ZzeactNodeList } from '@/shared/ZzeactTypes'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { get as getInstance } from '@/shared/ZzeactInstanceMap'
import { HostComponent, ClassComponent } from '@/shared/ZzeactWorkTags'
import warningWithoutStack from '@/shared/warningWithoutStack'
import { getPublicInstance } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import {
  findCurrentUnmaskedContext,
  processChildContext,
  emptyContextObject,
  isContextProvider as isLegacyContextProvider,
} from './ZzeactFiberContext'
import { createFiberRoot } from './ZzeactFiberRoot'

import { createUpdate, enqueueUpdate } from './ZzeactUpdateQueue'

import {
  // computeUniqueAsyncExpiration,
  requestCurrentTime,
  computeExpirationForFiber,
  scheduleWork,
  // requestWork,
  // flushRoot,
  // batchedUpdates,
  unbatchedUpdates,
  // flushSync,
  // flushControlled,
  // deferredUpdates,
  // syncUpdates,
  // interactiveUpdates,
  // flushInteractiveUpdates,
  flushPassiveEffects,
} from './ZzeactFiberScheduler'

type OpaqueRoot = FiberRoot

function getContextForSubtree(
  parentComponent?: Zzeact$Component,
): object {
  if (!parentComponent) {
    return emptyContextObject
  }

  const fiber = getInstance(parentComponent)
  const parentContext = findCurrentUnmaskedContext(fiber)

  if (fiber.tag === ClassComponent) {
    const Component = fiber.type
    if (isLegacyContextProvider(Component)) {
      return processChildContext(fiber, Component, parentContext)
    }
  }

  return parentContext
}

function scheduleRootUpdate(
  current: Fiber,
  element: ZzeactNodeList,
  expirationTime: ExpirationTime,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: () => any,
): ExpirationTime {
  const update = createUpdate(expirationTime)
  update.payload = {element}

  callback = callback === undefined ? null : callback
  if (callback !== null) {
    warningWithoutStack(
      typeof callback === 'function',
      'render(...): Expected the last optional `callback` argument to be a ' +
        'function. Instead received: %s.',
      callback,
    )
    update.callback = callback
  }

  flushPassiveEffects()
  enqueueUpdate(current, update)
  scheduleWork(current, expirationTime)

  return expirationTime
}

export function updateContainerAtExpirationTime(
  element: ZzeactNodeList,
  container: OpaqueRoot,
  parentComponent: Zzeact$Component,
  expirationTime: ExpirationTime,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: () => any,
): ExpirationTime {
  const current = container.current

  const context = getContextForSubtree(parentComponent)
  if (container.context === null) {
    container.context = context
  } else {
    container.pendingContext = context
  }

  return scheduleRootUpdate(current, element, expirationTime, callback)
}

export function createContainer(
  containerInfo: Container,
  isConcurrent: boolean,
  hydrate: boolean,
): OpaqueRoot {
  return createFiberRoot(containerInfo, isConcurrent, hydrate)
}

export function updateContainer(
  element: ZzeactNodeList,
  container: OpaqueRoot,
  parentComponent?: Zzeact$Component,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback?: () => any,
): ExpirationTime {
  const current = container.current
  const currentTime = requestCurrentTime()
  const expirationTime = computeExpirationForFiber(currentTime, current)
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  )
}

export {
  // flushRoot,
  // requestWork,
  // computeUniqueAsyncExpiration,
  // batchedUpdates,
  unbatchedUpdates,
  // deferredUpdates,
  // syncUpdates,
  // interactiveUpdates,
  // flushInteractiveUpdates,
  // flushControlled,
  // flushSync,
}

export function getPublicRootInstance(
  container: OpaqueRoot,
): Zzeact$Component | PublicInstance | null {
  const containerFiber = container.current
  if (!containerFiber.child) {
    return null
  }
  switch (containerFiber.child.tag) {
    case HostComponent:
      return getPublicInstance(containerFiber.child.stateNode)
    default:
      return containerFiber.child.stateNode
  }
}
