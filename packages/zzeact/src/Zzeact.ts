import ZzeactVersion from '@/shared/ZzeactVersion'

import { Component/*, PureComponent */} from './ZzeactBaseClasses'
console.log('2019/11/26 Reading stop at ZzeactChildren (!!important)')
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

  Component,
  version: ZzeactVersion,
  createElement,
  cloneElement,
  createFactory,
  isValidElement,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ZzeactSharedInternals,
} as possibleHasDefault<Zzeact>

export default Zzeact
