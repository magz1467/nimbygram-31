
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { useErrorHandler } from '@/hooks/use-error-handler';
import { executeSearch } from './search/search-executor';
import { processSearchError } from './search/search-error-handler';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

/**
 * Hook for searching planning applications based on coordinates
 * 
 * @param coordinates [latitude, longitude] for the search center
 * @returns Search results, loading state, error state, filters, and control functions
 */
export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();
  const { isNonCritical } = useErrorHandler();
  
  // Track search attempts to improve error handling
  const [searchAttempts, setSearchAttempts] = useState(0);
  
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters, searchAttempts],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log(`🔍 Search attempt ${searchAttempts + 1} with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
        
        // Default radius in kilometers
        const searchRadius = 10;
        
        // Execute the search with appropriate strategies
        return await executeSearch(coordinates, searchRadius, filters);
      } catch (err: any) {
        return processSearchError(err, toast, () => {
          // Increment search attempts to trigger a retry
          setSearchAttempts(prev => prev + 1);
        });
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry timeout errors or when we already have results
      if (error?.message?.includes('timeout') || error?.message?.includes('too long')) {
        return false;
      }
      // Only retry network errors, up to 2 times
      return failureCount < 2;
    },
  });

  // Reset search attempts when coordinates change
  useEffect(() => {
    setSearchAttempts(0);
  }, [coordinates]);

  return {
    applications: applications || [],
    isLoading,
    error,
    filters,
    setFilters,
    refetch: () => {
      setSearchAttempts(prev => prev + 1);
      return refetch();
    }
  };
};
