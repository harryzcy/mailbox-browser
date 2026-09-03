import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: ['eslint-plugin-better-tailwindcss'],
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/index.css'
    }
  },
  plugins: [
    'typescript',
    'unicorn',
    'oxc',
    'react',
    'jsx-a11y',
    'import',
    'promise',
    'vitest'
  ],
  categories: {
    correctness: 'error',
    perf: 'error',
    suspicious: 'error',
    pedantic: 'error'
  },
  env: {
    browser: true,
    es2026: true
  },
  options: {
    typeAware: true
  },
  ignorePatterns: [
    'dist/',
    'coverage/',
    'node_modules/',
    '.wrangler/',
    '*.config.js',
    '*.config.ts',
    '*.config.cjs'
  ],
  rules: {
    // The new JSX transform makes the React import unnecessary.
    'react/react-in-jsx-scope': 'off',

    // Stylistic opinions we don't hold; prettier owns formatting.
    'eslint/max-lines': 'off',
    'eslint/max-lines-per-function': 'off',
    'eslint/no-inline-comments': 'off',
    'eslint/no-lonely-if': 'off',
    'eslint/no-negated-condition': 'off',
    'eslint/no-underscore-dangle': 'off',
    'eslint/no-warning-comments': 'off',
    'import/max-dependencies': 'off',
    'unicorn/no-lonely-if': 'off',
    'unicorn/no-negated-condition': 'off',

    // Not part of typescript-eslint strict/stylistic; too noisy for this codebase.
    'typescript/prefer-readonly-parameter-types': 'off',
    'typescript/no-unsafe-type-assertion': 'off',
    'typescript/strict-boolean-expressions': 'off',
    'typescript/strict-void-return': 'off',
    'typescript/consistent-return': 'off',

    // Inline callbacks are idiomatic React; memoizing every prop isn't worth it.
    'unicorn/consistent-function-scoping': 'off',
    'eslint/no-await-in-loop': 'off',
    'import/no-unassigned-import': 'off',

    'better-tailwindcss/enforce-canonical-classes': [
      'error',
      { rootFontSize: 16 }
    ]
  }
})
