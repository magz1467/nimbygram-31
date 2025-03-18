// Simple implementation of navigationTracer
export function installNavigationTracer() {
  console.log('Navigation tracer installed');
  
  // Listen for navigation events
  window.addEventListener('popstate', () => {
    console.log('Navigation: popstate', window.location.pathname);
  });
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('popstate', () => {});
  };
} 