const oneArgumentPooler = function (copyFieldsFrom) {
  const Klass = this
  if (Klass.instancePool.length) {
    const instance = Klass.instancePool.pop()
    Klass.call(instance, copyFieldsFrom)
    return instance
  } else {
    return new Klass(copyFieldsFrom)
  }
}

const twoArgumentPooler = function (a1, a2) {
  const Klass = this
  if (Klass.instancePool.length) {
    const instance = Klass.instancePool.pop()
    Klass.call(instance, a1, a2)
    return instance
  } else {
    return new Klass(a1, a2)
  }
}

const fiveArgumentPooler = function (a1, a2, a3, a4, a5) {
  const Klass = this
  if (Klass.instancePool.length) {
    const instance = Klass.instancePool.pop()
    Klass.call(instance, a1, a2, a3, a4, a5)
    return instance
  } else {
    return new Klass(a1, a2, a3, a4, a5)
  }
}

const standardReleaser = function (instance) {
  const Klass = this
  instance.destructor && instance.destructor()
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance)
  }
}

const DEFAULT_POOL_SIZE = 10
const DEFAULT_POOLER = oneArgumentPooler

const addPoolingTo = function (CopyConstructor, pooler) {
  const NewKlass = CopyConstructor
  NewKlass.instancePool = []
  NewKlass.getPooled = pooler || DEFAULT_POOLER
  if (!NewKlass.poolSize) {
    NewKlass.poolSize = DEFAULT_POOL_SIZE
  }
  NewKlass.release = standardReleaser
  return NewKlass
}

// 渐渐好像看懂了这个方法，他似乎是个工厂函数，把传入的 class 都附加了一些信息在上面
// 像 oneArgumentPooler, twoArgumentPooler, fiveArgumentPooler 这三个暴露出来的方法，只是为了改变 DEFAULT_POOLER 的值
// 目前 addPoolingTo 方法用的是最多
// 他为 class 本身添加了 instancePool, getPooled, poolSize, release 4个静态方法
// 其中 getPooled 和 release 是比较关键的内容
// 关于 getPooled 的几个区别就是接受参数不同，操作也雷同，获取 instancePool 的长度大于 0 的情况，是用来绑定 this 的作用域的
// 调用这个方法？在传入参数？不是很理解本身在做什么
// 分支下的内容是直接操作 new ，比较好理解，并传入参数
// 至于这个工具是用来做什么的，暂时也没有很深刻的理解
export default {
  addPoolingTo,
  oneArgumentPooler,
  twoArgumentPooler,
  fiveArgumentPooler,
}
