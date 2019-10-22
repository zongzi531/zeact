import { Fiber } from '@/zzeact-reconciler/src/ZzeactFiber'

interface CurrentWrapper {
  current: null | Fiber
}

const ZzeactCurrentOwner: CurrentWrapper = {
  current: null
}

export default ZzeactCurrentOwner
