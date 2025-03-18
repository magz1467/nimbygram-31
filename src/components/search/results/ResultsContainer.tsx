import { Application } from "@/types/planning";
import { ResultsListView } from "./ResultsListView";
import { useState, useEffect } from "react";
import { MapSplitView } from "./components/MapSplitView";
import React from 'react';
import { useSearchState } from "@/hooks/search/useSearchState";

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
  error?: Error | null;
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
  error
}: ResultsContainerProps) => {
  // Access global search state
  const {
    hasPartialResults,
    isSearchInProgress,
    retry,
    loadMore
  } = useSearchState();

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
      onRetry={retry}
    />
  ) : (
    <React.Fragment>
      <ResultsListView
        applications={displayApplications}
        isLoading={isLoading}
        onSeeOnMap={(id) => {
          setSelectedId(id);
          setShowMap(true);
        }}
        searchTerm={searchTerm}
        displayTerm={displayTerm}
        onRetry={retry}
        selectedId={selectedId}
        coordinates={coordinates}
        handleMarkerClick={handleMarkerClick}
        allApplications={applications}
        postcode={searchTerm}
        error={error}
      />
    </React.Fragment>
  );
};
