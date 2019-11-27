import { RefObject } from '@/shared/ZzeactTypes'

export function createRef(): RefObject {
  const refObject = {
    current: null,
  }
  return refObject
}
