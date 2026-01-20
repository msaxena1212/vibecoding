import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Serve static assets from the 'public' directory
  build: {
    outDir: 'dist',   // Output build files to the 'dist' directory
  },
})