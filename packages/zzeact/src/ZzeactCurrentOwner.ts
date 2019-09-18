// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fiber = any

interface CurrentWrapper {
  current: null | Fiber
}

const ZzeactCurrentOwner: CurrentWrapper = {
  current: null
}

export default ZzeactCurrentOwner
