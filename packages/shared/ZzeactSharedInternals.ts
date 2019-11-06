import Zzeact from '@/zzeact'

const ZzeactSharedInternals =
  Zzeact.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

if (!ZzeactSharedInternals.hasOwnProperty('ZzeactCurrentDispatcher')) {
  ZzeactSharedInternals.ZzeactCurrentDispatcher = {
    current: null,
  }
}

export default ZzeactSharedInternals
