const { createBuild } = require('./utils')
const { rollupConfig, rollupOutputOptions } = require('./config')
const rollupUglify = require('rollup-plugin-uglify')

createBuild({
  rollupConfig,
  rollupOutputOptions,
  plugins: [
    rollupUglify.uglify(),
  ]
})
