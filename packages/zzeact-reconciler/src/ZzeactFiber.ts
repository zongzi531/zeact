import { ZzeactElement, Source } from '@/shared/ZzeactElementType'
import { ZzeactFragment, ZzeactPortal, RefObject } from '@/shared/ZzeactTypes'
import { WorkTag } from '@/shared/ZzeactWorkTags'
import { TypeOfMode } from './ZzeactTypeOfMode'
import { SideEffectTag } from '@/shared/ZzeactSideEffectTags'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { UpdateQueue } from './ZzeactUpdateQueue'
import { ContextDependencyList } from './ZzeactFiberNewContext'
import { HookType } from './ZzeactFiberHooks'

import invariant from '@/shared/invariant'

// import { isDevToolsPresent } from './ZzeactFiberDevToolsHook'

import { NoEffect } from '@/shared/ZzeactSideEffectTags'
import {
  IndeterminateComponent,
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
  // FunctionComponent,
  MemoComponent,
  LazyComponent,
} from '@/shared/ZzeactWorkTags'
import { NoWork } from './ZzeactFiberExpirationTime'
import {
  NoContext,
  ConcurrentMode,
  ProfileMode,
  StrictMode,
} from './ZzeactTypeOfMode'
import {
  ZZEACT_FORWARD_REF_TYPE,
  ZZEACT_FRAGMENT_TYPE,
  ZZEACT_STRICT_MODE_TYPE,
  ZZEACT_PROFILER_TYPE,
  ZZEACT_PROVIDER_TYPE,
  ZZEACT_CONTEXT_TYPE,
  ZZEACT_CONCURRENT_MODE_TYPE,
  ZZEACT_SUSPENSE_TYPE,
  ZZEACT_MEMO_TYPE,
  ZZEACT_LAZY_TYPE,
} from '@/shared/ZzeactSymbols'

export type Fiber = {
  tag: WorkTag
  key: null | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  elementType: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateNode: any
  return: Fiber | null
  child: Fiber | null
  sibling: Fiber | null
  index: number
  ref: null | (((handle: mixed) => void) & { _stringRef?: string }) | RefObject
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memoizedProps: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateQueue: UpdateQueue<any> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  memoizedState: any
  contextDependencies: ContextDependencyList | null
  mode: TypeOfMode
  effectTag: SideEffectTag
  nextEffect: Fiber | null
  firstEffect: Fiber | null
  lastEffect: Fiber | null
  expirationTime: ExpirationTime
  childExpirationTime: ExpirationTime
  alternate: Fiber | null
  actualDuration?: number
  actualStartTime?: number
  selfBaseDuration?: number
  treeBaseDuration?: number

  _debugID?: number
  _debugSource?: Source | null
  _debugOwner?: Fiber | null
  _debugIsCurrentlyTiming?: boolean
  _debugHookTypes?: Array<HookType> | null
}

function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): void {
  // Instance
  this.tag = tag
  this.key = key
  this.elementType = null
  this.type = null
  this.stateNode = null

  // Fiber
  this.return = null
  this.child = null
  this.sibling = null
  this.index = 0

  this.ref = null

  this.pendingProps = pendingProps
  this.memoizedProps = null
  this.updateQueue = null
  this.memoizedState = null
  this.contextDependencies = null

  this.mode = mode

  // Effects
  this.effectTag = NoEffect
  this.nextEffect = null

  this.firstEffect = null
  this.lastEffect = null

  this.expirationTime = NoWork
  this.childExpirationTime = NoWork

  this.alternate = null
}

const createFiber = function(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): Fiber {
  return new FiberNode(tag, pendingProps, key, mode)
}

export function createHostRootFiber(isConcurrent: boolean): Fiber {
  const mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext

  return createFiber(HostRoot, null, null, mode)
}

export function createWorkInProgress(
  current: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any,
  // expirationTime: ExpirationTime,
): Fiber {
  let workInProgress = current.alternate
  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    )
    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.effectTag = NoEffect
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }

  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.contextDependencies = current.contextDependencies

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  return workInProgress
}

function shouldConstruct(Component: Function): boolean {
  const prototype = Component.prototype
  return !!(prototype && prototype.isZzeactComponent)
}

export function createFiberFromFragment(
  elements: ZzeactFragment,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
  key: null | string,
): Fiber {
  const fiber = createFiber(Fragment, elements, key, mode)
  fiber.expirationTime = expirationTime
  return fiber
}

function createFiberFromMode(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
  key: null | string,
): Fiber {
  const fiber = createFiber(Mode, pendingProps, key, mode)

  const type =
    (mode & ConcurrentMode) === NoContext
      ? ZZEACT_STRICT_MODE_TYPE
      : ZZEACT_CONCURRENT_MODE_TYPE
  fiber.elementType = type
  fiber.type = type

  fiber.expirationTime = expirationTime
  return fiber
}

function createFiberFromProfiler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
  key: null | string,
): Fiber {
  const fiber = createFiber(Profiler, pendingProps, key, mode | ProfileMode)
  fiber.elementType = ZZEACT_PROFILER_TYPE
  fiber.type = ZZEACT_PROFILER_TYPE
  fiber.expirationTime = expirationTime

  return fiber
}

export function createFiberFromSuspense(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
  key: null | string,
): Fiber {
  const fiber = createFiber(SuspenseComponent, pendingProps, key, mode)

  const type = ZZEACT_SUSPENSE_TYPE
  fiber.elementType = type
  fiber.type = type

  fiber.expirationTime = expirationTime
  return fiber
}

export function createFiberFromTypeAndProps(
  type: Zzeact$ElementType,
  key: null | string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingProps: any,
  owner: null | Fiber,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
): Fiber {
  let fiberTag: WorkTag = IndeterminateComponent
  let resolvedType = type
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent
    }
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  } else {
    getTag: switch (type) {
      case ZZEACT_FRAGMENT_TYPE:
        return createFiberFromFragment(
          pendingProps.children,
          mode,
          expirationTime,
          key,
        )
      case ZZEACT_CONCURRENT_MODE_TYPE:
        return createFiberFromMode(
          pendingProps,
          mode | ConcurrentMode | StrictMode,
          expirationTime,
          key,
        )
      case ZZEACT_STRICT_MODE_TYPE:
        return createFiberFromMode(
          pendingProps,
          mode | StrictMode,
          expirationTime,
          key,
        )
      case ZZEACT_PROFILER_TYPE:
        return createFiberFromProfiler(pendingProps, mode, expirationTime, key)
      case ZZEACT_SUSPENSE_TYPE:
        return createFiberFromSuspense(pendingProps, mode, expirationTime, key)
      default: {
        if (typeof type === 'object' && type !== null) {
          switch (type.$$typeof) {
            case ZZEACT_PROVIDER_TYPE:
              fiberTag = ContextProvider
              break getTag
            case ZZEACT_CONTEXT_TYPE:
              fiberTag = ContextConsumer
              break getTag
            case ZZEACT_FORWARD_REF_TYPE:
              fiberTag = ForwardRef
              break getTag
            case ZZEACT_MEMO_TYPE:
              fiberTag = MemoComponent
              break getTag
            case ZZEACT_LAZY_TYPE:
              fiberTag = LazyComponent
              resolvedType = null
              break getTag
          }
        }
        const info = ''
        invariant(
          false,
          'Element type is invalid: expected a string (for built-in ' +
            'components) or a class/function (for composite components) ' +
            'but got: %s.%s',
          type == null ? type : typeof type,
          info,
        )
      }
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode)
  fiber.elementType = type
  fiber.type = resolvedType
  fiber.expirationTime = expirationTime

  return fiber
}

export function createFiberFromElement(
  element: ZzeactElement,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
): Fiber {
  const owner = null
  const type = element.type
  const key = element.key
  const pendingProps = element.props
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode,
    expirationTime,
  )
  return fiber
}

export function createFiberFromText(
  content: string,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
): Fiber {
  const fiber = createFiber(HostText, content, null, mode)
  fiber.expirationTime = expirationTime
  return fiber
}

export function createFiberFromPortal(
  portal: ZzeactPortal,
  mode: TypeOfMode,
  expirationTime: ExpirationTime,
): Fiber {
  const pendingProps = portal.children !== null ? portal.children : []
  const fiber = createFiber(HostPortal, pendingProps, portal.key, mode)
  fiber.expirationTime = expirationTime
  fiber.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null,
    implementation: portal.implementation,
  }
  return fiber
}

export function createFiberFromHostInstanceForDeletion(): Fiber {
  const fiber = createFiber(HostComponent, null, null, NoContext)
  fiber.elementType = 'DELETED'
  fiber.type = 'DELETED'
  return fiber
}
