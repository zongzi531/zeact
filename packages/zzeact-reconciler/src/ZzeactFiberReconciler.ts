import warningWithoutStack from '@/shared/warningWithoutStack'
import { IFiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { Container } from './ZzeactFiberHostConfig'
import { createFiberRoot } from './ZzeactFiberRoot'
import { scheduleWork } from './ZzeactFiberScheduler'

type OpaqueRoot = FiberRoot

export function updateContainer(
  element: ZzeactNodeList,
  container: OpaqueRoot,
  parentComponent?: Zzeact$Component<any, any>,
  callback?: () => any,
): ExpirationTime {
  const current = container.current
  // const currentTime = requestCurrentTime()
  // const expirationTime = computeExpirationForFiber(currentTime, current)
  const expirationTime = 0
  return updateContainerAtExpirationTime(
    element,
    container,
    parentComponent,
    expirationTime,
    callback,
  )
}

export function createContainer(
  containerInfo: Container,
  isConcurrent: boolean,
  hydrate: boolean,
): OpaqueRoot {
  return createFiberRoot(containerInfo, isConcurrent, hydrate)
}

export function updateContainerAtExpirationTime(
  element: ZzeactNodeList,
  container: OpaqueRoot,
  parentComponent: Zzeact$Component<any, any>,
  expirationTime: ExpirationTime,
  callback?: () => any,
) {
  // TODO: If this is a nested container, this won't be the root.
  const current = container.current
  // const context = getContextForSubtree(parentComponent)
  // if (container.context === null) {
  //   container.context = context
  // } else {
  //   container.pendingContext = context
  // }

  return scheduleRootUpdate(current, element, expirationTime, callback)
}

function scheduleRootUpdate(
  current: IFiber,
  element: ZzeactNodeList,
  expirationTime: ExpirationTime,
  callback?: () => any,
) {

  // const update = createUpdate(expirationTime)
  // Caution: React DevTools currently depends on this property
  // being called "element".
  // update.payload = {element}

  callback = callback === undefined ? null : callback
  if (callback !== null) {
    warningWithoutStack(
      typeof callback === 'function',
      'render(...): Expected the last optional `callback` argument to be a ' +
        'function. Instead received: %s.',
      callback,
    )
    // update.callback = callback
  }

  // flushPassiveEffects()
  // enqueueUpdate(current, update)
  scheduleWork(current, expirationTime)

  return expirationTime
}
