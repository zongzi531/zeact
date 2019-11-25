import {
  Instance,
  TextInstance,
  Container,
  UpdatePayload,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { Fiber } from './ZzeactFiber'
import { FiberRoot } from './ZzeactFiberRoot'
import { CapturedValue, CapturedError } from './ZzeactCapturedValue'
import { SuspenseState } from './ZzeactFiberSuspenseComponent'
import { FunctionComponentUpdateQueue } from './ZzeactFiberHooks'
import { Thenable } from './ZzeactFiberScheduler'

import {
  FunctionComponent,
  ForwardRef,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText,
  HostPortal,
  Profiler,
  SuspenseComponent,
  DehydratedSuspenseComponent,
  IncompleteClassComponent,
  MemoComponent,
  SimpleMemoComponent,
} from '@/shared/ZzeactWorkTags'
import {
  ContentReset,
  Placement,
  Snapshot,
  Update,
} from '@/shared/ZzeactSideEffectTags'
import getComponentName from '@/shared/getComponentName'
import invariant from '@/shared/invariant'

import { NoWork} from './ZzeactFiberExpirationTime'
import { onCommitUnmount } from './ZzeactFiberDevToolsHook'
import { getStackByFiberInDevAndProd } from './ZzeactCurrentFiber'
import { logCapturedError } from './ZzeactFiberErrorLogger'
import { resolveDefaultProps } from './ZzeactFiberLazyComponent'
import { commitUpdateQueue } from './ZzeactUpdateQueue'
import {
  getPublicInstance,
  supportsMutation,
  commitMount,
  commitUpdate,
  resetTextContent,
  commitTextUpdate,
  appendChild,
  appendChildToContainer,
  insertBefore,
  insertInContainerBefore,
  removeChild,
  removeChildFromContainer,
  hideInstance,
  hideTextInstance,
  unhideInstance,
  unhideTextInstance,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import {
  captureCommitPhaseError,
  requestCurrentTime,
  retryTimedOutBoundary,
} from './ZzeactFiberScheduler'
import {
  NoEffect as NoHookEffect,
  UnmountSnapshot,
  UnmountMutation,
  MountMutation,
  UnmountLayout,
  MountLayout,
  UnmountPassive,
  MountPassive,
} from './ZzeactHookEffectTags'

const PossiblyWeakSet = typeof WeakSet === 'function' ? WeakSet : Set

export function logError(boundary: Fiber, errorInfo: CapturedValue<mixed>): void {
  const source = errorInfo.source
  let stack = errorInfo.stack
  if (stack === null && source !== null) {
    stack = getStackByFiberInDevAndProd(source)
  }

  const capturedError: CapturedError = {
    componentName: source !== null ? getComponentName(source.type) : null,
    componentStack: stack !== null ? stack : '',
    error: errorInfo.value,
    errorBoundary: null,
    errorBoundaryName: null,
    errorBoundaryFound: false,
    willRetry: false,
  }

  if (boundary !== null && boundary.tag === ClassComponent) {
    capturedError.errorBoundary = boundary.stateNode
    capturedError.errorBoundaryName = getComponentName(boundary.type)
    capturedError.errorBoundaryFound = true
    capturedError.willRetry = true
  }

  try {
    logCapturedError(capturedError)
  } catch (e) {
    setTimeout(() => {
      throw e
    })
  }
}

const callComponentWillUnmountWithTimer = function(current, instance): void {
  instance.props = current.memoizedProps
  instance.state = current.memoizedState
  instance.componentWillUnmount()
}

function safelyCallComponentWillUnmount(current, instance): void {
  try {
    callComponentWillUnmountWithTimer(current, instance)
  } catch (unmountError) {
    captureCommitPhaseError(current, unmountError)
  }
}

function safelyDetachRef(current: Fiber): void {
  const ref = current.ref
  if (ref !== null) {
    if (typeof ref === 'function') {
      {
        try {
          ref(null)
        } catch (refError) {
          captureCommitPhaseError(current, refError)
        }
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref as any).current = null
    }
  }
}

function safelyCallDestroy(current, destroy): void {
  try {
    destroy()
  } catch (error) {
    captureCommitPhaseError(current, error)
  }
}

function commitBeforeMutationLifeCycles(
  current: Fiber | null,
  finishedWork: Fiber,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      commitHookEffectList(UnmountSnapshot, NoHookEffect, finishedWork)
      return
    }
    case ClassComponent: {
      if (finishedWork.effectTag & Snapshot) {
        if (current !== null) {
          const prevProps = current.memoizedProps
          const prevState = current.memoizedState
          const instance = finishedWork.stateNode
          const snapshot = instance.getSnapshotBeforeUpdate(
            finishedWork.elementType === finishedWork.type
              ? prevProps
              : resolveDefaultProps(finishedWork.type, prevProps),
            prevState,
          )
          instance.__zzeactInternalSnapshotBeforeUpdate = snapshot
        }
      }
      return
    }
    case HostRoot:
    case HostComponent:
    case HostText:
    case HostPortal:
    case IncompleteClassComponent:
      return
    default: {
      invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
          'likely caused by a bug in Zzeact. Please file an issue.',
      )
    }
  }
}

function commitHookEffectList(
  unmountTag: number,
  mountTag: number,
  finishedWork: Fiber,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue as any)
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      if ((effect.tag & unmountTag) !== NoHookEffect) {
        const destroy = effect.destroy
        effect.destroy = undefined
        if (destroy !== undefined) {
          (destroy as () => void)()
        }
      }
      if ((effect.tag & mountTag) !== NoHookEffect) {
        const create = effect.create
        effect.destroy = create()
      }
      effect = effect.next
    } while (effect !== firstEffect)
  }
}

export function commitPassiveHookEffects(finishedWork: Fiber): void {
  commitHookEffectList(UnmountPassive, NoHookEffect, finishedWork)
  commitHookEffectList(NoHookEffect, MountPassive, finishedWork)
}

function commitLifeCycles(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectList(UnmountLayout, MountLayout, finishedWork)
      break
    }
    case ClassComponent: {
      const instance = finishedWork.stateNode
      if (finishedWork.effectTag & Update) {
        if (current === null) {
          instance.componentDidMount()
        } else {
          const prevProps =
            finishedWork.elementType === finishedWork.type
              ? current.memoizedProps
              : resolveDefaultProps(finishedWork.type, current.memoizedProps)
          const prevState = current.memoizedState
          instance.componentDidUpdate(
            prevProps,
            prevState,
            instance.__zzeactInternalSnapshotBeforeUpdate,
          )
        }
      }
      const updateQueue = finishedWork.updateQueue
      if (updateQueue !== null) {
        commitUpdateQueue(
          finishedWork,
          updateQueue,
          instance,
        )
      }
      return
    }
    case HostRoot: {
      const updateQueue = finishedWork.updateQueue
      if (updateQueue !== null) {
        let instance = null
        if (finishedWork.child !== null) {
          switch (finishedWork.child.tag) {
            case HostComponent:
              instance = getPublicInstance(finishedWork.child.stateNode)
              break
            case ClassComponent:
              instance = finishedWork.child.stateNode
              break
          }
        }
        commitUpdateQueue(
          finishedWork,
          updateQueue,
          instance,
        )
      }
      return
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode

      if (current === null && finishedWork.effectTag & Update) {
        const type = finishedWork.type
        const props = finishedWork.memoizedProps
        commitMount(instance, type, props)
      }

      return
    }
    case HostText: {
      return
    }
    case HostPortal: {
      return
    }
    case Profiler: {
      return
    }
    case SuspenseComponent:
      break
    case IncompleteClassComponent:
      break
    default: {
      invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
          'likely caused by a bug in Zzeact. Please file an issue.',
      )
    }
  }
}

function hideOrUnhideAllChildren(finishedWork, isHidden): void {
  if (supportsMutation) {
    let node: Fiber = finishedWork
    while (true) {
      if (node.tag === HostComponent) {
        const instance = node.stateNode
        if (isHidden) {
          hideInstance(instance)
        } else {
          unhideInstance(node.stateNode, node.memoizedProps)
        }
      } else if (node.tag === HostText) {
        const instance = node.stateNode
        if (isHidden) {
          hideTextInstance(instance)
        } else {
          unhideTextInstance(instance, node.memoizedProps)
        }
      } else if (
        node.tag === SuspenseComponent &&
        node.memoizedState !== null
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fallbackChildFragment: Fiber = (node.child as any).sibling
        fallbackChildFragment.return = node
        node = fallbackChildFragment
        continue
      } else if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
      if (node === finishedWork) {
        return
      }
      while (node.sibling === null) {
        if (node.return === null || node.return === finishedWork) {
          return
        }
        node = node.return
      }
      node.sibling.return = node.return
      node = node.sibling
    }
  }
}

function commitAttachRef(finishedWork: Fiber): void {
  const ref = finishedWork.ref
  if (ref !== null) {
    const instance = finishedWork.stateNode
    let instanceToUse
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance)
        break
      default:
        instanceToUse = instance
    }
    if (typeof ref === 'function') {
      ref(instanceToUse)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref as any).current = instanceToUse
    }
  }
}

function commitDetachRef(current: Fiber): void {
  const currentRef = current.ref
  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      currentRef(null)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (currentRef as any).current = null
    }
  }
}

function commitUnmount(current: Fiber): void {
  onCommitUnmount(current)

  switch (current.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateQueue: FunctionComponentUpdateQueue | null = (current.updateQueue as any)
      if (updateQueue !== null) {
        const lastEffect = updateQueue.lastEffect
        if (lastEffect !== null) {
          const firstEffect = lastEffect.next
          let effect = firstEffect
          do {
            const destroy = effect.destroy
            if (destroy !== undefined) {
              safelyCallDestroy(current, destroy)
            }
            effect = effect.next
          } while (effect !== firstEffect)
        }
      }
      break
    }
    case ClassComponent: {
      safelyDetachRef(current)
      const instance = current.stateNode
      if (typeof instance.componentWillUnmount === 'function') {
        safelyCallComponentWillUnmount(current, instance)
      }
      return
    }
    case HostComponent: {
      safelyDetachRef(current)
      return
    }
    case HostPortal: {
      if (supportsMutation) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        unmountHostComponents(current)
      }
      return
    }
  }
}

function commitNestedUnmounts(root: Fiber): void {
  let node: Fiber = root
  while (true) {
    commitUnmount(node)
    if (
      node.child !== null &&
      (node.tag !== HostPortal)
    ) {
      node.child.return = node
      node = node.child
      continue
    }
    if (node === root) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function detachFiber(current: Fiber): void {
  current.return = null
  current.child = null
  current.memoizedState = null
  current.updateQueue = null
  const alternate = current.alternate
  if (alternate !== null) {
    alternate.return = null
    alternate.child = null
    alternate.memoizedState = null
    alternate.updateQueue = null
  }
}

function getHostParentFiber(fiber: Fiber): Fiber {
  let parent = fiber.return
  while (parent !== null) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
  invariant(
    false,
    'Expected to find a host parent. This error is likely caused by a bug ' +
      'in Zzeact. Please file an issue.',
  )
}

function isHostParent(fiber: Fiber): boolean {
  return (
    fiber.tag === HostComponent ||
    fiber.tag === HostRoot ||
    fiber.tag === HostPortal
  )
}

function getHostSibling(fiber: Fiber): Instance | null {
  let node: Fiber = fiber
  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
    while (
      node.tag !== HostComponent &&
      node.tag !== HostText &&
      node.tag !== DehydratedSuspenseComponent
    ) {
      if (node.effectTag & Placement) {
        continue siblings
      }
      if (node.child === null || node.tag === HostPortal) {
        continue siblings
      } else {
        node.child.return = node
        node = node.child
      }
    }
    if (!(node.effectTag & Placement)) {
      return node.stateNode
    }
  }
}

function commitPlacement(finishedWork: Fiber): void {
  const parentFiber = getHostParentFiber(finishedWork)

  let parent
  let isContainer

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentFiber.stateNode
      isContainer = false
      break
    case HostRoot:
      parent = parentFiber.stateNode.containerInfo
      isContainer = true
      break
    case HostPortal:
      parent = parentFiber.stateNode.containerInfo
      isContainer = true
      break
    default:
      invariant(
        false,
        'Invalid host parent fiber. This error is likely caused by a bug ' +
          'in Zzeact. Please file an issue.',
      )
  }
  if (parentFiber.effectTag & ContentReset) {
    resetTextContent(parent)
    parentFiber.effectTag &= ~ContentReset
  }

  const before = getHostSibling(finishedWork)
  let node: Fiber = finishedWork
  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      if (before) {
        if (isContainer) {
          insertInContainerBefore(parent, node.stateNode, before)
        } else {
          insertBefore(parent, node.stateNode, before)
        }
      } else {
        if (isContainer) {
          appendChildToContainer(parent, node.stateNode)
        } else {
          appendChild(parent, node.stateNode)
        }
      }
    } else if (node.tag === HostPortal) {
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }
    if (node === finishedWork) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return
      }
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function unmountHostComponents(current): void {
  let node: Fiber = current

  let currentParentIsValid = false

  let currentParent
  let currentParentIsContainer

  while (true) {
    if (!currentParentIsValid) {
      let parent = node.return
      findParent: while (true) {
        invariant(
          parent !== null,
          'Expected to find a host parent. This error is likely caused by ' +
            'a bug in Zzeact. Please file an issue.',
        )
        switch (parent.tag) {
          case HostComponent:
            currentParent = parent.stateNode
            currentParentIsContainer = false
            break findParent
          case HostRoot:
            currentParent = parent.stateNode.containerInfo
            currentParentIsContainer = true
            break findParent
          case HostPortal:
            currentParent = parent.stateNode.containerInfo
            currentParentIsContainer = true
            break findParent
        }
        parent = parent.return
      }
      currentParentIsValid = true
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      commitNestedUnmounts(node)
      if (currentParentIsContainer) {
        removeChildFromContainer(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((currentParent as any) as Container),
          (node.stateNode as Instance | TextInstance),
        )
      } else {
        removeChild(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((currentParent as any) as Instance),
          (node.stateNode as Instance | TextInstance),
        )
      }
    } else if (node.tag === HostPortal) {
      if (node.child !== null) {
        currentParent = node.stateNode.containerInfo
        currentParentIsContainer = true
        node.child.return = node
        node = node.child
        continue
      }
    } else {
      commitUnmount(node)
      if (node.child !== null) {
        node.child.return = node
        node = node.child
        continue
      }
    }
    if (node === current) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === current) {
        return
      }
      node = node.return
      if (node.tag === HostPortal) {
        currentParentIsValid = false
      }
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function commitDeletion(current: Fiber): void {
  if (supportsMutation) {
    unmountHostComponents(current)
  }
  detachFiber(current)
}

function commitWork(current: Fiber | null, finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      commitHookEffectList(UnmountMutation, MountMutation, finishedWork)
      return
    }
    case ClassComponent: {
      return
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode
      if (instance != null) {
        const newProps = finishedWork.memoizedProps
        const oldProps = current !== null ? current.memoizedProps : newProps
        const type = finishedWork.type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatePayload: null | UpdatePayload = (finishedWork.updateQueue as any)
        finishedWork.updateQueue = null
        if (updatePayload !== null) {
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
          )
        }
      }
      return
    }
    case HostText: {
      invariant(
        finishedWork.stateNode !== null,
        'This should have a text node initialized. This error is likely ' +
          'caused by a bug in Zzeact. Please file an issue.',
      )
      const textInstance: TextInstance = finishedWork.stateNode
      const newText: string = finishedWork.memoizedProps
      const oldText: string =
        current !== null ? current.memoizedProps : newText
      commitTextUpdate(textInstance, oldText, newText)
      return
    }
    case HostRoot: {
      return
    }
    case Profiler: {
      return
    }
    case SuspenseComponent: {
      const newState: SuspenseState | null = finishedWork.memoizedState

      let newDidTimeout
      let primaryChildParent = finishedWork
      if (newState === null) {
        newDidTimeout = false
      } else {
        newDidTimeout = true
        primaryChildParent = finishedWork.child
        if (newState.timedOutAt === NoWork) {
          newState.timedOutAt = requestCurrentTime()
        }
      }

      if (primaryChildParent !== null) {
        hideOrUnhideAllChildren(primaryChildParent, newDidTimeout)
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const thenables: Set<Thenable> | null = (finishedWork.updateQueue as any)
      if (thenables !== null) {
        finishedWork.updateQueue = null
        let retryCache = finishedWork.stateNode
        if (retryCache === null) {
          retryCache = finishedWork.stateNode = new PossiblyWeakSet()
        }
        thenables.forEach(thenable => {
          const retry = retryTimedOutBoundary.bind(null, finishedWork, thenable)
          if (!retryCache.has(thenable)) {
            retryCache.add(thenable)
            thenable.then(retry, retry)
          }
        })
      }

      return
    }
    case IncompleteClassComponent: {
      return
    }
    default: {
      invariant(
        false,
        'This unit of work tag should not have side-effects. This error is ' +
          'likely caused by a bug in Zzeact. Please file an issue.',
      )
    }
  }
}

function commitResetTextContent(current: Fiber): void {
  resetTextContent(current.stateNode)
}

export {
  commitBeforeMutationLifeCycles,
  commitResetTextContent,
  commitPlacement,
  commitDeletion,
  commitWork,
  commitLifeCycles,
  commitAttachRef,
  commitDetachRef,
}
