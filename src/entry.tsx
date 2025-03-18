import React from 'react';
import ReactDOM from 'react-dom/client';
import MinimalApp from './MinimalApp';
import './index.css';

console.log('🚀 Starting from new entry point: entry.tsx');

// Function to initialize the application
function initializeApp() {
  // Check if the root element exists
  const rootElement = document.getElementById('root');
  console.log('📦 Root element found:', !!rootElement);

  if (!rootElement) {
    console.log('📦 Root element not found, creating one');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    console.log('📦 Created new root element');
  }

  // Get the root element (either existing or newly created)
  const targetRoot = document.getElementById('root');

  if (targetRoot) {
    try {
      console.log('🎨 Creating React root');
      const root = ReactDOM.createRoot(targetRoot);
      
      console.log('🎨 Rendering minimal app');
      root.render(
        <React.StrictMode>
          <MinimalApp />
        </React.StrictMode>
      );
      console.log('🎨 React render called successfully');
    } catch (error) {
      console.error('❌ Error rendering React application:', error);
    }
  } else {
    console.error('❌ Root element still not found, cannot render React application');
  }
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
} 