import { getToStringValue, toString } from './ToStringValue'

type SelectWithWrapperState = HTMLSelectElement & {
  _wrapperState: {
    wasMultiple: boolean
  }
}

function updateOptions(
  node: HTMLSelectElement,
  multiple: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  propValue: any,
  setDefaultSelected: boolean,
): void {
  type IndexableHTMLOptionsCollection = HTMLOptionsCollection & {
    [key: number]: HTMLOptionElement
  }
  const options: IndexableHTMLOptionsCollection = node.options

  if (multiple) {
    const selectedValues = (propValue as Array<string>)
    const selectedValue = {}
    for (let i = 0; i < selectedValues.length; i++) {
      selectedValue['$' + selectedValues[i]] = true
    }
    for (let i = 0; i < options.length; i++) {
      const selected = selectedValue.hasOwnProperty('$' + options[i].value)
      if (options[i].selected !== selected) {
        options[i].selected = selected
      }
      if (selected && setDefaultSelected) {
        options[i].defaultSelected = true
      }
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedValue = toString(getToStringValue((propValue as any)))
    let defaultSelected = null
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === selectedValue) {
        options[i].selected = true
        if (setDefaultSelected) {
          options[i].defaultSelected = true
        }
        return
      }
      if (defaultSelected === null && !options[i].disabled) {
        defaultSelected = options[i]
      }
    }
    if (defaultSelected !== null) {
      defaultSelected.selected = true
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHostProps(element: Element, props: any): any {
  return Object.assign({}, props, {
    value: undefined,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initWrapperState(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as SelectWithWrapperState)

  node._wrapperState = {
    wasMultiple: !!props.multiple,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postMountWrapper(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as SelectWithWrapperState)
  node.multiple = !!props.multiple
  const value = props.value
  if (value != null) {
    updateOptions(node, !!props.multiple, value, false)
  } else if (props.defaultValue != null) {
    updateOptions(node, !!props.multiple, props.defaultValue, true)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postUpdateWrapper(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as SelectWithWrapperState)
  const wasMultiple = node._wrapperState.wasMultiple
  node._wrapperState.wasMultiple = !!props.multiple

  const value = props.value
  if (value != null) {
    updateOptions(node, !!props.multiple, value, false)
  } else if (wasMultiple !== !!props.multiple) {
    if (props.defaultValue != null) {
      updateOptions(node, !!props.multiple, props.defaultValue, true)
    } else {
      updateOptions(node, !!props.multiple, props.multiple ? [] : '', false)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restoreControlledState(element: Element, props: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const node = ((element as any) as SelectWithWrapperState)
  const value = props.value

  if (value != null) {
    updateOptions(node, !!props.multiple, value, false)
  }
}
