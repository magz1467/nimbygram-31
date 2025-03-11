
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { handleSearchError } from './search/error-handler';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { searchLogger } from '@/utils/searchLogger';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

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
        
        const [lat, lng] = coordinates;
        // Start with a smaller radius to reduce query size
        const initialRadiusKm = 5;
        
        // Log search for analytics
        await searchLogger.logSearch(`${lat},${lng}`, 'coordinates', 'planning');
        
        // Try spatial search first - with smaller radius to avoid timeouts
        try {
          console.log(`Attempting spatial search with ${initialRadiusKm}km radius`);
          const spatialResults = await performSpatialSearch(lat, lng, initialRadiusKm, filters);
          
          if (spatialResults && spatialResults.length > 0) {
            console.log(`✅ Spatial search successful, found ${spatialResults.length} results`);
            return spatialResults;
          }
          
          // If no results with small radius, try a slightly larger radius
          if (spatialResults && spatialResults.length === 0) {
            console.log('No results found with small radius, trying larger radius');
            const expandedResults = await performSpatialSearch(lat, lng, 10, filters);
            if (expandedResults && expandedResults.length > 0) {
              return expandedResults;
            }
          }
        } catch (spatialFunctionError) {
          console.log('Spatial function not available, using fallback method:', spatialFunctionError);
          
          // Only log real errors, not just the fallback path
          if (!isNonCritical(spatialFunctionError)) {
            console.error('Spatial search error:', spatialFunctionError);
          }
          // Continue to fallback method
        }
        
        // If spatial search fails or isn't available, fall back to manual search with limited radius
        console.log('Using fallback search method with limited radius');
        return await performFallbackSearch(lat, lng, initialRadiusKm, filters);
      } catch (err: any) {
        return handleSearchError(err, toast, () => {
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
