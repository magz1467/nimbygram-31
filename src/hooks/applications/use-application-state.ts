import { useState, useEffect } from 'react';
import { Application } from "@/types/planning";
import { SortType, FilterType, StatusCounts } from "@/types/application-types";
import { useApplicationsData } from "@/components/applications/dashboard/hooks/useApplicationsData";
import { useFilteredApplications } from "@/hooks/use-filtered-applications";
import { useSearchState } from './use-search-state';
import { useFilterSortState } from './use-filter-sort-state';

export const useApplicationState = (initialPostcode = '') => {
  const {
    postcode,
    coordinates,
    isLoadingCoords,
    searchPoint,
    setSearchPoint,
    searchStartTime,
    setSearchStartTime,
    isSearching,
    setIsSearching,
    handlePostcodeSelect
  } = useSearchState(initialPostcode);

  const {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    setIsMapView,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  } = useFilterSortState();

  const { 
    applications, 
    isLoading: isLoadingApps, 
    fetchApplicationsInRadius,
    statusCounts = {
      'Under Review': 0,
      'Approved': 0,
      'Declined': 0,
      'Other': 0
    }
  } = useApplicationsData();

  useEffect(() => {
    if (!coordinates) return;
    
    const isInitialSearch = !searchPoint && coordinates;
    const isNewSearch = searchPoint && coordinates && 
      (searchPoint[0] !== coordinates[0] || searchPoint[1] !== coordinates[1]);

    if (isInitialSearch || isNewSearch) {
      try {
        setSearchPoint(coordinates as [number, number]);
        fetchApplicationsInRadius(coordinates as [number, number], 1000);
      } catch (error) {
        console.error('Search error:', error);
        setIsSearching(false);
      }
    }
  }, [coordinates, searchPoint, fetchApplicationsInRadius]);

  useEffect(() => {
    if (searchStartTime && !isLoadingApps && !isLoadingCoords) {
      setSearchStartTime(null);
      setIsSearching(false);
    }
  }, [isLoadingApps, isLoadingCoords, searchStartTime]);

  const filteredApplications = useFilteredApplications(
    applications || [],
    activeFilters,
    activeSort
  );

  return {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    postcode,
    coordinates,
    isLoading: isLoadingCoords || isLoadingApps,
    applications,
    filteredApplications,
    statusCounts,
    handleMarkerClick,
    handleFilterChange,
    handlePostcodeSelect,
    handleSortChange,
    setIsMapView
  };
};