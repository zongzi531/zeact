import { Fiber } from './ZzeactFiber'

import { get as getInstance } from '@/shared/ZzeactInstanceMap'

import {
  // ClassComponent,
  // HostComponent,
  HostRoot,
  // HostPortal,
  // HostText,
} from '@/shared/ZzeactWorkTags'
import { NoEffect, Placement } from '@/shared/ZzeactSideEffectTags'

const MOUNTING = 1
const MOUNTED = 2
const UNMOUNTED = 3

function isFiberMountedImpl(fiber: Fiber): number {
  let node = fiber
  if (!fiber.alternate) {
    if ((node.effectTag & Placement) !== NoEffect) {
      return MOUNTING
    }
    while (node.return) {
      node = node.return
      if ((node.effectTag & Placement) !== NoEffect) {
        return MOUNTING
      }
    }
  } else {
    while (node.return) {
      node = node.return
    }
  }
  if (node.tag === HostRoot) {
    return MOUNTED
  }
  return UNMOUNTED
}

export function isFiberMounted(fiber: Fiber): boolean {
  return isFiberMountedImpl(fiber) === MOUNTED
}

export function isMounted(component: Zzeact$Component): boolean {

  const fiber: Fiber | null = getInstance(component)
  if (!fiber) {
    return false
  }
  return isFiberMountedImpl(fiber) === MOUNTED
}
