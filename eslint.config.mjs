import config from '@antfu/eslint-config'

export default config(
  {
    stylistic: false
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
