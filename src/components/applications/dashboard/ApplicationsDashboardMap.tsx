import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardHeader } from "./components/DashboardHeader";
import { SearchSection } from "./components/SearchSection";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { useDashboardState } from "@/hooks/use-dashboard-state";
import { useEffect } from "react";
import { MapContent } from "./components/MapContent";
import { SidebarContent } from "./components/SidebarContent";
import { useSearchPoint } from "@/hooks/use-search-point";

export const ApplicationsDashboardMap = () => {
  const isMobile = useIsMobile();
  const { searchPoint, setSearchPoint } = useSearchPoint();
  const {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    setIsMapView,
    postcode,
    coordinates,
    isLoading,
    applications,
    filteredApplications,
    statusCounts,
    handleMarkerClick,
    handleFilterChange,
    handlePostcodeSelect,
    handleSortChange,
  } = useDashboardState();

  // Select first application by default when applications are loaded, but only on mobile and in map view
  useEffect(() => {
    if (isMobile && filteredApplications?.length > 0 && !selectedId && isMapView) {
      handleMarkerClick(filteredApplications[0].id);
    }
  }, [filteredApplications, selectedId, handleMarkerClick, isMapView, isMobile]);

  const handleClose = () => {
    handleMarkerClick(null);
  };

  // Update searchPoint when coordinates change
  useEffect(() => {
    if (coordinates) {
      setSearchPoint(coordinates);
    }
  }, [coordinates, setSearchPoint]);

  // Show loading only when loading and no applications
  const showLoading = isLoading && (!applications || applications.length === 0);

  return (
    <div className="h-screen w-full flex flex-col relative">
      <DashboardHeader />

      <SearchSection 
        onPostcodeSelect={handlePostcodeSelect}
        onFilterChange={coordinates ? handleFilterChange : undefined}
        onSortChange={handleSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        isMapView={isMapView}
        onToggleView={isMobile ? () => {
          setIsMapView(!isMapView);
          // Clear selection when switching to list view
          if (isMapView) {
            handleMarkerClick(null);
          }
        } : undefined}
        applications={applications}
        statusCounts={statusCounts}
      />

      <div className="flex-1 relative w-full">
        <div className="absolute inset-0 flex" style={{ zIndex: 10 }}>
          <SidebarContent
            isMobile={isMobile}
            isMapView={isMapView}
            applications={filteredApplications || []}
            selectedId={selectedId}
            postcode={postcode}
            coordinates={coordinates as [number, number]}
            activeFilters={activeFilters}
            activeSort={activeSort}
            statusCounts={statusCounts}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSelectApplication={handleMarkerClick}
            onClose={handleClose}
          />

          {(!isMobile || isMapView) && coordinates && (
            <MapContent
              applications={filteredApplications || []}
              selectedId={selectedId}
              coordinates={coordinates as [number, number]}
              isMobile={isMobile}
              isMapView={isMapView}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>
      </div>

      {showLoading && <LoadingOverlay />}
    </div>
  );
};