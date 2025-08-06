import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  server: {
    port: 5178,
    proxy: {
      '/rails/active_storage': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
