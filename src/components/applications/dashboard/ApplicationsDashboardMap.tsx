
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useApplicationState } from "@/hooks/applications/use-application-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardLayout } from "./components/DashboardLayout";
import { SearchSection } from "./components/SearchSection";
import { SidebarSection } from "./components/SidebarSection";
import { MapSection } from "./components/MapSection";
import { LoadingOverlay } from "./components/LoadingOverlay";

const ApplicationsDashboardMap = () => {
  const isMobile = useIsMobile();
  const {
    searchTerm,
    setSearchTerm,
    coordinates,
    applications,
    filteredApplications,
    isLoading,
    selectedId,
    showMap,
    setShowMap,
    handleMarkerClick,
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
    handlePostcodeSelect,
    postcode
  } = useApplicationState();

  return (
    <ErrorBoundary>
      <DashboardLayout
        applications={applications}
        selectedId={selectedId}
        isMapView={showMap}
        coordinates={coordinates}
        activeFilters={activeFilters}
        activeSort={activeSort}
        postcode={postcode || searchTerm}
        isLoading={isLoading}
        filteredApplications={filteredApplications}
        handleMarkerClick={handleMarkerClick}
        handleFilterChange={handleFilterChange}
        handlePostcodeSelect={handlePostcodeSelect}
        handleSortChange={handleSortChange}
        setIsMapView={setShowMap}
      >
        <SearchSection 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onPostcodeSelect={handlePostcodeSelect}
          isLoading={isLoading}
        />
        
        <SidebarSection 
          applications={filteredApplications}
          selectedId={selectedId}
          coordinates={coordinates}
          onSelectApplication={handleMarkerClick}
          activeFilters={activeFilters}
          activeSort={activeSort}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onMapToggle={() => setShowMap(!showMap)}
          isMapView={showMap}
        />
        
        <MapSection 
          isMobile={isMobile}
          isMapView={showMap}
          coordinates={coordinates}
          applications={applications}
          selectedId={selectedId}
          dispatch={{ 
            type: 'SELECT_APPLICATION', 
            payload: handleMarkerClick 
          }}
          postcode={searchTerm}
        />
        
        {isLoading && <LoadingOverlay />}
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default ApplicationsDashboardMap;
