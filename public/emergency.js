// This is a direct script that doesn't rely on the build system
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  
  if (!root) {
    console.error('Root element not found, creating one');
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
  }
  
  // Render a simple message directly without React
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
      <h1>Emergency Fallback Loaded</h1>
      <p>This is a direct JavaScript fallback that doesn't rely on React or the build system.</p>
      <p>If you can see this message, then your HTML and basic JavaScript are working correctly.</p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px;">
        <h2>Debugging Information</h2>
        <p>Current time: ${new Date().toLocaleTimeString()}</p>
        <p>User Agent: ${navigator.userAgent}</p>
      </div>
      
      <button 
        id="testButton"
        style="margin-top: 20px; padding: 10px 15px; background-color: #0070f3; color: white; border: none; border-radius: 5px; cursor: pointer;"
      >
        Test Interactivity
      </button>
    </div>
  `;
  
  // Add event listener to the button
  document.getElementById('testButton').addEventListener('click', function() {
    alert('Button clicked! JavaScript is working correctly.');
  });
}); 