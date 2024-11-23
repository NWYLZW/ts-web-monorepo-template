import config from '@antfu/eslint-config'

console.log('hello eslint')

export default config(
  {
    stylistic: false,
    typescript: {
      tsconfigPath: './tsconfig.json',
      overrides: {
        'ts/no-namespace': 'off',
        'ts/no-empty-object-type': 'off',
        'ts/method-signature-style': 'off',
        'ts/no-use-before-define': 'off',
        'ts/ban-ts-comment': 'off',
        'ts/no-wrapper-object-types': 'off',
        'ts/no-unsafe-function-type': 'off',
        'ts/strict-boolean-expressions': 'off',

        'import/no-mutable-exports': 'off',
        'perfectionist/sort-imports': 'off',
        'perfectionist/sort-named-imports': 'off'
      }
    }
  },
  // test, script and config files
  {
    files: [
      'packages/*/tests/**/*.{js,ts,tsx}',
      'vitest.config.ts',
      'eslint.config.mjs',
      'vitest.workspace.ts',
      'website/vite.config.ts',
      'scripts/**/*.{js,ts}'
    ],
    rules: {
      'no-console': 'off',
      'ts/strict-boolean-expressions': 'off'
    }
  }
)
