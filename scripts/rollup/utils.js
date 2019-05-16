const path = require('path')
const rollup = require('rollup')
const chalk = require('chalk')

const packageRoot = (...paths) => path.join(__dirname, '..', '..', ...paths)

const PackageJSON = require(packageRoot('package.json'))

const createBuild = async ({ rollupConfig = {}, rollupOutputOptions = {}, plugins = [], lastCallBack = () => {} }) => {
  console.log(`${chalk.bgYellow.black(' BUILDING ')} ${PackageJSON.main}`)
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
    console.log(`${chalk.bgRed.black(' OH NOES! ')} ${PackageJSON.main}\n`)
    throw error
  }
  console.log(`${chalk.bgGreen.black(' COMPLETE ')} ${PackageJSON.main}\n`)
  lastCallBack()
}

module.exports = {
  packageRoot,
  PackageJSON,
  createBuild,
}
