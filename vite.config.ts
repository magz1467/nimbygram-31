
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
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Add a cache buster to ensure fresh assets
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Add timestamp to chunk names to bust cache
        chunkFileNames: 'assets/js/[name]-[hash]-[timestamp].js',
        entryFileNames: 'assets/js/[name]-[hash]-[timestamp].js',
        assetFileNames: 'assets/[ext]/[name]-[hash]-[timestamp].[ext]',
      },
    },
  }
}));
