export {
  unstable_now as now,
} from '@/scheduler'

export type Container = Element | Document

interface IHostContextDev {
  namespace: string
  ancestorInfo: mixed
}

type HostContextProd = string

export type HostContext = IHostContextDev | HostContextProd

export type TimeoutHandle = TimeoutID

export type NoTimeout = -1

export const noTimeout = -1

export let isPrimaryRenderer = true
