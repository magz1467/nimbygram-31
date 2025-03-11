
import { Application } from "@/types/planning";
import { ResultsListView } from "./ResultsListView";
import { useState } from "react";

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
  handleMarkerClick
}: ResultsContainerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const onSeeOnMap = (id: number) => {
    setSelectedId(id);
    console.log(`See on map clicked for application: ${id}`);
    
    // Find the selected application to get its coordinates
    const selectedApp = applications.find(app => app.id === id);
    if (selectedApp) {
      console.log('Found application with coordinates:', selectedApp.coordinates);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate total pages based on the number of applications
  const totalPages = Math.ceil(displayApplications.length / pageSize);

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
    />
  );
};
