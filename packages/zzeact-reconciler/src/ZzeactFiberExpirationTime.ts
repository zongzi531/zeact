import MAX_SIGNED_31_BIT_INT from './maxSigned31BitInt'

export type ExpirationTime = number

export const NoWork = 0
export const Never = 1
export const Sync = MAX_SIGNED_31_BIT_INT

const UNIT_SIZE = 10
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1

export function msToExpirationTime(ms: number): ExpirationTime {
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0)
}

function ceiling(num: number, precision: number): number {
  return (((num / precision) | 0) + 1) * precision
}

function computeExpirationBucket(
  currentTime,
  expirationInMs,
  bucketSizeMs,
): ExpirationTime {
  return (
    MAGIC_NUMBER_OFFSET -
    ceiling(
      MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
      bucketSizeMs / UNIT_SIZE,
    )
  )
}

export const LOW_PRIORITY_EXPIRATION = 5000
export const LOW_PRIORITY_BATCH_SIZE = 250

export function computeAsyncExpiration(
  currentTime: ExpirationTime,
): ExpirationTime {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE,
  )
}

export const HIGH_PRIORITY_EXPIRATION = /* __DEV__ ? 500 : */ 150
export const HIGH_PRIORITY_BATCH_SIZE = 100

export function computeInteractiveExpiration(currentTime: ExpirationTime): ExpirationTime {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE,
  )
}