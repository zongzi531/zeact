export interface IInteraction {
  __count: number
  id: number
  name: string
  timestamp: number
}

export interface ISubscriber {
  onInteractionTraced: (interaction: IInteraction) => void
  onInteractionScheduledWorkCompleted: (interaction: IInteraction) => void
  onWorkScheduled: (interactions: Set<IInteraction>, threadID: number) => void
  onWorkCanceled: (interactions: Set<IInteraction>, threadID: number) => void
  onWorkStarted: (interactions: Set<IInteraction>, threadID: number) => void
  onWorkStopped: (interactions: Set<IInteraction>, threadID: number) => void
}

export interface IInteractionsRef {
  current: Set<IInteraction>
}

export interface ISubscriberRef {
  current: ISubscriber | null
}

const DEFAULT_THREAD_ID = 0

let interactionIDCounter: number = 0
let threadIDCounter: number = 0

export function unstable_getThreadID(): number {
  return ++threadIDCounter
}

let interactionsRef: IInteractionsRef = null

let subscriberRef: ISubscriberRef = null

export {interactionsRef as __interactionsRef, subscriberRef as __subscriberRef}