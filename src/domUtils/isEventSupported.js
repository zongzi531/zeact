import ExecutionEnvironment from '@/environment/ExecutionEnvironment'

let testNode
if (ExecutionEnvironment.canUseDOM) {
  testNode = document.createElement('div')
}

const isEventSupported = (eventNameSuffix, capture) => {
  // capture 判断是否为捕获
  if (!testNode || (capture && !testNode.addEventListener)) {
    return false
  }
  let element = document.createElement('div')
  const eventName = 'on' + eventNameSuffix
  let isSupported = eventName in element

  // 整个过程在这里判断是否支持该（eventNameSuffix）事件，
  // 当然上面也是
  if (!isSupported) {
    element.setAttribute(eventName, '')
    isSupported = typeof element[eventName] === 'function'
    if (typeof element[eventName] !== 'undefined') {
      element[eventName] = undefined
    }
    element.removeAttribute(eventName)
  }
  element = null
  return isSupported
}

export default isEventSupported
