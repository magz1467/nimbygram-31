
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Application } from "@/types/planning";
import { featureFlags, FeatureFlags } from '@/config/feature-flags';
import { SearchFilters } from './search/types';
import { useProgressiveSearch } from './search/use-progressive-search';
import { useSearchErrorHandler } from './search/use-search-error-handler';
import { useSearchTelemetry } from './search/use-search-telemetry';
import { executeSearch } from './search/search-executor';

export { SearchFilters } from './search/types';

export const usePlanningSearch = (coordinates: [number, number] | null) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5);
  
  const { logSearchCompleted } = useSearchTelemetry();
  const { handleSearchError, errorRef, searchMethodRef } = useSearchErrorHandler(
    coordinates, 
    searchRadius, 
    filters
  );
  
  const { results: progressiveResults, isLoading: isLoadingProgressive } = 
    useProgressiveSearch(coordinates, searchRadius, filters);
  
  const queryKey = useRef<string[]>(['planning-applications', 'no-coordinates']);
  
  if (coordinates) {
    const filterString = JSON.stringify(filters);
    const radiusString = searchRadius.toString();
    const coordString = coordinates.join(',');
    
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
        
        const result = await executeSearch(
          { coordinates, radius: searchRadius, filters },
          searchMethodRef
        );
        
        logSearchCompleted(
          coordinates,
          searchRadius,
          filters,
          result.applications.length,
          result.searchMethod
        );
        
        return result.applications;
      } catch (err) {
        handleSearchError(err);
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

  const error = queryError || errorRef.current;
  
  const finalApplications = (isLoading && progressiveResults.length > 0) 
    ? progressiveResults 
    : (applications || []);

  return {
    applications: finalApplications,
    isLoading: isLoading && !isLoadingProgressive,
    isLoadingProgressive,
    error,
    filters,
    setFilters,
    searchRadius,
    setSearchRadius,
    progressiveResults: progressiveResults.length > 0
  };
};
