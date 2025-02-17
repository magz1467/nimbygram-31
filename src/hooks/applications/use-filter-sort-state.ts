
import { useState } from 'react';
import { FilterType, SortType } from "@/types/application-types";

export const useFilterSortState = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterType>({});
  const [activeSort, setActiveSort] = useState<SortType>(null);
  const [isMapView, setIsMapView] = useState(true);

  const handleMarkerClick = (id: number | null) => {
    setSelectedId(id);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => {
      if (value === prev[filterType as keyof FilterType]) {
        const { [filterType as keyof FilterType]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [filterType]: value
      };
    });
  };

  const handleSortChange = (sortType: SortType) => {
    setActiveSort(sortType);
  };

  return {
    selectedId,
    activeFilters,
    activeSort,
    isMapView,
    setIsMapView,
    handleMarkerClick,
    handleFilterChange,
    handleSortChange
  };
};
