import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'public', // Serve static assets from the 'public' directory
  build: {
    outDir: '../dist', // Output build files to the 'dist' directory (outside 'public')
  },
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // Treat .js files as JSX
      }
    }
  },
})