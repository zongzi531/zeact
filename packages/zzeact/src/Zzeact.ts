import ZzeactVersion from '@/shared/ZzeactVersion'

import { Component/*, PureComponent */} from './ZzeactBaseClasses'
import { createRef } from './ZzeactCreateRef'
import { forEach, map, count, toArray, only } from './ZzeactChildren'
import {
  createElement,
  createFactory,
  cloneElement,
  isValidElement,
} from './ZzeactElement'
import ZzeactSharedInternals from './ZzeactSharedInternals'

interface Zzeact {
  version: string
  Children: {
    map: Function
    forEach: Function
    count: Function
    toArray: Function
    only: Function
  }
  createRef: Function
  createElement: Function
  cloneElement: Function
  createFactory: Function
  isValidElement: Function
}

const Zzeact = {
  Children: {
    map,
    forEach,
    count,
    toArray,
    only,
  },

  createRef,
  Component,
  version: ZzeactVersion,
  createElement,
  cloneElement,
  createFactory,
  isValidElement,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ZzeactSharedInternals,
} as possibleHasDefault<Zzeact>

export default Zzeact
