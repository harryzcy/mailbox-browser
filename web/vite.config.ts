import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyRoutes = ['/web', '/proxy', '/config', '/plugins']

const proxy = {}
proxyRoutes.forEach((route) => {
  proxy[route] = {
    target: 'http://localhost:8070',
    changeOrigin: true
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy
  },
  plugins: [react()]
})
