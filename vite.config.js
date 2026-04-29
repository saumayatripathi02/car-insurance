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
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-axios': ['axios'],
          'vendor-icons': ['react-icons/gi', 'react-icons/md', 'react-icons/io5', 'react-icons/cg'],
          'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          // Lazy loaded chunks stay separate
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit after optimizations
  },
  optimizeDeps: {
    // Exclude heavy libraries from pre-bundling so they're loaded only when needed
    exclude: ['jspdf', '@stripe/stripe-js'],
  },
})
