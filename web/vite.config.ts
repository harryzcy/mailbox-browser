/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
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

export default defineConfig({
  server: {
    proxy
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, './src/components/ui')
    },
    tsconfigPaths: true
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './vitest-setup.js'
  }
})
