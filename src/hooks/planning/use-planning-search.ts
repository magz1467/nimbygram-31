
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { handleSearchError } from './search/error-handler';
import { ErrorType } from '@/utils/errors';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log(`🔍 Searching with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
        
        const [lat, lng] = coordinates;
        const radiusKm = 10;
        
        // Try spatial search first
        try {
          const spatialResults = await performSpatialSearch(lat, lng, radiusKm, filters);
          console.log('Spatial search results:', spatialResults?.length || 0);
          if (spatialResults && spatialResults.length > 0) {
            return spatialResults;
          }
        } catch (spatialFunctionError) {
          console.log('Spatial function not available, using fallback method:', spatialFunctionError);
          // Continue to fallback method
        }
        
        // If spatial search fails or isn't available, fall back to manual search
        console.log('Falling back to standard bounding box search');
        const fallbackResults = await performFallbackSearch(lat, lng, radiusKm, filters);
        console.log('Fallback search results:', fallbackResults.length);
        return fallbackResults;
      } catch (err: any) {
        console.error('Search error occurred:', err);
        return handleSearchError(err, toast);
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    applications: applications || [],
    isLoading,
    error,
    filters,
    setFilters
  };
};
