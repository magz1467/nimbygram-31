
import { ReactNode } from "react";

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
  // For mobile with map, we'll just use a standard container
  // The map will be displayed as an overlay
  const containerClass = "container mx-auto px-4 py-8";

  return (
    <div className={containerClass}>
      {children}
    </div>
  );
};
