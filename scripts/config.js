const path = require('path')
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve')
const rollupPluginBabel = require('rollup-plugin-babel')
const rollupPluginJson = require('rollup-plugin-json')
const rollupPluginAlias = require('rollup-plugin-alias')

const inputOptions = {
  input: 'main.js',
  plugins: [
    rollupPluginNodeResolve(),
    rollupPluginBabel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    rollupPluginJson(),
    rollupPluginAlias({
      '@': path.join(__dirname, '../src')
    }),
  ],
}

const outputOptions = {
  file: 'dist/Zzeact.umd.js',
  format: 'umd',
  name: 'Zzeact',
  sourcemap: true,
}

module.exports = {
  inputOptions,
  outputOptions,
}
