import {enableUserTimingAPI} from '@/shared/ZzeactFeatureFlags'

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

let currentPhase: MeasurementPhase | null = null

let isCommitting: boolean = false
let hasScheduledUpdateInCurrentCommit: boolean = false
let hasScheduledUpdateInCurrentPhase: boolean = false

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
