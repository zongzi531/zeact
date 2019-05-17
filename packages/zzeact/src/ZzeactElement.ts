import { ZZEACT_ELEMENT_TYPE } from '@/shared/ZzeactSymbols'
import ZzeactCurrentOwner from './ZzeactCurrentOwner'

const RESERVED_PROPS = {
  __self: true,
  __source: true,
  key: true,
  ref: true,
}

const hasOwnProperty = Object.prototype.hasOwnProperty

function hasValidRef(config) {
  return config.ref !== undefined
}

function hasValidKey(config) {
  return config.key !== undefined
}

export interface IElement {
  $$typeof: symbol | number
  _owner: any
  key: any
  props: any
  ref: any
  type: any
}

function ZzeactElement(type, key, ref, self, source, owner, props): IElement {
  const element = {
    $$typeof: ZZEACT_ELEMENT_TYPE,
    _owner: owner,
    key,
    props,
    ref,
    type,
  }

  return element
}

interface IProps {
  children?: any
}
export type createElement = (type: any, config: any, children: any) => IElement
export function createElement(type, config, children): IElement {
  let propName

  const props: IProps = {}

  let key = null
  let ref = null
  let self = null
  let source = null

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref
    }
    if (hasValidKey(config)) {
      key = '' + config.key
    }

    self = config.__self === undefined ? null : config.__self
    source = config.__source === undefined ? null : config.__source
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName]
      }
    }
  }

  const childrenLength = arguments.length - 2
  if (childrenLength === 1) {
    props.children = children
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength)
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2]
    }
    props.children = childArray
  }

  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
  }

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
