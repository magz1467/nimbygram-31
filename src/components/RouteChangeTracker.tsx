
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { logRouteChange } from '@/utils/reloadTracker';

export const RouteChangeTracker = () => {
  const location = useLocation();
  const previousPathRef = useRef<string>(location.pathname);
  
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;
    
    if (previousPath !== currentPath) {
      logRouteChange(previousPath, currentPath);
      previousPathRef.current = currentPath;
    }
  }, [location]);
  
  // This component doesn't render anything
  return null;
};
