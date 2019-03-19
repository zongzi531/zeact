// 这里在干嘛没看懂
import accumulate from '@/utils/accumulate'
import EventConstants from '@/event/EventConstants'
import CallbackRegistry from '@/event/CallbackRegistry'
import forEachAccumulated from '@/utils/forEachAccumulated'

const { PropagationPhases } = EventConstants
const { getListener } = CallbackRegistry

const injection = {
  InstanceHandle: null,
  injectInstanceHandle (InjectedInstanceHandle) {
    injection.InstanceHandle = InjectedInstanceHandle
  },
}

const listenerAtPhase = (id, abstractEvent, propagationPhase) => {
  const registrationName =
    abstractEvent.type.phasedRegistrationNames[propagationPhase]
  return getListener(id, registrationName)
}

const accumulateDirectionalDispatches = (domID, upwards, abstractEvent) => {
  const phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured
  const listener = listenerAtPhase(domID, abstractEvent, phase)
  if (listener) {
    abstractEvent._dispatchListeners =
      accumulate(abstractEvent._dispatchListeners, listener)
    abstractEvent._dispatchIDs = accumulate(abstractEvent._dispatchIDs, domID)
  }
}

const accumulateTwoPhaseDispatchesSingle = abstractEvent => {
  if (abstractEvent && abstractEvent.type.phasedRegistrationNames) {
    injection.InstanceHandle.traverseTwoPhase(
      abstractEvent.abstractTargetID,
      accumulateDirectionalDispatches,
      abstractEvent
    )
  }
}

const accumulateTwoPhaseDispatches = abstractEvents => {
  forEachAccumulated(abstractEvents, accumulateTwoPhaseDispatchesSingle)
}

export default {
  injection,
  accumulateTwoPhaseDispatches,
}
