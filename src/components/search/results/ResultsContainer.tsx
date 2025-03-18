
import { Application } from "@/types/planning";
import { ResultsListView } from "./ResultsListView";
import { useState, useEffect } from "react";
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

  // Debug logging to check received date
  useEffect(() => {
    if (displayApplications.length > 0) {
      console.log('ResultsContainer - Sample application:', {
        id: displayApplications[0].id,
        received: displayApplications[0].received,
        received_date: displayApplications[0].received_date
      });
    }
  }, [displayApplications]);

  // Modified to display either list view or split view based on showMap
  return showMap && coordinates ? (
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
      onRetry={() => console.log("Retry search requested")}
    />
  ) : (
    <ResultsListView
      applications={displayApplications}
      isLoading={isLoading}
      onSeeOnMap={(id) => {
        setSelectedId(id);
        setShowMap(true);
      }}
      searchTerm={searchTerm}
      displayTerm={displayTerm}
      onRetry={() => console.log("Retry search requested")}
      selectedId={selectedId}
      coordinates={coordinates}
      handleMarkerClick={handleMarkerClick}
      allApplications={applications}
      postcode={searchTerm}
      currentPage={currentPage}
      totalPages={Math.ceil(displayApplications.length / pageSize)}
      onPageChange={setCurrentPage}
      totalCount={displayApplications.length}
      hasPartialResults={hasPartialResults}
      isSearchInProgress={isSearchInProgress}
    />
  );
};
