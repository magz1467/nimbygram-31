
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Application } from "@/types/planning";
import { SearchFilters } from "@/hooks/planning/use-planning-search";

interface SearchViewContentProps {
  initialSearch: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  applications: Application[];
  isLoading: boolean;
  filters: SearchFilters;
  onFilterChange: (type: string, value: any) => void;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
  retryCount?: number;
  coordinates?: [number, number] | null;
}

export const SearchViewContent = ({
  initialSearch,
  applications = [],
  isLoading,
  filters,
  onFilterChange,
  onError,
  onSearchComplete,
  retryCount = 0,
  coordinates
}: SearchViewContentProps) => {
  const hasResultsRef = useRef(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [isLongLoadingDetected, setIsLongLoadingDetected] = useState(false);

  useEffect(() => {
    hasResultsRef.current = applications && applications.length > 0;
  }, [applications]);

  useEffect(() => {
    if (onSearchComplete && !isLoading) {
      onSearchComplete();
    }
  }, [isLoading, onSearchComplete]);

  useEffect(() => {
    if (!isLoading && applications.length > 0) {
      setCurrentPage(0);
    }
  }, [applications, isLoading]);

  // Effect to detect long-running searches
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to detect long-running searches (more than 4 seconds)
      const timeoutId = setTimeout(() => {
        setIsLongLoadingDetected(true);
      }, 4000);
      
      // Clean up the timeout if the loading state changes before the timeout
      return () => clearTimeout(timeoutId);
    } else {
      // Reset the long loading state when loading is complete
      setIsLongLoadingDetected(false);
    }
  }, [isLoading]);

  return (
    <div className="max-w-4xl mx-auto pb-16 pt-0">
      <ResultsHeader 
        searchTerm={initialSearch.searchTerm}
        displayTerm={initialSearch.displayTerm}
        resultsCount={applications?.length || 0}
        isLoading={isLoading}
        hasSearched={true}
        activeFilters={filters}
        onFilterChange={onFilterChange}
        applications={applications}
      />

      {isLoading && isLongLoadingDetected && applications.length === 0 && (
        <div className="mx-auto px-4 max-w-lg mt-4 mb-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <h3 className="font-medium mb-1">Still searching...</h3>
            <p className="text-sm mb-2">
              We're searching our database for planning applications. This might take a moment for large areas.
            </p>
            <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 lg:px-6">
        <ResultsContainer
          applications={applications}
          isLoading={isLoading}
          searchTerm={initialSearch.searchTerm}
          displayTerm={initialSearch.displayTerm}
          displayApplications={applications}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={(id) => setSelectedId(id)}
        />
      </div>
    </div>
  );
};
