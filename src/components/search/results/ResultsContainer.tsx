
import { useState, useEffect } from "react";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { Application } from "@/types/planning";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsContainerProps {
  displayApplications: Application[];
  applications: Application[];
  coordinates: [number, number] | null;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  handleMarkerClick: (id: number) => void;
  isLoading: boolean;
  searchTerm?: string;
  onRetry?: () => void;
}

export const ResultsContainer = ({
  displayApplications = [],
  applications = [],
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  isLoading,
  searchTerm,
  onRetry
}: ResultsContainerProps) => {
  const isMobile = useIsMobile();
  const [containerClass, setContainerClass] = useState("container mx-auto px-4 py-8");
  
  const hasCoordinates = Boolean(coordinates);
  const hasApplications = applications.length > 0;

  // Determine if we should show the map
  const shouldShowMap = showMap && hasCoordinates && hasApplications;
  
  console.log("🌍 Map visibility state:", {
    showMap,
    hasCoordinates,
    coordinates,
    selectedId,
    applications: applications.length,
    isLoading,
    isMobile
  });
  
  console.log("🎯 Should show map?", {
    shouldShowMap,
    conditions: {
      showMap,
      hasCoordinates,
      hasApplications
    }
  });
  
  useEffect(() => {
    if (shouldShowMap) {
      setContainerClass("grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8");
    } else {
      setContainerClass("container mx-auto px-4 py-8");
    }
  }, [shouldShowMap]);
  
  // Helper function to handle "See on Map" clicks
  const handleSeeOnMap = (id: number) => {
    setShowMap(true);
    setSelectedId(id);
    handleMarkerClick(id);
  };
  
  // Handler for retrying the search
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className={containerClass}>
      <div className={shouldShowMap ? "col-span-1" : ""}>
        <SearchResultsList 
          applications={displayApplications}
          isLoading={isLoading}
          onSeeOnMap={handleSeeOnMap}
          searchTerm={searchTerm}
          onRetry={handleRetry}
        />
      </div>
      
      {shouldShowMap && coordinates && (
        <div className="col-span-1 relative h-[700px] rounded-lg overflow-hidden border shadow">
          <button 
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100"
            aria-label="Close map"
          >
            ✕
          </button>
          <MapViewLayout 
            applications={applications}
            selectedId={selectedId}
            postcode=""
            coordinates={coordinates}
            isLoading={isLoading}
            activeFilters={{}}
            activeSort={null}
            onPostcodeSelect={() => {}}
            onFilterChange={() => {}}
            onSortChange={() => {}}
            onMarkerClick={handleMarkerClick}
            onSelectApplication={setSelectedId}
          />
        </div>
      )}
    </div>
  );
};
