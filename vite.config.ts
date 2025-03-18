
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    // Apply post-processing to ensure CSS variables are properly handled
    postcss: {
      plugins: [],
    },
    // Ensure CSS modules hash consistently
    modules: {
      localsConvention: 'camelCaseOnly',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Add a cache buster to ensure fresh assets
    assetsInlineLimit: 0,
    // Critical CSS optimization
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Use hash for cache busting without invalid timestamp
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(css)$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[ext]/[name]-[hash][extname]';
        },
      },
    },
  }
}));
