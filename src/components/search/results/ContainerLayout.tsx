
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
      relative 
      ${shouldShowMap && !isMobile ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'block'}
    `}>
      {children}
    </div>
  );
};
