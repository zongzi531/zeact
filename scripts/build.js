const rollup = require('rollup')
const rollupPluginUglify = require('rollup-plugin-uglify')

const { inputOptions, outputOptions } = require('./config')

const build = async () => {
  const bundle = await rollup.rollup({
    ...inputOptions,
    plugins: [
      ...inputOptions.plugins,
      rollupPluginUglify.uglify(),
    ],
  })

  await bundle.write(outputOptions)
}

build()
