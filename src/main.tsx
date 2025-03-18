
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AppRoutes } from './router';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installNavigationTracer } from './utils/navigationTracer';
import { installNavigationOverride } from './utils/navigationOverride';
import { installComponentInspector } from './utils/componentInspector';
import { installClickTracer } from './utils/clickTracer';

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Debug logs
console.log('=== DEBUG API KEY INFO ===');
console.log('App version: 1.0.6');
console.log('Build timestamp: ' + new Date().toISOString());
console.log('Checking loaded scripts at: ' + new Date().toISOString());

// Install utilities with error handling
try {
  installNavigationTracer();
  installNavigationOverride();
  installComponentInspector();
  installClickTracer();
} catch (error) {
  console.error('Error installing utilities:', error);
}

// Create React root and render the application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRoutes} />
    </QueryClientProvider>
  </React.StrictMode>
);
