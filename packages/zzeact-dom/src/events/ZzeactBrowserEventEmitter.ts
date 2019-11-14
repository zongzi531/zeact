import { registrationNameDependencies } from '@/events/EventPluginRegistry'
import {
  TOP_BLUR,
  TOP_CANCEL,
  TOP_CLOSE,
  TOP_FOCUS,
  TOP_INVALID,
  TOP_RESET,
  TOP_SCROLL,
  TOP_SUBMIT,
  getRawEventName,
  mediaEventTypes,
} from './DOMTopLevelEventTypes'
import {
  setEnabled,
  isEnabled,
  trapBubbledEvent,
  trapCapturedEvent,
} from './ZzeactDOMEventListener'
import isEventSupported from './isEventSupported'

/**
 * Summary of `ZzeactBrowserEventEmitter` event handling:
 *
 *  - Top-level delegation is used to trap most native browser events. This
 *    may only occur in the main thread and is the responsibility of
 *    ZzeactDOMEventListener, which is injected and can therefore support
 *    pluggable event sources. This is the only work that occurs in the main
 *    thread.
 *
 *  - We normalize and de-duplicate events to account for browser quirks. This
 *    may be done in the worker thread.
 *
 *  - Forward these native events (with the associated top-level type used to
 *    trap it) to `EventPluginHub`, which in turn will ask plugins if they want
 *    to extract any synthetic events.
 *
 *  - The `EventPluginHub` will then process each event by annotating them with
 *    "dispatches", a sequence of listeners and IDs that care about that event.
 *
 *  - The `EventPluginHub` then dispatches the events.
 *
 * Overview of Zzeact and the event system:
 *
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ZzeactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ZzeactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 *                   .
 *    Zzeact Core     .  General Purpose Event Plugin System
 */

const alreadyListeningTo = {}
let zzeactTopListenersCounter = 0

const topListenersIDKey = '_zzeactListenersID' + ('' + Math.random()).slice(2)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getListeningForDocument(mountAt: any): any {
  if (!Object.prototype.hasOwnProperty.call(mountAt, topListenersIDKey)) {
    mountAt[topListenersIDKey] = zzeactTopListenersCounter++
    alreadyListeningTo[mountAt[topListenersIDKey]] = {}
  }
  return alreadyListeningTo[mountAt[topListenersIDKey]]
}

export function listenTo(
  registrationName: string,
  mountAt: Document | Element,
): void {
  const isListening = getListeningForDocument(mountAt)
  const dependencies = registrationNameDependencies[registrationName]

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i]
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      switch (dependency) {
        case TOP_SCROLL:
          trapCapturedEvent(TOP_SCROLL, mountAt)
          break
        case TOP_FOCUS:
        case TOP_BLUR:
          trapCapturedEvent(TOP_FOCUS, mountAt)
          trapCapturedEvent(TOP_BLUR, mountAt)
          isListening[TOP_BLUR] = true
          isListening[TOP_FOCUS] = true
          break
        case TOP_CANCEL:
        case TOP_CLOSE:
          if (isEventSupported(getRawEventName(dependency))) {
            trapCapturedEvent(dependency, mountAt)
          }
          break
        case TOP_INVALID:
        case TOP_SUBMIT:
        case TOP_RESET:
          break
        default:
          const isMediaEvent = mediaEventTypes.indexOf(dependency) !== -1
          if (!isMediaEvent) {
            trapBubbledEvent(dependency, mountAt)
          }
          break
      }
      isListening[dependency] = true
    }
  }
}

export function isListeningToAllDependencies(
  registrationName: string,
  mountAt: Document | Element,
): boolean {
  const isListening = getListeningForDocument(mountAt)
  const dependencies = registrationNameDependencies[registrationName]
  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i]
    if (!(isListening.hasOwnProperty(dependency) && isListening[dependency])) {
      return false
    }
  }
  return true
}

export {setEnabled, isEnabled, trapBubbledEvent, trapCapturedEvent}
