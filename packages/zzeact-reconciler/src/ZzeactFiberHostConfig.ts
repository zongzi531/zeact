import invariant from '@/shared/invariant'

invariant(false, 'This module must be shimmed by a specific renderer.')

// 这个位置有疑问？？？

export type Container = any

export type HostContext = any

export let isPrimaryRenderer = true
