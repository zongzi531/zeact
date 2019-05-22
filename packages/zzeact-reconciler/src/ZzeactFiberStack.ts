import { IFiber } from './ZzeactFiber'

export interface IStackCursor<T> {
  current: T
}

const valueStack: any[] = []

let index = -1

function createCursor<T>(defaultValue: T): IStackCursor<T> {
  return {
    current: defaultValue,
  }
}

function pop<T>(cursor: IStackCursor<T>, fiber: IFiber): void {
  if (index < 0) {
    return
  }

  cursor.current = valueStack[index]

  valueStack[index] = null

  index--
}

export {
  createCursor,
  // isEmpty,
  pop,
  // push,
  // DEV only:
  // checkThatStackIsEmpty,
  // resetStackAfterFatalErrorInDev,
}
