const rollup = require('rollup')

const inputOptions = {
  input: 'index.js',
}
const outputOptions = {
  file: 'dist/index.js',
  format: 'cjs',
}

const build = async () => {
  const bundle = await rollup.rollup(inputOptions)

  await bundle.write(outputOptions)
}

build()
