
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';

interface MobileDetectorProps {
  children: React.ReactNode;
}

export const MobileDetector = ({ children }: MobileDetectorProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  useEffect(() => {
    // Check if we're on search results page to prevent reloads
    const isSearchResultsPage = location.pathname.includes('search-results');
    
    if (isMobile && !isSearchResultsPage) {
      const isFirstLoad = (
        performance.navigation.type === 0 && 
        document.referrer === '' && 
        !sessionStorage.getItem('initialLoadDone')
      );
      
      if (isFirstLoad) {
        // Set flag to prevent infinite reload
        sessionStorage.setItem('initialLoadDone', 'true');
        
        // Add timestamp to force cache bust
        const cacheBustUrl = new URL(window.location.href);
        cacheBustUrl.searchParams.set('t', Date.now().toString());
        
        // Hard reload to get fresh content
        window.location.href = cacheBustUrl.toString();
      }
    }
    
    // Add meta tag for mobile
    if (isMobile) {
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }
    }
    
    return () => {
      // Only remove initialLoadDone on component unmount if not on search results
      if (!isSearchResultsPage) {
        sessionStorage.removeItem('initialLoadDone');
      }
    };
  }, [isMobile, location.pathname]);

  return <>{children}</>;
};
