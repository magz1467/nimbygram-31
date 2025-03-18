
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();

  // Track location changes
  useEffect(() => {
    console.log('🔍 Navigation detected to:', location.pathname + location.search);
  }, [location]);

  // Monkey patch the navigate function to log all navigations
  useEffect(() => {
    const originalNavigate = navigate;
    
    // @ts-ignore - Overriding for debugging
    window.navigate = (...args: any[]) => {
      console.log('🔍 Navigate called with:', args);
      return originalNavigate(...args);
    };

    // Also track history API usage
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      console.log('🔍 history.pushState called with:', args);
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      console.log('🔍 history.replaceState called with:', args);
      return originalReplaceState.apply(this, args);
    };

    // Track link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link) {
        console.log('🔍 Link clicked:', link.href);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      // @ts-ignore - Cleanup
      window.navigate = originalNavigate;
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      document.removeEventListener('click', handleClick);
    };
  }, [navigate]);

  return null;
}
