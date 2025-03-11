
import { useEffect } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";
import { ErrorType } from "@/utils/errors";

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
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(
    initialSearch?.searchTerm || ''
  );

  const { 
    applications, 
    isLoading: isLoadingResults,
    error: searchError,
    filters,
    setFilters
  } = usePlanningSearch(coordinates);

  // Combine errors from coordinates and search
  const error = coordsError || searchError;

  useEffect(() => {
    // Only propagate meaningful errors, not infrastructure setup messages
    if (onError && error && !isNonCriticalError(error)) {
      console.log('🚨 Search error:', error);
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    if (!isLoadingResults && !isLoadingCoords && onSearchComplete) {
      onSearchComplete();
    }
  }, [isLoadingResults, isLoadingCoords, onSearchComplete]);

  // Helper to check if the error is a non-critical infrastructure message
  function isNonCriticalError(err: any): boolean {
    return err?.message?.toLowerCase()?.includes('support table') || false;
  }

  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  // Only show error view for real errors, not infrastructure messages
  if (error && !isNonCriticalError(error) && !applications.length) {
    // Determine error type for proper display
    let errorType = ErrorType.UNKNOWN;
    
    if (error.type) {
      // If the error already has a type property, use it
      errorType = error.type;
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
        onRetry={() => window.location.reload()}
      />
    );
  }

  const isLoading = isLoadingCoords || isLoadingResults;

  return (
    <SearchViewContent
      initialSearch={initialSearch}
      applications={applications}
      isLoading={isLoading}
      filters={filters}
      onFilterChange={(type, value) => {
        setFilters({ ...filters, [type]: value });
      }}
      onError={onError}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
