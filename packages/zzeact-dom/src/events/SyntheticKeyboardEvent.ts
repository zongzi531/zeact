import SyntheticUIEvent from './SyntheticUIEvent'
import getEventCharCode from './getEventCharCode'
import getEventKey from './getEventKey'
import getEventModifierState from './getEventModifierState'

const SyntheticKeyboardEvent = SyntheticUIEvent.extend({
  key: getEventKey,
  location: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  repeat: null,
  locale: null,
  getModifierState: getEventModifierState,
  charCode: function(event) {
    if (event.type === 'keypress') {
      return getEventCharCode(event)
    }
    return 0
  },
  keyCode: function(event) {
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode
    }
    return 0
  },
  which: function(event) {
    if (event.type === 'keypress') {
      return getEventCharCode(event)
    }
    if (event.type === 'keydown' || event.type === 'keyup') {
      return event.keyCode
    }
    return 0
  },
})

export default SyntheticKeyboardEvent
