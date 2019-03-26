import PooledClass from '@/utils/PooledClass'

export default class ZzeactOnDOMReady {
  constructor (initialCollection) {
    this._queue = initialCollection || null
  }
}

Object.assign(ZzeactOnDOMReady.prototype, {
  // 加入队列
  enqueue (component, callback) {
    this._queue = this._queue || []
    this._queue.push({ component, callback })
  },
  // 通知所有，执行队列所有方法
  notifyAll () {
    const queue = this._queue
    if (queue) {
      for (let i = 0; i < queue.length; i++) {
        const { component, callback } = queue[i]
        // 这一步似乎没看懂在做什么
        callback.call(component, component.getDOMNode())
      }
      queue.length = 0
    }
  },
  // 重置队列
  reset () {
    this._queue = null
  },
  // PooledClass 使用所需
  destructor () {
    // 手动释放内存
    this.reset()
  },
})

PooledClass.addPoolingTo(ZzeactOnDOMReady)
