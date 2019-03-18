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

export default {
  addPoolingTo: addPoolingTo,
  oneArgumentPooler: oneArgumentPooler,
  twoArgumentPooler: twoArgumentPooler,
  fiveArgumentPooler: fiveArgumentPooler,
}
