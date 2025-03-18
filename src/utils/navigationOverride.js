// Simple implementation of navigationOverride
export function installNavigationOverride() {
  console.log('Navigation override installed');
  
  // Original pushState and replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  // Override pushState
  history.pushState = function(...args) {
    console.log('Navigation: pushState', args[2]);
    return originalPushState.apply(this, args);
  };
  
  // Override replaceState
  history.replaceState = function(...args) {
    console.log('Navigation: replaceState', args[2]);
    return originalReplaceState.apply(this, args);
  };
  
  // Return a cleanup function
  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
} 