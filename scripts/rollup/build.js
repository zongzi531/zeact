const { buildEverything } = require('./utils')
const rollupUglify = require('rollup-plugin-uglify')

buildEverything({
  plugins: [
    rollupUglify.uglify(),
  ],
})
