
import { useState, useCallback } from 'react';
import { FilterType, SortType } from '@/types/application-types';

export const useFilterSortState = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterType>({});
  const [activeSort, setActiveSort] = useState<SortType>(null);
  const [showMap, setShowMap] = useState<boolean>(false);

  // Handle marker selection
  const handleMarkerClick = useCallback((id: number | null) => {
    setSelectedId(id);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((sortType: SortType) => {
    setActiveSort(sortType);
  }, []);

  return {
    selectedId,
    setSelectedId,
    activeFilters,
    activeSort,
    showMap,
    setShowMap,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  };
};
