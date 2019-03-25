module.exports = {
    root: true,
    extends: 'standard',
    parser: 'babel-eslint',
    parserOptions: {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    rules: {
        'comma-dangle': ['error', 'always-multiline'],
        'no-useless-escape': 0,
        'no-useless-return': 0,
        'no-new-func': 0,
        'eqeqeq': 0,
    }
}
