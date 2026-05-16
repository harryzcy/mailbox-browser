import eslint from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
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
  reactHooks.configs.flat.recommended,
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
