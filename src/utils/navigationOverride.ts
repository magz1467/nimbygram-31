/**
 * This utility overrides browser navigation functions to help debug
 * and intercept navigation to the /map URL
 */

export function installNavigationOverride() {
  console.log('🔧 Installing navigation override');
  
  try {
    // Store original functions
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
    
    // Override pushState
    history.pushState = function(...args) {
      const [state, title, url] = args;
      console.log('🔍 history.pushState intercepted:', { state, title, url });
      
      // Check if trying to navigate to /map
      if (url && typeof url === 'string' && (url === '/map' || url.includes('/map?'))) {
        console.log('🛑 Prevented navigation to /map via pushState');
        
        // Instead of navigating, dispatch a custom event that our app can listen for
        window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url } }));
        
        // Return without actually navigating
        return;
      }
      
      return originalPushState.apply(this, args);
    };
    
    // Override replaceState
    history.replaceState = function(...args) {
      const [state, title, url] = args;
      console.log('🔍 history.replaceState intercepted:', { state, title, url });
      
      // Check if trying to navigate to /map
      if (url && typeof url === 'string' && (url === '/map' || url.includes('/map?'))) {
        console.log('🛑 Prevented navigation to /map via replaceState');
        
        // Instead of navigating, dispatch a custom event that our app can listen for
        window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url } }));
        
        // Return without actually navigating
        return;
      }
      
      return originalReplaceState.apply(this, args);
    };
    
    // Store the original methods
    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;
    
    // Create wrapper functions that we'll use instead
    const safeAssign = function(url: string) {
      console.log('🔄 Navigation override: window.location.assign to', url);
      // Call the original method
      originalAssign.call(window.location, url);
    };
    
    const safeReplace = function(url: string) {
      console.log('🔄 Navigation override: window.location.replace to', url);
      // Call the original method
      originalReplace.call(window.location, url);
    };
    
    // Use these wrapper functions in your application
    // You can expose them globally or through a utility
    window.navigationUtils = {
      assign: safeAssign,
      replace: safeReplace
    };
    
    // Also intercept all link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href);
        
        // Check if trying to navigate to /map
        if (url.pathname === '/map' || url.pathname.includes('/map?')) {
          console.log('🔍 Link click intercepted:', link.href);
          console.log('🛑 Prevented navigation to /map via link click');
          
          e.preventDefault();
          e.stopPropagation();
          
          // Instead of navigating, dispatch a custom event that our app can listen for
          window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url: url.pathname + url.search } }));
        }
      }
    }, true);
    
    // Override location.href setter
    if (originalHref && originalHref.set) {
      Object.defineProperty(window.location, 'href', {
        ...originalHref,
        set(url) {
          console.log('🔍 location.href setter intercepted:', url);
          
          // Check if trying to navigate to /map
          if (url && typeof url === 'string' && (url === '/map' || url.includes('/map?'))) {
            console.log('🛑 Prevented navigation to /map via location.href');
            
            // Instead of navigating, dispatch a custom event that our app can listen for
            window.dispatchEvent(new CustomEvent('mapViewRequested', { detail: { url } }));
            
            // Return without actually navigating
            return;
          }
          
          return originalHref.set.call(this, url);
        }
      });
    }
    
    console.log('✅ Navigation override installed safely');
  } catch (error) {
    console.error('❌ Failed to install navigation override:', error);
    // Continue execution even if override fails
  }
} 