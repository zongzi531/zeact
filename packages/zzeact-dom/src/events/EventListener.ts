export function addEventBubbleListener(
  element: Document | Element,
  eventType: string,
  listener: Function,
): void {
  element.addEventListener(eventType, listener as EventListenerOrEventListenerObject, false)
}

export function addEventCaptureListener(
  element: Document | Element,
  eventType: string,
  listener: Function,
): void {
  element.addEventListener(eventType, listener as EventListenerOrEventListenerObject, true)
}
