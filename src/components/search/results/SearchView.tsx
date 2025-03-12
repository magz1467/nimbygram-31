
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
import { useToast } from "@/hooks/use-toast";

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

export const SearchView = ({
  initialSearch,
  retryCount = 0,
  onError,
  onSearchComplete
}: SearchViewProps) => {
  const componentId = useRef(`sv-${Math.random().toString(36).substring(2, 9)}`).current;
  const mountTimeRef = useRef(Date.now());
  const hasReportedError = useRef(false);
  const [localError, setLocalError] = useState<Error | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const { toast } = useToast();
  const searchCompleteRef = useRef(false);
  const componentRenders = useRef(0);
  
  // Track renders
  componentRenders.current += 1;
  renderCounts.searchView += 1;
  
  const searchParamsKey = initialSearch ? `${initialSearch.searchTerm}-${initialSearch.timestamp || 0}` : 'no-search';
  renderCounts.searchViewWithParams.set(
    searchParamsKey, 
    (renderCounts.searchViewWithParams.get(searchParamsKey) || 0) + 1
  );
  
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
  
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(
    initialSearch?.searchTerm || ''
  );

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

  const { 
    applications, 
    isLoading: isLoadingResults,
    isFetching,
    error: searchError,
    hasResults,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius
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

  // Show skeletons for a minimum time
  useEffect(() => {
    if (coordinates && !isLoadingCoords) {
      console.log(`⏱️ Skeleton timer started [${componentId}]`);
      const timer = setTimeout(() => {
        console.log(`⏱️ Skeleton timer finished [${componentId}]`);
        setShowSkeleton(false);
      }, 1000); // Reduced to 1 second
      
      return () => {
        console.log(`⏱️ Skeleton timer cleared [${componentId}]`);
        clearTimeout(timer);
      }
    }
  }, [coordinates, isLoadingCoords, componentId]);

  // Combine errors
  const error = localError || coordsError || searchError;

  // Handle errors
  useEffect(() => {
    if ((coordsError || searchError) && !localError) {
      console.log(`❌ Error detected [${componentId}]`, {
        coordsError: coordsError?.message,
        searchError: searchError?.message,
        time: new Date().toISOString()
      });
      setLocalError(coordsError || searchError);
    }
  }, [coordsError, searchError, localError, componentId]);

  // Error reporting
  useEffect(() => {
    if (onError && error && !isNonCriticalError(error) && !hasReportedError.current) {
      console.log('🚨 Search error reported to parent:', error);
      hasReportedError.current = true;
      onError(error);
    }
  }, [error, onError]);

  // Search completion
  useEffect(() => {
    console.log(`🔎 Search completion check [${componentId}]`, {
      isLoadingResults,
      isLoadingCoords,
      hasCoordinates: !!coordinates,
      hasApplications: !!applications,
      searchCompleteRef: searchCompleteRef.current,
      time: new Date().toISOString()
    });
    
    if (!isLoadingResults && !isLoadingCoords && coordinates && applications && !searchCompleteRef.current) {
      console.log(`✅ Search complete [${componentId}] - calling onSearchComplete`);
      searchCompleteRef.current = true;
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  }, [isLoadingResults, isLoadingCoords, coordinates, applications, onSearchComplete, componentId]);

  // If we found some applications using the emergency search
  // but the search itself reported an error
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

  // Show loading state when we're still getting coordinates or results
  if ((isLoadingCoords || (isLoadingResults && showSkeleton)) && !hasResults) {
    console.log(`⏳ Returning loading skeletons [${componentId}]`, {
      isLoadingCoords,
      isLoadingResults,
      showSkeleton,
      hasResults
    });
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Searching for planning applications...</h2>
        <p className="text-gray-600 mb-6">Looking for planning applications near {initialSearch.displayTerm || initialSearch.searchTerm}</p>
        <LoadingSkeletons count={5} isLongSearch={false} />
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
          setLocalError(null);
          hasReportedError.current = false;
          window.location.reload();
        }}
      />
    );
  }

  const isLoading = isLoadingCoords || isLoadingResults || isFetching;
  
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
          setLocalError(err);
        }
      }}
      onSearchComplete={onSearchComplete}
      retryCount={retryCount}
    />
  );
};
