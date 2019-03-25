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
  validate () {
    var invalid = !injection.InstanceHandle ||
      !injection.InstanceHandle.traverseTwoPhase ||
      !injection.InstanceHandle.traverseEnterLeave
    if (invalid) {
      throw new Error('InstanceHandle not injected before use!')
    }
  },
}

const listenerAtPhase = (id, abstractEvent, propagationPhase) => {
  // 获得对应的事件抽象名称
  const registrationName =
    abstractEvent.type.phasedRegistrationNames[propagationPhase]
  // 返回获得对应的回调
  return getListener(id, registrationName)
}

const accumulateDirectionalDispatches = (domID, upwards, abstractEvent) => {
  // 通过 upwards 来判断选用 bubbled 或是 captured ， 以传入到 listenerAtPhase
  const phase = upwards ? PropagationPhases.bubbled : PropagationPhases.captured
  const listener = listenerAtPhase(domID, abstractEvent, phase)
  // 若 listener 存在则执行
  if (listener) {
    // 若 _dispatchListeners ， _dispatchIDs 不存在则返回对应的 listener 和 domID
    // 这里你可以发现，若本身捕获的方法存在，就会把冒泡的方法进行追加返回 [捕获, 冒泡]
    // 再通过 EventPluginUtils 的 forEachEventDispatch 进行执行
    abstractEvent._dispatchListeners =
      accumulate(abstractEvent._dispatchListeners, listener)
    abstractEvent._dispatchIDs = accumulate(abstractEvent._dispatchIDs, domID)
  }
}

const accumulateTwoPhaseDispatchesSingle = abstractEvent => {
  // 判断抽象事件是否存在
  if (abstractEvent && abstractEvent.type.phasedRegistrationNames) {
    // 分别执行：
    // 前提 abstractEvent.abstractTargetID 存在
    // traverseParentPath('', abstractEvent.abstractTargetID, accumulateDirectionalDispatches, abstractEvent, true, false)
    // traverseParentPath(abstractEvent.abstractTargetID, '', accumulateDirectionalDispatches, abstractEvent, false, true)
    injection.InstanceHandle.traverseTwoPhase(
      abstractEvent.abstractTargetID,
      accumulateDirectionalDispatches,
      abstractEvent
    )
  }
}

const accumulateTwoPhaseDispatches = abstractEvents => {
  // 执行 accumulateTwoPhaseDispatchesSingle(abstractEvents)
  forEachAccumulated(abstractEvents, accumulateTwoPhaseDispatchesSingle)
}

const accumulateDispatches = (id, ignoredDirection, abstractEvent) => {
  if (abstractEvent && abstractEvent.type.registrationName) {
    const listener = getListener(id, abstractEvent.type.registrationName)
    if (listener) {
      abstractEvent._dispatchListeners =
        accumulate(abstractEvent._dispatchListeners, listener)
      abstractEvent._dispatchIDs = accumulate(abstractEvent._dispatchIDs, id)
    }
  }
}

const accumulateDirectDispatchesSingle = abstractEvent => {
  if (abstractEvent && abstractEvent.type.registrationName) {
    accumulateDispatches(abstractEvent.abstractTargetID, null, abstractEvent)
  }
}

const accumulateEnterLeaveDispatches = (leave, enter, fromID, toID) => {
  injection.InstanceHandle.traverseEnterLeave(
    fromID,
    toID,
    accumulateDispatches,
    leave,
    enter
  )
}

const accumulateDirectDispatches = abstractEvents => {
  forEachAccumulated(abstractEvents, accumulateDirectDispatchesSingle)
}

export default {
  injection,
  accumulateTwoPhaseDispatches,
  accumulateEnterLeaveDispatches,
  accumulateDirectDispatches,
}
