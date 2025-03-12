
import { Application } from "@/types/planning";
import { ResultsList } from "./ResultsList";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import { MapView } from "@/components/applications/dashboard/components/MapView";
import { useState, useCallback } from "react";

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
  const [displayedApplications, setDisplayedApplications] = useState<Application[]>(
    applications.slice(0, 10)
  );

  const handleLoadMore = useCallback(async () => {
    // Load 10 more applications
    const currentCount = displayedApplications.length;
    const nextBatch = applications.slice(0, currentCount + 10);
    setDisplayedApplications(nextBatch);
    return Promise.resolve();
  }, [applications, displayedApplications]);

  // Handle clicking on a marker or application in the list
  const handleApplicationSelect = useCallback((id: number) => {
    setSelectedId(id);
    onMarkerClick(id);
  }, [setSelectedId, onMarkerClick]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      {/* Left side - Results list */}
      <div className="overflow-y-auto border rounded-lg bg-white">
        <div className="sticky top-0 bg-white p-3 border-b flex justify-between items-center z-10">
          <h2 className="font-medium">
            {applications.length} {applications.length === 1 ? 'result' : 'results'}
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
        <ResultsList
          loadedApplications={displayedApplications}
          applications={applications}
          allApplications={applications}
          onSeeOnMap={handleApplicationSelect}
          selectedId={selectedId}
          coordinates={coordinates}
          handleMarkerClick={handleApplicationSelect}
          isLoading={isLoading}
          postcode={searchTerm || ""}
          isLastPage={displayedApplications.length >= applications.length}
          onRetry={onRetry}
          handleLoadMore={handleLoadMore}
        />
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
