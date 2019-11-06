import { Fiber } from './ZzeactFiber'

import { enableProfilerTimer } from '@/shared/ZzeactFeatureFlags'

import { now } from '@/zzeact-dom/src/client/ZzeactDOMHostConfig' /* ./ReactFiberHostConfig */

export type ProfilerTimer = {
  getCommitTime(): number
  recordCommitTime(): void
  startProfilerTimer(fiber: Fiber): void
  stopProfilerTimerIfRunning(fiber: Fiber): void
  stopProfilerTimerIfRunningAndRecordDelta(fiber: Fiber): void
}

let commitTime: number = 0
let profilerStartTime: number = -1

function getCommitTime(): number {
  return commitTime
}

function recordCommitTime(): void {
  if (!enableProfilerTimer) {
    return
  }
  commitTime = now()
}

function startProfilerTimer(fiber: Fiber): void {
  if (!enableProfilerTimer) {
    return
  }

  profilerStartTime = now()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (((fiber.actualStartTime as any) as number) < 0) {
    fiber.actualStartTime = now()
  }
}

function stopProfilerTimerIfRunning(/* fiber: Fiber */): void {
  if (!enableProfilerTimer) {
    return
  }
  profilerStartTime = -1
}

function stopProfilerTimerIfRunningAndRecordDelta(
  fiber: Fiber,
  overrideBaseTime: boolean,
): void {
  if (!enableProfilerTimer) {
    return
  }

  if (profilerStartTime >= 0) {
    const elapsedTime = now() - profilerStartTime
    fiber.actualDuration += elapsedTime
    if (overrideBaseTime) {
      fiber.selfBaseDuration = elapsedTime
    }
    profilerStartTime = -1
  }
}

export {
  getCommitTime,
  recordCommitTime,
  startProfilerTimer,
  stopProfilerTimerIfRunning,
  stopProfilerTimerIfRunningAndRecordDelta,
}
