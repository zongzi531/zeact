const rollupTypescript = require('rollup-plugin-typescript')
const rollupAlias = require('rollup-plugin-alias')
const rollupJson = require('rollup-plugin-json')
const { packageRoot, PackageJSON } = require('./utils')

const entry = entryName => require.resolve(packageRoot('packages', entryName, 'index.ts'))

const resolvedEntry = entry('zzeact')

const rollupConfig = {
  input: resolvedEntry,
  plugins: [
    rollupTypescript(),
    rollupAlias({
      resolve: ['.ts'],
      '@': packageRoot('packages'),
      '~': packageRoot(''),
    }),
    rollupJson(),
  ],
}

const rollupOutputOptions = {
  file: PackageJSON.main,
  format: 'umd',
  name: 'Zzeact',
  sourcemap: true,
}

module.exports = {
  rollupConfig,
  rollupOutputOptions,
}
