import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    conditions: ['browser', 'module', 'import', 'default']
  }
})
