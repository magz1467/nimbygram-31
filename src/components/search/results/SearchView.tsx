
import { useEffect } from 'react';
import { useCoordinates } from "@/hooks/use-coordinates";
import { usePlanningSearch, SearchFilters } from "@/hooks/planning/use-planning-search";
import { SearchViewContent } from "./SearchViewContent";
import { NoSearchStateView } from "./NoSearchStateView";
import { SearchErrorView } from "./SearchErrorView";
import { MobileDetector } from "@/components/map/mobile/MobileDetector";

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

  useEffect(() => {
    // Only propagate meaningful errors, not infrastructure setup messages
    if (onError && error && !error.message?.toLowerCase().includes('support table')) {
      console.log('🚨 Search error:', error);
      onError(error);
    }
  }, [error, onError]);

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
    return (
      <SearchErrorView 
        errorDetails={error.message}
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

