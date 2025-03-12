
import { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const { toast } = useToast();
  const errorRef = useRef<Error | null>(null);
  
  // Function to handle search errors
  const handleSearchError = useCallback((err: any) => {
    console.error('Search error:', err);
    errorRef.current = err instanceof Error ? err : new Error(String(err));
    
    // Provide user feedback
    toast({
      title: "Search Error",
      description: err?.message || "There was an issue with your search. Please try again.",
      variant: "destructive"
    });
  }, [toast]);
  
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
  
  const { data: applications = [], isLoading, error: queryError } = useQuery({
    queryKey: queryKey.current,
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log('Searching with coordinates:', coordinates, 'radius:', searchRadius);
        
        const [lat, lng] = coordinates;
        
        // First try spatial search (with PostGIS)
        console.log('Attempting spatial search first...');
        const spatialResults = await performSpatialSearch(lat, lng, searchRadius, filters);
        
        // If spatial search returns results or empty array (not null), use those results
        if (spatialResults !== null) {
          console.log('Using spatial search results:', spatialResults.length);
          return spatialResults;
        }
        
        // If spatial search returns null (indicating failure/unavailability), use fallback
        console.log('Spatial search unavailable, using fallback search');
        const fallbackResults = await performFallbackSearch(lat, lng, searchRadius, filters);
        console.log('Got fallback results:', fallbackResults.length);
        return fallbackResults;
      } catch (err) {
        handleSearchError(err);
        // Return empty array to prevent component crashes
        return [];
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once
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
