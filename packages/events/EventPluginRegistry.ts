import { DispatchConfig } from './ZzeactSyntheticEventType'
import {
  AnyNativeEvent,
  PluginName,
  PluginModule,
} from './PluginModuleType'

import invariant from '@/shared/invariant'

type NamesToPlugins = {[key: string/* PluginName */]: PluginModule<AnyNativeEvent>}
type EventPluginOrder = null | Array<PluginName>

let eventPluginOrder: EventPluginOrder = null

const namesToPlugins: NamesToPlugins = {}

export const plugins = []

export const eventNameDispatchConfigs = {}

export const registrationNameModules = {}

export const registrationNameDependencies = {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const possibleRegistrationNames = null as any

function publishRegistrationName(
  registrationName: string,
  pluginModule: PluginModule<AnyNativeEvent>,
  eventName: string,
): void {
  invariant(
    !registrationNameModules[registrationName],
    'EventPluginHub: More than one plugin attempted to publish the same ' +
      'registration name, `%s`.',
    registrationName,
  )
  registrationNameModules[registrationName] = pluginModule
  registrationNameDependencies[registrationName] =
    pluginModule.eventTypes[eventName].dependencies
}

function publishEventForPlugin(
  dispatchConfig: DispatchConfig,
  pluginModule: PluginModule<AnyNativeEvent>,
  eventName: string,
): boolean {
  invariant(
    !eventNameDispatchConfigs.hasOwnProperty(eventName),
    'EventPluginHub: More than one plugin attempted to publish the same ' +
      'event name, `%s`.',
    eventName,
  )
  eventNameDispatchConfigs[eventName] = dispatchConfig

  const phasedRegistrationNames = dispatchConfig.phasedRegistrationNames
  if (phasedRegistrationNames) {
    for (const phaseName in phasedRegistrationNames) {
      if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
        const phasedRegistrationName = phasedRegistrationNames[phaseName]
        publishRegistrationName(
          phasedRegistrationName,
          pluginModule,
          eventName,
        )
      }
    }
    return true
  } else if (dispatchConfig.registrationName) {
    publishRegistrationName(
      dispatchConfig.registrationName,
      pluginModule,
      eventName,
    )
    return true
  }
  return false
}

function recomputePluginOrdering(): void {
  if (!eventPluginOrder) {
    return
  }
  for (const pluginName in namesToPlugins) {
    const pluginModule = namesToPlugins[pluginName]
    const pluginIndex = eventPluginOrder.indexOf(pluginName)
    invariant(
      pluginIndex > -1,
      'EventPluginRegistry: Cannot inject event plugins that do not exist in ' +
        'the plugin ordering, `%s`.',
      pluginName,
    )
    if (plugins[pluginIndex]) {
      continue
    }
    invariant(
      pluginModule.extractEvents,
      'EventPluginRegistry: Event plugins must implement an `extractEvents` ' +
        'method, but `%s` does not.',
      pluginName,
    )
    plugins[pluginIndex] = pluginModule
    const publishedEvents = pluginModule.eventTypes
    for (const eventName in publishedEvents) {
      invariant(
        publishEventForPlugin(
          publishedEvents[eventName],
          pluginModule,
          eventName,
        ),
        'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.',
        eventName,
        pluginName,
      )
    }
  }
}

export function injectEventPluginOrder(
  injectedEventPluginOrder: EventPluginOrder,
): void {
  invariant(
    !eventPluginOrder,
    'EventPluginRegistry: Cannot inject event plugin ordering more than ' +
      'once. You are likely trying to load more than one copy of Zzeact.',
  )
  eventPluginOrder = Array.prototype.slice.call(injectedEventPluginOrder)
  recomputePluginOrdering()
}

export function injectEventPluginsByName(
  injectedNamesToPlugins: NamesToPlugins,
): void {
  let isOrderingDirty = false
  for (const pluginName in injectedNamesToPlugins) {
    if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
      continue
    }
    const pluginModule = injectedNamesToPlugins[pluginName]
    if (
      !namesToPlugins.hasOwnProperty(pluginName) ||
      namesToPlugins[pluginName] !== pluginModule
    ) {
      invariant(
        !namesToPlugins[pluginName],
        'EventPluginRegistry: Cannot inject two different event plugins ' +
          'using the same name, `%s`.',
        pluginName,
      )
      namesToPlugins[pluginName] = pluginModule
      isOrderingDirty = true
    }
  }
  if (isOrderingDirty) {
    recomputePluginOrdering()
  }
}
