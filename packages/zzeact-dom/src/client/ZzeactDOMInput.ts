import invariant from '@/shared/invariant'

import { setValueForProperty } from './DOMPropertyOperations'
import { getFiberCurrentPropsFromNode } from './ZzeactDOMComponentTree'
import { getToStringValue, toString } from './ToStringValue'
import { updateValueIfChanged } from './inputValueTracking'

import { ToStringValue } from './ToStringValue'

type InputWithWrapperState = HTMLInputElement & {
  _wrapperState: {
    initialValue: ToStringValue
    initialChecked?: boolean
    controlled?: boolean
  }
}

function isControlled(props): boolean {
  const usesChecked = props.type === 'checkbox' || props.type === 'radio'
  return usesChecked ? props.checked != null : props.value != null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHostProps(element: Element, props: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)
  const checked = props.checked

  const hostProps = Object.assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked,
  })

  return hostProps
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initWrapperState(element: Element, props: any): void {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)
  const defaultValue = props.defaultValue == null ? '' : props.defaultValue

  node._wrapperState = {
    initialChecked:
      props.checked != null ? props.checked : props.defaultChecked,
    initialValue: getToStringValue(
      props.value != null ? props.value : defaultValue,
    ),
    controlled: isControlled(props),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateChecked(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)
  const checked = props.checked
  if (checked != null) {
    setValueForProperty(node, 'checked', checked, false)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateWrapper(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)

  updateChecked(element, props)

  const value = getToStringValue(props.value)
  const type = props.type

  if (value != null) {
    if (type === 'number') {
      if (
        (value === 0 && node.value === '') ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.value != (value as any)
      ) {
        node.value = toString(value)
      }
    } else if (node.value !== toString(value)) {
      node.value = toString(value)
    }
  } else if (type === 'submit' || type === 'reset') {
    node.removeAttribute('value')
    return
  }

  if (props.hasOwnProperty('value')) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setDefaultValue(node, props.type, value)
  } else if (props.hasOwnProperty('defaultValue')) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    setDefaultValue(node, props.type, getToStringValue(props.defaultValue))
  }

  if (props.checked == null && props.defaultChecked != null) {
    node.defaultChecked = !!props.defaultChecked
  }
}

export function postMountWrapper(
  element: Element,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  isHydrating: boolean,
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)

  if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
    const type = props.type
    const isButton = type === 'submit' || type === 'reset'

    if (isButton && (props.value === undefined || props.value === null)) {
      return
    }

    const initialValue = toString(node._wrapperState.initialValue)

    if (!isHydrating) {
      if (initialValue !== node.value) {
        node.value = initialValue
      }
    }

    node.defaultValue = initialValue
  }

  const name = node.name
  if (name !== '') {
    node.name = ''
  }

  node.defaultChecked = !node.defaultChecked
  node.defaultChecked = !!node._wrapperState.initialChecked

  if (name !== '') {
    node.name = name
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restoreControlledState(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as InputWithWrapperState)
  updateWrapper(node, props)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  updateNamedCousins(node, props)
}

function updateNamedCousins(rootNode, props): void {
  const name = props.name
  if (props.type === 'radio' && name != null) {
    let queryRoot: Element = rootNode

    while (queryRoot.parentNode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryRoot = ((queryRoot.parentNode as any) as Element)
    }

    const group = queryRoot.querySelectorAll(
      'input[name=' + JSON.stringify('' + name) + '][type="radio"]',
    )

    for (let i = 0; i < group.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const otherNode = ((group[i] as any) as HTMLInputElement)
      if (otherNode === rootNode || otherNode.form !== rootNode.form) {
        continue
      }
      const otherProps = getFiberCurrentPropsFromNode(otherNode)
      invariant(
        otherProps,
        'ZzeactDOMInput: Mixing Zzeact and non-Zzeact radio inputs with the ' +
          'same `name` is not supported.',
      )

      updateValueIfChanged(otherNode)

      updateWrapper(otherNode, otherProps)
    }
  }
}

export function setDefaultValue(
  node: InputWithWrapperState,
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): void {
  if (
    type !== 'number' ||
    node.ownerDocument.activeElement !== node
  ) {
    if (value == null) {
      node.defaultValue = toString(node._wrapperState.initialValue)
    } else if (node.defaultValue !== toString(value)) {
      node.defaultValue = toString(value)
    }
  }
}
