import SyntheticEvent from '@/events/SyntheticEvent'

const SyntheticClipboardEvent = SyntheticEvent.extend({
  clipboardData: function(event) {
    return 'clipboardData' in event
      ? event.clipboardData
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (window as Window & typeof globalThis & { clipboardData: any }).clipboardData 
  },
})

export default SyntheticClipboardEvent
