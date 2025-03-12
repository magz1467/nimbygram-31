import { useEffect, useRef, useState } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";
import { ErrorType } from "@/utils/errors";
import { isNonCriticalError } from "@/utils/errors";
import { LoadingSkeletons } from "./components/LoadingSkeletons";

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  retryCount?: number;
  onError?: (error: Error | null) => void;
  onSearchComplete?: () => void;
}

export const SearchView = ({
  initialSearch,
  retryCount = 0,
  onError,
  onSearchComplete
}: SearchViewProps) => {
  // Use a ref to prevent multiple error callbacks
  const hasReportedError = useRef(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(
    initialSearch?.searchTerm || ''
  );

  const { 
    applications, 
    isLoading: isLoadingResults,
    isFetching,
    error: searchError,
    hasResults,
    filters,
    setFilters
  } = usePlanningSearch(coordinates);

  // Show skeletons for a minimum time to avoid flickering UI
  useEffect(() => {
    if (coordinates && !isLoadingCoords) {
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 1500); // Keep skeleton for at least 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [coordinates, isLoadingCoords]);

  // Combine errors from coordinates and search
  const error = localError || coordsError || searchError;

  useEffect(() => {
    // Store any error in local state to prevent loss during rerenders
    if ((coordsError || searchError) && !localError) {
      setLocalError(coordsError || searchError);
    }
  }, [coordsError, searchError, localError]);

  useEffect(() => {
    // Only propagate meaningful errors, not infrastructure setup messages
    // And only report an error once to prevent loops
    if (onError && error && !isNonCriticalError(error) && !hasReportedError.current) {
      console.log('🚨 Search error:', error);
      hasReportedError.current = true;
      
      // Safely call onError, avoiding state updates during render
      setTimeout(() => {
        onError(error);
      }, 0);
    }
  }, [error, onError]);

  useEffect(() => {
    // Only call onSearchComplete when everything is truly done
    if (!isLoadingResults && !isLoadingCoords && coordinates && applications && onSearchComplete && !hasReportedError.current) {
      // Safely call completion callback
      setTimeout(() => {
        if (onSearchComplete) onSearchComplete();
      }, 0);
    }
  }, [isLoadingResults, isLoadingCoords, coordinates, applications, onSearchComplete]);

  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  // Show loading state when we're still getting coordinates or results
  if ((isLoadingCoords || (isLoadingResults && showSkeleton)) && !hasResults) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Searching for planning applications...</h2>
        <p className="text-gray-600 mb-6">Looking for planning applications near {initialSearch.displayTerm || initialSearch.searchTerm}</p>
        <LoadingSkeletons count={5} isLongSearch={false} />
      </div>
    );
  }

  // Only show error view for real errors, not infrastructure messages
  if (error && !isNonCriticalError(error) && !applications.length) {
    // Determine error type for proper display
    let errorType = ErrorType.UNKNOWN;
    
    if ('type' in error && error.type) {
      // If the error already has a type property, use it
      errorType = error.type as ErrorType;
    } else if (
      error.message?.includes('timeout') || 
      error.message?.includes('too long') ||
      error.message?.includes('canceling statement')
    ) {
      errorType = ErrorType.TIMEOUT;
    } else if (error.message?.includes('network') || !navigator.onLine) {
      errorType = ErrorType.NETWORK;
    } else if (error.message?.includes('not found') || error.message?.includes('no results')) {
      errorType = ErrorType.NOT_FOUND;
    }
    
    return (
      <SearchErrorView 
        errorDetails={error.message}
        errorType={errorType}
        onRetry={() => {
          setLocalError(null);
          hasReportedError.current = false;
          window.location.reload();
        }}
      />
    );
  }

  const isLoading = isLoadingCoords || isLoadingResults || isFetching;

  return (
    <SearchViewContent
      initialSearch={initialSearch}
      applications={applications || []}
      isLoading={isLoading}
      filters={filters}
      onFilterChange={(type, value) => {
        setFilters({ ...filters, [type]: value });
      }}
      onError={(err) => {
        if (err && !isNonCriticalError(err)) {
          setLocalError(err);
        }
      }}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
