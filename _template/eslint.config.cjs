// @ts-check
const typescriptEslint = require('typescript-eslint')
const eslintPluginCypress = require('eslint-plugin-cypress/flat')
const prettierConfig = require('eslint-config-prettier')

module.exports = typescriptEslint.config(
  {
    ignores: ['node_modules/**', 'dist/**', 'cypress/reports/**'],
  },
  ...typescriptEslint.configs.recommended,
  eslintPluginCypress.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'cypress/no-unnecessary-waiting': 'warn',
    },
  }
)
