import { Fiber } from './ZzeactFiber'

export type ProfilerTimer = {
  getCommitTime(): number
  recordCommitTime(): void
  startProfilerTimer(fiber: Fiber): void
  stopProfilerTimerIfRunning(fiber: Fiber): void
  stopProfilerTimerIfRunningAndRecordDelta(fiber: Fiber): void
}

const commitTime: number = 0

function getCommitTime(): number {
  return commitTime
}

function recordCommitTime(): void {
  return
}

function startProfilerTimer(/* fiber: Fiber */): void {
  return
}

function stopProfilerTimerIfRunning(/* fiber: Fiber */): void {
  return
}

function stopProfilerTimerIfRunningAndRecordDelta(
  // fiber: Fiber,
  // overrideBaseTime: boolean,
): void {
  return
}

export {
  getCommitTime,
  recordCommitTime,
  startProfilerTimer,
  stopProfilerTimerIfRunning,
  stopProfilerTimerIfRunningAndRecordDelta,
}
