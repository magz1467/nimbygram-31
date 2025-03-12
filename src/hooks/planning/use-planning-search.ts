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
  
  const queryKey = coordinates ? 
    ['planning-applications', coordinates.join(','), JSON.stringify(filters), searchRadius.toString()] : 
    ['planning-applications', 'no-coordinates'];
    
  const coordinatesString = coordinates ? coordinates.join(',') : null;
  useEffect(() => {
    previousCoordinatesRef.current = coordinatesString;
  }, [coordinatesString]);
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        const [lat, lng] = coordinates;
        
        try {
          const spatialResults = await performSpatialSearch(lat, lng, searchRadius, filters);
          if (spatialResults && spatialResults.length > 0) {
            return spatialResults;
          }
        } catch (spatialError) {
          console.log('Spatial search failed, using fallback search instead:', spatialError);
        }
        
        return await performFallbackSearch(lat, lng, searchRadius, filters);
      } catch (err) {
        return handleSearchError(err, toast);
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
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
