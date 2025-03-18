import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure all modules are bundled, not externalized
    rollupOptions: {
      external: [], // Don't externalize any modules
    },
  },
  // Make sure all environment variables are properly defined
  define: {
    'process.env': {},
    'import.meta.env.VITE_APP_NAME': JSON.stringify('Your App Name'),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.0'),
  },
  // Disable optimizations that might cause issues
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'leaflet'
    ]
  }
}); 