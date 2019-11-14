import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { FiberRoot } from './ZzeactFiberRoot'
import {
  Instance,
  Type,
  Props,
  Container,
  ChildSet,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { SuspenseState } from './ZzeactFiberSuspenseComponent'

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
  createHiddenTextInstance,
  appendInitialChild,
  finalizeInitialChildren,
  prepareUpdate,
  supportsMutation,
  supportsPersistence,
  cloneInstance,
  cloneHiddenInstance,
  cloneUnhiddenInstance,
  createContainerChildSet,
  appendChildToContainerChildSet,
  finalizeContainerChildren,
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
    const currentHostContext = getHostContext()
    const updatePayload = prepareUpdate(
      instance,
      type,
      oldProps,
      newProps,
      rootContainerInstance,
      currentHostContext,
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
} else if (supportsPersistence) {
  appendAllChildren = function(
    parent: Instance,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
  ): void {
    let node = workInProgress.child
    while (node !== null) {
      branches: if (node.tag === HostComponent) {
        let instance = node.stateNode
        if (needsVisibilityToggle) {
          const props = node.memoizedProps
          const type = node.type
          if (isHidden) {
            instance = cloneHiddenInstance(instance, type, props, node)
          } else {
            instance = cloneUnhiddenInstance(instance, type, props, node)
          }
          node.stateNode = instance
        }
        appendInitialChild(parent, instance)
      } else if (node.tag === HostText) {
        let instance = node.stateNode
        if (needsVisibilityToggle) {
          const text = node.memoizedProps
          const rootContainerInstance = getRootHostContainer()
          const currentHostContext = getHostContext()
          if (isHidden) {
            instance = createHiddenTextInstance(
              text,
              rootContainerInstance,
              currentHostContext,
              workInProgress,
            )
          } else {
            instance = createTextInstance(
              text,
              rootContainerInstance,
              currentHostContext,
              workInProgress,
            )
          }
          node.stateNode = instance
        }
        appendInitialChild(parent, instance)
      } else if (node.tag === HostPortal) {
      } else if (node.tag === SuspenseComponent) {
        const current = node.alternate
        if (current !== null) {
          const oldState: SuspenseState = current.memoizedState
          const newState: SuspenseState = node.memoizedState
          const oldIsHidden = oldState !== null
          const newIsHidden = newState !== null
          if (oldIsHidden !== newIsHidden) {
            const primaryChildParent = newIsHidden ? node.child : node
            if (primaryChildParent !== null) {
              appendAllChildren(parent, primaryChildParent, true, newIsHidden)
            }
            break branches
          }
        }
        if (node.child !== null) {
          node.child.return = node
          node = node.child
          continue
        }
      } else if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
      node = (node as Fiber)
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

  const appendAllChildrenToContainer = function(
    containerChildSet: ChildSet,
    workInProgress: Fiber,
    needsVisibilityToggle: boolean,
    isHidden: boolean,
  ): void {
    let node = workInProgress.child
    while (node !== null) {
      branches: if (node.tag === HostComponent) {
        let instance = node.stateNode
        if (needsVisibilityToggle) {
          const props = node.memoizedProps
          const type = node.type
          if (isHidden) {
            instance = cloneHiddenInstance(instance, type, props, node)
          } else {
            instance = cloneUnhiddenInstance(instance, type, props, node)
          }
          node.stateNode = instance
        }
        appendChildToContainerChildSet(containerChildSet, instance)
      } else if (node.tag === HostText) {
        let instance = node.stateNode
        if (needsVisibilityToggle) {
          const text = node.memoizedProps
          const rootContainerInstance = getRootHostContainer()
          const currentHostContext = getHostContext()
          if (isHidden) {
            instance = createHiddenTextInstance(
              text,
              rootContainerInstance,
              currentHostContext,
              workInProgress,
            )
          } else {
            instance = createTextInstance(
              text,
              rootContainerInstance,
              currentHostContext,
              workInProgress,
            )
          }
          node.stateNode = instance
        }
        appendChildToContainerChildSet(containerChildSet, instance)
      } else if (node.tag === HostPortal) {
      } else if (node.tag === SuspenseComponent) {
        const current = node.alternate
        if (current !== null) {
          const oldState: SuspenseState = current.memoizedState
          const newState: SuspenseState = node.memoizedState
          const oldIsHidden = oldState !== null
          const newIsHidden = newState !== null
          if (oldIsHidden !== newIsHidden) {
            const primaryChildParent = newIsHidden ? node.child : node
            if (primaryChildParent !== null) {
              appendAllChildrenToContainer(
                containerChildSet,
                primaryChildParent,
                true,
                newIsHidden,
              )
            }
            break branches
          }
        }
        if (node.child !== null) {
          node.child.return = node
          node = node.child
          continue
        }
      } else if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
      node = (node as Fiber)
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
  updateHostContainer = function(workInProgress: Fiber): void {
    const portalOrRoot: {
      containerInfo: Container
      pendingChildren: ChildSet
    } =
      workInProgress.stateNode
    const childrenUnchanged = workInProgress.firstEffect === null
    if (childrenUnchanged) {
    } else {
      const container = portalOrRoot.containerInfo
      const newChildSet = createContainerChildSet(container)
      appendAllChildrenToContainer(newChildSet, workInProgress, false, false)
      portalOrRoot.pendingChildren = newChildSet
      markUpdate(workInProgress)
      finalizeContainerChildren(container, newChildSet)
    }
  }
  updateHostComponent = function(
    current: Fiber,
    workInProgress: Fiber,
    type: Type,
    newProps: Props,
    rootContainerInstance: Container,
  ): void {
    const currentInstance = current.stateNode
    const oldProps = current.memoizedProps
    const childrenUnchanged = workInProgress.firstEffect === null
    if (childrenUnchanged && oldProps === newProps) {
      workInProgress.stateNode = currentInstance
      return
    }
    const recyclableInstance: Instance = workInProgress.stateNode
    const currentHostContext = getHostContext()
    let updatePayload = null
    if (oldProps !== newProps) {
      updatePayload = prepareUpdate(
        recyclableInstance,
        type,
        oldProps,
        newProps,
        rootContainerInstance,
        currentHostContext,
      )
    }
    if (childrenUnchanged && updatePayload === null) {
      workInProgress.stateNode = currentInstance
      return
    }
    const newInstance = cloneInstance(
      currentInstance,
      updatePayload,
      type,
      oldProps,
      newProps,
      workInProgress,
      childrenUnchanged,
      recyclableInstance,
    )
    if (
      finalizeInitialChildren(
        newInstance,
        type,
        newProps,
        rootContainerInstance,
        currentHostContext,
      )
    ) {
      markUpdate(workInProgress)
    }
    workInProgress.stateNode = newInstance
    if (childrenUnchanged) {
      markUpdate(workInProgress)
    } else {
      appendAllChildren(newInstance, workInProgress, false, false)
    }
  }
  updateHostText = function(
    current: Fiber,
    workInProgress: Fiber,
    oldText: string,
    newText: string,
  ): void {
    if (oldText !== newText) {
      const rootContainerInstance = getRootHostContainer()
      const currentHostContext = getHostContext()
      workInProgress.stateNode = createTextInstance(
        newText,
        rootContainerInstance,
        currentHostContext,
        workInProgress,
      )
      markUpdate(workInProgress)
    }
  }
} else {
  updateHostContainer = function(): void {
    // Noop
  }
  updateHostComponent = function(
    // current: Fiber,
    // workInProgress: Fiber,
    // type: Type,
    // newProps: Props,
    // rootContainerInstance: Container,
  ): void {
    // Noop
  }
  updateHostText = function(
    // current: Fiber,
    // workInProgress: Fiber,
    // oldText: string,
    // newText: string,
  ): void {
    // Noop
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
              currentHostContext,
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
