import eslint from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
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
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024
      }
    },
    rules: {
      semi: [2, 'never']
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.js'],
    ...tsEslint.configs.disableTypeChecked
  }
)
