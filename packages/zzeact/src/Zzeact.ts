import ZzeactVersion from '@/shared/ZzeactVersion'

import {
  createElement,
  createFactory,
  cloneElement,
  isValidElement,
} from './ZzeactElement'

interface Zzeact {
  version: string
  createElement: Function
  cloneElement: Function
  createFactory: Function
  isValidElement: Function
}

const Zzeact = {
  version: ZzeactVersion,
  createElement,
  cloneElement,
  createFactory,
  isValidElement,
} as possibleHasDefault<Zzeact>

export default Zzeact
