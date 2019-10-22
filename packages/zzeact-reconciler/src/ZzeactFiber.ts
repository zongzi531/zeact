import {/* ZzeactFragment, ZzeactPortal, */ RefObject } from '@/shared/ZzeactTypes'
import { WorkTag } from '@/shared/ZzeactWorkTags'
import { TypeOfMode } from './ZzeactTypeOfMode'
import { SideEffectTag } from '@/shared/ZzeactSideEffectTags'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { UpdateQueue } from './ZzeactUpdateQueue'
import { ContextDependencyList } from './ZzeactFiberNewContext'

// import { enableProfilerTimer } from '@/shared/ZzeactFeatureFlags'

// import { isDevToolsPresent } from './ZzeactFiberDevToolsHook'

import { NoEffect } from '@/shared/ZzeactSideEffectTags'
import {
  // IndeterminateComponent,
  // ClassComponent,
  HostRoot,
  // HostComponent,
  // HostText,
  // HostPortal,
  // ForwardRef,
  // Fragment,
  // Mode,
  // ContextProvider,
  // ContextConsumer,
  // Profiler,
  // SuspenseComponent,
  // FunctionComponent,
  // MemoComponent,
  // LazyComponent,
} from '@/shared/ZzeactWorkTags'
import { NoWork } from './ZzeactFiberExpirationTime'
import {
  NoContext,
  ConcurrentMode,
  // ProfileMode,
  StrictMode,
} from './ZzeactTypeOfMode'

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

  // if (enableProfilerTimer) {

  //   this.actualDuration = Number.NaN
  //   this.actualStartTime = Number.NaN
  //   this.selfBaseDuration = Number.NaN
  //   this.treeBaseDuration = Number.NaN

  //   this.actualDuration = 0
  //   this.actualStartTime = -1
  //   this.selfBaseDuration = 0
  //   this.treeBaseDuration = 0
  // }
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
  // eslint-disable-next-line prefer-const
  let mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext

  // if (enableProfilerTimer && isDevToolsPresent) {
  //   mode |= ProfileMode
  // }

  return createFiber(HostRoot, null, null, mode)
}
