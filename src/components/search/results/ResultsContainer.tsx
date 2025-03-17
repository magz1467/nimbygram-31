
import { Application } from "@/types/planning";
import { ResultsListView } from "./ResultsListView";
import { useState, useEffect } from "react";
import { MapSplitView } from "./components/MapSplitView";
import { useNavigate, useLocation } from "react-router-dom";

export interface ResultsContainerProps {
  applications: Application[];
  displayApplications: Application[];
  isLoading: boolean;
  searchTerm?: string;
  displayTerm?: string;
  coordinates?: [number, number] | null;
  showMap: boolean;
  setShowMap: (show: boolean) => void;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  handleMarkerClick: (id: number) => void;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
}

export const ResultsContainer = ({
  applications,
  displayApplications,
  isLoading,
  searchTerm,
  displayTerm,
  coordinates,
  showMap,
  setShowMap,
  selectedId,
  setSelectedId,
  handleMarkerClick,
  hasPartialResults = false,
  isSearchInProgress = false
}: ResultsContainerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();
  const location = useLocation();

  // If showMap is true, navigate to the map page instead
  useEffect(() => {
    if (showMap && coordinates) {
      const params = new URLSearchParams();
      if (searchTerm) params.set('postcode', searchTerm);
      
      // Navigate to the map page with application data preserved
      navigate(`/map?${params.toString()}`, { 
        state: { 
          applications,
          searchTerm: searchTerm,
          coordinates,
          fromList: true // Mark that we came from list view
        } 
      });
      
      // Reset the showMap state after navigation
      setShowMap(false);
    }
  }, [showMap, coordinates, navigate, searchTerm, setShowMap, applications]);

  // Check for incoming state from the map view
  useEffect(() => {
    if (location.state?.fromMap && !applications.length && location.state?.applications?.length) {
      console.log('Restoring applications from map state:', location.state.applications.length);
      // We could dispatch an action here to restore the applications if needed
    }
  }, [location.state, applications.length]);

  // Simple implementation that focuses on showing the list view
  const onSeeOnMap = (id: number) => {
    setSelectedId(id);
    // Navigate to map view with the selected application
    const params = new URLSearchParams();
    if (searchTerm) params.set('postcode', searchTerm);
    
    navigate(`/map?${params.toString()}`, { 
      state: { 
        applications,
        searchTerm: searchTerm,
        coordinates,
        selectedId: id,
        fromList: true
      } 
    });
  };

  // Modified to not cause page reloads
  const handleRetry = () => {
    // Instead of reloading the whole page, we can emit an event or use a callback
    console.log("Retry search requested");
    // Only reload if explicitly requested by user interaction
    // The automatic reloading after results are found has been removed
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages based on the number of applications
  const totalPages = Math.ceil(displayApplications.length / pageSize);

  // Show only the list view since map view will be handled by navigation
  return (
    <ResultsListView
      applications={displayApplications}
      isLoading={isLoading}
      onSeeOnMap={onSeeOnMap}
      searchTerm={searchTerm}
      displayTerm={displayTerm}
      onRetry={handleRetry}
      selectedId={selectedId}
      coordinates={coordinates}
      handleMarkerClick={handleMarkerClick}
      allApplications={applications}
      postcode={searchTerm}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      totalCount={displayApplications.length}
      hasPartialResults={hasPartialResults}
      isSearchInProgress={isSearchInProgress}
    />
  );
};
