
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
    // Log device detection
    console.log('📱 Device Detection:', { 
      isMobile, 
      path: location.pathname,
      windowWidth: window.innerWidth,
      userAgent: navigator.userAgent
    });
    
    // Only add meta tag for mobile - no page reloading
    if (isMobile) {
      console.log('📱 Setting mobile viewport meta tag');
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        const previousContent = metaViewport.getAttribute('content');
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        console.log('📱 Updated viewport meta:', { 
          from: previousContent, 
          to: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' 
        });
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
        console.log('📱 Created new viewport meta tag');
      }
    }
  }, [isMobile, location.pathname]);

  return <>{children}</>;
};
