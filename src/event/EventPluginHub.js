// 这里在干嘛没看懂
import CallbackRegistry from './CallbackRegistry'
import accumulate from '@/utils/accumulate'
import throwIf from '@/utils/throwIf'
import EventPropagators from './EventPropagators'
import merge from '@/utils/merge'

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

const { putListener } = CallbackRegistry

const registrationNames = {}

const registrationNamesArr = []

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
        injection.plugins[pluginIndex] = PluginModule
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
  // 这里在干嘛 看不懂
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

const enqueueAbstractEvents = abstractEvents => {
  // debugger
}

const processAbstractEventQueue = () => {}

export default {
  registrationNames,
  putListener,
  extractAbstractEvents,
  enqueueAbstractEvents,
  processAbstractEventQueue,
  injection,
}
