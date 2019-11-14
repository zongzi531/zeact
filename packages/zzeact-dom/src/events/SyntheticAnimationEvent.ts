import SyntheticEvent from '@/events/SyntheticEvent'

const SyntheticAnimationEvent = SyntheticEvent.extend({
  animationName: null,
  elapsedTime: null,
  pseudoElement: null,
})

export default SyntheticAnimationEvent
