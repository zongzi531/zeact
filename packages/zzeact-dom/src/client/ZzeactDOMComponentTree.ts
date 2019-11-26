import { HostComponent, HostText } from '@/shared/ZzeactWorkTags'
import invariant from '@/shared/invariant'

const randomKey = Math.random()
  .toString(36)
  .slice(2)
const internalInstanceKey = '__zzeactInternalInstance$' + randomKey
const internalEventHandlersKey = '__zzeactEventHandlers$' + randomKey

export function precacheFiberNode(hostInst, node): void {
  node[internalInstanceKey] = hostInst
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getClosestInstanceFromNode(node): any {
  if (node[internalInstanceKey]) {
    return node[internalInstanceKey]
  }

  while (!node[internalInstanceKey]) {
    if (node.parentNode) {
      node = node.parentNode
    } else {
      return null
    }
  }

  const inst = node[internalInstanceKey]
  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst
  }

  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getInstanceFromNode(node): any {
  const inst = node[internalInstanceKey]
  if (inst) {
    if (inst.tag === HostComponent || inst.tag === HostText) {
      return inst
    } else {
      return null
    }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNodeFromInstance(inst): any {
  if (inst.tag === HostComponent || inst.tag === HostText) {
    return inst.stateNode
  }
  invariant(false, 'getNodeFromInstance: Invalid argument.')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFiberCurrentPropsFromNode(node): any {
  return node[internalEventHandlersKey] || null
}

export function updateFiberProps(node, props): void {
  node[internalEventHandlersKey] = props
}
