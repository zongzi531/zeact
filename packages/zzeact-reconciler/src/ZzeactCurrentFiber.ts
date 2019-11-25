import { Fiber } from './ZzeactFiber'

import {
  HostRoot,
  HostPortal,
  HostText,
  Fragment,
  ContextProvider,
  ContextConsumer,
} from '@/shared/ZzeactWorkTags'
import describeComponentFrame from '@/shared/describeComponentFrame'
import getComponentName from '@/shared/getComponentName'


type LifeCyclePhase = 'render' | 'getChildContext'

function describeFiber(fiber: Fiber): string {
  switch (fiber.tag) {
    case HostRoot:
    case HostPortal:
    case HostText:
    case Fragment:
    case ContextProvider:
    case ContextConsumer:
      return ''
    default:
      const owner = fiber._debugOwner
      const source = fiber._debugSource
      const name = getComponentName(fiber.type)
      let ownerName = null
      if (owner) {
        ownerName = getComponentName(owner.type)
      }
      return describeComponentFrame(name, source, ownerName)
  }
}

export function getStackByFiberInDevAndProd(workInProgress: Fiber): string {
  let info = ''
  let node = workInProgress
  do {
    info += describeFiber(node)
    node = node.return
  } while (node)
  return info
}

export const current: Fiber | null = null
export const phase: LifeCyclePhase | null = null

export function getCurrentFiberOwnerNameInDevOrNull(): null {
  return null
}

export function getCurrentFiberStackInDev(): string {
  return ''
}

export function resetCurrentFiber(): void { return }

export function setCurrentFiber(): void { return }

export function setCurrentPhase(): void { return }
