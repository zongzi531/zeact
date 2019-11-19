import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { FiberRoot } from './ZzeactFiberRoot'
import {
  Instance,
  Type,
  Props,
  Container,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

import {
  IndeterminateComponent,
  FunctionComponent,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText,
  HostPortal,
  ContextProvider,
  ContextConsumer,
  ForwardRef,
  Fragment,
  Mode,
  Profiler,
  SuspenseComponent,
  DehydratedSuspenseComponent,
  MemoComponent,
  SimpleMemoComponent,
  LazyComponent,
  IncompleteClassComponent,
} from '@/shared/ZzeactWorkTags'
import {
  Placement,
  Ref,
  Update,
  NoEffect,
  DidCapture,
  Deletion,
} from '@/shared/ZzeactSideEffectTags'
import invariant from '@/shared/invariant'

import {
  createInstance,
  createTextInstance,
  appendInitialChild,
  finalizeInitialChildren,
  prepareUpdate,
  supportsMutation,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import {
  getRootHostContainer,
  popHostContext,
  getHostContext,
  popHostContainer,
} from './ZzeactFiberHostContext'
import {
  isContextProvider as isLegacyContextProvider,
  popContext as popLegacyContext,
  popTopLevelContextObject as popTopLevelLegacyContextObject,
} from './ZzeactFiberContext'
import {popProvider} from './ZzeactFiberNewContext'
import {
  prepareToHydrateHostInstance,
  prepareToHydrateHostTextInstance,
  skipPastDehydratedSuspenseInstance,
  popHydrationState,
} from './ZzeactFiberHydrationContext'
import {enableSuspenseServerRenderer} from '@/shared/ZzeactFeatureFlags'

function markUpdate(workInProgress: Fiber): void {
  workInProgress.effectTag |= Update
}

function markRef(workInProgress: Fiber): void {
  workInProgress.effectTag |= Ref
}

let appendAllChildren
let updateHostContainer
let updateHostComponent
let updateHostText
if (supportsMutation) {
  appendAllChildren = function(
    parent: Instance,
    workInProgress: Fiber,
    // needsVisibilityToggle: boolean,
    // isHidden: boolean,
  ): void {
    let node = workInProgress.child
    while (node !== null) {
      if (node.tag === HostComponent || node.tag === HostText) {
        appendInitialChild(parent, node.stateNode)
      } else if (node.tag === HostPortal) {
      } else if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
      if (node === workInProgress) {
        return
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === workInProgress) {
          return
        }
        node = node.return
      }
      node.sibling.return = node.return
      node = node.sibling
    }
  }

  updateHostContainer = function(/* workInProgress: Fiber */): void {
    // Noop
  }
  updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ): void {
    const oldProps = current.memoizedProps
    if (oldProps === newProps) {
      return
    }

    const instance: Instance = workInProgress.stateNode
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    workInProgress.updateQueue = (updatePayload as any)
    if (updatePayload) {
      markUpdate(workInProgress)
    }
  }
  updateHostText = function(
    current: Fiber,
    workInProgress: Fiber,
    oldText: string,
    newText: string,
  ): void {
    if (oldText !== newText) {
      markUpdate(workInProgress)
    }
  }
}

function completeWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const newProps = workInProgress.pendingProps

  switch (workInProgress.tag) {
    case IndeterminateComponent:
      break
    case LazyComponent:
      break
    case SimpleMemoComponent:
    case FunctionComponent:
      break
    case ClassComponent: {
      const Component = workInProgress.type
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(/* workInProgress */)
      }
      break
    }
    case HostRoot: {
      popHostContainer(/* workInProgress */)
      popTopLevelLegacyContextObject(/* workInProgress */)
      const fiberRoot = (workInProgress.stateNode as FiberRoot)
      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext
        fiberRoot.pendingContext = null
      }
      if (current === null || current.child === null) {
        popHydrationState(workInProgress)
        workInProgress.effectTag &= ~Placement
      }
      updateHostContainer(workInProgress)
      break
    }
    case HostComponent: {
      popHostContext(workInProgress)
      const rootContainerInstance = getRootHostContainer()
      const type = workInProgress.type
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance,
        )

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress)
        }
      } else {
        if (!newProps) {
          invariant(
            workInProgress.stateNode !== null,
            'We must have new props for new mounts. This error is likely ' +
              'caused by a bug in Zzeact. Please file an issue.',
          )
          break
        }

        const currentHostContext = getHostContext()
        const wasHydrated = popHydrationState(workInProgress)
        if (wasHydrated) {
          if (
            prepareToHydrateHostInstance(
              workInProgress,
              rootContainerInstance,
              currentHostContext,
            )
          ) {
            markUpdate(workInProgress)
          }
        } else {
          const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          )

          appendAllChildren(instance, workInProgress, false, false)
          if (
            finalizeInitialChildren(
              instance,
              type,
              newProps,
              rootContainerInstance,
            )
          ) {
            markUpdate(workInProgress)
          }
          workInProgress.stateNode = instance
        }

        if (workInProgress.ref !== null) {
          markRef(workInProgress)
        }
      }
      break
    }
    case HostText: {
      const newText = newProps
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps
        updateHostText(current, workInProgress, oldText, newText)
      } else {
        if (typeof newText !== 'string') {
          invariant(
            workInProgress.stateNode !== null,
            'We must have new props for new mounts. This error is likely ' +
              'caused by a bug in Zzeact. Please file an issue.',
          )
        }
        const rootContainerInstance = getRootHostContainer()
        const currentHostContext = getHostContext()
        const wasHydrated = popHydrationState(workInProgress)
        if (wasHydrated) {
          if (prepareToHydrateHostTextInstance(workInProgress)) {
            markUpdate(workInProgress)
          }
        } else {
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          )
        }
      }
      break
    }
    case ForwardRef:
      break
    case SuspenseComponent: {
      const nextState = workInProgress.memoizedState
      if ((workInProgress.effectTag & DidCapture) !== NoEffect) {
        workInProgress.expirationTime = renderExpirationTime
        return workInProgress
      }

      const nextDidTimeout = nextState !== null
      const prevDidTimeout = current !== null && current.memoizedState !== null

      if (current !== null && !nextDidTimeout && prevDidTimeout) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentFallbackChild: Fiber | null = (current.child as any).sibling
        if (currentFallbackChild !== null) {
          const first = workInProgress.firstEffect
          if (first !== null) {
            workInProgress.firstEffect = currentFallbackChild
            currentFallbackChild.nextEffect = first
          } else {
            workInProgress.firstEffect = workInProgress.lastEffect = currentFallbackChild
            currentFallbackChild.nextEffect = null
          }
          currentFallbackChild.effectTag = Deletion
        }
      }

      if (nextDidTimeout || prevDidTimeout) {
        workInProgress.effectTag |= Update
      }
      break
    }
    case Fragment:
      break
    case Mode:
      break
    case Profiler:
      break
    case HostPortal:
      popHostContainer(/* workInProgress */)
      updateHostContainer(workInProgress)
      break
    case ContextProvider:
      popProvider(workInProgress)
      break
    case ContextConsumer:
      break
    case MemoComponent:
      break
    case IncompleteClassComponent: {
      const Component = workInProgress.type
      if (isLegacyContextProvider(Component)) {
        popLegacyContext(/* workInProgress */)
      }
      break
    }
    case DehydratedSuspenseComponent: {
      if (enableSuspenseServerRenderer) {
        if (current === null) {
          const wasHydrated = popHydrationState(workInProgress)
          invariant(
            wasHydrated,
            'A dehydrated suspense component was completed without a hydrated node. ' +
              'This is probably a bug in Zzeact.',
          )
          skipPastDehydratedSuspenseInstance(workInProgress)
        } else if ((workInProgress.effectTag & DidCapture) === NoEffect) {
          current.alternate = null
          workInProgress.alternate = null
          workInProgress.tag = SuspenseComponent
          workInProgress.memoizedState = null
          workInProgress.stateNode = null
        }
      }
      break
    }
    default:
      invariant(
        false,
        'Unknown unit of work tag. This error is likely caused by a bug in ' +
          'Zzeact. Please file an issue.',
      )
  }

  return null
}

export { completeWork }
