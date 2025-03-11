
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
  // Simple implementation that focuses on showing the list view
  const onSeeOnMap = (id: number) => {
    setSelectedId(id);
    // In a real implementation we might integrate with a map view here
    console.log(`See on map clicked for application: ${id}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

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
    />
  );
};
