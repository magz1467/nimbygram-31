
import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config', './supabase/.env'],
    api: false, // Disable API server by default
    // If API server is needed, use the following configuration instead:
    // api: {
    //   host: 'localhost',
    //   port: 51204,
    //   strictPort: true, // Prevent fallback to another port
    //   middlewares: [
    //     // Add middleware to check origin header
    //     (req, res, next) => {
    //       const origin = req.headers.origin;
    //       // Allow only specific origins
    //       if (!origin || origin === 'http://localhost:8080') {
    //         next();
    //       } else {
    //         res.writeHead(403);
    //         res.end('Forbidden');
    //       }
    //     }
    //   ]
    // }
  },
});
