import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,           // Allows using describe, it, expect without importing
    environment: 'jsdom',    // Simulates browser for React
    coverage: {
      provider: 'v8',        // Uses the v8 coverage tool installed above
      reporter: ['text', 'lcov'], // Generates lcov.info for SonarCloud
    },
  },
})
