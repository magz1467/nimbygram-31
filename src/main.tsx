import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installNavigationOverride } from './utils/navigationOverride';
import { installNavigationTracer } from './utils/navigationTracer';

// Debug API key usage
console.log('=== DEBUG API KEY INFO ===');
console.log('App version:', '1.0.6'); // Increment this to verify you're seeing the latest deployment
console.log('Build timestamp:', new Date().toISOString());

// Create a function to check loaded scripts
function checkLoadedScripts() {
  console.log('Checking loaded scripts at:', new Date().toISOString());
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const src = script.getAttribute('src') || '';
    if (src.includes('maps.googleapis.com')) {
      console.log('Google Maps script source:', src);
    }
  });
}

// Run script check immediately and after a delay
checkLoadedScripts();
setTimeout(checkLoadedScripts, 3000);

const queryClient = new QueryClient();

// Install navigation debugging tools before anything else
installNavigationTracer();
installNavigationOverride();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
