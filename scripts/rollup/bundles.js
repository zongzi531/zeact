const UMD = 'umd'

const bundles = [
  {
    format: [
      UMD,
    ],
    entry: 'zzeact',
    global: 'Zzeact',
  },
  {
    format: [
      UMD,
    ],
    entry: 'zzeact-dom',
    global: 'ZzeactDOM',
  },
]

module.exports = {
  Bundles: bundles,
}
