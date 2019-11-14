import invariant from '@/shared/invariant'

import {
  getInstanceFromNode,
  getFiberCurrentPropsFromNode,
} from './EventPluginUtils'

let restoreImpl = null
let restoreTarget = null
let restoreQueue = null

function restoreStateOfTarget(target): void {
  const internalInstance = getInstanceFromNode(target)
  if (!internalInstance) {
    return
  }
  invariant(
    typeof restoreImpl === 'function',
    'setRestoreImplementation() needs to be called to handle a target for controlled ' +
      'events. This error is likely caused by a bug in Zzeact. Please file an issue.',
  )
  const props = getFiberCurrentPropsFromNode(internalInstance.stateNode)
  restoreImpl(internalInstance.stateNode, internalInstance.type, props)
}

export function setRestoreImplementation(
  impl: (domElement: Element, tag: string, props: object) => void,
): void {
  restoreImpl = impl
}

export function enqueueStateRestore(target: EventTarget): void {
  if (restoreTarget) {
    if (restoreQueue) {
      restoreQueue.push(target)
    } else {
      restoreQueue = [target]
    }
  } else {
    restoreTarget = target
  }
}

export function needsStateRestore(): boolean {
  return restoreTarget !== null || restoreQueue !== null
}

export function restoreStateIfNeeded(): void {
  if (!restoreTarget) {
    return
  }
  const target = restoreTarget
  const queuedTargets = restoreQueue
  restoreTarget = null
  restoreQueue = null

  restoreStateOfTarget(target)
  if (queuedTargets) {
    for (let i = 0; i < queuedTargets.length; i++) {
      restoreStateOfTarget(queuedTargets[i])
    }
  }
}
