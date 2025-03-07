
import { ReactNode, useEffect, useState } from "react";

interface ContainerLayoutProps {
  shouldShowMap: boolean;
  isMobile: boolean;
  children: ReactNode;
}

export const ContainerLayout = ({
  shouldShowMap,
  isMobile,
  children,
}: ContainerLayoutProps) => {
  const [containerClass, setContainerClass] = useState("container mx-auto px-4 py-8");
  
  useEffect(() => {
    if (shouldShowMap) {
      if (isMobile) {
        // On mobile, full-width layout for map
        setContainerClass("w-full h-full px-0 pt-0 pb-4");
        
        // Prevent body scrolling when map is visible
        document.body.style.overflow = 'hidden';
      } else {
        // On desktop, grid layout for side-by-side display
        setContainerClass("grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8");
      }
    } else {
      // Default container for regular view
      setContainerClass("container mx-auto px-4 py-8");
      document.body.style.overflow = '';
    }
    
    return () => {
      // Clean up when component unmounts
      document.body.style.overflow = '';
    };
  }, [shouldShowMap, isMobile]);

  return (
    <div className={containerClass} style={isMobile && shouldShowMap ? {height: 'calc(100vh - 120px)'} : {}}>
      {children}
    </div>
  );
};
