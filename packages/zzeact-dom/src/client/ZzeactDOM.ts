import invariant from '@/shared/invariant'
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

function legacyRenderSubtreeIntoContainer(
  parentComponent: React$Component<any, any>,
  children: ReactNodeList,
  container: DOMContainer,
  forceHydrate: boolean,
  callback?: () => any,
) {
  return false
}

interface IWork {
  _onCommit: () => void,
  _callbacks: Array<() => mixed> | null,
  _didCommit: boolean,
  then(onCommit: () => mixed): void,
}

interface IRoot {
  _internalRoot: FiberRoot,
  render(children: ReactNodeList, callback?: () => any): IWork,
  unmount(callback?: () => any): IWork,
  legacy_renderSubtreeIntoContainer(
    parentComponent: React$Component<any, any>,
    children: ReactNodeList,
    callback?: () => any,
  ): IWork,
  createBatch(): Batch,
}

type Batch = FiberRootBatch & {
  _root: IRoot,
  _hasChildren: boolean,
  _children: ReactNodeList,
  _callbacks: Array<() => mixed> | null,
  _didComplete: boolean,
  render(children: ReactNodeList): IWork,
  then(onComplete: () => mixed): void,
  commit(): void,
}

type DOMContainer = (Element | Document) & {
  _reactRootContainer?: IRoot,
  _reactHasBeenPassedToCreateRootDEV?: boolean,
}

interface IZzeactDOM {
  default?: any
  render: (element: React$Element<any>, container: DOMContainer, callback?: () => any) => any
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
