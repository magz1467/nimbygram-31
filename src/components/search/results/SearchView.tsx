
import { useSearchResults } from '@/hooks/applications/use-search-results';
import { useEffect } from 'react';
import { useTitle } from '@/hooks/use-title';
import { ResultsContainer } from './ResultsContainer';
import { FilterBarSection } from './FilterBarSection';

interface SearchViewProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    timestamp?: number;
  };
}

export const SearchView = ({ initialSearch }: SearchViewProps) => {
  const {
    postcode,
    coordinates,
    displayApplications,
    applications,
    isLoading,
    hasSearched,
    showMap,
    setShowMap,
    selectedId,
    setSelectedId,
    handleMarkerClick,
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
    handlePostcodeSelect,
    statusCounts,
    refetch
  } = useSearchResults({ initialSearch });

  // Set page title
  useTitle(`Planning Applications near ${postcode || 'your area'}`);

  // Log search state for debugging
  useEffect(() => {
    console.log('Search view state:', {
      postcode,
      hasCoordinates: Boolean(coordinates),
      applicationCount: applications?.length,
      isLoading,
      hasSearched,
      showMap,
      selectedId,
      activeFilters,
      activeSort
    });
  }, [postcode, coordinates, applications, isLoading, hasSearched, showMap, selectedId, activeFilters, activeSort]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <FilterBarSection
        showMap={showMap}
        setShowMap={setShowMap}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        activeFilters={activeFilters}
        activeSort={activeSort}
        applications={applications}
        statusCounts={statusCounts}
      />

      <div className="flex flex-col flex-1 bg-gray-50">
        <ResultsContainer
          displayApplications={displayApplications}
          applications={applications}
          coordinates={coordinates}
          showMap={showMap}
          setShowMap={setShowMap}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          handleMarkerClick={handleMarkerClick}
          isLoading={isLoading}
          searchTerm={postcode}
          onRetry={refetch}
          activeSort={activeSort}
          activeFilters={activeFilters}
        />
      </div>
    </div>
  );
};
