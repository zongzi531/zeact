const { buildEverything } = require('./utils')
const rollupServe = require('rollup-plugin-serve')

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001
const HOST = process.env.HOST || '0.0.0.0'

buildEverything({
  plugins: [
    rollupServe({
      contentBase: ['dist', 'examples'],
      host: HOST,
      port: DEFAULT_PORT,
    }),
  ],
  isWatch: true,
})
