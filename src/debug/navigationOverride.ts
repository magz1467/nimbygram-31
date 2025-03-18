export function installNavigationOverride() {
  console.log('🔧 Installing navigation override');
  
  // Create a custom event for navigation
  const triggerNavigation = (url) => {
    const event = new CustomEvent('customNavigation', { 
      detail: { url } 
    });
    window.dispatchEvent(event);
  };
  
  // Add this to window for debugging
  window.navigationUtils = {
    navigateTo: (url) => {
      console.log(`🧭 Custom navigation to: ${url}`);
      triggerNavigation(url);
      // Use the original method instead of trying to override it
      window.location.href = url;
    }
  };
  
  // Listen for navigation events
  window.addEventListener('customNavigation', (e) => {
    console.log(`🧭 Navigation event detected: ${e.detail.url}`);
  });
  
  console.log('✅ Navigation override installed safely');
} 