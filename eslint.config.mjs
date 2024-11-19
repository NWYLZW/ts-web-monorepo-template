import config from '@antfu/eslint-config'

export default config(
  {
    stylistic: false,
    typescript: {
      tsconfigPath: './tsconfig.json'
    }
  },
  {
    files: [
      './pacakges/*/tests/**/*.{js,ts,tsx}'
    ],
    rules: {
      'no-console': 'off'
    }
  }
)
