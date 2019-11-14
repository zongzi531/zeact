import { Fiber } from '@/zzeact-reconciler/src/ZzeactFiber'
import { TopLevelType } from './TopLevelEventTypes'

export type DispatchConfig = {
  dependencies: Array<TopLevelType>
  phasedRegistrationNames?: {
    bubbled: string
    captured: string
  }
  registrationName?: string
  isInteractive?: boolean
}

export type ZzeactSyntheticEvent = {
  dispatchConfig: DispatchConfig
  getPooled: (
    dispatchConfig: DispatchConfig,
    targetInst: Fiber,
    nativeTarget: Event,
    nativeEventTarget: EventTarget,
  ) => ZzeactSyntheticEvent
  isPersistent: () => boolean
} & SyntheticEvent
