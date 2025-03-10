
import { useState, useEffect } from 'react';
import { useSearchState } from '@/hooks/applications/use-search-state';
import { useFilterSortState } from '@/hooks/applications/use-filter-sort-state';
import { useStatusCounts } from '@/hooks/applications/use-status-counts';
import { useInterestingApplications } from '@/hooks/applications/use-interesting-applications';
import { useFilteredAndSortedApplications } from './use-filtered-and-sorted-applications';
import { useMapInteractions } from './use-map-interactions';
import { Application } from '@/types/planning';

interface SearchResultsOptions {
  initialPostcode?: string;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  retryCount?: number;
}

export const useSearchResults = ({ initialPostcode, initialSearch, retryCount = 0 }: SearchResultsOptions = {}) => {
  const initialPostcodeValue = initialSearch?.searchType === 'postcode' ? initialSearch.searchTerm : initialPostcode || '';
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(initialPostcodeValue));
  const [currentPage, setCurrentPage] = useState(0);

  const {
    postcode,
    coordinates,
    isLoadingCoords,
    isLoadingApps,
    applications = [],
    handlePostcodeSelect,
    refetch,
    error: searchStateError,
    coordsError
  } = useSearchState(initialPostcodeValue);

  const {
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
  } = useFilterSortState();

  const {
    showMap,
    setShowMap,
    selectedId,
    setSelectedId,
    handleMarkerClick
  } = useMapInteractions();

  // Combine and prioritize errors
  useEffect(() => {
    if (coordsError) {
      console.error('Coordinates error:', coordsError);
      setError(coordsError);
    } else if (searchStateError) {
      console.error('Search state error:', searchStateError);
      setError(searchStateError);
    } else {
      setError(null);
    }
  }, [searchStateError, coordsError]);

  // Get status counts from applications
  const statusCounts = useStatusCounts(applications);

  // Fetch interesting applications for initial state
  const { 
    interestingApplications, 
    isLoadingInteresting,
    fetchInterestingApplications 
  } = useInterestingApplications(hasSearched);

  // Only fetch interesting applications when needed
  useEffect(() => {
    if (!hasSearched) {
      fetchInterestingApplications();
    }
  }, [hasSearched, fetchInterestingApplications]);

  // Update search status when we have results or coordinates
  useEffect(() => {
    if (coordinates || (applications && applications.length > 0)) {
      console.log('🔍 Search completed with results:', { 
        hasCoordinates: !!coordinates, 
        applicationsCount: applications?.length || 0 
      });
      setHasSearched(true);
    }
  }, [coordinates, applications]);

  // Trigger initial search with provided search term
  useEffect(() => {
    if (initialSearch?.searchTerm && initialSearch.searchType === 'postcode') {
      console.log('🔍 Triggering initial postcode search:', initialSearch.searchTerm);
      handlePostcodeSelect(initialSearch.searchTerm);
    }
  }, [initialSearch, handlePostcodeSelect]);

  // Clear map state when search changes
  useEffect(() => {
    // Reset map visibility when search changes
    setShowMap(false);
    setSelectedId(null);
    // Reset pagination when search changes
    setCurrentPage(0);
  }, [postcode, coordinates, setShowMap, setSelectedId]);

  // Filter and sort applications with pagination
  const {
    applications: filteredApplications,
    totalCount,
    totalPages
  } = useFilteredAndSortedApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates,
    postcode,
    25,  // pageSize fixed at 25
    currentPage
  );

  const isLoading = isLoadingCoords || isLoadingApps || isLoadingInteresting;
  const displayApplications = hasSearched ? filteredApplications : interestingApplications;

  return {
    postcode,
    coordinates,
    applications,
    displayApplications,
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
    refetch,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount
  };
};
