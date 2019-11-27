import invariant from '@/shared/invariant'
import ZzeactNoopUpdateQueue from './ZzeactNoopUpdateQueue'

const emptyObject = {}

function Component(props, context, updater): void {
  this.props = props
  this.context = context
  this.refs = emptyObject
  this.updater = updater || ZzeactNoopUpdateQueue
}

// 终于检查到问题原因在这里，缺失这个内容导致在 Begin Work 进错分支未对 Class 进行 new 操作
Component.prototype.isZzeactComponent = {}

Component.prototype.setState = function(partialState, callback): void {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  )
  this.updater.enqueueSetState(this, partialState, callback, 'setState')
}

export { Component/*, PureComponent */}