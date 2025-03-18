// Emergency patch to fix rendering issues
(function() {
  console.log('🚨 Applying emergency patch');
  
  // 1. Completely disable problematic functions
  window.installNavigationOverride = function() { return true; };
  window.installComponentInspector = function() { return true; };
  window.installClickTracer = function() { return true; };
  
  // 2. Patch React Router navigation
  if (window.ReactRouterDOM) {
    const originalUseNavigate = window.ReactRouterDOM.useNavigate;
    window.ReactRouterDOM.useNavigate = function() {
      try {
        return originalUseNavigate.apply(this, arguments);
      } catch (e) {
        console.error('Navigation error:', e);
        return function() {}; // Return empty function as fallback
      }
    };
  }
  
  // 3. Override problematic imports
  const originalImport = window.import;
  window.import = function(path) {
    if (path.includes('navigationOverride') || 
        path.includes('componentInspector') || 
        path.includes('clickTracer')) {
      console.log(`🛑 Blocked import of ${path}`);
      return Promise.resolve({ 
        installNavigationOverride: function() { return true; },
        installComponentInspector: function() { return true; },
        installClickTracer: function() { return true; }
      });
    }
    return originalImport.apply(this, arguments);
  };
  
  // 4. Add a fallback rendering mechanism
  window.addEventListener('load', function() {
    setTimeout(function() {
      const root = document.getElementById('root');
      if (!root || root.children.length === 0) {
        console.log('🚨 Application failed to render, applying emergency rendering');
        
        // Create root if it doesn't exist
        const appRoot = root || document.createElement('div');
        if (!root) {
          appRoot.id = 'root';
          document.body.appendChild(appRoot);
        }
        
        // Render emergency content
        appRoot.innerHTML = `
          <div style="font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1>Application Emergency Mode</h1>
            <p>The main application encountered issues during initialization.</p>
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
              <h2>Available Pages:</h2>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 10px;">
                  <a href="/vanilla.html" style="display: block; padding: 10px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; text-align: center;">
                    Open Vanilla Version
                  </a>
                </li>
                <li style="margin-bottom: 10px;">
                  <a href="/minimal.html" style="display: block; padding: 10px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; text-align: center;">
                    Open Minimal React Version
                  </a>
                </li>
              </ul>
            </div>
          </div>
        `;
      }
    }, 5000); // Wait 5 seconds for the app to render
  });
  
  console.log('✅ Emergency patch applied');
})(); 