import { Fiber } from './ZzeactFiber'

import { getStackByFiberInDevAndProd } from './ZzeactCurrentFiber'

export type CapturedValue<T> = {
  value: T
  source: Fiber | null
  stack: string | null
}

export type CapturedError = {
  componentName?: string
  componentStack: string
  error: mixed
  errorBoundary?: object
  errorBoundaryFound: boolean
  errorBoundaryName: string | null
  willRetry: boolean
}

export function createCapturedValue<T>(
  value: T,
  source: Fiber,
): CapturedValue<T> {
  return {
    value,
    source,
    stack: getStackByFiberInDevAndProd(source),
  }
}
