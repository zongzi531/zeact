const rollup = require('rollup')
const rollupPluginNodeResolve = require('rollup-plugin-node-resolve')
const rollupPluginBabel = require('rollup-plugin-babel')
const rollupPluginJson = require('rollup-plugin-json')
const rollupPluginUglify = require('rollup-plugin-uglify')

const inputOptions = {
  input: 'main.js',
  plugins: [
    rollupPluginNodeResolve(),
    rollupPluginBabel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    rollupPluginJson(),
    rollupPluginUglify.uglify(),
  ],
}
const outputOptions = {
  file: 'dist/main.js',
  format: 'cjs',
  sourcemap: true,
}

const build = async () => {
  const bundle = await rollup.rollup(inputOptions)

  await bundle.write(outputOptions)
}

build()
