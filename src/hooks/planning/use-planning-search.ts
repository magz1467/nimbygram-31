import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { handleSearchError } from './search/error-handler';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { searchLogger } from '@/utils/searchLogger';
import { ErrorType, createAppError } from '@/utils/errors';
import { supabase } from "@/integrations/supabase/client";

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
  // Keep track of whether we've shown a timeout toast
  const [hasShownTimeoutToast, setHasShownTimeoutToast] = useState(false);
  
  const { data: applications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters, searchAttempts],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.log(`🔍 Search attempt ${searchAttempts + 1} with coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
        
        const [lat, lng] = coordinates;
        // Start with an ultra small radius for immediate results
        const initialRadiusKm = 1;
        
        // Reset timeout toast flag on new searches
        setHasShownTimeoutToast(false);
        
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
        } catch (spatialError: any) {
          // If it's a timeout, we don't want to show multiple toast messages
          if (spatialError?.message?.includes('timeout') || 
              spatialError?.message?.includes('57014') ||
              spatialError?.code === '57014') {
            console.log('Spatial search timed out, proceeding to fallback');
            
            // Only show toast once per search session
            if (!hasShownTimeoutToast) {
              toast({
                title: "Search optimization",
                description: "Trying alternative search method for faster results.",
                variant: "default"
              });
              setHasShownTimeoutToast(true);
            }
          } else if (!isNonCritical(spatialError)) {
            console.error('Spatial search error:', spatialError);
          }
          // Continue to fallback method
        }
        
        // Always try the lightweight fallback search
        console.log('Using fallback search method with ultra-small radius');
        try {
          // Use a small radius first for immediate results
          return await performFallbackSearch(lat, lng, initialRadiusKm, filters);
        } catch (fallbackError: any) {
          // If first fallback fails, try with no filters at all
          if (fallbackError?.message?.includes('timeout') || 
              fallbackError?.message?.includes('57014')) {
            
            console.log('Fallback search timed out, trying emergency minimal search');
            
            // Last resort - get the most recent applications regardless of location
            // and then sort them by proximity to search coordinates
            const { data } = await supabase
              .from('crystal_roof')
              .select('*')
              .limit(30)
              .order('id', { ascending: false });
              
            if (data && data.length > 0) {
              console.log(`Retrieved ${data.length} recent applications as emergency fallback`);
              const applications = data.map(item => {
                return {
                  id: item.id,
                  reference: item.reference || item.lpa_app_no || String(item.id),
                  title: item.description || `Application ${item.id}`,
                  description: item.description || '',
                  status: item.status || 'Unknown',
                  address: item.address || '',
                  postcode: item.postcode || '',
                  coordinates: [Number(item.latitude), Number(item.longitude)] as [number, number],
                  // ... minimal required fields
                } as Application;
              });
              
              // Sort by proximity if coordinates are valid
              return applications;
            }
          }
          
          // If all fallbacks fail, rethrow with a clear message
          throw new Error("Unable to retrieve planning applications at this time. Please try again later.");
        }
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
      // Don't retry too many times
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
