import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Add detailed debugging logs
console.log('🚀 Starting React initialization');

// Check if the root element exists
const rootElement = document.getElementById('root');
console.log('📦 Root element found:', !!rootElement, rootElement);

// Check the DOM structure
console.log('📄 Document structure:');
console.log('- HTML:', document.documentElement.outerHTML.substring(0, 500) + '...');
console.log('- Body children count:', document.body.childElementCount);
console.log('- Body first few children:', Array.from(document.body.children).slice(0, 5));

// Create a root element if it doesn't exist
if (!rootElement) {
  console.log('📦 Root element not found, creating one');
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  console.log('📦 Created new root element:', newRoot);
}

// Get the root element (either existing or newly created)
const targetRoot = document.getElementById('root');

// Only try to render if the root element exists
if (targetRoot) {
  try {
    console.log('🎨 Creating React root on element:', targetRoot);
    const root = ReactDOM.createRoot(targetRoot);
    
    console.log('🎨 Rendering React application');
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('🎨 React render called successfully');
  } catch (error) {
    console.error('❌ Error rendering React application:', error);
    console.error('Error details:', error.message, error.stack);
  }
} else {
  console.error('❌ Root element still not found, cannot render React application');
} 