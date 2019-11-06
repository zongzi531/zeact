import ZzeactVersion from '@/shared/ZzeactVersion'

import { Component/*, PureComponent */} from './ZzeactBaseClasses'
import {
  createElement,
  createFactory,
  cloneElement,
  isValidElement,
} from './ZzeactElement'
import ZzeactSharedInternals from './ZzeactSharedInternals'

interface Zzeact {
  version: string
  createElement: Function
  cloneElement: Function
  createFactory: Function
  isValidElement: Function
}

const Zzeact = {
  Component,
  version: ZzeactVersion,
  createElement,
  cloneElement,
  createFactory,
  isValidElement,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ZzeactSharedInternals,
} as possibleHasDefault<Zzeact>

export default Zzeact
