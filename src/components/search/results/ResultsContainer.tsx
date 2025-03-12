
import { Application } from "@/types/planning";
import { ResultsListView } from "./ResultsListView";
import { useState } from "react";
import { MapSplitView } from "./components/MapSplitView";

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

  // Simple implementation that focuses on showing the list view
  const onSeeOnMap = (id: number) => {
    setSelectedId(id);
    // In a real implementation we might integrate with a map view here
    console.log(`See on map clicked for application: ${id}`);
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

  // Show the map split view if showMap is true
  if (showMap && coordinates && displayApplications.length > 0) {
    return (
      <MapSplitView
        applications={displayApplications}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        coordinates={coordinates}
        searchTerm={searchTerm}
        onMarkerClick={handleMarkerClick}
        onToggleMapView={() => setShowMap(false)}
        isLoading={isLoading}
        hasPartialResults={hasPartialResults}
        isSearchInProgress={isSearchInProgress}
        onRetry={handleRetry}
      />
    );
  }

  // Otherwise show the standard list view
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
