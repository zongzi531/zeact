import EventListener from '@/vendor/stubs/EventListener'

const normalizeEvent = eventParam => {
  let normalized = eventParam || window.event
  // In some browsers (OLD FF), setting the target throws an error. A good way
  // to tell if setting the target will throw an error, is to check if the event
  // has a `target` property. Safari events have a `target` but it's not always
  // normalized. Even if a `target` property exists, it's good to only set the
  // target property if we realize that a change will actually take place.
  const hasTargetProperty = 'target' in normalized
  const eventTarget = normalized.target || normalized.srcElement || window
  // Safari may fire events on text nodes (Node.TEXT_NODE is 3)
  // @see http://www.quirksmode.org/js/events_properties.html
  const textNodeNormalizedTarget =
    (eventTarget.nodeType === 3) ? eventTarget.parentNode : eventTarget
  if (!hasTargetProperty || normalized.target !== textNodeNormalizedTarget) {
    // Create an object that inherits from the native event so that we can set
    // `target` on it. (It is read-only and setting it throws in strict mode).
    normalized = Object.create(normalized)
    normalized.target = textNodeNormalizedTarget
  }
  return normalized
}

const createNormalizedCallback = cb => unfixedNativeEvent => {
  cb(normalizeEvent(unfixedNativeEvent))
}

// 将本身封装的冒泡捕获再次封装
const NormalizedEventListener = {
  listen (el, handlerBaseName, cb) {
    EventListener.listen(el, handlerBaseName, createNormalizedCallback(cb))
  },
  capture (el, handlerBaseName, cb) {
    EventListener.capture(el, handlerBaseName, createNormalizedCallback(cb))
  },
}

export default NormalizedEventListener
