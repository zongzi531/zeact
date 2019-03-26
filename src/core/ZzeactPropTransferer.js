import emptyFunction from '@/vendor/core/emptyFunction'
import joinClasses from '@/utils/joinClasses'
import merge from '@/utils/merge'

// 执行对应的方法
const createTransferStrategy = mergeStrategy => {
  return function (props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value
    } else {
      props[key] = mergeStrategy(props[key], value)
    }
  }
}

const TransferStrategies = {
  ref: emptyFunction,
  className: createTransferStrategy(joinClasses),
  style: createTransferStrategy(merge),
}

const ZzeactPropTransferer = {
  TransferStrategies,
  Mixin: {
    transferPropsTo (component) {
      const props = {}
      for (const thatKey in component.props) {
        if (component.props.hasOwnProperty(thatKey)) {
          props[thatKey] = component.props[thatKey]
        }
      }
      for (const thisKey in this.props) {
        if (!this.props.hasOwnProperty(thisKey)) {
          continue
        }
        const transferStrategy = TransferStrategies[thisKey]
        if (transferStrategy) {
          transferStrategy(props, thisKey, this.props[thisKey])
        } else if (!props.hasOwnProperty(thisKey)) {
          props[thisKey] = this.props[thisKey]
        }
      }
      component.props = props
      return component
    },
  },
}

export default ZzeactPropTransferer
