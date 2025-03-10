
import { useState } from 'react';
import { useFilterSortState } from './use-filter-sort-state';
import { FilterType, SortType } from '@/types/application-types';
import { useFilteredApplications } from '@/hooks/use-filtered-applications';

export const useApplicationState = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    selectedId,
    setSelectedId,
    activeFilters,
    activeSort,
    showMap,
    setShowMap,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  } = useFilterSortState();

  // Get filtered applications
  const filteredResult = useFilteredApplications(
    applications,
    activeFilters,
    activeSort,
    coordinates
  );

  // Simple handler for postcode selection
  const handlePostcodeSelect = (postcode: string) => {
    setSearchTerm(postcode);
    // Additional implementation as needed
  };

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    coordinates,
    setCoordinates,
    applications,
    setApplications,
    filteredApplications: filteredResult.applications,
    isLoading,
    setIsLoading,
    error,
    setError,
    
    // Filter and sort state
    selectedId,
    setSelectedId,
    activeFilters,
    activeSort,
    showMap,
    setShowMap,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange,
    handlePostcodeSelect
  };
};
