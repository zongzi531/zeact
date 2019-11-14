import { Fiber } from '@/zzeact-reconciler/src/ZzeactFiber'
import {
  DispatchConfig,
  ZzeactSyntheticEvent,
} from './ZzeactSyntheticEventType'
import { TopLevelType } from './TopLevelEventTypes'

export type EventTypes = {[key: string]: DispatchConfig}

export type AnyNativeEvent = Event | KeyboardEvent | MouseEvent | Touch

export type PluginName = string

export type PluginModule<NativeEvent> = {
  eventTypes: EventTypes
  extractEvents: (
    topLevelType: TopLevelType,
    targetInst: null | Fiber,
    nativeTarget: NativeEvent,
    nativeEventTarget: EventTarget,
  ) => ZzeactSyntheticEvent | null
  tapMoveThreshold?: number
}
