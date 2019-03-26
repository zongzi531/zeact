import throwIf from '@/utils/throwIf'

const DUAL_TRANSACTION =
  'Cannot initialize transaction when there is already an outstanding ' +
  'transaction. Common causes of this are trying to render a component ' +
  'when you are already rendering a component or attempting a state ' +
  'transition while in a render function. Another possibility is that ' +
  'you are rendering new content (or state transitioning) in a ' +
  'componentDidRender callback. If this is not the case, please report the ' +
  'issue immediately.'

const MISSING_TRANSACTION =
  'Cannot close transaction when there is none open.'

/**
 * `Transaction` creates a black box that is able to wrap any method such that
 * certain invariants are maintained before and after the method is invoked
 * (Even if an exception is thrown while invoking the wrapped method). Whoever
 * instantiates a transaction can provide enforcers of the invariants at
 * creation time. The `Transaction` class itself will supply one additional
 * automatic invariant for you - the invariant that any transaction instance
 * should not be ran while it is already being ran. You would typically create a
 * single instance of a `Transaction` for reuse multiple times, that potentially
 * is used to wrap several different methods. Wrappers are extremely simple -
 * they only require implementing two methods.
 *
 * <pre>
 *                       wrappers (injected at creation time)
 *                                      +        +
 *                                      |        |
 *                    +-----------------|--------|--------------+
 *                    |                 v        |              |
 *                    |      +---------------+   |              |
 *                    |   +--|    wrapper1   |---|----+         |
 *                    |   |  +---------------+   v    |         |
 *                    |   |          +-------------+  |         |
 *                    |   |     +----|   wrapper2  |--------+   |
 *                    |   |     |    +-------------+  |     |   |
 *                    |   |     |                     |     |   |
 *                    |   v     v                     v     v   | wrapper
 *                    | +---+ +---+   +---------+   +---+ +---+ | invariants
 * perform(anyMethod) | |   | |   |   |         |   |   | |   | | maintained
 * +----------------->|-|---|-|---|-->|anyMethod|---|---|-|---|-|-------->
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | |   | |   |   |         |   |   | |   | |
 *                    | +---+ +---+   +---------+   +---+ +---+ |
 *                    |  initialize                    close    |
 *                    +-----------------------------------------+
 * </pre>
 *
 * Bonus:
 * - Reports timing metrics by method name and wrapper index.
 *
 * Use cases:
 * - Preserving the input selection ranges before/after reconciliation.
 *   Restoring selection even in the event of an unexpected error.
 * - Deactivating events while rearranging the DOM, preventing blurs/focuses,
 *   while guaranteeing that afterwards, the event system is reactivated.
 * - Flushing a queue of collected DOM mutations to the main UI thread after a
 *   reconciliation takes place in a worker thread.
 * - Invoking any collected `componentDidRender` callbacks after rendering new
 *   content.
 * - (Future use case): Wrapping particular flushes of the `ReactWorker` queue
 *   to preserve the `scrollTop` (an automatic scroll aware DOM).
 * - (Future use case): Layout calculations before and after DOM upates.
 *
 * Transactional plugin API:
 * - A module that has an `initialize` method that returns any precomputation.
 * - and a `close` method that accepts the precomputation. `close` is invoked
 *   when the wrapped process is completed, or has failed.
 *
 * @param {Array<TransactionalWrapper>} transactionWrapper Wrapper modules
 * that implement `initialize` and `close`.
 * @return {Transaction} Single transaction for reuse in thread.
 *
 * @class Transaction
 */
const Mixin = {
  // 用于判断当前 Transaction 状态，是可以执行相应的方法，比如：
  // 执行 perform 时要确保 _isInTransaction 为 false，反之
  _isInTransaction: false,
  // 默认是 null，又外部传入，方法来获取 TransactionWrappers，是一个数组
  // 因为在 initializeAll 和 closeAll 需要使用到
  getTransactionWrappers: null,
  // 重新初始化方法
  // 看了下面代码可以不难发现，这里有在计时，记录 Init 和 Close 的时间
  // 整个过程在 Init 时返回的内容都存储在 wrapperInitData 中，
  // 在 Close 时再取出使用，再加上中间方法的执行
  // 那么这里这么做的思想是什么呢？
  reinitializeTransaction () {
    this.transactionWrappers = this.getTransactionWrappers()
    if (!this.wrapperInitData) {
      this.wrapperInitData = []
    } else {
      this.wrapperInitData.length = 0
    }
    if (!this.timingMetrics) {
      this.timingMetrics = {}
    }
    this.timingMetrics.methodInvocationTime = 0
    if (!this.timingMetrics.wrapperInitTimes) {
      this.timingMetrics.wrapperInitTimes = []
    } else {
      this.timingMetrics.wrapperInitTimes.length = 0
    }
    if (!this.timingMetrics.wrapperCloseTimes) {
      this.timingMetrics.wrapperCloseTimes = []
    } else {
      this.timingMetrics.wrapperCloseTimes.length = 0
    }
    this._isInTransaction = false
  },
  isInTransaction () {
    return !!this._isInTransaction
  },
  // 事务的能力是可以在 initializeAll 时将函数返回值记入
  // 在 closeAll 时重新使用到返回值
  perform (method, scope, a, b, c, d, e, f) {
    throwIf(this.isInTransaction(), DUAL_TRANSACTION)
    const memberStart = Date.now()
    let err = null
    let ret
    try {
      this.initializeAll()
      ret = method.call(scope, a, b, c, d, e, f)
    } catch (ieRequiresCatch) {
      err = err || ieRequiresCatch
    } finally {
      const memberEnd = Date.now()
      this.methodInvocationTime += (memberEnd - memberStart)
      try {
        this.closeAll()
      } catch (closeAllErr) {
        err = err || closeAllErr
      }
    }
    if (err) {
      throw err
    }
    return ret
  },
  initializeAll () {
    // 初始化所有方法，按照次序执行 initialize 方法
    // 按照目前的编写内容来看，执行顺序如下：
    // SELECTION_RESTORATION
    // EVENT_SUPPRESSION
    // ON_DOM_READY_QUEUEING
    this._isInTransaction = true
    const { transactionWrappers } = this
    const { wrapperInitTimes } = this.timingMetrics
    let err = null
    for (let i = 0; i < transactionWrappers.length; i++) {
      const initStart = Date.now()
      const wrapper = transactionWrappers[i]
      try {
        this.wrapperInitData[i] = wrapper.initialize ? wrapper.initialize.call(this) : null
      } catch (initErr) {
        err = err || initErr
        this.wrapperInitData[i] = Transaction.OBSERVED_ERROR
      } finally {
        const curInitTime = wrapperInitTimes[i]
        const initEnd = Date.now()
        wrapperInitTimes[i] = (curInitTime || 0) + (initEnd - initStart)
      }
    }
  },
  closeAll () {
    // 关闭所有方法，按照次序执行 close 方法
    // 按照目前的编写内容来看，执行顺序如下：
    // SELECTION_RESTORATION
    // EVENT_SUPPRESSION
    // ON_DOM_READY_QUEUEING
    throwIf(!this.isInTransaction(), MISSING_TRANSACTION)
    const { transactionWrappers } = this
    const { wrapperCloseTimes } = this.timingMetrics
    let err = null
    for (let i = 0; i < transactionWrappers.length; i++) {
      const closeStart = Date.now()
      const wrapper = transactionWrappers[i]
      const initData = this.wrapperInitData[i]
      try {
        if (initData !== Transaction.OBSERVED_ERROR) {
          wrapper.close && wrapper.close.call(this, initData)
        }
      } catch (closeErr) {
        err = err || closeErr
      } finally {
        const curCloseTime = wrapperCloseTimes[i]
        const closeEnd = Date.now()
        wrapperCloseTimes[i] = (curCloseTime || 0) + (closeEnd - closeStart)
      }
    }
    this.wrapperInitData.length = 0
    this._isInTransaction = false
    if (err) {
      throw err
    }
  },
}

const Transaction = {
  Mixin,
  OBSERVED_ERROR: {},
}

export default Transaction
