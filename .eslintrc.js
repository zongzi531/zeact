module.exports = {
  env: {
    browser: true,
    es6: true
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/semi': [ 'error', 'never' ],
    '@typescript-eslint/quotes': [ 'error', 'single' ],
    '@typescript-eslint/member-delimiter-style': ['error', { 'multiline': { 'delimiter': 'none' } }],
    'camelcase': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
  }
}
