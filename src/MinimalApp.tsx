import React from 'react';

const MinimalApp = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Application Loaded Successfully</h1>
      <p>This is a minimal version of the application to verify that React is rendering correctly.</p>
      <p>If you can see this message, then React is working properly.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Debugging Information</h2>
        <p>React version: {React.version}</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <button 
        style={{ 
          marginTop: '20px', 
          padding: '10px 15px', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Interactivity
      </button>
    </div>
  );
};

export default MinimalApp; 