import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxyRoutes = ['/web', '/proxy', '/config', '/plugins']

const proxy = {} as Record<
  string,
  {
    target: string
    changeOrigin: boolean
  }
>

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
