
import { useEffect, useState } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";
import { ErrorType, AppError } from "@/utils/errors";
import { detectErrorType } from "@/utils/errors/detection";
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';

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
  const { toast } = useToast();
  const { handleError: handleAppError } = useErrorHandler();
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);
  
  // Start timing when initialSearch changes
  useEffect(() => {
    if (initialSearch?.searchTerm) {
      setSearchStartTime(Date.now());
    }
  }, [initialSearch?.searchTerm]);
  
  const { coordinates, isLoading: isLoadingCoords } = useCoordinates(
    initialSearch?.searchTerm || ''
  );

  const { 
    applications, 
    isLoading: isLoadingResults,
    error,
    filters,
    setFilters
  } = usePlanningSearch(coordinates);

  // Log search performance metrics when search completes
  useEffect(() => {
    if (!isLoadingResults && !isLoadingCoords && searchStartTime) {
      const searchDuration = Date.now() - searchStartTime;
      console.log(`Search completed in ${searchDuration}ms`);
      
      // If search is slow (> 3s), log it for performance tracking
      if (searchDuration > 3000) {
        console.info('Slow search metrics:', {
          duration: searchDuration,
          resultsCount: applications?.length || 0,
          searchTerm: initialSearch?.searchTerm,
          coordinates
        });
      }
      
      // Reset the timer
      setSearchStartTime(null);
    }
  }, [isLoadingResults, isLoadingCoords, searchStartTime, applications?.length, initialSearch?.searchTerm, coordinates]);

  useEffect(() => {
    // Only propagate meaningful errors, not infrastructure setup messages
    if (onError && error && !error.message?.toLowerCase().includes('support table')) {
      console.log('🚨 Search error:', error);
      
      // Handle the error to show a toast
      handleAppError(error, {
        context: 'search',
        silent: true // Don't show duplicate toast, SearchErrorView will handle display
      });
      
      // Propagate the error up to the parent component
      onError(error);
    }
  }, [error, onError, handleAppError]);

  useEffect(() => {
    if (!isLoadingResults && !isLoadingCoords && onSearchComplete) {
      onSearchComplete();
    }
  }, [isLoadingResults, isLoadingCoords, onSearchComplete]);

  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  // Only show error view for real errors, not infrastructure messages
  if (error && !error.message?.toLowerCase().includes('support table') && !applications.length) {
    // Determine error type for proper display
    let errorType = ErrorType.UNKNOWN;
    
    // Check if error is an AppError type that has the type property
    if ((error as AppError).type !== undefined) {
      errorType = (error as AppError).type;
    } else {
      // Use the detectErrorType utility to determine the error type
      errorType = detectErrorType(error);
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
