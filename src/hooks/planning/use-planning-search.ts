
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { SearchFilters, PlanningSearchResult } from './use-planning-search-types';
import { calculateGeographicBounds } from '@/utils/planning/distance-utils';
import { applyFilters } from '@/utils/planning/filter-utils';
import { handleSearchError, isNonCriticalError } from '@/utils/planning/error-handling';
import { searchWithSpatialFunction, searchWithBasicFiltering } from '@/services/planning/planning-service';

/**
 * Hook for searching planning applications near a location
 * @param coordinates [latitude, longitude] coordinates to search around
 * @returns Object containing applications, loading state, errors, and filter controls
 */
export const usePlanningSearch = (coordinates: [number, number] | null): PlanningSearchResult => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        // Get coordinates with 10km radius (fixed radius as requested)
        const [lat, lng] = coordinates;
        const radiusKm = 10; // Fixed 10km radius
        
        console.log(`Searching within ${radiusKm}km radius of [${lat}, ${lng}]`);
        
        // First, try using the optimized PostGIS function approach
        const spatialResults = await searchWithSpatialFunction(lat, lng, radiusKm);
        
        if (spatialResults) {
          // Apply filters in-memory if PostGIS query succeeded
          return applyFilters(spatialResults, filters);
        }
        
        // Fallback approach - calculate bounding box for basic query
        const bounds = calculateGeographicBounds(lat, lng, radiusKm);
        return await searchWithBasicFiltering(lat, lng, bounds, filters);
        
      } catch (err: any) {
        handleSearchError(err, toast);
        
        // Return empty array instead of throwing to prevent UI from breaking
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once to prevent excessive error toasts
  });

  return {
    applications,
    isLoading,
    error,
    filters,
    setFilters
  };
};

// For backward compatibility, re-export from the new location
export * from './use-planning-search-types';
