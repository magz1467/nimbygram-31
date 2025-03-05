
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchState } from '@/hooks/applications/use-search-state';
import { useFilterSortState } from '@/hooks/applications/use-filter-sort-state';
import { useStatusCounts } from '@/hooks/applications/use-status-counts';
import { useInterestingApplications } from '@/hooks/applications/use-interesting-applications';
import { Application } from '@/types/planning';

interface SearchResultsOptions {
  initialPostcode?: string;
  initialSearch?: {
    searchType: 'postcode' | 'location';
    searchTerm: string;
    timestamp?: number;
  };
}

export const useSearchResults = ({ initialPostcode, initialSearch }: SearchResultsOptions = {}) => {
  const initialPostcodeValue = initialSearch?.searchType === 'postcode' ? initialSearch.searchTerm : initialPostcode || '';

  const {
    postcode,
    coordinates,
    isLoadingCoords,
    isLoadingApps,
    applications = [],
    handlePostcodeSelect,
  } = useSearchState(initialPostcodeValue);

  const [hasSearched, setHasSearched] = useState(Boolean(initialPostcodeValue));
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    activeFilters,
    activeSort,
    handleFilterChange,
    handleSortChange,
  } = useFilterSortState();

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

  // Memoize filtered and sorted applications
  const filteredApplications = useMemo(() => {
    console.log('🔍 Filtering applications:', {
      total: applications?.length || 0,
      filters: activeFilters,
      sort: activeSort
    });

    if (!applications || applications.length === 0) {
      return [];
    }

    const filtered = applications.filter(app => {
      if (activeFilters.status && app.status !== activeFilters.status) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (activeSort === 'newest') {
        return new Date(b.submissionDate || '').getTime() - new Date(a.submissionDate || '').getTime();
      }
      if (activeSort === 'closingSoon' && coordinates) {
        const dateA = new Date(a.last_date_consultation_comments || '').getTime();
        const dateB = new Date(b.last_date_consultation_comments || '').getTime();
        return dateA - dateB;
      }
      return 0;
    });
  }, [applications, activeFilters, activeSort, coordinates]);

  // Handle marker click
  const handleMarkerClick = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id) {
      const element = document.getElementById(`application-${id}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

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
    statusCounts
  };
};
