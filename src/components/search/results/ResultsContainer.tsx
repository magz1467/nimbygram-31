
import { useState, useEffect } from "react";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { MapViewLayout } from "@/components/map/MapViewLayout";
import { Application } from "@/types/planning";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
    isMobile,
    shouldShowMap
  });
  
  useEffect(() => {
    if (shouldShowMap) {
      if (isMobile) {
        setContainerClass("w-full px-0 py-4");
      } else {
        setContainerClass("grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8");
      }
    } else {
      setContainerClass("container mx-auto px-4 py-8");
    }
  }, [shouldShowMap, isMobile]);
  
  // Helper function to handle "See on Map" clicks
  const handleSeeOnMap = (id: number) => {
    console.log('🗺️ See on Map clicked for ID:', id);
    
    if (!hasCoordinates) {
      toast({
        title: "Map error",
        description: "Unable to show the map. Location coordinates not found.",
        variant: "destructive"
      });
      return;
    }
    
    setShowMap(true);
    setSelectedId(id);
    handleMarkerClick(id);
    
    if (isMobile) {
      // On mobile, scroll to make sure map is visible
      setTimeout(() => {
        const mapElement = document.querySelector('.mobile-map-container');
        mapElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Handler for retrying the search
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // Map container style for mobile
  const mapContainerStyle = isMobile && shouldShowMap
    ? { height: 'calc(100vh - 180px)', width: '100%' }
    : { height: '700px' };

  return (
    <div className={containerClass}>
      {/* On mobile, if map is shown, display it first */}
      {isMobile && shouldShowMap && coordinates && (
        <div 
          className="mobile-map-container relative w-full overflow-hidden border shadow rounded-lg mb-6"
          style={mapContainerStyle}
        >
          <button 
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-50 bg-white p-2 rounded-full shadow hover:bg-gray-100"
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
      
      {/* Application list */}
      <div className={shouldShowMap && !isMobile ? "col-span-1" : ""}>
        <SearchResultsList 
          applications={displayApplications}
          isLoading={isLoading}
          onSeeOnMap={handleSeeOnMap}
          searchTerm={searchTerm}
          onRetry={handleRetry}
        />
      </div>
      
      {/* Desktop map layout */}
      {!isMobile && shouldShowMap && coordinates && (
        <div className="col-span-1 relative rounded-lg overflow-hidden border shadow" style={mapContainerStyle}>
          <button 
            onClick={() => setShowMap(false)}
            className="absolute top-2 right-2 z-50 bg-white p-2 rounded-full shadow hover:bg-gray-100"
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
