
import { useState, useRef, useEffect } from 'react';
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
  const previousCoordinatesRef = useRef<string | null>(null);
  const errorRef = useRef<Error | null>(null);
  
  // Create a stable query key
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  if (coordinates) {
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    const coordString = coordinates.join(',');
    
    // Only update the query key if the search parameters have changed
    if (
      queryKey.current[1] !== coordString || 
      queryKey.current[2] !== filterString || 
      queryKey.current[3] !== radiusString
    ) {
      queryKey.current = ['planning-applications', coordString, filterString, radiusString];
    }
  }
  
  const coordinatesString = coordinates ? coordinates.join(',') : null;
  
  useEffect(() => {
    previousCoordinatesRef.current = coordinatesString;
  }, [coordinatesString]);
  
  const { data: applications = [], isLoading, error: queryError } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        const [lat, lng] = coordinates;
        
        try {
          // First attempt spatial search, but expect it might fail
          console.log('Attempting spatial search');
          const spatialResults = await performSpatialSearch(lat, lng, searchRadius, filters);
          if (spatialResults && spatialResults.length > 0) {
            console.log('Spatial search successful with', spatialResults.length, 'results');
            return spatialResults;
          }
        } catch (spatialError) {
          // Log but don't throw - we'll try fallback search
          console.log('Spatial search failed, using fallback search instead:', spatialError);
        }
        
        // Always proceed with fallback search if we reach here
        console.log('Using fallback search');
        const fallbackResults = await performFallbackSearch(lat, lng, searchRadius, filters);
        return fallbackResults;
      } catch (err) {
        console.error('Search error:', err);
        // Store the error to prevent losing it on re-renders
        errorRef.current = err instanceof Error ? err : new Error(String(err));
        
        // Return empty array to prevent component crashes
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Combine stored error with query error
  const error = queryError || errorRef.current;

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
