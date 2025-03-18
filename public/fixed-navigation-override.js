// Fixed version of navigationOverride.js
window.installNavigationOverride = function() {
  console.log('🔧 Installing safe navigation override');
  
  // Store original functions
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // Override pushState
  history.pushState = function(...args) {
    console.log('🔍 pushState intercepted:', args);
    
    // Check if this is a navigation to /map
    const url = args[2];
    if (typeof url === 'string' && url.includes('/map')) {
      console.log('🚨 Intercepted navigation to /map via pushState');
      
      // Instead of navigating, dispatch a custom event that our app can listen for
      window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url } }));
      
      // Return without actually navigating
      return;
    }
    
    return originalPushState.apply(this, args);
  };
  
  // Override replaceState
  history.replaceState = function(...args) {
    console.log('🔍 replaceState intercepted:', args);
    
    // Check if this is a navigation to /map
    const url = args[2];
    if (typeof url === 'string' && url.includes('/map')) {
      console.log('🚨 Intercepted navigation to /map via replaceState');
      
      // Instead of navigating, dispatch a custom event that our app can listen for
      window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url } }));
      
      // Return without actually navigating
      return;
    }
    
    return originalReplaceState.apply(this, args);
  };

  // Intercept all link clicks
  document.addEventListener('click', (e) => {
    const target = e.target;
    const link = target.closest('a');
    
    if (link && link.href) {
      const url = new URL(link.href);
      
      // Check if this is a navigation to /map
      if (url.pathname.includes('/map')) {
        console.log('🚨 Intercepted click on link to /map:', url.pathname);
        
        e.preventDefault();
        e.stopPropagation();
        
        // Instead of navigating, dispatch a custom event that our app can listen for
        window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url: url.pathname + url.search } }));
      }
    }
  }, true);
  
  console.log('✅ Safe navigation override installed');
  return true;
};

// Also provide empty implementations of other problematic functions
window.installComponentInspector = function() {
  console.log('🔧 Component inspector safely disabled');
  return true;
};

window.installClickTracer = function() {
  console.log('🔧 Click tracer safely disabled');
  return true;
};

console.log('✅ Fixed navigation override loaded'); 