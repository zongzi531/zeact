import { Fiber } from './ZzeactFiber'
import { FiberRoot } from './ZzeactFiberRoot'
// declare var __ZZEACT_DEVTOOLS_GLOBAL_HOOK__: Object | void

// 关于是否存在开发工具，我们将其默认置于 undefined

const __ZZEACT_DEVTOOLS_GLOBAL_HOOK__ = void 0

// eslint-disable-next-line prefer-const
let onCommitFiberRoot = null
// eslint-disable-next-line prefer-const
let onCommitFiberUnmount = null

export const isDevToolsPresent =
  typeof __ZZEACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined'

export function onCommitRoot(root: FiberRoot): void {
  if (typeof onCommitFiberRoot === 'function') {
    onCommitFiberRoot(root)
  }
}

export function onCommitUnmount(fiber: Fiber): void {
  if (typeof onCommitFiberUnmount === 'function') {
    onCommitFiberUnmount(fiber)
  }
}
