import Zzeact from '@/zzeact'
import { getToStringValue, toString } from './ToStringValue'


function flattenChildren(children): string {
  let content = ''
  Zzeact.Children.forEach(children, function(child) {
    if (child == null) {
      return
    }
    content += child
  })

  return content
}

export function validateProps(): void { return }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postMountWrapper(element: Element, props: any): void {
  if (props.value != null) {
    element.setAttribute('value', toString(getToStringValue(props.value)))
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHostProps(element: Element, props: any): any {
  const hostProps = {children: undefined, ...props}
  const content = flattenChildren(props.children)

  if (content) {
    hostProps.children = content
  }

  return hostProps
}
