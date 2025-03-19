import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Consolidate into a single default export
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@types': path.resolve(__dirname, './src/types'),
      '@api': path.resolve(__dirname, './src/api'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  optimizeDeps: {
    include: [
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@supabase/supabase-js',
      'sonner',
      'recharts',
      'embla-carousel-react'
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            warning.message.includes('lucide-react')) {
          return;
        }
        // Use default for everything else
        warn(warning);
      }
    },
    // Ensure consistent sourcemap generation
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  // Add consistent environment variable handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  }
}); 