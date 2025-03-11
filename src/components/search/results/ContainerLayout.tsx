
import React from "react";

interface ContainerLayoutProps {
  children: React.ReactNode;
  shouldShowMap: boolean;
  isMobile: boolean;
}

export const ContainerLayout = ({ 
  children, 
  shouldShowMap,
  isMobile
}: ContainerLayoutProps) => {
  return (
    <div className={`
      relative max-w-5xl mx-auto px-4 
      ${shouldShowMap && !isMobile ? 'lg:grid lg:grid-cols-2 lg:gap-6' : ''}
    `}>
      {children}
    </div>
  );
};
