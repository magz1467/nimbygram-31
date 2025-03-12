
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";
import { ErrorType } from "@/utils/errors";
import { isNonCriticalError } from "@/utils/errors";
import { LoadingSkeletons } from "./components/LoadingSkeletons";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

// Add render counter
const renderCounts = {
  searchView: 0,
  searchViewWithParams: new Map<string, number>()
};

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

// Helper function to get a user-friendly label for the search stage
const getStageLabel = (stage: string | null): string => {
  switch (stage) {
    case 'coordinates':
      return 'Finding location...';
    case 'searching':
      return 'Searching for planning applications...';
    case 'processing':
      return 'Processing results...';
    case 'complete':
      return 'Search complete';
    default:
      return 'Searching...';
  }
};

export const SearchView = ({
  initialSearch,
  retryCount = 0,
  onError,
  onSearchComplete
}: SearchViewProps) => {
  const componentId = useRef(`sv-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const hasReportedError = useRef(false);
  const searchCompleteRef = useRef(false);
  const componentRenders = useRef(0);
  const { toast } = useToast();
  
  // Track renders
  componentRenders.current += 1;
  renderCounts.searchView += 1;
  
  const searchParamsKey = initialSearch ? `${initialSearch.searchTerm}-${initialSearch.timestamp || 0}` : 'no-search';
  renderCounts.searchViewWithParams.set(
    searchParamsKey, 
    (renderCounts.searchViewWithParams.get(searchParamsKey) || 0) + 1
  );
  
  // Memoize the search term to prevent unnecessary coordinate lookups
  const searchTerm = useMemo(() => initialSearch?.searchTerm || '', [initialSearch?.searchTerm]);
  
  // Log render information
  useEffect(() => {
    console.log(`🔍 SearchView [${componentId}] MOUNTED`, {
      mountTime: new Date(mountTimeRef.current).toISOString(),
      searchTerm: initialSearch?.searchTerm,
      timestamp: initialSearch?.timestamp,
    });
    
    // Enhanced re-render logging
    console.log(`🔄 SearchView Render Stats:`, {
      totalRenders: renderCounts.searchView,
      componentRenders: componentRenders.current,
      rendersBySearchParams: Object.fromEntries(renderCounts.searchViewWithParams),
      renderTime: new Date().toISOString(),
      sinceMount: Date.now() - mountTimeRef.current,
      component: componentId
    });
    
    return () => {
      console.log(`🔍 SearchView [${componentId}] UNMOUNTED after ${componentRenders.current} renders`, {
        lifetime: Date.now() - mountTimeRef.current,
        unmountTime: new Date().toISOString(),
        searchTerm: initialSearch?.searchTerm,
      });
    };
  }, [componentId, initialSearch?.searchTerm, initialSearch?.timestamp]);
  
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(searchTerm);

  // Log coordinate changes
  useEffect(() => {
    if (coordinates) {
      console.log(`📍 Coordinates resolved [${componentId}]`, {
        coordinates,
        time: new Date().toISOString(),
        sinceMount: Date.now() - mountTimeRef.current,
        render: componentRenders.current
      });
    }
  }, [coordinates, componentId]);

  // Only trigger usePlanningSearch when coordinates are available
  const { 
    applications, 
    isLoading: isLoadingResults,
    isFetching,
    error: searchError,
    hasResults,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    searchState
  } = usePlanningSearch(coordinates);

  // Track application loads
  useEffect(() => {
    if (applications?.length) {
      console.log(`📊 Applications loaded [${componentId}]`, {
        count: applications.length,
        time: new Date().toISOString(),
        sinceMount: Date.now() - mountTimeRef.current,
        render: componentRenders.current,
        isLoading: isLoadingResults,
        isFetching
      });
    }
  }, [applications, componentId, isFetching, isLoadingResults]);

  // Determine if we should show loading UI
  const isLoading = isLoadingCoords || isLoadingResults || isFetching;
  const shouldShowSkeletons = isLoading && !hasResults;
  
  // Combine errors
  const error = coordsError || searchError || searchState.error;

  // Error reporting
  useEffect(() => {
    if (onError && error && !isNonCriticalError(error) && !hasReportedError.current) {
      console.log('🚨 Search error reported to parent:', error);
      hasReportedError.current = true;
      onError(error);
    }
  }, [error, onError]);

  // Search completion - ensure this only runs once per search
  const handleSearchCompleted = useCallback(() => {
    if (!isLoading && coordinates && applications && !searchCompleteRef.current && hasResults) {
      console.log(`✅ Search complete [${componentId}] - calling onSearchComplete`);
      searchCompleteRef.current = true;
      onSearchComplete?.();
    }
  }, [isLoading, coordinates, applications, onSearchComplete, componentId, hasResults]);

  // Use a separate effect for search completion to avoid frequent rerenders
  useEffect(() => {
    handleSearchCompleted();
  }, [handleSearchCompleted]);

  // If we found some applications but the search itself reported an error
  useEffect(() => {
    if (error && applications.length > 0) {
      console.log(`⚠️ Showing limited results toast [${componentId}]`);
      toast({
        title: "Limited Results",
        description: "We found some results, but had to limit our search. For better results, try a more specific location.",
        duration: 6000,
      });
    }
  }, [error, applications.length, toast, componentId]);

  if (!initialSearch?.searchTerm) {
    console.log(`⭕ Returning NoSearchStateView [${componentId}]`);
    return <NoSearchStateView onPostcodeSelect={() => {}} />;
  }

  // Show loading state when we're still searching
  if (shouldShowSkeletons) {
    const searchStage = searchState.stage;
    const searchProgress = searchState.progress;
    
    console.log(`⏳ Returning loading view [${componentId}]`, {
      stage: searchStage,
      progress: searchProgress,
      isLoadingCoords,
      isLoadingResults
    });
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">{getStageLabel(searchStage)}</h2>
        <p className="text-gray-600 mb-6">Looking for planning applications near {initialSearch.displayTerm || initialSearch.searchTerm}</p>
        
        {/* Show progress bar */}
        <div className="mb-8">
          <Progress value={searchProgress} className="h-2 mb-2" />
          <p className="text-sm text-gray-500 text-right">{Math.round(searchProgress)}%</p>
        </div>
        
        <LoadingSkeletons count={5} isLongSearch={searchStage === 'searching'} />
      </div>
    );
  }

  // Only show error view for real errors, not infrastructure messages
  // Also don't show error view if we have some applications to show
  if (error && !isNonCriticalError(error) && !applications.length) {
    // Determine error type for proper display
    let errorType = ErrorType.UNKNOWN;
    
    if ('type' in error && error.type) {
      // If the error already has a type property, use it
      errorType = error.type as ErrorType;
    } else if (
      error.message?.includes('timeout') || 
      error.message?.includes('too long') ||
      error.message?.includes('canceling statement') ||
      error.message?.includes('reduced area')
    ) {
      errorType = ErrorType.TIMEOUT;
    } else if (error.message?.includes('network') || !navigator.onLine) {
      errorType = ErrorType.NETWORK;
    } else if (error.message?.includes('not found') || error.message?.includes('no results')) {
      errorType = ErrorType.NOT_FOUND;
    }
    
    console.log(`❌ Returning error view [${componentId}]`, {
      errorType,
      errorMessage: error.message
    });
    
    return (
      <SearchErrorView 
        errorDetails={error.message}
        errorType={errorType}
        onRetry={() => {
          hasReportedError.current = false;
          window.location.reload();
        }}
      />
    );
  }

  console.log(`🔄 Returning SearchViewContent [${componentId}]`, {
    applicationCount: applications?.length || 0,
    isLoading,
    hasCoordinates: !!coordinates,
    searchCompleted: searchCompleteRef.current,
    time: new Date().toISOString()
  });

  return (
    <SearchViewContent
      initialSearch={initialSearch}
      applications={applications || []}
      isLoading={isLoading}
      filters={filters}
      onFilterChange={(type, value) => {
        console.log(`🔄 Filter changed [${componentId}]`, { type, value });
        setFilters({ ...filters, [type]: value });
      }}
      onError={(err) => {
        console.log(`❌ Error in SearchViewContent [${componentId}]`, err);
        if (err && !isNonCriticalError(err)) {
          onError?.(err);
        }
      }}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
