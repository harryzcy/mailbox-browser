import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/web': {
        target: 'http://localhost:8070',
        changeOrigin: true
      }
    }
  },
  plugins: [react()]
})
