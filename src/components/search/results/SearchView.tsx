
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
import { supabase } from "@/integrations/supabase/client";

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
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);
  
  // Start timing when initialSearch changes
  useEffect(() => {
    if (initialSearch?.searchTerm) {
      setSearchStartTime(Date.now());
      setHasInitialData(false);
    }
  }, [initialSearch?.searchTerm]);
  
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(
    initialSearch?.searchTerm || ''
  );

  const { 
    applications, 
    isLoading: isLoadingResults,
    error: searchError,
    filters,
    setFilters,
    refetch
  } = usePlanningSearch(coordinates);

  // Set hasInitialData when we first get applications
  useEffect(() => {
    if (applications.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [applications, hasInitialData]);

  // Handle coordinates error
  useEffect(() => {
    if (coordsError && onError) {
      console.error('Coordinates error:', coordsError);
      handleAppError(coordsError, {
        context: 'location',
        silent: false,
      });
      onError(coordsError);
    }
  }, [coordsError, onError, handleAppError]);

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
    if (onError && searchError && 
        !searchError.message?.toLowerCase().includes('support table') &&
        !hasInitialData) { // Don't show error if we have some results
      console.log('🚨 Search error:', searchError);
      
      // Handle the error to show a toast
      handleAppError(searchError, {
        context: 'search',
        silent: true // Don't show duplicate toast, SearchErrorView will handle display
      });
      
      // Propagate the error up to the parent component
      onError(searchError);
    }
  }, [searchError, onError, handleAppError, hasInitialData]);

  useEffect(() => {
    if (!isLoadingResults && !isLoadingCoords && onSearchComplete) {
      onSearchComplete();
    }
  }, [isLoadingResults, isLoadingCoords, onSearchComplete]);

  // Emergency data fetching if all else fails
  const handleEmergencyRetry = async () => {
    setIsRetrying(true);
    try {
      // Try the simplest possible query to get SOME data
      const { data } = await supabase
        .from('crystal_roof')
        .select('*')
        .limit(20)
        .order('id', { ascending: false });
        
      if (data && data.length > 0) {
        toast({
          title: "Showing recent applications",
          description: "We retrieved some recent applications while we work on fixing search.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Even emergency retry failed:', err);
    } finally {
      setIsRetrying(false);
      refetch(); // Try normal search again
    }
  };

  // Retry search with broader parameters if we get a timeout error
  const handleRetry = () => {
    setIsRetrying(true);
    console.log('Retrying search...');
    refetch().finally(() => setIsRetrying(false));
  };

  if (!initialSearch?.searchTerm) {
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  // Check if we have applications even when there's an error - show them if we do
  if (applications && applications.length > 0) {
    // Show content view if we have data, even if there was an error
    const isLoading = isLoadingCoords || isLoadingResults || isRetrying;
    
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
        coordinates={coordinates}
      />
    );
  }

  // Show error view only for real errors with no results
  const error = searchError || coordsError;
  if (error && !error.message?.toLowerCase().includes('support table')) {
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
        onRetry={errorType === ErrorType.TIMEOUT ? handleEmergencyRetry : handleRetry}
        isRetrying={isRetrying}
      />
    );
  }

  const isLoading = isLoadingCoords || isLoadingResults || isRetrying;

  // Show content view even with no applications in loading state
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
      coordinates={coordinates}
    />
  );
};
