import {
  __interactionsRef,
  __subscriberRef,
} from '@/scheduler/tracing'
import invariant from '@/shared/invariant'
import {
  enableSchedulerTracing,
} from '@/shared/ZzeactFeatureFlags'
import { HostRoot } from '@/shared/ZzeactWorkTags'
import { recordScheduleUpdate } from './ZzeactDebugFiberPerf'
import { IFiber } from './ZzeactFiber'
import { ExpirationTime, NoWork } from './ZzeactFiberExpirationTime'
import {
  unwindInterruptedWork,
} from './ZzeactFiberUnwindWork'

let isWorking: boolean = false

let nextUnitOfWork: IFiber | null = null
let nextRoot: FiberRoot | null = null
let nextRenderExpirationTime: ExpirationTime = NoWork
let nextLatestAbsoluteTimeoutMs: number = -1
let nextRenderDidError: boolean = false

let nextEffect: IFiber | null = null

let isCommitting: boolean = false
let rootWithPendingPassiveEffects: FiberRoot | null = null
let passiveEffectCallbackHandle = null
let passiveEffectCallback = null

let legacyErrorBoundariesThatAlreadyFailed: Set<mixed> | null = null

let interruptedBy: IFiber | null = null

function resetStack() {
  if (nextUnitOfWork !== null) {
    let interruptedWork = nextUnitOfWork.return
    while (interruptedWork !== null) {
      unwindInterruptedWork(interruptedWork)
      interruptedWork = interruptedWork.return
    }
  }

  nextRoot = null
  nextRenderExpirationTime = NoWork
  nextLatestAbsoluteTimeoutMs = -1
  nextRenderDidError = false
  nextUnitOfWork = null
}

function computeThreadID(
  expirationTime: ExpirationTime,
  interactionThreadID: number,
): number {
  // Interaction threads are unique per root and expiration time.
  return expirationTime * 1000 + interactionThreadID
}

const NESTED_UPDATE_LIMIT = 50
let nestedUpdateCount: number = 0

function scheduleWorkToRoot(fiber: IFiber, expirationTime): FiberRoot | null {
  recordScheduleUpdate()

  // Update the source fiber's expiration time
  if (fiber.expirationTime < expirationTime) {
    fiber.expirationTime = expirationTime
  }
  let alternate = fiber.alternate
  if (alternate !== null && alternate.expirationTime < expirationTime) {
    alternate.expirationTime = expirationTime
  }
  // Walk the parent path to the root and update the child expiration time.
  let node = fiber.return
  let root = null
  if (node === null && fiber.tag === HostRoot) {
    root = fiber.stateNode
  } else {
    while (node !== null) {
      alternate = node.alternate
      if (node.childExpirationTime < expirationTime) {
        node.childExpirationTime = expirationTime
        if (
          alternate !== null &&
          alternate.childExpirationTime < expirationTime
        ) {
          alternate.childExpirationTime = expirationTime
        }
      } else if (
        alternate !== null &&
        alternate.childExpirationTime < expirationTime
      ) {
        alternate.childExpirationTime = expirationTime
      }
      if (node.return === null && node.tag === HostRoot) {
        root = node.stateNode
        break
      }
      node = node.return
    }
  }

  if (enableSchedulerTracing) {
    if (root !== null) {
      const interactions = __interactionsRef.current
      if (interactions.size > 0) {
        const pendingInteractionMap = root.pendingInteractionMap
        const pendingInteractions = pendingInteractionMap.get(expirationTime)
        if (pendingInteractions != null) {
          interactions.forEach(interaction => {
            if (!pendingInteractions.has(interaction)) {
              // Update the pending async work count for previously unscheduled interaction.
              interaction.__count++
            }

            pendingInteractions.add(interaction)
          })
        } else {
          pendingInteractionMap.set(expirationTime, new Set(interactions))

          // Update the pending async work count for the current interactions.
          interactions.forEach(interaction => {
            interaction.__count++
          })
        }

        const subscriber = __subscriberRef.current
        if (subscriber !== null) {
          const threadID = computeThreadID(
            expirationTime,
            root.interactionThreadID,
          )
          subscriber.onWorkScheduled(interactions, threadID)
        }
      }
    }
  }
  return root
}

function scheduleWork(fiber: IFiber, expirationTime: ExpirationTime) {
  const root = scheduleWorkToRoot(fiber, expirationTime)
  if (root === null) {
    return
  }

  if (
    !isWorking &&
    nextRenderExpirationTime !== NoWork &&
    expirationTime > nextRenderExpirationTime
  ) {
    // This is an interruption. (Used for performance tracking.)
    interruptedBy = fiber
    resetStack()
  }
  markPendingPriorityLevel(root, expirationTime)
  if (
    // If we're in the render phase, we don't need to schedule this root
    // for an update, because we'll do it before we exit...
    !isWorking ||
    isCommitting ||
    // ...unless this is a different root than the one we're rendering.
    nextRoot !== root
  ) {
    const rootExpirationTime = root.expirationTime
    requestWork(root, rootExpirationTime)
  }
  if (nestedUpdateCount > NESTED_UPDATE_LIMIT) {
    // Reset this back to zero so subsequent updates don't throw.
    nestedUpdateCount = 0
    invariant(
      false,
      'Maximum update depth exceeded. This can happen when a ' +
        'component repeatedly calls setState inside ' +
        'componentWillUpdate or componentDidUpdate. React limits ' +
        'the number of nested updates to prevent infinite loops.',
    )
  }
}

export {
  scheduleWork,
}
