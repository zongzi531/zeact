import invariant from '@/shared/invariant'

import { getToStringValue, toString } from './ToStringValue'
import { ToStringValue } from './ToStringValue'

type TextAreaWithWrapperState = HTMLTextAreaElement & {
  _wrapperState: {
    initialValue: ToStringValue
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHostProps(element: Element, props: any): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as TextAreaWithWrapperState)
  invariant(
    props.dangerouslySetInnerHTML == null,
    '`dangerouslySetInnerHTML` does not make sense on <textarea>.',
  )

  const hostProps = {
    ...props,
    value: undefined,
    defaultValue: undefined,
    children: toString(node._wrapperState.initialValue),
  }

  return hostProps
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initWrapperState(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as TextAreaWithWrapperState)

  let initialValue = props.value

  if (initialValue == null) {
    let defaultValue = props.defaultValue
    let children = props.children
    if (children != null) {
      invariant(
        defaultValue == null,
        'If you supply `defaultValue` on a <textarea>, do not pass children.',
      )
      if (Array.isArray(children)) {
        invariant(
          children.length <= 1,
          '<textarea> can only have at most one child.',
        )
        children = children[0]
      }

      defaultValue = children
    }
    if (defaultValue == null) {
      defaultValue = ''
    }
    initialValue = defaultValue
  }

  node._wrapperState = {
    initialValue: getToStringValue(initialValue),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function updateWrapper(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as TextAreaWithWrapperState)
  const value = getToStringValue(props.value)
  const defaultValue = getToStringValue(props.defaultValue)
  if (value != null) {
    const newValue = toString(value)
    if (newValue !== node.value) {
      node.value = newValue
    }
    if (props.defaultValue == null && node.defaultValue !== newValue) {
      node.defaultValue = newValue
    }
  }
  if (defaultValue != null) {
    node.defaultValue = toString(defaultValue)
  }
}

export function postMountWrapper(element: Element): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as TextAreaWithWrapperState)
  const textContent = node.textContent

  if (textContent === node._wrapperState.initialValue) {
    node.value = textContent
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restoreControlledState(element: Element, props: any): void {
  updateWrapper(element, props)
}
