import { Fiber } from './ZzeactFiber'
import {
  Instance,
  TextInstance,
  HydratableInstance,
  SuspenseInstance,
  // Container,
  // HostContext,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

import {
  HostComponent,
  HostText,
  // HostRoot,
  SuspenseComponent,
  DehydratedSuspenseComponent,
} from '@/shared/ZzeactWorkTags'
import { Deletion, Placement } from '@/shared/ZzeactSideEffectTags'

import { createFiberFromHostInstanceForDeletion } from './ZzeactFiber'
import {
  // shouldSetTextContent,
  supportsHydration,
  canHydrateInstance,
  canHydrateTextInstance,
  canHydrateSuspenseInstance,
  getNextHydratableSibling,
  getFirstHydratableChild,
  // hydrateInstance,
  // hydrateTextInstance,
  // getNextHydratableInstanceAfterSuspenseInstance,
  // didNotMatchHydratedContainerTextInstance,
  // didNotMatchHydratedTextInstance,
  // didNotHydrateContainerInstance,
  // didNotHydrateInstance,
  // didNotFindHydratableContainerInstance,
  // didNotFindHydratableContainerTextInstance,
  // didNotFindHydratableContainerSuspenseInstance,
  // didNotFindHydratableInstance,
  // didNotFindHydratableTextInstance,
  // didNotFindHydratableSuspenseInstance,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { enableSuspenseServerRenderer } from '@/shared/ZzeactFeatureFlags'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hydrationParentFiber: null | Fiber = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let nextHydratableInstance: null | HydratableInstance = null
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isHydrating: boolean = false

function enterHydrationState(fiber: Fiber): boolean {
  if (!supportsHydration) {
    return false
  }

  const parentInstance = fiber.stateNode.containerInfo
  nextHydratableInstance = getFirstHydratableChild(parentInstance)
  hydrationParentFiber = fiber
  isHydrating = true
  return true
}

function resetHydrationState(): void {
  if (!supportsHydration) {
    return
  }

  hydrationParentFiber = null
  nextHydratableInstance = null
  isHydrating = false
}

function deleteHydratableInstance(
  returnFiber: Fiber,
  instance: HydratableInstance,
): void {
  const childToDelete = createFiberFromHostInstanceForDeletion()
  childToDelete.stateNode = instance
  childToDelete.return = returnFiber
  childToDelete.effectTag = Deletion

  if (returnFiber.lastEffect !== null) {
    returnFiber.lastEffect.nextEffect = childToDelete
    returnFiber.lastEffect = childToDelete
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = childToDelete
  }
}

function insertNonHydratedInstance(returnFiber: Fiber, fiber: Fiber): void {
  fiber.effectTag |= Placement
}

function tryHydrate(fiber, nextInstance): boolean {
  switch (fiber.tag) {
    case HostComponent: {
      const type = fiber.type
      // const props = fiber.pendingProps
      const instance = canHydrateInstance(nextInstance, type/* , props */)
      if (instance !== null) {
        fiber.stateNode = (instance as Instance)
        return true
      }
      return false
    }
    case HostText: {
      const text = fiber.pendingProps
      const textInstance = canHydrateTextInstance(nextInstance, text)
      if (textInstance !== null) {
        fiber.stateNode = (textInstance as TextInstance)
        return true
      }
      return false
    }
    case SuspenseComponent: {
      if (enableSuspenseServerRenderer) {
        const suspenseInstance = canHydrateSuspenseInstance(nextInstance)
        if (suspenseInstance !== null) {
          fiber.tag = DehydratedSuspenseComponent
          fiber.stateNode = (suspenseInstance as SuspenseInstance)
          return true
        }
      }
      return false
    }
    default:
      return false
  }
}

function tryToClaimNextHydratableInstance(fiber: Fiber): void {
  if (!isHydrating) {
    return
  }
  let nextInstance = nextHydratableInstance
  if (!nextInstance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insertNonHydratedInstance((hydrationParentFiber as any), fiber)
    isHydrating = false
    hydrationParentFiber = fiber
    return
  }
  const firstAttemptedInstance = nextInstance
  if (!tryHydrate(fiber, nextInstance)) {
    nextInstance = getNextHydratableSibling(firstAttemptedInstance)
    if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insertNonHydratedInstance((hydrationParentFiber as any), fiber)
      isHydrating = false
      hydrationParentFiber = fiber
      return
    }
    deleteHydratableInstance(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hydrationParentFiber as any),
      firstAttemptedInstance,
    )
  }
  hydrationParentFiber = fiber
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextHydratableInstance = getFirstHydratableChild((nextInstance as any))
}

export {
  enterHydrationState,
  // reenterHydrationStateFromDehydratedSuspenseInstance,
  resetHydrationState,
  tryToClaimNextHydratableInstance,
  // prepareToHydrateHostInstance,
  // prepareToHydrateHostTextInstance,
  // skipPastDehydratedSuspenseInstance,
  // popHydrationState,
}
