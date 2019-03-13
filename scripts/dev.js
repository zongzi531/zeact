const rollup = require('rollup')
const rollupPluginServe = require('rollup-plugin-serve')

const { inputOptions, outputOptions } = require('./config')

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
const HOST = process.env.HOST || '0.0.0.0'

const build = async () => {
  const bundle = await rollup.rollup({
    ...inputOptions,
    plugins: [
      ...inputOptions.plugins,
      rollupPluginServe({
        contentBase: ['dist', 'examples'],
        host: HOST,
        port: DEFAULT_PORT,
      }),
    ],
  })

  await bundle.write(outputOptions)

  rollup.watch({
    ...inputOptions,
    output: [outputOptions],
  })
}

build()
