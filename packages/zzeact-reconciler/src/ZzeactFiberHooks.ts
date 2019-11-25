import { ZzeactContext } from '@/shared/ZzeactTypes'
import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'
import { HookEffectTag } from './ZzeactHookEffectTags'

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

type Effect = {
  tag: HookEffectTag
  create: () => (() => void) | void
  destroy: (() => void) | void
  deps: Array<mixed> | null
  next: Effect
}

export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refOrContext: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nextRenderExpirationTime: ExpirationTime,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // renderExpirationTime = nextRenderExpirationTime
  // currentlyRenderingFiber = workInProgress
  // nextCurrentHook = current !== null ? current.memoizedState : null
  // ZzeactCurrentDispatcher.current =
  //     nextCurrentHook === null
  //       ? HooksDispatcherOnMount
  //       : HooksDispatcherOnUpdate

  // eslint-disable-next-line prefer-const
  let children = Component(props, refOrContext)

  // if (didScheduleRenderPhaseUpdate) {
  //   do {
  //     didScheduleRenderPhaseUpdate = false;
  //     numberOfReRenders += 1;

  //     nextCurrentHook = current !== null ? current.memoizedState : null;
  //     nextWorkInProgressHook = firstWorkInProgressHook;

  //     currentHook = null;
  //     workInProgressHook = null;
  //     componentUpdateQueue = null;

  //     ZzeactCurrentDispatcher.current = HooksDispatcherOnUpdate

  //     children = Component(props, refOrContext);
  //   } while (didScheduleRenderPhaseUpdate);

  //   renderPhaseUpdates = null;
  //   numberOfReRenders = 0;
  // }

  // ZzeactCurrentDispatcher.current = ContextOnlyDispatcher;

  // const renderedWork: Fiber = (currentlyRenderingFiber as any);

  // renderedWork.memoizedState = firstWorkInProgressHook;
  // renderedWork.expirationTime = remainingExpirationTime;
  // renderedWork.updateQueue = (componentUpdateQueue as any);
  // renderedWork.effectTag |= sideEffectTag;

  // const didRenderTooFewHooks =
  //   currentHook !== null && currentHook.next !== null;

  // renderExpirationTime = NoWork;
  // currentlyRenderingFiber = null;

  // currentHook = null;
  // nextCurrentHook = null;
  // firstWorkInProgressHook = null;
  // workInProgressHook = null;
  // nextWorkInProgressHook = null;

  // remainingExpirationTime = NoWork;
  // componentUpdateQueue = null;
  // sideEffectTag = 0;

  // invariant(
  //   !didRenderTooFewHooks,
  //   'Rendered fewer hooks than expected. This may be caused by an accidental ' +
  //     'early return statement.',
  // );

  return children
}

export type FunctionComponentUpdateQueue = {
  lastEffect: Effect | null
}

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
