
import { Application } from "@/types/planning";
import { ResultsList } from "./ResultsList";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { useState, useCallback, useEffect, useRef } from "react";

interface MapSplitViewProps {
  applications: Application[];
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  coordinates: [number, number];
  searchTerm?: string;
  onMarkerClick: (id: number) => void;
  onToggleMapView: () => void;
  isLoading: boolean;
  hasPartialResults?: boolean;
  isSearchInProgress?: boolean;
  onRetry?: () => void;
}

export const MapSplitView = ({
  applications,
  selectedId,
  setSelectedId,
  coordinates,
  searchTerm,
  onMarkerClick,
  onToggleMapView,
  isLoading,
  hasPartialResults,
  isSearchInProgress,
  onRetry
}: MapSplitViewProps) => {
  const listContainerRef = useRef<HTMLDivElement>(null);
  
  // Get the selected application or null if none is selected
  const selectedApplication = selectedId 
    ? applications.find(app => app.id === selectedId) 
    : null;
  
  // Applications to display - either just the selected one or all if none selected
  const displayedApplications = selectedApplication 
    ? [selectedApplication] 
    : applications.slice(0, 10);

  // Handle clicking on a marker or application in the list
  const handleApplicationSelect = useCallback((id: number) => {
    setSelectedId(id);
    onMarkerClick(id);
  }, [setSelectedId, onMarkerClick]);

  // Load more applications button handler
  const handleLoadMore = useCallback(async () => {
    if (!selectedApplication) {
      const currentCount = displayedApplications.length;
      const nextBatch = applications.slice(0, currentCount + 10);
      return Promise.resolve();
    }
    return Promise.resolve();
  }, [applications, displayedApplications, selectedApplication]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      {/* Left side - Selected application or Results list */}
      <div className="overflow-y-auto border rounded-lg bg-white" ref={listContainerRef}>
        <div className="sticky top-0 bg-white p-3 border-b flex justify-between items-center z-10">
          <h2 className="font-medium">
            {selectedApplication 
              ? 'Selected Application' 
              : `${applications.length} ${applications.length === 1 ? 'result' : 'results'}`}
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleMapView}
            className="flex items-center gap-1.5"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
        </div>
        
        <div className="divide-y">
          {displayedApplications.map((app) => (
            <div 
              key={app.id}
              data-application-id={app.id}
              className={`p-4 cursor-pointer transition-colors ${selectedId === app.id ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleApplicationSelect(app.id)}
            >
              <ResultsList
                loadedApplications={[app]}
                applications={[app]}
                allApplications={applications}
                onSeeOnMap={handleApplicationSelect}
                selectedId={selectedId}
                coordinates={coordinates}
                handleMarkerClick={handleApplicationSelect}
                isLoading={isLoading}
                postcode={searchTerm || ""}
                isLastPage={true}
                onRetry={onRetry}
                handleLoadMore={handleLoadMore}
                hideControls={true}
              />
            </div>
          ))}
        </div>
        
        {!selectedApplication && displayedApplications.length < applications.length && (
          <div className="p-4 text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleLoadMore()}
              className="w-full"
            >
              Load More ({displayedApplications.length} of {applications.length})
            </Button>
          </div>
        )}
      </div>

      {/* Right side - Map view */}
      <div className="relative h-full border rounded-lg overflow-hidden">
        <MapView
          applications={applications}
          selectedId={selectedId}
          coordinates={coordinates}
          onMarkerClick={handleApplicationSelect}
        />
      </div>
    </div>
  );
};
