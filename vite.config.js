import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Exclude API routes and database packages from build
        return id.includes('/api/') || 
               id === '@vercel/postgres' || 
               id.startsWith('@vercel/postgres') ||
               id === 'pg' ||
               id.startsWith('pg/')
      }
    }
  },
  optimizeDeps: {
    exclude: ['@vercel/postgres', 'pg']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

