
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { handleSearchError } from './search/error-handler';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const { toast } = useToast();
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters, searchRadius],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        const [lat, lng] = coordinates;
        
        // Always use fallback search since spatial search is failing with 404
        return await performFallbackSearch(lat, lng, searchRadius, filters);
      } catch (err) {
        return handleSearchError(err, toast);
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius
  };
};
