import { FiberRoot } from './ZzeactFiberRoot'
import {
  // Instance,
  // TextInstance,
  Container,
  // PublicInstance,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { ZzeactNodeList } from '@/shared/ZzeactTypes'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { createFiberRoot } from './ZzeactFiberRoot'

import {
  // computeUniqueAsyncExpiration,
  requestCurrentTime,
  // computeExpirationForFiber,
  // scheduleWork,
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
  // flushPassiveEffects,
} from './ZzeactFiberScheduler'

type OpaqueRoot = FiberRoot

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
  callback?: Function,
): ExpirationTime {
  const current = container.current
  const currentTime = requestCurrentTime()

  console.log('2019/10/22 Reading stop:', element, container, parentComponent, callback)
  console.log('2019/10/22 Reading stop:', current, currentTime)
  return currentTime
  // const expirationTime = computeExpirationForFiber(currentTime, current)
  // return updateContainerAtExpirationTime(
  //   element,
  //   container,
  //   parentComponent,
  //   expirationTime,
  //   callback,
  // )
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
