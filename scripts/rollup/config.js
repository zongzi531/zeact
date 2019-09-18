const path = require('path')
const rollupTypescript = require('rollup-plugin-typescript')
const rollupAlias = require('rollup-plugin-alias')
const rollupJson = require('rollup-plugin-json')
const { eslint: rollupEslint } = require('rollup-plugin-eslint')

const DOUBLE_POINT = '..'
const PATH_SRC = 'packages'
const PATH_ROOT = ''
const DEFAULT_INDEX_FILE = 'index.ts'
const BASE_DIR = 'dist/'
const BASE_SUFFIX = 'js'

const packageRoot = (...paths) => path.join(__dirname, DOUBLE_POINT, DOUBLE_POINT, ...paths)

const resolvedEntry = entryName => require.resolve(packageRoot(PATH_SRC, entryName, DEFAULT_INDEX_FILE))

const getFileName = (global, format) => BASE_DIR + [global, format, BASE_SUFFIX].join('.')

const getRollupConfig = ({ entry }) => ({
  input: resolvedEntry(entry),
  plugins: [
    rollupEslint({
      exclude: [
        'node_modules/**',
        './package.json'
      ],
    }),
    rollupTypescript(),
    rollupAlias({
      resolve: ['.ts'],
      '@': packageRoot(PATH_SRC),
      '~': packageRoot(PATH_ROOT),
    }),
    rollupJson(),
  ],
})

const getRollupOutputOptions = ({ entry, global, format, sourcemap = true }) => ({
  file: getFileName(global, format),
  format,
  name: global,
  sourcemap,
})

module.exports = {
  getRollupConfig,
  getRollupOutputOptions,
}
