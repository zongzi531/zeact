import { HostComponent } from './ZzeactWorkTags'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getParent(inst): any {
  do {
    inst = inst.return
  } while (inst && inst.tag !== HostComponent)
  if (inst) {
    return inst
  }
  return null
}

export function getLowestCommonAncestor(instA, instB): null {
  let depthA = 0
  for (let tempA = instA; tempA; tempA = getParent(tempA)) {
    depthA++
  }
  let depthB = 0
  for (let tempB = instB; tempB; tempB = getParent(tempB)) {
    depthB++
  }

  while (depthA - depthB > 0) {
    instA = getParent(instA)
    depthA--
  }

  while (depthB - depthA > 0) {
    instB = getParent(instB)
    depthB--
  }

  let depth = depthA
  while (depth--) {
    if (instA === instB || instA === instB.alternate) {
      return instA
    }
    instA = getParent(instA)
    instB = getParent(instB)
  }
  return null
}

export function isAncestor(instA, instB): boolean {
  while (instB) {
    if (instA === instB || instA === instB.alternate) {
      return true
    }
    instB = getParent(instB)
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getParentInstance(inst): any {
  return getParent(inst)
}

export function traverseTwoPhase(inst, fn, arg): void {
  const path = []
  while (inst) {
    path.push(inst)
    inst = getParent(inst)
  }
  let i
  for (i = path.length; i-- > 0; ) {
    fn(path[i], 'captured', arg)
  }
  for (i = 0; i < path.length; i++) {
    fn(path[i], 'bubbled', arg)
  }
}

export function traverseEnterLeave(from, to, fn, argFrom, argTo): void {
  const common = from && to ? getLowestCommonAncestor(from, to) : null
  const pathFrom = []
  while (true) {
    if (!from) {
      break
    }
    if (from === common) {
      break
    }
    const alternate = from.alternate
    if (alternate !== null && alternate === common) {
      break
    }
    pathFrom.push(from)
    from = getParent(from)
  }
  const pathTo = []
  while (true) {
    if (!to) {
      break
    }
    if (to === common) {
      break
    }
    const alternate = to.alternate
    if (alternate !== null && alternate === common) {
      break
    }
    pathTo.push(to)
    to = getParent(to)
  }
  for (let i = 0; i < pathFrom.length; i++) {
    fn(pathFrom[i], 'bubbled', argFrom)
  }
  for (let i = pathTo.length; i-- > 0; ) {
    fn(pathTo[i], 'captured', argTo)
  }
}
