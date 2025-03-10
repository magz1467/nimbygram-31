
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
    handlePostcodeSelect
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
        searchTerm={searchTerm}
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
          applications={applications}
          activeFilters={activeFilters}
          activeSort={activeSort}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          isMapView={showMap}
        />
        
        <SidebarSection 
          isMobile={isMobile}
          isMapView={showMap}
          applications={filteredApplications}
          selectedId={selectedId}
          postcode={searchTerm}
          coordinates={coordinates || [51.509865, -0.118092]} // Default to London if no coordinates
          activeFilters={activeFilters}
          activeSort={activeSort}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSelectApplication={handleMarkerClick}
          onClose={() => handleMarkerClick(null)}
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
