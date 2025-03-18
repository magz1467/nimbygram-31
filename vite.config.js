import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'path': 'path-browserify',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: false,
  },
  // Make sure all environment variables are properly defined
  define: {
    'process.env': process.env,
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
  },
  // Handle Node.js built-in modules
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      fs: path.resolve(__dirname, './src/utils/fs-polyfill.js'),
      path: 'path-browserify',
    },
  },
}); 