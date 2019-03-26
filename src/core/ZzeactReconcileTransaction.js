import PooledClass from '@/utils/PooledClass'
import Transaction from '@/utils/Transaction'
import ExecutionEnvironment from '@/environment/ExecutionEnvironment'
import ZzeactOnDOMReady from './ZzeactOnDOMReady'
import ZzeactInputSelection from './ZzeactInputSelection'
import ZzeactEvent from './ZzeactEvent'

// 整个类就是不难看出，就是为了 PooledClass 所准备的
// **其实主要是事务**
export default class ZzeactReconcileTransaction {
  constructor () {
    // 初始化时，调用 Transaction 的 reinitializeTransaction 方法
    this.reinitializeTransaction()
    // 这里传入 null 实际上是 new ZzeactOnDOMReady 时，传入 initialCollection = null
    // 使得 _queue = null
    this.zzeactOnDOMReady = ZzeactOnDOMReady.getPooled(null)
  }
}

// 这段是关于可选择元素的操作的
const SELECTION_RESTORATION = {
  initialize: ZzeactInputSelection.getSelectionInformation,
  close: ZzeactInputSelection.restoreSelection,
}

// 用于设置 _topLevelListenersEnabled 私有变量，将其设置为 false
// 就是在 Transaction 这个 perform 的过程中来跳过事件监听
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

// 执行 ZzeactOnDOMReady 的对应方法来控制队列任务
const ON_DOM_READY_QUEUEING = {
  initialize () { this.zzeactOnDOMReady.reset() },
  close () { this.zzeactOnDOMReady.notifyAll() },
}

// transactionWrappers 在被使用 perform 方法时候调用的顺序
// 先 initialize 完以后在传入的方法最后 close
const TRANSACTION_WRAPPERS = [
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING,
]

const Mixin = {
  // Transaction 用于获得 transactionWrappers 的方法
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
  // PooledClass 使用的方法
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
