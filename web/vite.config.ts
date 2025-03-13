import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

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
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, './src/components/ui')
    }
  }
})
