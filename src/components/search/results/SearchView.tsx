
import { useEffect, useRef, useState } from 'react';
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
  // Use a ref to prevent multiple error callbacks
  const hasReportedError = useRef(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  
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

  // Helper to check if the error is a non-critical infrastructure message
  function isNonCriticalError(err: any): boolean {
    if (!err) return true;
    
    const errorMessage = err.message ? err.message.toLowerCase() : '';
    return (
      errorMessage.includes('support table') || 
      errorMessage.includes('function does not exist') ||
      errorMessage.includes('searches') ||
      errorMessage.includes('get_nearby_applications') ||
      errorMessage.includes('crystal_roof.support_count')
    );
  }

  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
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

  const isLoading = isLoadingCoords || isLoadingResults;

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
