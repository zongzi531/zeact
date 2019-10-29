import { Fiber } from './ZzeactFiber'
import { enableUserTimingAPI } from '@/shared/ZzeactFeatureFlags'
import getComponentName from '@/shared/getComponentName'

type MeasurementPhase =
  | 'componentWillMount'
  | 'componentWillUnmount'
  | 'componentWillReceiveProps'
  | 'shouldComponentUpdate'
  | 'componentWillUpdate'
  | 'componentDidUpdate'
  | 'componentDidMount'
  | 'getChildContext'
  | 'getSnapshotBeforeUpdate'

const zzeactEmoji = '\u269B'
const warningEmoji = '\u26D4'

const supportsUserTiming =
  typeof performance !== 'undefined' &&
  typeof performance.mark === 'function' &&
  typeof performance.clearMarks === 'function' &&
  typeof performance.measure === 'function' &&
  typeof performance.clearMeasures === 'function'

// let currentFiber: Fiber | null = null
let currentPhase: MeasurementPhase | null = null
let currentPhaseFiber: Fiber | null = null

// eslint-disable-next-line prefer-const
let isCommitting: boolean = false
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let hasScheduledUpdateInCurrentCommit: boolean = false
let hasScheduledUpdateInCurrentPhase: boolean = false
// let commitCountInCurrentWorkLoop: number = 0
// let effectCountInCurrentCommit: number = 0
// let isWaitingForCallback: boolean = false

const labelsInCurrentCommit: Set<string> = new Set()

const formatMarkName = (markName: string): string => {
  return `${zzeactEmoji} ${markName}`
}

const formatLabel = (label: string, warning: string | null): string => {
  const prefix = warning ? `${warningEmoji} ` : `${zzeactEmoji} `
  const suffix = warning ? ` Warning: ${warning}` : ''
  return `${prefix}${label}${suffix}`
}

const beginMark = (markName: string): void => {
  performance.mark(formatMarkName(markName))
}

const clearMark = (markName: string): void => {
  performance.clearMarks(formatMarkName(markName))
}

const endMark = (label: string, markName: string, warning: string | null): void => {
  const formattedMarkName = formatMarkName(markName)
  const formattedLabel = formatLabel(label, warning)
  try {
    performance.measure(formattedLabel, formattedMarkName)
  } catch (err) {
  }
  performance.clearMarks(formattedMarkName)
  performance.clearMeasures(formattedLabel)
}

const getFiberMarkName = (label: string, debugID: number): string => {
  return `${label} (#${debugID})`
}

const getFiberLabel = (
  componentName: string,
  isMounted: boolean,
  phase: MeasurementPhase | null,
): string => {
  if (phase === null) {
    return `${componentName} [${isMounted ? 'update' : 'mount'}]`
  } else {
    return `${componentName}.${phase}`
  }
}

const beginFiberMark = (
  fiber: Fiber,
  phase: MeasurementPhase | null,
): boolean => {
  const componentName = getComponentName(fiber.type) || 'Unknown'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugID = ((fiber._debugID as any) as number)
  const isMounted = fiber.alternate !== null
  const label = getFiberLabel(componentName, isMounted, phase)

  if (isCommitting && labelsInCurrentCommit.has(label)) {
    return false
  }
  labelsInCurrentCommit.add(label)

  const markName = getFiberMarkName(label, debugID)
  beginMark(markName)
  return true
}

const clearFiberMark = (fiber: Fiber, phase: MeasurementPhase | null): void => {
  const componentName = getComponentName(fiber.type) || 'Unknown'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugID = ((fiber._debugID as any) as number)
  const isMounted = fiber.alternate !== null
  const label = getFiberLabel(componentName, isMounted, phase)
  const markName = getFiberMarkName(label, debugID)
  clearMark(markName)
}

const endFiberMark = (
  fiber: Fiber,
  phase: MeasurementPhase | null,
  warning: string | null,
): void => {
  const componentName = getComponentName(fiber.type) || 'Unknown'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debugID = ((fiber._debugID as any ) as number)
  const isMounted = fiber.alternate !== null
  const label = getFiberLabel(componentName, isMounted, phase)
  const markName = getFiberMarkName(label, debugID)
  endMark(label, markName, warning)
}

const clearPendingPhaseMeasurement: () => void = () => {
  if (currentPhase !== null && currentPhaseFiber !== null) {
    clearFiberMark(currentPhaseFiber, currentPhase)
  }
  currentPhaseFiber = null
  currentPhase = null
  hasScheduledUpdateInCurrentPhase = false
}

export function startPhaseTimer(fiber: Fiber, phase: MeasurementPhase): void {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return
    }
    clearPendingPhaseMeasurement()
    if (!beginFiberMark(fiber, phase)) {
      return
    }
    currentPhaseFiber = fiber
    currentPhase = phase
  }
}

export function stopPhaseTimer(): void {
  if (enableUserTimingAPI) {
    if (!supportsUserTiming) {
      return
    }
    if (currentPhase !== null && currentPhaseFiber !== null) {
      const warning = hasScheduledUpdateInCurrentPhase
        ? 'Scheduled a cascading update'
        : null
      endFiberMark(currentPhaseFiber, currentPhase, warning)
    }
    currentPhase = null
    currentPhaseFiber = null
  }
}

export function recordScheduleUpdate(): void {
  if (enableUserTimingAPI) {
    if (isCommitting) {
      hasScheduledUpdateInCurrentCommit = true
    }
    if (
      currentPhase !== null &&
      currentPhase !== 'componentWillMount' &&
      currentPhase !== 'componentWillReceiveProps'
    ) {
      hasScheduledUpdateInCurrentPhase = true
    }
  }
}
