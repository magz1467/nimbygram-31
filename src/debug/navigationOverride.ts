
export function installNavigationOverride() {
  console.log('🔧 Installing navigation override');
  
  // Create a custom event for navigation
  const triggerNavigation = (url: string) => {
    const event = new CustomEvent('customNavigation', { 
      detail: { url } 
    });
    window.dispatchEvent(event);
  };
  
  // Add this to window for debugging
  interface NavigationUtils {
    navigateTo: (url: string) => void;
  }
  
  // Extend Window interface
  declare global {
    interface Window {
      navigationUtils?: NavigationUtils;
    }
  }
  
  // Set navigation utils on window
  window.navigationUtils = {
    navigateTo: (url: string) => {
      console.log(`🧭 Custom navigation to: ${url}`);
      triggerNavigation(url);
      // Use the original method instead of trying to override it
      window.location.href = url;
    }
  };
  
  // Listen for navigation events
  window.addEventListener('customNavigation', (e: Event) => {
    const customEvent = e as CustomEvent;
    console.log(`🧭 Navigation event detected: ${customEvent.detail?.url}`);
  });
  
  console.log('✅ Navigation override installed safely');
  return true;
}
