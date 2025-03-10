
import { useState, useEffect, useMemo } from 'react';
import { Application } from "@/types/planning";
import { SortType, StatusCounts } from "@/types/application-types";
import { useSearchState } from './use-search-state';
import { useFilterSortState } from './use-filter-sort-state';
import { useApplicationSorting } from '@/hooks/use-application-sorting';
import { calculateStatusCounts } from './use-status-counts';
import { fetchApplicationsPage } from '@/utils/fetchApplications';

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
  const PAGE_SIZE = 25;
  const [currentPage, setCurrentPage] = useState(0);
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Use search state for coordinates fetching
  const {
    postcode,
    coordinates,
    isLoadingCoords,
    error: searchError,
    coordsError,
    handlePostcodeSelect
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

  // Load initial page of results when coordinates change
  useEffect(() => {
    const loadInitialPage = async () => {
      if (coordinates) {
        setIsLoadingPage(true);
        setCurrentPage(0);
        
        try {
          const result = await fetchApplicationsPage(coordinates, 0, PAGE_SIZE);
          setApplications(result.applications);
          setTotalCount(result.totalCount);
          setHasMore(result.hasMore);
        } catch (error) {
          console.error('Error loading initial page:', error);
          setApplications([]);
          setTotalCount(0);
          setHasMore(false);
        } finally {
          setIsLoadingPage(false);
        }
      }
    };
    
    loadInitialPage();
  }, [coordinates, retryCount]);

  // Load next page when currentPage changes (except on initial load)
  useEffect(() => {
    const loadNextPage = async () => {
      if (coordinates && currentPage > 0) {
        setIsLoadingPage(true);
        
        try {
          const result = await fetchApplicationsPage(coordinates, currentPage, PAGE_SIZE);
          setApplications(prev => [...prev, ...result.applications]);
          setHasMore(result.hasMore);
          // Don't update totalCount here as it should remain consistent
        } catch (error) {
          console.error('Error loading next page:', error);
          // Don't change existing applications on error
        } finally {
          setIsLoadingPage(false);
        }
      }
    };
    
    loadNextPage();
  }, [currentPage, coordinates]);

  // Reset pagination and map state when search changes
  useEffect(() => {
    setShowMap(false);
    setSelectedId(null);
    setCurrentPage(0);
  }, [postcode, coordinates, setShowMap, setSelectedId]);

  // Apply filtering 
  const filteredApplications = useMemo(() => {
    // Filter applications based on activeFilters
    let filtered = [...applications];
    
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
  
  // Calculate status counts
  const statusCounts = useMemo<StatusCounts>(() => {
    return calculateStatusCounts(applications);
  }, [applications]);

  // Function to load more results
  const loadMoreResults = () => {
    if (hasMore && !isLoadingPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Calculate if we're loading
  const isLoading = isLoadingCoords || isLoadingPage;

  // Calculate if we have searched
  const hasSearched = Boolean(postcode || coordinates);

  return {
    // Search state
    postcode,
    coordinates,
    applications,
    displayApplications: sortedApplications,
    isLoading,
    error: searchError || coordsError,
    hasSearched,

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
    loadMoreResults,
    hasMore,
    totalCount,

    // Stats
    statusCounts
  };
};
