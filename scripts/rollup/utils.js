const rollup = require('rollup')
const chalk = require('chalk')
const { getRollupConfig, getRollupOutputOptions } = require('./config')
const { Bundles } = require('./bundles')

const createBuild = async ({ rollupConfig = {}, rollupOutputOptions = {}, plugins = [], isWatch = false }) => {
  console.log(`${chalk.bgYellow.black(' BUILDING ')} ${rollupOutputOptions.file}`)
  try {
    const bundle = await rollup.rollup({
      ...rollupConfig,
      plugins: [
        ...rollupConfig.plugins,
        ...plugins,
      ],
    })

    await bundle.write(rollupOutputOptions)
  } catch (error) {
    console.log(`${chalk.bgRed.black(' OH NOES! ')} ${rollupOutputOptions.file}\n`)
    throw error
  }
  console.log(`${chalk.bgGreen.black(' COMPLETE ')} ${rollupOutputOptions.file}\n`)

  isWatch && rollup.watch({
    ...rollupConfig,
    output: [rollupOutputOptions],
  })
}

const buildEverything = async ({ plugins = [], isWatch = false }) => {
  for (const bundle of Bundles) {
    for (const format of bundle.format) {
      const rollupConfig = getRollupConfig({
        entry: bundle.entry,
      })
      const rollupOutputOptions = getRollupOutputOptions({
        entry: bundle.entry,
        global: bundle.global,
        format,
      })
      await createBuild({
        rollupConfig,
        rollupOutputOptions,
        plugins,
        isWatch,
      })
    }
  }
}

module.exports = {
  createBuild,
  buildEverything,
}
