export type StackCursor<T> = {
  current: T
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const valueStack: Array<any> = []

let index = -1

function createCursor<T>(defaultValue: T): StackCursor<T> {
  return {
    current: defaultValue,
  }
}

function isEmpty(): boolean {
  return index === -1
}

function pop<T>(cursor: StackCursor<T>): void {
  if (index < 0) {
    return
  }
  cursor.current = valueStack[index]
  valueStack[index] = null
  index--
}

function push<T>(cursor: StackCursor<T>, value: T): void {
  index++
  valueStack[index] = cursor.current
  cursor.current = value
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function checkThatStackIsEmpty(): void {}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function resetStackAfterFatalErrorInDev(): void {}

export {
  createCursor,
  isEmpty,
  pop,
  push,
  // DEV only:
  checkThatStackIsEmpty,
  resetStackAfterFatalErrorInDev,
}
