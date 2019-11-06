import { ZzeactElement } from '@/shared/ZzeactElementType'
import { ZzeactPortal } from '@/shared/ZzeactTypes'
import { Fiber } from './ZzeactFiber'
import { ExpirationTime } from './ZzeactFiberExpirationTime'

import { Placement, Deletion } from '@/shared/ZzeactSideEffectTags'
import {
  getIteratorFn,
  ZZEACT_ELEMENT_TYPE,
  ZZEACT_FRAGMENT_TYPE,
  ZZEACT_PORTAL_TYPE,
} from '@/shared/ZzeactSymbols'
import {
  FunctionComponent,
  ClassComponent,
  HostText,
  HostPortal,
  Fragment,
} from '@/shared/ZzeactWorkTags'
import invariant from '@/shared/invariant'

import {
  createWorkInProgress,
  createFiberFromElement,
  createFiberFromFragment,
  createFiberFromText,
  createFiberFromPortal,
} from './ZzeactFiber'
import { emptyRefsObject } from './ZzeactFiberClassComponent'

const isArray = Array.isArray

function coerceRef(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ZzeactElement,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const mixedRef = element.ref
  if (
    mixedRef !== null &&
    typeof mixedRef !== 'function' &&
    typeof mixedRef !== 'object'
  ) {

    if (element._owner) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const owner: Fiber = (element._owner as any)
      let inst
      if (owner) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ownerFiber = ((owner as any) as Fiber)
        invariant(
          ownerFiber.tag === ClassComponent,
          'Function components cannot have refs. ' +
            'Did you mean to use React.forwardRef()?',
        )
        inst = ownerFiber.stateNode
      }
      invariant(
        inst,
        'Missing owner for string ref %s. This error is likely caused by a ' +
          'bug in React. Please file an issue.',
        mixedRef,
      )
      const stringRef = '' + mixedRef
      if (
        current !== null &&
        current.ref !== null &&
        typeof current.ref === 'function' &&
        current.ref._stringRef === stringRef
      ) {
        return current.ref
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ref: Function & { _stringRef?: any } = function(value): void {
        let refs = inst.refs
        if (refs === emptyRefsObject) {
          refs = inst.refs = {}
        }
        if (value === null) {
          delete refs[stringRef]
        } else {
          refs[stringRef] = value
        }
      }
      ref._stringRef = stringRef
      return ref
    } else {
      invariant(
        typeof mixedRef === 'string',
        'Expected ref to be a function, a string, an object returned by React.createRef(), or null.',
      )
      invariant(
        element._owner,
        'Element ref was specified as a string (%s) but no owner was set. This could happen for one of' +
          ' the following reasons:\n' +
          '1. You may be adding a ref to a function component\n' +
          '2. You may be adding a ref to a component that was not created inside a component\'s render method\n' +
          '3. You have multiple copies of React loaded\n' +
          'See https://fb.me/react-refs-must-have-owner for more information.',
        mixedRef,
      )
    }
  }
  return mixedRef
}

function throwOnInvalidObjectType(returnFiber: Fiber, newChild: object): void {
  if (returnFiber.type !== 'textarea') {
    const addendum = ''
    invariant(
      false,
      'Objects are not valid as a React child (found: %s).%s',
      Object.prototype.toString.call(newChild) === '[object Object]'
        ? 'object with keys {' + Object.keys(newChild).join(', ') + '}'
        : newChild,
      addendum,
    )
  }
}

function ChildReconciler(shouldTrackSideEffects): Function {
  function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
    if (!shouldTrackSideEffects) {
      return
    }
    const last = returnFiber.lastEffect
    if (last !== null) {
      last.nextEffect = childToDelete
      returnFiber.lastEffect = childToDelete
    } else {
      returnFiber.firstEffect = returnFiber.lastEffect = childToDelete
    }
    childToDelete.nextEffect = null
    childToDelete.effectTag = Deletion
  }

  function deleteRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
  ): null {
    if (!shouldTrackSideEffects) {
      return null
    }

    let childToDelete = currentFirstChild
    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
    }
    return null
  }

  function mapRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber,
  ): Map<string | number, Fiber> {
    const existingChildren: Map<string | number, Fiber> = new Map()

    let existingChild = currentFirstChild
    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild)
      } else {
        existingChildren.set(existingChild.index, existingChild)
      }
      existingChild = existingChild.sibling
    }
    return existingChildren
  }

  function useFiber(
    fiber: Fiber,
    pendingProps: mixed,
    // expirationTime: ExpirationTime,
  ): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps/* , expirationTime */)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number,
  ): number {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
      return lastPlacedIndex
    }
    const current = newFiber.alternate
    if (current !== null) {
      const oldIndex = current.index
      if (oldIndex < lastPlacedIndex) {
        newFiber.effectTag = Placement
        return lastPlacedIndex
      } else {
        return oldIndex
      }
    } else {
      newFiber.effectTag = Placement
      return lastPlacedIndex
    }
  }

  function placeSingleChild(newFiber: Fiber): Fiber {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.effectTag = Placement
    }
    return newFiber
  }

  function updateTextNode(
    returnFiber: Fiber,
    current: Fiber | null,
    textContent: string,
    expirationTime: ExpirationTime,
  ): Fiber {
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(
        textContent,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, textContent/* , expirationTime */)
      existing.return = returnFiber
      return existing
    }
  }

  function updateElement(
    returnFiber: Fiber,
    current: Fiber | null,
    element: ZzeactElement,
    expirationTime: ExpirationTime,
  ): Fiber {
    if (current !== null && current.elementType === element.type) {
      const existing = useFiber(current, element.props/* , expirationTime */)
      existing.ref = coerceRef(returnFiber, current, element)
      existing.return = returnFiber
      return existing
    } else {
      const created = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      )
      created.ref = coerceRef(returnFiber, current, element)
      created.return = returnFiber
      return created
    }
  }

  function updatePortal(
    returnFiber: Fiber,
    current: Fiber | null,
    portal: ZzeactPortal,
    expirationTime: ExpirationTime,
  ): Fiber {
    if (
      current === null ||
      current.tag !== HostPortal ||
      current.stateNode.containerInfo !== portal.containerInfo ||
      current.stateNode.implementation !== portal.implementation
    ) {
      const created = createFiberFromPortal(
        portal,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, portal.children || []/* , expirationTime */)
      existing.return = returnFiber
      return existing
    }
  }

  function updateFragment(
    returnFiber: Fiber,
    current: Fiber | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fragment: Iterable<any>,
    expirationTime: ExpirationTime,
    key: null | string,
  ): Fiber {
    if (current === null || current.tag !== Fragment) {
      const created = createFiberFromFragment(
        fragment,
        returnFiber.mode,
        expirationTime,
        key,
      )
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, fragment/* , expirationTime */)
      existing.return = returnFiber
      return existing
    }
  }

  function createChild(
    returnFiber: Fiber,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChild: any,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const created = createFiberFromText(
        '' + newChild,
        returnFiber.mode,
        expirationTime,
      )
      created.return = returnFiber
      return created
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case ZZEACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(
            newChild,
            returnFiber.mode,
            expirationTime,
          )
          created.ref = coerceRef(returnFiber, null, newChild)
          created.return = returnFiber
          return created
        }
        case ZZEACT_PORTAL_TYPE: {
          const created = createFiberFromPortal(
            newChild,
            returnFiber.mode,
            expirationTime,
          )
          created.return = returnFiber
          return created
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        const created = createFiberFromFragment(
          newChild,
          returnFiber.mode,
          expirationTime,
          null,
        )
        created.return = returnFiber
        return created
      }

      throwOnInvalidObjectType(returnFiber, newChild)
    }

    return null
  }

  function updateSlot(
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChild: any,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    const key = oldFiber !== null ? oldFiber.key : null

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      if (key !== null) {
        return null
      }
      return updateTextNode(
        returnFiber,
        oldFiber,
        '' + newChild,
        expirationTime,
      )
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case ZZEACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            if (newChild.type === ZZEACT_FRAGMENT_TYPE) {
              return updateFragment(
                returnFiber,
                oldFiber,
                newChild.props.children,
                expirationTime,
                key,
              )
            }
            return updateElement(
              returnFiber,
              oldFiber,
              newChild,
              expirationTime,
            )
          } else {
            return null
          }
        }
        case ZZEACT_PORTAL_TYPE: {
          if (newChild.key === key) {
            return updatePortal(
              returnFiber,
              oldFiber,
              newChild,
              expirationTime,
            )
          } else {
            return null
          }
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        if (key !== null) {
          return null
        }

        return updateFragment(
          returnFiber,
          oldFiber,
          newChild,
          expirationTime,
          null,
        )
      }

      throwOnInvalidObjectType(returnFiber, newChild)
    }

    return null
  }

  function updateFromMap(
    existingChildren: Map<string | number, Fiber>,
    returnFiber: Fiber,
    newIdx: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChild: any,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const matchedFiber = existingChildren.get(newIdx) || null
      return updateTextNode(
        returnFiber,
        matchedFiber,
        '' + newChild,
        expirationTime,
      )
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case ZZEACT_ELEMENT_TYPE: {
          const matchedFiber =
            existingChildren.get(
              newChild.key === null ? newIdx : newChild.key,
            ) || null
          if (newChild.type === ZZEACT_FRAGMENT_TYPE) {
            return updateFragment(
              returnFiber,
              matchedFiber,
              newChild.props.children,
              expirationTime,
              newChild.key,
            )
          }
          return updateElement(
            returnFiber,
            matchedFiber,
            newChild,
            expirationTime,
          )
        }
        case ZZEACT_PORTAL_TYPE: {
          const matchedFiber =
            existingChildren.get(
              newChild.key === null ? newIdx : newChild.key,
            ) || null
          return updatePortal(
            returnFiber,
            matchedFiber,
            newChild,
            expirationTime,
          )
        }
      }

      if (isArray(newChild) || getIteratorFn(newChild)) {
        const matchedFiber = existingChildren.get(newIdx) || null
        return updateFragment(
          returnFiber,
          matchedFiber,
          newChild,
          expirationTime,
          null,
        )
      }

      throwOnInvalidObjectType(returnFiber, newChild)
    }

    return null
  }

  function reconcileChildrenArray(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChildren: Array<any>,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    let resultingFirstChild: Fiber | null = null
    let previousNewFiber: Fiber | null = null

    let oldFiber = currentFirstChild
    let lastPlacedIndex = 0
    let newIdx = 0
    let nextOldFiber = null
    for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        expirationTime,
      )
      if (newFiber === null) {
        if (oldFiber === null) {
          oldFiber = nextOldFiber
        }
        break
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber)
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (newIdx === newChildren.length) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    if (oldFiber === null) {
      for (; newIdx < newChildren.length; newIdx++) {
        const newFiber = createChild(
          returnFiber,
          newChildren[newIdx],
          expirationTime,
        )
        if (!newFiber) {
          continue
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
      return resultingFirstChild
    }

    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        expirationTime,
      )
      if (newFiber) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key,
            )
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach(child => deleteChild(returnFiber, child))
    }

    return resultingFirstChild
  }

  function reconcileChildrenIterator(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChildrenIterable: Iterable<any>,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    const iteratorFn = getIteratorFn(newChildrenIterable)
    invariant(
      typeof iteratorFn === 'function',
      'An object is not an iterable. This error is likely caused by a bug in ' +
        'React. Please file an issue.',
    )

    const newChildren = iteratorFn.call(newChildrenIterable)
    invariant(newChildren != null, 'An iterable object provided no iterator.')

    let resultingFirstChild: Fiber | null = null
    let previousNewFiber: Fiber | null = null

    let oldFiber = currentFirstChild
    let lastPlacedIndex = 0
    let newIdx = 0
    let nextOldFiber = null

    let step = newChildren.next()
    for (
      ;
      oldFiber !== null && !step.done;
      newIdx++, step = newChildren.next()
    ) {
      if (oldFiber.index > newIdx) {
        nextOldFiber = oldFiber
        oldFiber = null
      } else {
        nextOldFiber = oldFiber.sibling
      }
      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        step.value,
        expirationTime,
      )
      if (newFiber === null) {
        if (!oldFiber) {
          oldFiber = nextOldFiber
        }
        break
      }
      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          deleteChild(returnFiber, oldFiber)
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (step.done) {
      deleteRemainingChildren(returnFiber, oldFiber)
      return resultingFirstChild
    }

    if (oldFiber === null) {
      for (; !step.done; newIdx++, step = newChildren.next()) {
        const newFiber = createChild(returnFiber, step.value, expirationTime)
        if (newFiber === null) {
          continue
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
      return resultingFirstChild
    }

    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

    for (; !step.done; newIdx++, step = newChildren.next()) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        step.value,
        expirationTime,
      )
      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key,
            )
          }
        }
        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach(child => deleteChild(returnFiber, child))
    }

    return resultingFirstChild
  }

  function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
    expirationTime: ExpirationTime,
  ): Fiber {
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling)
      const existing = useFiber(currentFirstChild, textContent/* , expirationTime */)
      existing.return = returnFiber
      return existing
    }
    deleteRemainingChildren(returnFiber, currentFirstChild)
    const created = createFiberFromText(
      textContent,
      returnFiber.mode,
      expirationTime,
    )
    created.return = returnFiber
    return created
  }

  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ZzeactElement,
    expirationTime: ExpirationTime,
  ): Fiber {
    const key = element.key
    let child = currentFirstChild
    while (child !== null) {
      if (child.key === key) {
        if (
          child.tag === Fragment
            ? element.type === ZZEACT_FRAGMENT_TYPE
            : child.elementType === element.type
        ) {
          deleteRemainingChildren(returnFiber, child.sibling)
          const existing = useFiber(
            child,
            element.type === ZZEACT_FRAGMENT_TYPE
              ? element.props.children
              : element.props,
            // expirationTime,
          )
          existing.ref = coerceRef(returnFiber, child, element)
          existing.return = returnFiber
          return existing
        } else {
          deleteRemainingChildren(returnFiber, child)
          break
        }
      } else {
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }

    if (element.type === ZZEACT_FRAGMENT_TYPE) {
      const created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        expirationTime,
        element.key,
      )
      created.return = returnFiber
      return created
    } else {
      const created = createFiberFromElement(
        element,
        returnFiber.mode,
        expirationTime,
      )
      created.ref = coerceRef(returnFiber, currentFirstChild, element)
      created.return = returnFiber
      return created
    }
  }

  function reconcileSinglePortal(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    portal: ZzeactPortal,
    expirationTime: ExpirationTime,
  ): Fiber {
    const key = portal.key
    let child = currentFirstChild
    while (child !== null) {
      if (child.key === key) {
        if (
          child.tag === HostPortal &&
          child.stateNode.containerInfo === portal.containerInfo &&
          child.stateNode.implementation === portal.implementation
        ) {
          deleteRemainingChildren(returnFiber, child.sibling)
          const existing = useFiber(
            child,
            portal.children || [],
            // expirationTime,
          )
          existing.return = returnFiber
          return existing
        } else {
          deleteRemainingChildren(returnFiber, child)
          break
        }
      } else {
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }

    const created = createFiberFromPortal(
      portal,
      returnFiber.mode,
      expirationTime,
    )
    created.return = returnFiber
    return created
  }

  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newChild: any,
    expirationTime: ExpirationTime,
  ): Fiber | null {
    const isUnkeyedTopLevelFragment =
      typeof newChild === 'object' &&
      newChild !== null &&
      newChild.type === ZZEACT_FRAGMENT_TYPE &&
      newChild.key === null
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children
    }

    const isObject = typeof newChild === 'object' && newChild !== null

    if (isObject) {
      switch (newChild.$$typeof) {
        case ZZEACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              expirationTime,
            ),
          )
        case ZZEACT_PORTAL_TYPE:
          return placeSingleChild(
            reconcileSinglePortal(
              returnFiber,
              currentFirstChild,
              newChild,
              expirationTime,
            ),
          )
      }
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          '' + newChild,
          expirationTime,
        ),
      )
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      )
    }

    if (getIteratorFn(newChild)) {
      return reconcileChildrenIterator(
        returnFiber,
        currentFirstChild,
        newChild,
        expirationTime,
      )
    }

    if (isObject) {
      throwOnInvalidObjectType(returnFiber, newChild)
    }

    if (typeof newChild === 'undefined' && !isUnkeyedTopLevelFragment) {
      switch (returnFiber.tag) {
        case ClassComponent:
        case FunctionComponent: {
          const Component = returnFiber.type
          invariant(
            false,
            '%s(...): Nothing was returned from render. This usually means a ' +
              'return statement is missing. Or, to render nothing, ' +
              'return null.',
            Component.displayName || Component.name || 'Component',
          )
        }
      }
    }

    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  return reconcileChildFibers
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)

export function cloneChildFibers(
  current: Fiber | null,
  workInProgress: Fiber,
): void {
  invariant(
    current === null || workInProgress.child === current.child,
    'Resuming work not yet implemented.',
  )

  if (workInProgress.child === null) {
    return
  }

  let currentChild = workInProgress.child
  let newChild = createWorkInProgress(
    currentChild,
    currentChild.pendingProps,
    // currentChild.expirationTime,
  )
  workInProgress.child = newChild

  newChild.return = workInProgress
  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(
      currentChild,
      currentChild.pendingProps,
      // currentChild.expirationTime,
    )
    newChild.return = workInProgress
  }
  newChild.sibling = null
}
