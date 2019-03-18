import PooledClass from '@/utils/PooledClass'

export default class ZzeactOnDOMReady {
  constructor (initialCollection) {
    this._queue = initialCollection || null
  }
}

Object.assign(ZzeactOnDOMReady.prototype, {
  enqueue (component, callback) {
    this._queue = this._queue || []
    this._queue.push({ component, callback })
  },
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
  reset () {
    this._queue = null
  },
  destructor () {
    // 手动释放内存
    this.reset()
  },
})

PooledClass.addPoolingTo(ZzeactOnDOMReady)
