import { Namespaces } from '../shared/DOMNamespaces'
import createMicrosoftUnsafeLocalFunction from '../shared/createMicrosoftUnsafeLocalFunction'

let reusableSVGContainer

const setInnerHTML = createMicrosoftUnsafeLocalFunction(function(
  // 这里蛮奇怪的， Element 明明继承至 Node
  node: Element & Node,
  html: string,
): void {
  if (node.namespaceURI === Namespaces.svg && !('innerHTML' in node)) {
    reusableSVGContainer =
      reusableSVGContainer || document.createElement('div')
    reusableSVGContainer.innerHTML = '<svg>' + html + '</svg>'
    const svgNode = reusableSVGContainer.firstChild
    while (node.firstChild) {
      node.removeChild(node.firstChild)
    }
    while (svgNode.firstChild) {
      node.appendChild(svgNode.firstChild)
    }
  } else {
    node.innerHTML = html
  }
})

export default setInnerHTML
