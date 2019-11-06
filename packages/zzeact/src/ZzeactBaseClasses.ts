import ZzeactNoopUpdateQueue from './ZzeactNoopUpdateQueue'

const emptyObject = {}

function Component(props, context, updater): void {
  this.props = props
  this.context = context
  this.refs = emptyObject
  this.updater = updater || ZzeactNoopUpdateQueue
}

export { Component/*, PureComponent */}