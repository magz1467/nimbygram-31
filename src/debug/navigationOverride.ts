
/**
 * Utility for intercepting and logging navigation events
 */

export const initNavigationOverride = () => {
  if (typeof window === 'undefined') return;

  // Define a global object to store navigation utilities
  if (!window.navigationUtils) {
    window.navigationUtils = {
      navigateOverride: () => {},
      navigationListeners: []
    };
  }

  // Override the navigate function
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    // Call original function
    originalPushState.apply(this, args);
    
    // Dispatch a custom event that our code can listen to
    const event = new CustomEvent('navigationEvent', { detail: args });
    window.dispatchEvent(event);
    
    // Notify listeners
    if (window.navigationUtils && window.navigationUtils.navigationListeners) {
      window.navigationUtils.navigationListeners.forEach(listener => {
        try {
          listener(args);
        } catch (e) {
          console.error('Navigation listener error:', e);
        }
      });
    }
  };
};

// Add TypeScript declaration for window object
declare global {
  interface Window {
    navigationUtils: {
      navigateOverride: (url: string) => void;
      navigationListeners: ((args: any[]) => void)[];
    };
  }
}

// Re-export for convenience
export default initNavigationOverride;
