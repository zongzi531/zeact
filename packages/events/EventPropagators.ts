import {
  getParentInstance,
  traverseTwoPhase,
  traverseEnterLeave,
} from '@/shared/ZzeactTreeTraversal'

import { getListener } from './EventPluginHub'
import accumulateInto from './accumulateInto'
import forEachAccumulated from './forEachAccumulated'

type PropagationPhases = 'bubbled' | 'captured'

function listenerAtPhase(inst, event, propagationPhase: PropagationPhases): Function {
  const registrationName =
    event.dispatchConfig.phasedRegistrationNames[propagationPhase]
  return getListener(inst, registrationName)
}

function accumulateDirectionalDispatches(inst, phase, event): void {
  const listener = listenerAtPhase(inst, event, phase)
  if (listener) {
    event._dispatchListeners = accumulateInto(
      event._dispatchListeners,
      listener,
    )
    event._dispatchInstances = accumulateInto(event._dispatchInstances, inst)
  }
}

function accumulateTwoPhaseDispatchesSingle(event): void {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    traverseTwoPhase(event._targetInst, accumulateDirectionalDispatches, event)
  }
}

function accumulateTwoPhaseDispatchesSingleSkipTarget(event): void {
  if (event && event.dispatchConfig.phasedRegistrationNames) {
    const targetInst = event._targetInst
    const parentInst = targetInst ? getParentInstance(targetInst) : null
    traverseTwoPhase(parentInst, accumulateDirectionalDispatches, event)
  }
}

function accumulateDispatches(inst, ignoredDirection, event): void {
  if (inst && event && event.dispatchConfig.registrationName) {
    const registrationName = event.dispatchConfig.registrationName
    const listener = getListener(inst, registrationName)
    if (listener) {
      event._dispatchListeners = accumulateInto(
        event._dispatchListeners,
        listener,
      )
      event._dispatchInstances = accumulateInto(event._dispatchInstances, inst)
    }
  }
}

function accumulateDirectDispatchesSingle(event): void {
  if (event && event.dispatchConfig.registrationName) {
    accumulateDispatches(event._targetInst, null, event)
  }
}

export function accumulateTwoPhaseDispatches(events): void {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingle)
}

export function accumulateTwoPhaseDispatchesSkipTarget(events): void {
  forEachAccumulated(events, accumulateTwoPhaseDispatchesSingleSkipTarget)
}

export function accumulateEnterLeaveDispatches(leave, enter, from, to): void {
  traverseEnterLeave(from, to, accumulateDispatches, leave, enter)
}

export function accumulateDirectDispatches(events): void {
  forEachAccumulated(events, accumulateDirectDispatchesSingle)
}
