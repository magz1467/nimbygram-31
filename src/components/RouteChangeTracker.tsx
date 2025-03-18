
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { logRouteChange } from '@/utils/reloadTracker';

export const RouteChangeTracker = () => {
  // Check if we're in a router context before using router hooks
  try {
    const location = useLocation();
    const navigationType = useNavigationType();
    const previousPathRef = useRef<string>(location.pathname);
    
    useEffect(() => {
      const currentPath = location.pathname;
      const previousPath = previousPathRef.current;
      
      if (previousPath !== currentPath) {
        logRouteChange(previousPath, currentPath, navigationType);
        previousPathRef.current = currentPath;
      }
    }, [location, navigationType]);
    
    // This component doesn't render anything
    return null;
  } catch (error) {
    // Silently catch the error if we're not in a router context
    console.debug('RouteChangeTracker: Not in a router context, skipping');
    return null;
  }
};
