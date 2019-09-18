import {ZZEACT_ELEMENT_TYPE} from '@/shared/ZzeactSymbols'

import ZzeactCurrentOwner from './ZzeactCurrentOwner'

const ZzeactElement = function(type, key, ref, self, source, owner, props): ZzeactElement {
  const element: ZzeactElement = {
    $$typeof: ZZEACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  }

  return element
}

export function createElement (type, config, children): ZzeactElement {
  let propName

  const props = {}

  // eslint-disable-next-line prefer-const
  let key = null
  // eslint-disable-next-line prefer-const
  let ref = null
  // eslint-disable-next-line prefer-const
  let self = null
  // eslint-disable-next-line prefer-const
  let source = null

  // if (config != null) {
    // if (hasValidRef(config)) {
    //   ref = config.ref
    // }
    // if (hasValidKey(config)) {
    //   key = '' + config.key
    // }

    // self = config.__self === undefined ? null : config.__self
    // source = config.__source === undefined ? null : config.__source

    // for (propName in config) {
    //   if (
    //     hasOwnProperty.call(config, propName) &&
    //     !RESERVED_PROPS.hasOwnProperty(propName)
    //   ) {
    //     props[propName] = config[propName]
    //   }
    // }
  // }

  // const childrenLength = arguments.length - 2
  // if (childrenLength === 1) {
  //   props.children = children
  // } else if (childrenLength > 1) {
  //   const childArray = Array(childrenLength)
  //   for (let i = 0; i < childrenLength; i++) {
  //     childArray[i] = arguments[i + 2]
  //   }
  //   props.children = childArray
  // }

  // if (type && type.defaultProps) {
  //   const defaultProps = type.defaultProps
  //   for (propName in defaultProps) {
  //     if (props[propName] === undefined) {
  //       props[propName] = defaultProps[propName]
  //     }
  //   }
  // }

  return ZzeactElement(
    type,
    key,
    ref,
    self,
    source,
    ZzeactCurrentOwner.current,
    props,
  )
}
