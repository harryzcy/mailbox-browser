// @ts-check
import eslint from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
// import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
  {
    ignores: [
      'dist/',
      'coverage/',
      'node_modules/',
      '.wrangler/',
      '*.config.js',
      '*.config.ts',
      '*.config.cjs'
    ]
  },
  eslint.configs.recommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,
  // @ts-ignore
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2021
      }
    },
    rules: {
      semi: [2, 'never']
    }
  },
  {
    files: ['**/*.js'],
    ...tsEslint.configs.disableTypeChecked
  }
)
