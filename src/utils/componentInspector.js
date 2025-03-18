// Simple implementation of componentInspector
export function installComponentInspector() {
  console.log('Component inspector installed');
  
  // This would normally add debugging tools for React components
  // For this simple implementation, we'll just log render times
  
  // Return a cleanup function
  return () => {
    console.log('Component inspector uninstalled');
  };
} 