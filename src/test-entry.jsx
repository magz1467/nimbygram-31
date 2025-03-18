import React from 'react';
import ReactDOM from 'react-dom/client';
import TestComponent from './TestComponent';

console.log('Test entry point executing');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TestComponent />); 