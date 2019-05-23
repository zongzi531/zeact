import { IFiber } from './ZzeactFiber'
import { Container, HostContext } from './ZzeactFiberHostConfig'
import { createCursor, IStackCursor, pop } from './ZzeactFiberStack'

declare class NoContextT {}
const NO_CONTEXT: NoContextT = {}

let contextStackCursor: IStackCursor<HostContext | NoContextT> = createCursor(
  NO_CONTEXT,
)
let contextFiberStackCursor: IStackCursor<IFiber | NoContextT> = createCursor(
  NO_CONTEXT,
)
let rootInstanceStackCursor: IStackCursor<Container | NoContextT> = createCursor(
  NO_CONTEXT,
)

function popHostContainer(fiber: IFiber) {
  pop(contextStackCursor, fiber)
  pop(contextFiberStackCursor, fiber)
  pop(rootInstanceStackCursor, fiber)
}

function popHostContext(fiber: IFiber): void {
  if (contextFiberStackCursor.current !== fiber) {
    return
  }

  pop(contextStackCursor, fiber)
  pop(contextFiberStackCursor, fiber)
}

export {
  // getHostContext,
  // getRootHostContainer,
  popHostContainer,
  popHostContext,
  // pushHostContainer,
  // pushHostContext,
}
