import {
  getPropertyInfo,
  shouldIgnoreAttribute,
  shouldRemoveAttribute,
  isAttributeNameSafe,
  BOOLEAN,
  OVERLOADED_BOOLEAN,
} from '../shared/DOMProperty'

export function getValueForProperty(): void { return }
export function getValueForAttribute(): void { return }

export function setValueForProperty(
  node: Element,
  name: string,
  value: mixed,
  isCustomComponentTag: boolean,
): void {
  const propertyInfo = getPropertyInfo(name)
  if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
    return
  }
  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null
  }
  if (isCustomComponentTag || propertyInfo === null) {
    if (isAttributeNameSafe(name)) {
      const attributeName = name
      if (value === null) {
        node.removeAttribute(attributeName)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node.setAttribute(attributeName, '' + (value as any))
      }
    }
    return
  }
  const { mustUseProperty } = propertyInfo
  if (mustUseProperty) {
    const { propertyName } = propertyInfo
    if (value === null) {
      const { type } = propertyInfo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(node as any)[propertyName] = type === BOOLEAN ? false : ''
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (node as any)[propertyName] = value
    }
    return
  }
  const {attributeName, attributeNamespace} = propertyInfo
  if (value === null) {
    node.removeAttribute(attributeName)
  } else {
    const { type } = propertyInfo
    let attributeValue
    if (type === BOOLEAN || (type === OVERLOADED_BOOLEAN && value === true)) {
      attributeValue = ''
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attributeValue = '' + (value as any)
    }
    if (attributeNamespace) {
      node.setAttributeNS(attributeNamespace, attributeName, attributeValue)
    } else {
      node.setAttribute(attributeName, attributeValue)
    }
  }
}
