
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Application } from "@/types/planning";
import { SortType, StatusCounts } from "@/types/application-types";
import { useSearchState } from './use-search-state';
import { useFilterSortState } from './use-filter-sort-state';
import { useApplicationSorting } from '@/hooks/use-application-sorting';
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
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
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

  // Apply filtering and sorting
  const filteredApplications = useMemo(() => {
    // Filter applications based on activeFilters
    let filtered = [...(applications || [])];
    
    if (activeFilters.status) {
      filtered = filtered.filter(app => 
        app.status?.toLowerCase().includes(activeFilters.status.toLowerCase())
      );
    }
    
    if (activeFilters.type) {
      filtered = filtered.filter(app => 
        app.application_type_full?.toLowerCase().includes(activeFilters.type.toLowerCase()) ||
        app.type?.toLowerCase().includes(activeFilters.type.toLowerCase())
      );
    }
    
    if (activeFilters.classification) {
      filtered = filtered.filter(app => 
        app.class_3?.toLowerCase().includes(activeFilters.classification.toLowerCase())
      );
    }
    
    return filtered;
  }, [applications, activeFilters]);

  // Sort the filtered applications
  const sortedApplications = useApplicationSorting(
    filteredApplications,
    activeSort,
    coordinates
  );
  
  // Apply pagination
  const paginatedApplications = useMemo(() => {
    const startIndex = currentPage * PAGE_SIZE;
    return sortedApplications.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedApplications, currentPage, PAGE_SIZE]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedApplications.length / PAGE_SIZE));
  }, [sortedApplications.length, PAGE_SIZE]);

  // Calculate status counts
  const statusCounts = useMemo<StatusCounts>(() => {
    return calculateStatusCounts(applications);
  }, [applications]);

  // Function to load the next page of results
  const loadNextPage = useCallback((newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setIsLoadingNextPage(true);
      // Simulate loading time for smoother UX
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsLoadingNextPage(false);
      }, 300);
    }
  }, [totalPages]);

  // Combined loading state
  const isLoading = isLoadingCoords || isLoadingApps || isLoadingNextPage;

  return {
    // Search state
    postcode,
    coordinates,
    applications,
    displayApplications: paginatedApplications,
    isLoading,
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
    totalCount: sortedApplications.length,
    loadNextPage,

    // Stats
    statusCounts,
    
    // Actions
    refetch,
    
    // Errors
    error: searchError || coordsError
  };
};
