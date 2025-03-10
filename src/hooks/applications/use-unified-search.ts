
import { useState, useEffect, useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType, StatusCounts } from "@/types/application-types";
import { useSearchState } from './use-search-state';
import { useFilterSortState } from './use-filter-sort-state';
import { useFilteredAndSortedApplications } from './use-filtered-and-sorted-applications';
import { calculateStatusCounts } from './use-status-counts';

interface UseUnifiedSearchProps {
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    displayTerm?: string;
    timestamp?: number;
  };
  retryCount?: number;
}

export const useUnifiedSearch = ({ initialSearch, retryCount = 0 }: UseUnifiedSearchProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const PAGE_SIZE = 25;

  // Use search state for coordinates and applications fetching
  const {
    postcode,
    coordinates,
    applications = [],
    isLoadingCoords,
    isLoadingApps,
    error: searchError,
    coordsError,
    handlePostcodeSelect,
    refetch
  } = useSearchState(initialSearch?.searchTerm || '');

  // Use filter sort state for UI controls
  const {
    activeFilters,
    activeSort,
    showMap,
    setShowMap,
    selectedId,
    setSelectedId,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  } = useFilterSortState();

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [postcode, coordinates, activeFilters, activeSort]);

  // Get filtered and sorted applications
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
    PAGE_SIZE,
    currentPage
  );

  // Calculate status counts using the imported function
  const statusCounts = useMemo<StatusCounts>(() => {
    return calculateStatusCounts(applications);
  }, [applications]);

  return {
    // Search state
    postcode,
    coordinates,
    applications,
    displayApplications: filteredApplications,
    isLoading: isLoadingCoords || isLoadingApps,
    error: searchError || coordsError,
    hasSearched: Boolean(postcode || coordinates),

    // UI state
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

    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,

    // Stats
    statusCounts,
    
    // Actions
    refetch
  };
};
