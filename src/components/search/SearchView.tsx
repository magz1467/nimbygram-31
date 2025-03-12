import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchStateManager } from '@/hooks/planning/search/use-search-state-manager';
import { useCoordinates } from '@/hooks/planning/search/use-coordinates';
import { SearchFilters } from '@/hooks/planning/search/types';
import { SearchSkeleton } from './SearchSkeleton';
import { SearchStage } from '@/hooks/planning/search/use-search-state-manager';
import { Application } from '@/types/planning';
import { ResultsListView } from './results/ResultsListView';
import { ErrorMessage } from './results/components/ErrorMessage';

interface SearchViewProps {
  searchTerm: string;
  filters?: SearchFilters;
  onSearchComplete?: () => void;
}

export function SearchView({ 
  searchTerm, 
  filters = {}, 
  onSearchComplete 
}: SearchViewProps) {
  // Create refs to prevent rerenders
  const searchTermRef = useRef(searchTerm);
  const filtersRef = useRef(filters);
  const searchCompleteRef = useRef(false);
  
  // Update refs when props change
  useEffect(() => {
    searchTermRef.current = searchTerm;
    filtersRef.current = filters;
    // Reset search complete flag when search term changes
    if (searchTermRef.current !== searchTerm) {
      searchCompleteRef.current = false;
    }
  }, [searchTerm, filters]);
  
  // Use a single hook for coordinates to reduce state updates
  const { coordinates, isLoading: isLoadingCoords, error: coordsError } = useCoordinates(searchTerm);
  
  // Use our improved search state manager
  const { 
    isLoading: isLoadingResults,
    stage,
    progress,
    results,
    hasResults,
    error: searchError,
    startSearch,
    cancelSearch
  } = useSearchStateManager();
  
  // Combine loading states for easier handling
  const isLoading = isLoadingCoords || isLoadingResults;
  const error = coordsError || searchError;
  
  // Memoize the minimum time to show loading skeleton to prevent flickering
  const minimumLoadingTime = useMemo(() => {
    return 800; // 800ms minimum to prevent flickering
  }, []);
  
  // Track the loading start time to enforce minimum loading time
  const loadingStartTimeRef = useRef<number | null>(null);
  
  // Trigger search when coordinates are available
  useEffect(() => {
    if (!coordinates || isLoadingCoords) return;
    
    // Start the search with the current coordinates and filters
    startSearch({
      coordinates,
      filters: filtersRef.current,
      radius: 5 // Fixed 5km radius
    });
    
    // Track when loading starts
    if (!loadingStartTimeRef.current) {
      loadingStartTimeRef.current = Date.now();
    }
    
    // Cleanup function to cancel search if component unmounts
    return () => {
      cancelSearch();
    };
  }, [coordinates, isLoadingCoords, startSearch, cancelSearch]);
  
  // Determine if we should show loading state based on minimum time
  const [showLoading, setShowLoading] = useState(isLoading);
  
  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      loadingStartTimeRef.current = Date.now();
    } else if (!isLoading && loadingStartTimeRef.current) {
      // Calculate time elapsed since loading started
      const timeElapsed = Date.now() - loadingStartTimeRef.current;
      
      if (timeElapsed < minimumLoadingTime) {
        // Keep showing loading for the minimum time
        const remainingTime = minimumLoadingTime - timeElapsed;
        const timer = setTimeout(() => {
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
        
        return () => clearTimeout(timer);
      } else {
        // Minimum time already elapsed, hide loading immediately
        setShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    }
  }, [isLoading, minimumLoadingTime]);
  
  // Call onSearchComplete when search is complete
  useEffect(() => {
    if (!isLoading && coordinates && results.length > 0 && !searchCompleteRef.current) {
      searchCompleteRef.current = true;
      onSearchComplete?.();
    }
  }, [isLoading, coordinates, results, onSearchComplete]);

  // Function to handle seeing an application on the map
  const handleSeeOnMap = (id: number) => {
    console.log(`See on map clicked for application: ${id}`);
  };

  // Function to retry a search when it fails
  const handleRetry = () => {
    // Reset search complete flag
    searchCompleteRef.current = false;
    // Reset loading start time
    loadingStartTimeRef.current = null;
    
    if (coordinates) {
      startSearch({
        coordinates,
        filters: filtersRef.current,
        radius: 5 // Fixed 5km radius
      });
    }
  };
  
  // Render correct view based on state
  return (
    <div className={`search-view-container ${showLoading ? 'loading' : ''}`}>
      {/* Progress bar that stays at the top */}
      {isLoading && (
        <div className="search-progress-bar">
          <div 
            className="search-progress-fill" 
            style={{ width: `${progress}%` }}
          />
          <div className="search-stage-label">
            {getStageLabel(stage)}
          </div>
        </div>
      )}
      
      {/* Content area with stable height */}
      <div className="search-content-area">
        {showLoading && (
          <div className="search-skeleton-container">
            <SearchSkeleton count={5} />
          </div>
        )}
        
        {!showLoading && hasResults && (
          <div className="applications-list-container">
            <ResultsListView 
              applications={results} 
              isLoading={false}
              onSeeOnMap={handleSeeOnMap}
              searchTerm={searchTermRef.current}
            />
          </div>
        )}
        
        {!showLoading && !hasResults && !error && stage === 'complete' && (
          <div className="no-results-container">
            <ErrorMessage 
              title="No results found"
              message={`We couldn't find any planning applications for ${searchTermRef.current}. Please try another search.`} 
              onRetry={handleRetry}
            />
          </div>
        )}
        
        {!showLoading && error && (
          <div className="error-view-container">
            <ErrorMessage 
              title="Error searching for applications"
              message={error.message}
              onRetry={handleRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get user-friendly stage label
function getStageLabel(stage: SearchStage): string {
  switch (stage) {
    case 'idle':
      return 'Ready';
    case 'coordinates':
      return 'Finding location...';
    case 'searching':
      return 'Searching for applications...';
    case 'processing':
      return 'Processing results...';
    case 'complete':
      return 'Search complete';
    default:
      return 'Searching...';
  }
}
