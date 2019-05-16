const { createBuild } = require('./utils')
const { rollupConfig, rollupOutputOptions } = require('./config')
const rollupServe = require('rollup-plugin-serve')

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001
const HOST = process.env.HOST || '0.0.0.0'

createBuild({
  rollupConfig,
  rollupOutputOptions,
  plugins: [
    rollupServe({
      contentBase: ['dist', 'examples'],
      host: HOST,
      port: DEFAULT_PORT,
    }),
  ],
  lastCallBack: () => rollup.watch({
    ...rollupConfig,
    output: [rollupOutputOptions],
  }),
})
