
import React from 'react';
import ReactDOM from 'react-dom/client';
// CSS order is critical - load ours last to ensure it has highest precedence
import 'leaflet/dist/leaflet.css'; // Third-party CSS first
import './styles/utils.css';  // Base utilities
import './styles/lists.css';  // List styling
import './styles/map.css';    // Map-specific styles
import './styles/mobile.css'; // Mobile-specific styles
import './index.css';         // Main CSS last to ensure overrides work
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Debug API key usage
console.log('=== DEBUG API KEY INFO ===');
console.log('App version:', '1.0.10'); // Increment this to verify you're seeing the latest deployment
console.log('Build timestamp:', new Date().toISOString());
console.log('CSS loading order check: main.tsx loaded index.css AFTER third-party CSS');

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
