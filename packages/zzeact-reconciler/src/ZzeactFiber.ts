
/**
 *  暂时停留至此，没写完
 */

import { IRefObject } from '@/shared/ZzeactTypes'
import { WorkTag } from '@/shared/ZzeactWorkTags'

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
}
