
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Header from "@/components/Header";
import { SearchSection } from "@/components/applications/dashboard/components/SearchSection";
import { SidebarSection } from "@/components/applications/dashboard/components/SidebarSection";
import { MapContent } from "@/components/map/MapContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Application } from "@/types/planning";

interface MapViewLayoutProps {
  applications: Application[];
  selectedId: number | null;
  postcode: string;
  coordinates: [number, number];
  isLoading: boolean;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: 'closingSoon' | 'newest' | null;
  onPostcodeSelect: (postcode: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onSortChange: (sortType: 'closingSoon' | 'newest' | null) => void;
  onMarkerClick: (id: number) => void;
  onSelectApplication: (id: number | null) => void;
}

export const MapViewLayout = ({
  applications,
  selectedId,
  postcode,
  coordinates,
  isLoading,
  activeFilters,
  activeSort,
  onPostcodeSelect,
  onFilterChange,
  onSortChange,
  onMarkerClick,
  onSelectApplication,
}: MapViewLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen">
        <Header />
        <SearchSection 
          onPostcodeSelect={onPostcodeSelect}
          onFilterChange={onFilterChange}
          onSortChange={onSortChange}
          activeFilters={activeFilters}
          activeSort={activeSort}
          isMapView={true}
          applications={applications}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {!isMobile && (
            <SidebarSection
              isMobile={isMobile}
              isMapView={true}
              applications={applications}
              selectedId={selectedId}
              postcode={postcode}
              coordinates={coordinates}
              activeFilters={activeFilters}
              activeSort={activeSort}
              onFilterChange={onFilterChange}
              onSortChange={onSortChange}
              onSelectApplication={onSelectApplication}
              onClose={() => onSelectApplication(null)}
            />
          )}
          
          <div className="flex-1 relative">
            <MapContent 
              applications={applications}
              selectedId={selectedId}
              coordinates={coordinates}
              isMobile={isMobile}
              isMapView={true}
              onMarkerClick={onMarkerClick}
              isLoading={isLoading}
              postcode={postcode}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
