import invariant from '@/shared/invariant'
import {ZZEACT_ELEMENT_TYPE} from '@/shared/ZzeactSymbols'

import ZzeactCurrentOwner from './ZzeactCurrentOwner'

const hasOwnProperty = Object.prototype.hasOwnProperty

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
}

function hasValidRef(config): boolean {
  return config.ref !== undefined
}

function hasValidKey(config): boolean {
  return config.key !== undefined
}

const Zzeact$Element = function(type, key, ref, self, source, owner, props): Zzeact$Element {
  const element: Zzeact$Element = {
    $$typeof: ZZEACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  }

  return element
}

export function createElement (type, config, ...children): Zzeact$Element {
  let propName

  const props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children?: any
  } = {}

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

  const childrenLength = children.length
  if (childrenLength === 1) {
    props.children = children[0]
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength)
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = children[i]
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

  return Zzeact$Element(
    type,
    key,
    ref,
    self,
    source,
    ZzeactCurrentOwner.current,
    props,
  )
}

export function createFactory(type): Function {
  const factory = createElement.bind(null, type)
  factory.type = type
  return factory
}

export function cloneAndReplaceKey(oldElement, newKey): Zzeact$Element {
  const newElement = Zzeact$Element(
    oldElement.type,
    newKey,
    oldElement.ref,
    oldElement._self,
    oldElement._source,
    oldElement._owner,
    oldElement.props,
  )

  return newElement
}

export function cloneElement(element, config, ...children): Zzeact$Element {
  invariant(
    !(element === null || element === undefined),
    'Zzeact.cloneElement(...): The argument must be a Zzeact element, but you passed %s.',
    element,
  )

  let propName

  const props = Object.assign({}, element.props)

  let key = element.key
  let ref = element.ref

  const self = element._self

  const source = element._source

  let owner = element._owner

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref
      owner = ZzeactCurrentOwner.current
    }
    if (hasValidKey(config)) {
      key = '' + config.key
    }

    let defaultProps
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps
    }
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          props[propName] = defaultProps[propName]
        } else {
          props[propName] = config[propName]
        }
      }
    }
  }

  const childrenLength = children.length
  if (childrenLength === 1) {
    props.children = children[0]
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength)
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = children[i]
    }
    props.children = childArray
  }

  return Zzeact$Element(element.type, key, ref, self, source, owner, props)
}

export function isValidElement(object): boolean {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === ZZEACT_ELEMENT_TYPE
  )
}
