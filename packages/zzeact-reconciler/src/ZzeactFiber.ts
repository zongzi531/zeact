import { ISource } from '@/shared/ZzeactElementType'
import { enableProfilerTimer } from '@/shared/ZzeactFeatureFlags'
import { SideEffectTag, NoEffect } from '@/shared/ZzeactSideEffectTags'
import { IRefObject } from '@/shared/ZzeactTypes'
import {
  WorkTag,
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
import { isDevToolsPresent } from './ZzeactFiberDevToolsHook'
import { ExpirationTime, NoWork } from './ZzeactFiberExpirationTime'
import { HookType } from './ZzeactFiberHooks'
import { IContextDependencyList } from './ZzeactFiberNewContext'
import {
  TypeOfMode,
  NoContext,
  ConcurrentMode,
  ProfileMode,
  StrictMode,
} from './ZzeactTypeOfMode'
import { IUpdateQueue } from './ZzeactUpdateQueue'

type RefFunAndStr = ((handle: mixed) => void) & { _stringRef?: string }

export interface IFiber {
  tag: WorkTag
  key: null | string
  elementType: any
  type: any
  stateNode: any
  return: IFiber | null
  child: IFiber | null
  sibling: IFiber | null
  index: number
  ref: null | RefFunAndStr | IRefObject
  pendingProps: any
  memoizedProps: any
  updateQueue: IUpdateQueue<any> | null
  memoizedState: any
  contextDependencies: IContextDependencyList | null
  mode: TypeOfMode
  effectTag: SideEffectTag
  nextEffect: IFiber | null
  firstEffect: IFiber | null
  lastEffect: IFiber | null
  expirationTime: ExpirationTime
  childExpirationTime: ExpirationTime
  alternate: IFiber | null
  actualDuration?: number
  actualStartTime?: number
  selfBaseDuration?: number
  treeBaseDuration?: number
  _debugID?: number
  _debugSource?: ISource | null
  _debugOwner?: IFiber | null
  _debugIsCurrentlyTiming?: boolean
  _debugHookTypes?: HookType[] | null
}

function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
  this.tag = tag
  this.key = key
  this.elementType = null
  this.type = null
  this.stateNode = null
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
  this.effectTag = NoEffect
  this.nextEffect = null
  this.firstEffect = null
  this.lastEffect = null
  this.expirationTime = NoWork
  this.childExpirationTime = NoWork
  this.alternate = null

  if (enableProfilerTimer) {
    this.actualDuration = Number.NaN
    this.actualStartTime = Number.NaN
    this.selfBaseDuration = Number.NaN
    this.treeBaseDuration = Number.NaN
    this.actualDuration = 0
    this.actualStartTime = -1
    this.selfBaseDuration = 0
    this.treeBaseDuration = 0
  }
}

export function createHostRootFiber(isConcurrent: boolean): IFiber {
  let mode = isConcurrent ? ConcurrentMode | StrictMode : NoContext

  if (enableProfilerTimer && isDevToolsPresent) {
    mode |= ProfileMode
  }

  return createFiber(HostRoot, null, null, mode)
}

const createFiber = (
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
): IFiber => {
  return new FiberNode(tag, pendingProps, key, mode)
}
