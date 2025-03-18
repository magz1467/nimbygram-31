/**
 * This utility creates a stack trace when navigation to map is attempted
 * to help identify the source of the navigation
 */

export function installNavigationTracer() {
  console.log('🔍 Installing navigation tracer');
  
  // Create a custom error to capture the stack trace
  function captureStack() {
    const error = new Error('Navigation to map trace');
    console.log('🔍 Navigation to map stack trace:', error.stack);
    return error.stack;
  }
  
  // Override history methods
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    const [state, title, url] = args;
    if (url && typeof url === 'string' && (url === '/map' || url.includes('/map?'))) {
      console.log('🚨 history.pushState to /map detected');
      captureStack();
    }
    return originalPushState.apply(this, args);
  };
  
  const originalReplaceState = history.replaceState;
  history.replaceState = function(...args) {
    const [state, title, url] = args;
    if (url && typeof url === 'string' && (url === '/map' || url.includes('/map?'))) {
      console.log('🚨 history.replaceState to /map detected');
      captureStack();
    }
    return originalReplaceState.apply(this, args);
  };
  
  // Add a global click handler to catch all link clicks
  document.addEventListener('click', (e) => {
    setTimeout(() => {
      // Check after the event has been processed if we're navigating to /map
      if (window.location.pathname === '/map') {
        console.log('🚨 Navigation to /map detected after click event');
        captureStack();
      }
    }, 0);
  }, true);
  
  // Monitor URL changes
  let lastUrl = window.location.href;
  const urlObserver = setInterval(() => {
    if (window.location.href !== lastUrl) {
      if (window.location.pathname === '/map') {
        console.log('🚨 URL changed to /map');
        captureStack();
      }
      lastUrl = window.location.href;
    }
  }, 100);
  
  // Also look for any elements with map-related attributes
  setTimeout(() => {
    console.log('🔍 Scanning DOM for map-related elements');
    const mapLinks = document.querySelectorAll('a[href*="/map"]');
    console.log(`Found ${mapLinks.length} links to /map:`, mapLinks);
    
    // Look for onclick handlers that might navigate to map
    const allClickableElements = document.querySelectorAll('button, a, [role="button"], [onclick]');
    console.log(`Scanning ${allClickableElements.length} clickable elements for map-related code`);
    
    Array.from(allClickableElements).forEach(el => {
      const elHtml = el.outerHTML;
      if (elHtml.includes('map') || elHtml.includes('Map')) {
        console.log('🔍 Found potential map-related element:', el);
      }
    });
  }, 2000);
  
  console.log('✅ Navigation tracer installed');
} 