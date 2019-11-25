import { Fiber } from './ZzeactFiber'
import {
  Instance,
  TextInstance,
  HydratableInstance,
  Container,
  HostContext,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

import {
  HostComponent,
  HostText,
  HostRoot,
  SuspenseComponent,
  DehydratedSuspenseComponent,
} from '@/shared/ZzeactWorkTags'
import { Deletion, Placement } from '@/shared/ZzeactSideEffectTags'
import invariant from '@/shared/invariant'

import { createFiberFromHostInstanceForDeletion } from './ZzeactFiber'
import {
  shouldSetTextContent,
  supportsHydration,
  canHydrateInstance,
  canHydrateTextInstance,
  getNextHydratableSibling,
  getFirstHydratableChild,
  hydrateInstance,
  hydrateTextInstance,
  getNextHydratableInstanceAfterSuspenseInstance,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

let hydrationParentFiber: null | Fiber = null
let nextHydratableInstance: null | HydratableInstance = null
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

function reenterHydrationStateFromDehydratedSuspenseInstance(
  fiber: Fiber,
): boolean {
  if (!supportsHydration) {
    return false
  }

  const suspenseInstance = fiber.stateNode
  nextHydratableInstance = getNextHydratableSibling(suspenseInstance)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  popToNextHostParent(fiber)
  isHydrating = true
  return true
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
      const instance = canHydrateInstance(nextInstance, type)
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

function prepareToHydrateHostInstance(
  fiber: Fiber,
  rootContainerInstance: Container,
  hostContext: HostContext,
): boolean {
  if (!supportsHydration) {
    invariant(
      false,
      'Expected prepareToHydrateHostInstance() to never be called. ' +
        'This error is likely caused by a bug in Zzeact. Please file an issue.',
    )
  }

  const instance: Instance = fiber.stateNode
  const updatePayload = hydrateInstance(
    instance,
    fiber.type,
    fiber.memoizedProps,
    rootContainerInstance,
    hostContext,
    fiber,
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fiber.updateQueue = (updatePayload as any)
  if (updatePayload !== null) {
    return true
  }
  return false
}

function prepareToHydrateHostTextInstance(fiber: Fiber): boolean {
  if (!supportsHydration) {
    invariant(
      false,
      'Expected prepareToHydrateHostTextInstance() to never be called. ' +
        'This error is likely caused by a bug in Zzeact. Please file an issue.',
    )
  }

  const textInstance: TextInstance = fiber.stateNode
  const textContent: string = fiber.memoizedProps
  const shouldUpdate = hydrateTextInstance(textInstance, textContent, fiber)
  return shouldUpdate
}

function skipPastDehydratedSuspenseInstance(fiber: Fiber): void {
  if (!supportsHydration) {
    invariant(
      false,
      'Expected skipPastDehydratedSuspenseInstance() to never be called. ' +
        'This error is likely caused by a bug in Zzeact. Please file an issue.',
    )
  }
  const suspenseInstance = fiber.stateNode
  invariant(
    suspenseInstance,
    'Expected to have a hydrated suspense instance. ' +
      'This error is likely caused by a bug in Zzeact. Please file an issue.',
  )
  nextHydratableInstance = getNextHydratableInstanceAfterSuspenseInstance(
    suspenseInstance,
  )
}

function popToNextHostParent(fiber: Fiber): void {
  let parent = fiber.return
  while (
    parent !== null &&
    parent.tag !== HostComponent &&
    parent.tag !== HostRoot &&
    parent.tag !== DehydratedSuspenseComponent
  ) {
    parent = parent.return
  }
  hydrationParentFiber = parent
}

function popHydrationState(fiber: Fiber): boolean {
  if (!supportsHydration) {
    return false
  }
  if (fiber !== hydrationParentFiber) {
    return false
  }
  if (!isHydrating) {
    popToNextHostParent(fiber)
    isHydrating = true
    return false
  }

  const type = fiber.type

  if (
    fiber.tag !== HostComponent ||
    (type !== 'head' &&
      type !== 'body' &&
      !shouldSetTextContent(type, fiber.memoizedProps))
  ) {
    let nextInstance = nextHydratableInstance
    while (nextInstance) {
      deleteHydratableInstance(fiber, nextInstance)
      nextInstance = getNextHydratableSibling(nextInstance)
    }
  }

  popToNextHostParent(fiber)
  nextHydratableInstance = hydrationParentFiber
    ? getNextHydratableSibling(fiber.stateNode)
    : null
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

export {
  enterHydrationState,
  reenterHydrationStateFromDehydratedSuspenseInstance,
  resetHydrationState,
  tryToClaimNextHydratableInstance,
  prepareToHydrateHostInstance,
  prepareToHydrateHostTextInstance,
  skipPastDehydratedSuspenseInstance,
  popHydrationState,
}
