import config from '@antfu/eslint-config'

export default config(
  {
    stylistic: false,
    typescript: {
      tsconfigPath: './tsconfig.json'
    }
  },
  // test, script and config files
  {
    files: [
      './pacakges/*/tests/**/*.{js,ts,tsx}',
      './vitest.config.ts',
      './vitest.workspace.ts',
      './website/vite.config.ts',
      './scripts/**/*.{js,ts}'
    ],
    rules: {
      'no-console': 'off'
    }
  }
)
