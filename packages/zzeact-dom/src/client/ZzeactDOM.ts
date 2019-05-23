import invariant from '@/shared/invariant'
import {
  // computeUniqueAsyncExpiration,
  // findHostInstanceWithNoPortals,
  // updateContainerAtExpirationTime,
  // flushRoot,
  createContainer,
  updateContainer,
  // batchedUpdates,
  // unbatchedUpdates,
  // interactiveUpdates,
  // flushInteractiveUpdates,
  // flushSync,
  // flushControlled,
  // injectIntoDevTools,
  // getPublicRootInstance,
  // findHostInstance,
  // findHostInstanceWithWarning,
} from '@/zzeact-reconciler/inline.dom'
import { ROOT_ATTRIBUTE_NAME } from '../shared/DOMProperty'
import {
  COMMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_NODE,
  ELEMENT_NODE,
} from '../shared/HTMLNodeType'

function isValidContainer(node) {
  return !!(
    node &&
    (node.nodeType === ELEMENT_NODE ||
      node.nodeType === DOCUMENT_NODE ||
      node.nodeType === DOCUMENT_FRAGMENT_NODE ||
      (node.nodeType === COMMENT_NODE &&
        node.nodeValue === ' zzeact-mount-point-unstable '))
  )
}

function getZzeactRootElementInContainer(container: any) {
  if (!container) {
    return null
  }

  if (container.nodeType === DOCUMENT_NODE) {
    return container.documentElement
  } else {
    return container.firstChild
  }
}

function shouldHydrateDueToLegacyHeuristic(container) {
  const rootElement = getZzeactRootElementInContainer(container)
  return !!(
    rootElement &&
    rootElement.nodeType === ELEMENT_NODE &&
    rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME)
  )
}

function legacyCreateRootFromDOMContainer(
  container: DOMContainer,
  forceHydrate: boolean,
): IRoot {
  const shouldHydrate =
    forceHydrate || shouldHydrateDueToLegacyHeuristic(container)
  if (!shouldHydrate) {
    let rootSibling: any
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling)
    }
  }
  const isConcurrent = false
  return new ZzeactRoot(container, isConcurrent, shouldHydrate)
}

function ZzeactWork() {
  this._callbacks = null
  this._didCommit = false
  this._onCommit = this._onCommit.bind(this)
}
ZzeactWork.prototype.then = function(onCommit: () => mixed): void {
  if (this._didCommit) {
    onCommit()
    return
  }
  let callbacks = this._callbacks
  if (callbacks === null) {
    callbacks = this._callbacks = []
  }
  callbacks.push(onCommit)
}
ZzeactWork.prototype._onCommit = function(): void {
  if (this._didCommit) {
    return
  }
  this._didCommit = true
  const callbacks = this._callbacks
  if (callbacks === null) {
    return
  }
  // TODO: Error handling.
  for (const callback of callbacks) {
    invariant(
      typeof callback === 'function',
      'Invalid argument passed as callback. Expected a function. Instead ' +
        'received: %s',
      callback,
    )
    callback()
  }
}

function ZzeactRoot(
  container: DOMContainer,
  isConcurrent: boolean,
  hydrate: boolean,
) {
  const root = createContainer(container, isConcurrent, hydrate)
  this._internalRoot = root
}
ZzeactRoot.prototype.render = function(
  children: ZzeactNodeList,
  callback?: () => mixed,
): IWork {
  const root = this._internalRoot
  const work = new ZzeactWork()
  callback = callback === undefined ? null : callback
  if (callback !== null) {
    work.then(callback)
  }
  updateContainer(children, root, null, work._onCommit)
  return work
}

function legacyRenderSubtreeIntoContainer(
  parentComponent: Zzeact$Component<any, any>,
  children: ZzeactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback?: () => any,
) {
  let root: IRoot = container._zzeactRootContainer
  if (!root) {
    root = container._zzeactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate,
    )
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = () => {
        // const instance = getPublicRootInstance(root._internalRoot)
        // originalCallback.call(instance)
      }
    }
    // unbatchedUpdates(() => {
    //   if (parentComponent != null) {
    //     root.legacy_renderSubtreeIntoContainer(
    //       parentComponent,
    //       children,
    //       callback,
    //     )
    //   } else {
    //     root.render(children, callback)
    //   }
    // })
    root.render(children, callback)
  } else {
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = () => {
        // const instance = getPublicRootInstance(root._internalRoot)
        // originalCallback.call(instance)
      }
    }
    if (parentComponent != null) {
      root.legacy_renderSubtreeIntoContainer(
        parentComponent,
        children,
        callback,
      )
    } else {
      root.render(children, callback)
    }
  }
  // return getPublicRootInstance(root._internalRoot)
}

interface IWork {
  _onCommit: () => void
  _callbacks: Array<() => mixed> | null
  _didCommit: boolean
  then(onCommit: () => mixed): void
}

interface IRoot {
  _internalRoot: FiberRoot
  render(children: ZzeactNodeList, callback?: () => any): IWork
  unmount(callback?: () => any): IWork
  legacy_renderSubtreeIntoContainer(
    parentComponent: Zzeact$Component<any, any>,
    children: ZzeactNodeList,
    callback?: () => any,
  ): IWork
  createBatch(): Batch
}

type Batch = FiberRootBatch & {
  _root: IRoot,
  _hasChildren: boolean,
  _children: ZzeactNodeList,
  _callbacks: Array<() => mixed> | null,
  _didComplete: boolean,
  render(children: ZzeactNodeList): IWork,
  then(onComplete: () => mixed): void,
  commit(): void,
}

type DOMContainer = (Element | Document) & {
  _zzeactRootContainer?: IRoot,
  _zzeactHasBeenPassedToCreateRootDEV?: boolean,
}

interface IZzeactDOM {
  default?: any
  render: (element: Zzeact$Element<any>, container: DOMContainer, callback?: () => any) => any
}

const ZzeactDOM: IZzeactDOM = {
  render(element, container, callback) {
    invariant(
      isValidContainer(container),
      'Target container is not a DOM element.',
    )
    return legacyRenderSubtreeIntoContainer(
      null,
      element,
      container,
      false,
      callback,
    )
  },
}

export default ZzeactDOM
