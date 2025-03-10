
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DashboardLayout } from "./components/DashboardLayout";
import { useLocation } from "react-router-dom";
import { useApplicationState } from "@/hooks/applications/use-application-state";
import { useEffect } from "react";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";

export const ApplicationsDashboardMap = () => {
  const location = useLocation();
  const searchPostcode = location.state?.postcode;
  
  const {
    selectedId,
    activeFilters,
    activeSort,
    showMap,
    setShowMap,
    searchTerm,
    coordinates,
    isLoading,
    applications,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  } = useApplicationState();

  // Use filtered applications hook
  const { applications: filteredApplications } = useFilteredApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates
  );

  // Log coordinates for debugging
  useEffect(() => {
    if (coordinates) {
      console.log('🌍 Dashboard Map Component received coordinates:', coordinates);
    }
  }, [coordinates]);

  // Select first application when applications are loaded on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && filteredApplications?.length > 0 && !selectedId && !isLoading) {
      handleMarkerClick(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedId, isLoading, handleMarkerClick]);

  return (
    <ErrorBoundary>
      <DashboardLayout
        applications={applications}
        selectedId={selectedId}
        isMapView={showMap}
        coordinates={coordinates as [number, number]}
        activeFilters={activeFilters}
        activeSort={activeSort}
        postcode={searchTerm}
        isLoading={isLoading}
        filteredApplications={filteredApplications}
        handleMarkerClick={handleMarkerClick}
        handleFilterChange={handleFilterChange}
        handlePostcodeSelect={(postcode) => {
          // This is a simplified handler - additional implementation might be needed
          console.log('Postcode selected:', postcode);
        }}
        handleSortChange={handleSortChange}
        setIsMapView={setShowMap}
      />
    </ErrorBoundary>
  );
};
