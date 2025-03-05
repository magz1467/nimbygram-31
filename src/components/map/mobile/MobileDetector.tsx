import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileDetectorProps {
  children: React.ReactNode;
}

export const MobileDetector = ({ children }: MobileDetectorProps) => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Force page reload if coming from cache on mobile
    if (isMobile && window.performance) {
      const forceRefresh = sessionStorage.getItem('forceRefresh') === 'true';
      const isFirstLoad = (
        performance.navigation.type === 0 && 
        document.referrer === '' && 
        sessionStorage.getItem('initialLoadDone') !== 'true'
      );
      
      if (isFirstLoad || forceRefresh) {
        // Set flag to prevent infinite reload
        sessionStorage.setItem('initialLoadDone', 'true');
        sessionStorage.removeItem('forceRefresh');
        
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
      // Only remove initialLoadDone, keep other storage flags
      sessionStorage.removeItem('initialLoadDone');
    };
  }, [isMobile]);

  return <>{children}</>;
};
