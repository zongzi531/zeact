import { TEXT_NODE } from '../shared/HTMLNodeType'

function getEventTarget(nativeEvent): Node & ParentNode | null {
  let target = nativeEvent.target || nativeEvent.srcElement || window

  if (target.correspondingUseElement) {
    target = target.correspondingUseElement
  }

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}

export default getEventTarget
