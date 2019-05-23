import { IFiber } from './ZzeactFiber'
import { createCursor, IStackCursor, pop } from './ZzeactFiberStack'

export const emptyContextObject = {}

let contextStackCursor: IStackCursor<object> = createCursor(emptyContextObject)
let didPerformWorkStackCursor: IStackCursor<boolean> = createCursor(false)

function popContext(fiber: IFiber): void {
  pop(didPerformWorkStackCursor, fiber)
  pop(contextStackCursor, fiber)
}

function popTopLevelContextObject(fiber: IFiber): void {
  pop(didPerformWorkStackCursor, fiber)
  pop(contextStackCursor, fiber)
}

export {
  // getUnmaskedContext,
  // cacheContext,
  // getMaskedContext,
  // hasContextChanged,
  popContext,
  popTopLevelContextObject,
  // pushTopLevelContextObject,
  // processChildContext,
  // isContextProvider,
  // pushContextProvider,
  // invalidateContextProvider,
  // findCurrentUnmaskedContext,
}
