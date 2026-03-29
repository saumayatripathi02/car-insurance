import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled in production to prevent source code exposure
    minify: 'terser', // Ensure minification for production
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
  }
})
