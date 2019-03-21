import CallbackRegistry from './CallbackRegistry'
import accumulate from '@/utils/accumulate'
import throwIf from '@/utils/throwIf'
import EventPropagators from './EventPropagators'
import merge from '@/utils/merge'
import forEachAccumulated from '@/utils/forEachAccumulated'
import EventPluginUtils from './EventPluginUtils'
import AbstractEvent from './AbstractEvent'

const ERRORS = {
  DOUBLE_REGISTER:
    'You\'ve included an event plugin that extracts an ' +
    'event type with the exact same or identity as an event that ' +
    'had previously been injected - or, one of the registration names ' +
    'used by an plugin has already been used.',
  DOUBLE_ENQUEUE:
    'During the processing of events, more events were enqueued. This ' +
    'is strange and should not happen. Please report immediately. ',
  DEPENDENCY_ERROR:
    'You have either attempted to load an event plugin that has no ' +
    'entry in EventPluginOrder, or have attempted to extract events ' +
    'when some critical dependencies have not yet been injected.',
}

const { putListener, deleteListener } = CallbackRegistry

const registrationNames = {}

const registrationNamesArr = []

let abstractEventQueue = []

// 这是一个工厂函数
const recordAllRegistrationNames = (eventType, PluginModule) => {
  let phaseName
  const phasedRegistrationNames = eventType.phasedRegistrationNames
  if (phasedRegistrationNames) {
    for (phaseName in phasedRegistrationNames) {
      if (!phasedRegistrationNames.hasOwnProperty(phaseName)) {
        continue
      }
      registrationNames[phasedRegistrationNames[phaseName]] = PluginModule
      registrationNamesArr.push(phasedRegistrationNames[phaseName])
    }
  } else if (eventType.registrationName) {
    registrationNames[eventType.registrationName] = PluginModule
    registrationNamesArr.push(eventType.registrationName)
  }
}

const injection = {
  injectInstanceHandle (InjectedInstanceHandle) {
    EventPropagators.injection.injectInstanceHandle(InjectedInstanceHandle)
  },
  EventPluginOrder: null,
  injectEventPluginOrder (InjectedEventPluginOrder) {
    injection.EventPluginOrder = InjectedEventPluginOrder
    injection._recomputePluginsList()
  },
  plugins: [],
  pluginsByName: {},
  injectEventPluginsByName (pluginsByName) {
    injection.pluginsByName = merge(injection.pluginsByName, pluginsByName)
    injection._recomputePluginsList()
  },
  _recomputePluginsList () {
    const injectPluginByName = function (name, PluginModule) {
      const pluginIndex = injection.EventPluginOrder.indexOf(name)
      throwIf(pluginIndex === -1, ERRORS.DEPENDENCY_ERROR + name)
      if (!injection.plugins[pluginIndex]) {
        // 在对应位置插入 PluginModule
        injection.plugins[pluginIndex] = PluginModule
        // 并且遍历调用 recordAllRegistrationNames
        for (const eventName in PluginModule.abstractEventTypes) {
          const eventType = PluginModule.abstractEventTypes[eventName]
          recordAllRegistrationNames(eventType, PluginModule)
        }
      }
    }
    if (injection.EventPluginOrder) { // Else, do when plugin order injected
      const injectedPluginsByName = injection.pluginsByName
      for (const name in injectedPluginsByName) {
        injectPluginByName(name, injectedPluginsByName[name])
      }
    }
  },
}

const extractAbstractEvents = (topLevelType, nativeEvent, renderedTargetID, renderedTarget) => {
  // 若存在 possiblePlugin 则创建 AbstractEvents 的实例
  let abstractEvents
  const plugins = injection.plugins
  const len = plugins.length
  for (let i = 0; i < len; i++) {
    // Not every plugin in the ordering may be loaded at runtime.
    const possiblePlugin = plugins[i]
    const extractedAbstractEvents =
      possiblePlugin &&
      possiblePlugin.extractAbstractEvents(
        topLevelType,
        nativeEvent,
        renderedTargetID,
        renderedTarget
      )
    if (extractedAbstractEvents) {
      abstractEvents = accumulate(abstractEvents, extractedAbstractEvents)
    }
  }
  return abstractEvents
}

const getPluginModuleForAbstractEvent = abstractEvent => {
  if (abstractEvent.type.registrationName) {
    return registrationNames[abstractEvent.type.registrationName]
  } else {
    for (const phase in abstractEvent.type.phasedRegistrationNames) {
      if (!abstractEvent.type.phasedRegistrationNames.hasOwnProperty(phase)) {
        continue
      }
      const PluginModule = registrationNames[abstractEvent.type.phasedRegistrationNames[phase]]
      if (PluginModule) {
        return PluginModule
      }
    }
  }
  return null
}

const executeDispatchesAndRelease = abstractEvent => {
  if (abstractEvent) {
    const PluginModule = getPluginModuleForAbstractEvent(abstractEvent)
    const pluginExecuteDispatch = PluginModule && PluginModule.executeDispatch
    EventPluginUtils.executeDispatchesInOrder(
      abstractEvent,
      pluginExecuteDispatch || EventPluginUtils.executeDispatch
    )
    AbstractEvent.release(abstractEvent)
  }
}

const enqueueAbstractEvents = abstractEvents => {
  if (abstractEvents) {
    abstractEventQueue = accumulate(abstractEventQueue, abstractEvents)
  }
}

const processAbstractEventQueue = () => {
  const processingAbstractEventQueue = abstractEventQueue
  abstractEventQueue = null
  forEachAccumulated(processingAbstractEventQueue, executeDispatchesAndRelease)
}

const deleteAllListeners = (domID) => {
  let ii
  for (ii = 0; ii < registrationNamesArr.length; ii++) {
    deleteListener(domID, registrationNamesArr[ii])
  }
}

export default {
  registrationNames,
  putListener,
  extractAbstractEvents,
  enqueueAbstractEvents,
  processAbstractEventQueue,
  injection,
  deleteAllListeners,
}
