
/**
 * Utility to track and log page reloads and navigation
 */

// Store information about the current page load
const pageLoadInfo = {
  loadCount: 0,
  lastLoadTime: 0,
  loadType: '',
  referrer: '',
  isReload: false,
};

/**
 * Initialize the reload tracker
 * This should be called as early as possible in the application lifecycle
 */
export const initReloadTracker = () => {
  try {
    // Get load info from sessionStorage if it exists
    const storedInfo = sessionStorage.getItem('pageLoadInfo');
    const previousInfo = storedInfo ? JSON.parse(storedInfo) : null;
    
    // Determine if this is a reload
    pageLoadInfo.isReload = !!document.referrer && document.referrer.includes(window.location.host);
    pageLoadInfo.referrer = document.referrer;
    
    // Determine load type
    if (performance.navigation) {
      switch (performance.navigation.type) {
        case 0: // TYPE_NAVIGATE
          pageLoadInfo.loadType = 'navigate';
          break;
        case 1: // TYPE_RELOAD
          pageLoadInfo.loadType = 'reload';
          break;
        case 2: // TYPE_BACK_FORWARD
          pageLoadInfo.loadType = 'back_forward';
          break;
        default:
          pageLoadInfo.loadType = 'other';
      }
    } else {
      // Modern API (performance.navigation is deprecated)
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && navEntries[0] instanceof PerformanceNavigationTiming) {
        pageLoadInfo.loadType = navEntries[0].type;
      }
    }
    
    // Update count and time
    pageLoadInfo.loadCount = previousInfo ? previousInfo.loadCount + 1 : 1;
    pageLoadInfo.lastLoadTime = Date.now();
    
    // Store updated info
    sessionStorage.setItem('pageLoadInfo', JSON.stringify(pageLoadInfo));
    
    // Log the page load info
    console.log('📊 Page Load Tracker:', {
      count: pageLoadInfo.loadCount,
      type: pageLoadInfo.loadType,
      isReload: pageLoadInfo.isReload,
      referrer: pageLoadInfo.referrer,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in reload tracker:', error);
  }
};

/**
 * Log route changes between components
 */
export const logRouteChange = (previousPath: string, currentPath: string, navigationType?: string) => {
  console.log('🧭 Route Change:', {
    from: previousPath,
    to: currentPath,
    navigationType: navigationType || 'unknown',
    timestamp: new Date().toISOString(),
  });
};
