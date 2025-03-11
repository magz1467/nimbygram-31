
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ErrorMessage } from "./components/ErrorMessage";
import { ResultsContainer } from "./ResultsContainer";
import { ResultsHeader } from "./ResultsHeader";
import { Application } from "@/types/planning";
import { SearchFilters } from "@/hooks/planning/use-planning-search";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/use-error-handler";

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
  error?: Error | null;
  onRetry?: () => void;
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
  coordinates,
  error,
  onRetry
}: SearchViewContentProps) => {
  const hasResultsRef = useRef(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [isLongLoadingDetected, setIsLongLoadingDetected] = useState(false);
  const { toast } = useToast();
  const { ErrorType, isNonCritical } = useErrorHandler();

  // Track if we have results in the ref for later use
  useEffect(() => {
    hasResultsRef.current = applications && applications.length > 0;
  }, [applications]);

  // Call onSearchComplete when loading is done
  useEffect(() => {
    if (onSearchComplete && !isLoading) {
      onSearchComplete();
    }
  }, [isLoading, onSearchComplete]);

  // Reset to first page with new search results
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

  // Show timeout error message
  const isTimeoutError = error && (
    error.message.includes('timeout') || 
    error.message.includes('57014') || 
    error.message.includes('canceling statement')
  );

  // Has partial results even with error
  const hasPartialResults = applications && applications.length > 0;

  // If error but we have some results, show message but also the partial results
  useEffect(() => {
    if (error && hasPartialResults && isNonCritical(error)) {
      toast({
        title: "Showing partial results",
        description: "We found some results, but couldn't retrieve everything. Try refining your search.",
        variant: "warning",
      });
    }
  }, [error, hasPartialResults, toast, isNonCritical]);

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

      {error && !hasPartialResults && (
        <div className="px-4 lg:px-6 mt-4">
          <ErrorMessage 
            title={isTimeoutError ? "Search timeout" : "Error loading results"}
            message={isTimeoutError 
              ? `The search for "${initialSearch.displayTerm || initialSearch.searchTerm}" is taking too long. Please try a more specific location or use filters.`
              : error.message
            }
            onRetry={onRetry}
          />
        </div>
      )}

      {(applications.length > 0 || isLoading) && (
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
      )}

      {error && hasPartialResults && (
        <div className="px-4 mt-4 mb-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            <p className="font-medium mb-1">Showing partial results</p>
            <p>We found {applications.length} planning applications, but there might be more. Try refining your search criteria.</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry} 
                className="mt-2 bg-white"
              >
                <RotateCcw className="mr-1 h-3 w-3" /> Try again
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
