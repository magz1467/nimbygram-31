
import { Application } from "@/types/planning";
import { ReactNode } from "react";
import { MapSection } from "./MapSection";
import { SidebarSection } from "./SidebarSection";
import { DashboardHeader } from "./DashboardHeader";
import { LoadingOverlay } from "./LoadingOverlay";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortType } from "@/types/application-types";
import { SearchSection } from "./SearchSection";

interface DashboardLayoutProps {
  applications: Application[];
  selectedId: number | null;
  isMapView: boolean;
  coordinates: [number, number] | null;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
  searchTerm: string;
  isLoading?: boolean;
  filteredApplications: Application[];
  handleMarkerClick: (id: number | null) => void;
  handleFilterChange: (filterType: string, value: string) => void;
  handlePostcodeSelect: (postcode: string) => void;
  handleSortChange: (sortType: SortType) => void;
  setIsMapView: (value: boolean) => void;
  children?: ReactNode;
}

export const DashboardLayout = ({
  applications,
  selectedId,
  isMapView,
  coordinates,
  activeFilters,
  activeSort,
  searchTerm,
  isLoading = false,
  filteredApplications,
  handleMarkerClick,
  handleFilterChange,
  handlePostcodeSelect,
  handleSortChange,
  setIsMapView,
  children
}: DashboardLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden">
      <SearchSection 
        onPostcodeSelect={handlePostcodeSelect}
        applications={applications}
        isMapView={isMapView}
      />
      
      <DashboardHeader 
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={() => setIsMapView(!isMapView)}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        {isLoading && <LoadingOverlay />}
        
        <SidebarSection 
          isMobile={isMobile}
          isMapView={isMapView}
          applications={filteredApplications}
          selectedId={selectedId}
          postcode={searchTerm}
          coordinates={coordinates as [number, number]}
          activeFilters={activeFilters}
          activeSort={activeSort}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSelectApplication={handleMarkerClick}
          onClose={() => handleMarkerClick(null)}
        />
        
        <MapSection 
          isMobile={isMobile}
          isMapView={isMapView}
          coordinates={coordinates}
          applications={filteredApplications}
          selectedId={selectedId}
          dispatch={{
            type: 'SELECT_APPLICATION',
            payload: handleMarkerClick
          }}
          postcode={searchTerm}
        />
      </div>
      
      {children}
    </div>
  );
};
