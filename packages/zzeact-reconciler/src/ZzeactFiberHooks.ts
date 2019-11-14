import { ZzeactContext } from '@/shared/ZzeactTypes'

type BasicStateAction<S> = ((S) => S) | S

type Dispatch<A> = (A) => void

export type Dispatcher = {
  readContext<T>(
    context: ZzeactContext<T>,
    observedBits: void | number | boolean,
  ): T
  useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>]
  useReducer<S, I, A>(
    reducer: (S, A) => S,
    initialArg: I,
    init?: (I) => S,
  ): [S, Dispatch<A>]
  useContext<T>(
    context: ZzeactContext<T>,
    observedBits: void | number | boolean,
  ): T
  useRef<T>(initialValue: T): {current: T}
  useEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void
  useLayoutEffect(
    create: () => (() => void) | void,
    deps: Array<mixed> | void | null,
  ): void
  useCallback<T>(callback: T, deps: Array<mixed> | void | null): T
  useMemo<T>(nextCreate: () => T, deps: Array<mixed> | void | null): T
  useImperativeHandle<T>(
    ref: {current: T | null} | ((inst: T | null) => mixed) | null | void,
    create: () => T,
    deps: Array<mixed> | void | null,
  ): void
  useDebugValue<T>(value: T, formatterFn?: (value: T) => mixed): void
}

export type HookType =
  | 'useState'
  | 'useReducer'
  | 'useContext'
  | 'useRef'
  | 'useEffect'
  | 'useLayoutEffect'
  | 'useCallback'
  | 'useMemo'
  | 'useImperativeHandle'
  | 'useDebugValue'

  export const ContextOnlyDispatcher: Dispatcher | {} = {
    // readContext,
  
    // useCallback: throwInvalidHookError,
    // useContext: throwInvalidHookError,
    // useEffect: throwInvalidHookError,
    // useImperativeHandle: throwInvalidHookError,
    // useLayoutEffect: throwInvalidHookError,
    // useMemo: throwInvalidHookError,
    // useReducer: throwInvalidHookError,
    // useRef: throwInvalidHookError,
    // useState: throwInvalidHookError,
    // useDebugValue: throwInvalidHookError,
  }

  export function resetHooks(): void {
    // ZzeactCurrentDispatcher.current = ContextOnlyDispatcher
    // renderExpirationTime = NoWork
    // currentlyRenderingFiber = null
  
    // currentHook = null
    // nextCurrentHook = null
    // firstWorkInProgressHook = null
    // workInProgressHook = null
    // nextWorkInProgressHook = null
  
    // remainingExpirationTime = NoWork
    // componentUpdateQueue = null
    // sideEffectTag = 0
  
    // didScheduleRenderPhaseUpdate = false
    // renderPhaseUpdates = null
    // numberOfReRenders = 0
  }
