
import { useState, useCallback } from 'react';
import { SearchFilters } from '@/hooks/planning/use-planning-search';

export const useSearchViewFilters = () => {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleFilterChange = useCallback((type: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  return {
    filters,
    handleFilterChange
  };
};
