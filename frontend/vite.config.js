import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['chinese-snack-shop.nport.link'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080/chinese-snack-shop/backend/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://localhost:8080/chinese-snack-shop/backend/uploads',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/uploads/, '')
      }
    }
  }
})
