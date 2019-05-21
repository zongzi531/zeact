import { ISource } from '@/shared/ZzeactElementType'
import { SideEffectTag } from '@/shared/ZzeactSideEffectTags'
import { IRefObject } from '@/shared/ZzeactTypes'
import { WorkTag } from '@/shared/ZzeactWorkTags'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { HookType } from './ZzeactFiberHooks'
import { IContextDependencyList } from './ZzeactFiberNewContext'
import { TypeOfMode } from './ZzeactTypeOfMode'
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
