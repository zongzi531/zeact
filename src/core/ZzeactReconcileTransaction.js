import PooledClass from '@/utils/PooledClass'
import Transaction from '@/utils/Transaction'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import ZzeactOnDOMReady from '@/core/ZzeactOnDOMReady'
import ZzeactInputSelection from './ZzeactInputSelection'
import ZzeactEvent from './ZzeactEvent'

export default class ZzeactReconcileTransaction {
  constructor () {
    // 初始化时，调用 Transaction 的 reinitializeTransaction 方法
    this.reinitializeTransaction()
    // 这里传入 null 实际上是 new ZzeactOnDOMReady 时，传入 initialCollection = null
    // 使得 _queue = null
    this.zzeactOnDOMReady = ZzeactOnDOMReady.getPooled(null)
  }
}

const SELECTION_RESTORATION = {
  // 这一段没理解还
  initialize: ZzeactInputSelection.getSelectionInformation,
  close: ZzeactInputSelection.restoreSelection,
}

const EVENT_SUPPRESSION = {
  initialize () {
    const currentlyEnabled = ZzeactEvent.isEnabled()
    ZzeactEvent.setEnabled(false)
    return currentlyEnabled
  },
  close (previouslyEnabled) {
    ZzeactEvent.setEnabled(previouslyEnabled)
  },
}

const ON_DOM_READY_QUEUEING = {
  initialize () { this.zzeactOnDOMReady.reset() },
  close () { this.zzeactOnDOMReady.notifyAll() },
}

const TRANSACTION_WRAPPERS = [
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING,
]

const Mixin = {
  getTransactionWrappers () {
    // 在能使用 DOM 的情况下使用 TRANSACTION_WRAPPERS
    // 否则其实就是直接执行被调用的方法
    if (ExecutionEnvironment.canUseDOM) {
      return TRANSACTION_WRAPPERS
    } else {
      return []
    }
  },
  getZzeactOnDOMReady () {
    return this.zzeactOnDOMReady
  },
  destructor () {
    // 在 ZzeactReconcileTransaction 被 new 时，操作了
    // this.zzeactOnDOMReady = ZzeactOnDOMReady.getPooled(null)
    // 在 ZzeactReconcileTransaction 被销毁时， 也要销毁 ZzeactOnDOMReady
    ZzeactOnDOMReady.release(this.zzeactOnDOMReady)
    // 手动释放内存
    this.zzeactOnDOMReady = null
  },
}

Object.assign(ZzeactReconcileTransaction.prototype, Transaction.Mixin)
Object.assign(ZzeactReconcileTransaction.prototype, Mixin)

PooledClass.addPoolingTo(ZzeactReconcileTransaction)
