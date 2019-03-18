const canUseDOM = typeof window !== 'undefined'

export default {
  canUseDOM,
  canUseWorkers: typeof Worker !== 'undefined',
  isInWorker: !canUseDOM,
  global: (function () { return this })(),
}
