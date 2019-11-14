import { Fiber } from './ZzeactFiber'
import { FiberRoot } from './ZzeactFiberRoot'

import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { SuspenseState } from './ZzeactFiberSuspenseComponent'

import {
  IndeterminateComponent,
  FunctionComponent,
  ClassComponent,
  HostRoot,
  HostComponent,
  HostText,
  HostPortal,
  ForwardRef,
  Fragment,
  Mode,
  ContextProvider,
  ContextConsumer,
  Profiler,
  SuspenseComponent,
  DehydratedSuspenseComponent,
  MemoComponent,
  SimpleMemoComponent,
  LazyComponent,
  IncompleteClassComponent,
} from '@/shared/ZzeactWorkTags'
import {
  // NoEffect,
  // PerformedWork,
  Placement,
  ContentReset,
  // DidCapture,
  // Update,
  Ref,
  // Deletion,
} from '@/shared/ZzeactSideEffectTags'
import {
  // debugRenderPhaseSideEffects,
  // debugRenderPhaseSideEffectsForStrictMode,
} from '@/shared/ZzeactFeatureFlags'
import invariant from '@/shared/invariant'
import {
  mountChildFibers,
  reconcileChildFibers,
  cloneChildFibers,
} from './ZzeactChildFiber'
import { processUpdateQueue } from './ZzeactUpdateQueue'
import { NoWork, Never } from './ZzeactFiberExpirationTime'
import {
  ConcurrentMode,
  // NoContext,
  // ProfileMode,
  // StrictMode,
} from './ZzeactTypeOfMode'
import {
  shouldSetTextContent,
  shouldDeprioritizeSubtree,
} from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */
import { pushHostContext, pushHostContainer } from './ZzeactFiberHostContext'
import {
  pushProvider,
  // propagateContextChange,
  // readContext,
  // prepareToReadContext,
  // calculateChangedBits,
} from './ZzeactFiberNewContext'
// import { stopProfilerTimerIfRunning } from './ZzeactProfilerTimer'
import {
  // getMaskedContext,
  // getUnmaskedContext,
  hasContextChanged as hasLegacyContextChanged,
  pushContextProvider as pushLegacyContextProvider,
  isContextProvider as isLegacyContextProvider,
  pushTopLevelContextObject,
  // invalidateContextProvider,
} from './ZzeactFiberContext'
import {
  enterHydrationState,
  // reenterHydrationStateFromDehydratedSuspenseInstance,
  resetHydrationState,
  tryToClaimNextHydratableInstance,
} from './ZzeactFiberHydrationContext'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let didReceiveUpdate: boolean = false

function pushHostRootContext(workInProgress): void {
  const root = (workInProgress.stateNode as FiberRoot)
  if (root.pendingContext) {
    pushTopLevelContextObject(
      workInProgress,
      root.pendingContext,
      root.pendingContext !== root.context,
    )
  } else if (root.context) {
    pushTopLevelContextObject(workInProgress, root.context, false)
  }
  pushHostContainer(workInProgress, root.containerInfo)
}

function bailoutOnAlreadyFinishedWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  if (current !== null) {
    workInProgress.contextDependencies = current.contextDependencies
  }

  const childExpirationTime = workInProgress.childExpirationTime
  if (childExpirationTime < renderExpirationTime) {
    return null
  } else {
    cloneChildFibers(current, workInProgress)
    return workInProgress.child
  }
}

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nextChildren: any,
  renderExpirationTime: ExpirationTime,
): void {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    )
  } else {
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderExpirationTime,
    )
  }
}

function markRef(current: Fiber | null, workInProgress: Fiber): void {
  const ref = workInProgress.ref
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    workInProgress.effectTag |= Ref
  }
}

function updateHostRoot(current, workInProgress, renderExpirationTime): Fiber {
  pushHostRootContext(workInProgress)
  const updateQueue = workInProgress.updateQueue
  invariant(
    updateQueue !== null,
    'If the root does not have an updateQueue, we should have already ' +
      'bailed out. This error is likely caused by a bug in Zzeact. Please ' +
      'file an issue.',
  )
  const nextProps = workInProgress.pendingProps
  const prevState = workInProgress.memoizedState
  const prevChildren = prevState !== null ? prevState.element : null
  processUpdateQueue(
    workInProgress,
    updateQueue,
    nextProps,
    null,
    renderExpirationTime,
  )
  const nextState = workInProgress.memoizedState
  const nextChildren = nextState.element
  if (nextChildren === prevChildren) {
    resetHydrationState()
    return bailoutOnAlreadyFinishedWork(
      current,
      workInProgress,
      renderExpirationTime,
    )
  }
  const root: FiberRoot = workInProgress.stateNode
  if (
    (current === null || current.child === null) &&
    root.hydrate &&
    enterHydrationState(workInProgress)
  ) {
    workInProgress.effectTag |= Placement
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderExpirationTime,
    )
  } else {
    reconcileChildren(
      current,
      workInProgress,
      nextChildren,
      renderExpirationTime,
    )
    resetHydrationState()
  }
  return workInProgress.child
}

function updateHostComponent(current, workInProgress, renderExpirationTime): Fiber {
  pushHostContext(workInProgress)

  if (current === null) {
    tryToClaimNextHydratableInstance(workInProgress)
  }

  const type = workInProgress.type
  const nextProps = workInProgress.pendingProps
  const prevProps = current !== null ? current.memoizedProps : null

  let nextChildren = nextProps.children
  const isDirectTextChild = shouldSetTextContent(type, nextProps)

  if (isDirectTextChild) {
    nextChildren = null
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    workInProgress.effectTag |= ContentReset
  }

  markRef(current, workInProgress)

  if (
    renderExpirationTime !== Never &&
    workInProgress.mode & ConcurrentMode &&
    shouldDeprioritizeSubtree(type, nextProps)
  ) {
    workInProgress.expirationTime = workInProgress.childExpirationTime = Never
    return null
  }

  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderExpirationTime,
  )
  return workInProgress.child
}

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderExpirationTime: ExpirationTime,
): Fiber | null {
  const updateExpirationTime = workInProgress.expirationTime

  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps

    if (oldProps !== newProps || hasLegacyContextChanged()) {
      didReceiveUpdate = true
    } else if (updateExpirationTime < renderExpirationTime) {
      didReceiveUpdate = false
      console.log('2019/11/6 debug before WorkInProgress Tag:', workInProgress.tag)
      switch (workInProgress.tag) {
        case HostRoot:
          pushHostRootContext(workInProgress)
          resetHydrationState()
          break
        case HostComponent:
          pushHostContext(workInProgress)
          break
        case ClassComponent: {
          const Component = workInProgress.type
          if (isLegacyContextProvider(Component)) {
            pushLegacyContextProvider(workInProgress)
          }
          break
        }
        case HostPortal:
          pushHostContainer(
            workInProgress,
            workInProgress.stateNode.containerInfo,
          )
          break
        case ContextProvider: {
          const newValue = workInProgress.memoizedProps.value
          pushProvider(workInProgress, newValue)
          break
        }
        case Profiler:
          break
        case SuspenseComponent: {
          const state: SuspenseState | null = workInProgress.memoizedState
          const didTimeout = state !== null
          if (didTimeout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const primaryChildFragment: Fiber = (workInProgress.child as any)
            const primaryChildExpirationTime =
              primaryChildFragment.childExpirationTime
            if (
              primaryChildExpirationTime !== NoWork &&
              primaryChildExpirationTime >= renderExpirationTime
            ) {
              return updateSuspenseComponent(
                current,
                workInProgress,
                renderExpirationTime,
              )
            } else {
              const child = bailoutOnAlreadyFinishedWork(
                current,
                workInProgress,
                renderExpirationTime,
              )
              if (child !== null) {
                return child.sibling
              } else {
                return null
              }
            }
          }
          break
        }
        case DehydratedSuspenseComponent: {}
      }
      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderExpirationTime,
      )
    }
  } else {
    didReceiveUpdate = false
  }

  workInProgress.expirationTime = NoWork
  console.log('2019/11/6 debug WorkInProgress Tag:', workInProgress.tag)
  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      const elementType = workInProgress.elementType
      return mountIndeterminateComponent(
        current,
        workInProgress,
        elementType,
        renderExpirationTime,
      )
    }
    case LazyComponent: {
      const elementType = workInProgress.elementType
      return mountLazyComponent(
        current,
        workInProgress,
        elementType,
        updateExpirationTime,
        renderExpirationTime,
      )
    }
    case FunctionComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps)
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      )
    }
    case ClassComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps)
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      )
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderExpirationTime)
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderExpirationTime)
    case HostText:
      return updateHostText(current, workInProgress)
    case SuspenseComponent:
      return updateSuspenseComponent(
        current,
        workInProgress,
        renderExpirationTime,
      )
    case HostPortal:
      return updatePortalComponent(
        current,
        workInProgress,
        renderExpirationTime,
      )
    case ForwardRef: {
      const type = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === type
          ? unresolvedProps
          : resolveDefaultProps(type, unresolvedProps)
      return updateForwardRef(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderExpirationTime,
      )
    }
    case Fragment:
      return updateFragment(current, workInProgress, renderExpirationTime)
    case Mode:
      return updateMode(current, workInProgress, renderExpirationTime)
    case Profiler:
      return updateProfiler(current, workInProgress, renderExpirationTime)
    case ContextProvider:
      return updateContextProvider(
        current,
        workInProgress,
        renderExpirationTime,
      )
    case ContextConsumer:
      return updateContextConsumer(
        current,
        workInProgress,
        renderExpirationTime,
      )
    case MemoComponent: {
      const type = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      let resolvedProps = resolveDefaultProps(type, unresolvedProps)
      resolvedProps = resolveDefaultProps(type.type, resolvedProps)
      return updateMemoComponent(
        current,
        workInProgress,
        type,
        resolvedProps,
        updateExpirationTime,
        renderExpirationTime,
      )
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        updateExpirationTime,
        renderExpirationTime,
      )
    }
    case IncompleteClassComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps)
      return mountIncompleteClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderExpirationTime,
      )
    }
    case DehydratedSuspenseComponent: {
      break
    }
  }
  invariant(
    false,
    'Unknown unit of work tag. This error is likely caused by a bug in ' +
      'Zzeact. Please file an issue.',
  )
}

export { beginWork }