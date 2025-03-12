
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { Application } from "@/types/planning";
import { performSpatialSearch } from './search/spatial-search';
import { performFallbackSearch } from './search/fallback-search';
import { handleSearchError } from './search/error-handler';
import { ErrorType, AppError } from '@/utils/errors';
import { isUKPostcode } from '@/services/coordinates/location-type-detector';
import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  status?: string;
  type?: string;
  classification?: string;
}

/**
 * Log search attempt to Supabase for analytics and debugging
 */
async function logSearchAttempt(
  coordinates: [number, number] | null,
  filters: SearchFilters,
  searchRadius: number
) {
  try {
    const { data, error } = await supabase.from('SearchAttempts').insert({
      coordinates: coordinates ? { lat: coordinates[0], lng: coordinates[1] } : null,
      filters,
      radius_km: searchRadius,
      timestamp: new Date().toISOString(),
      browser_info: navigator.userAgent,
      online_status: navigator.onLine
    });
    
    if (error) {
      console.error('Failed to log search attempt:', error);
    }
  } catch (e) {
    console.error('Exception while logging search attempt:', e);
    // Don't block the search if logging fails
  }
}

// List of postcode areas with good coverage
const COVERAGE_AREAS = [
  'AL', 'BR', 'CM', 'CR', 'DA', 'E', 'EC', 'EN', 'HA', 'IG', 
  'KT', 'N', 'NW', 'RM', 'SE', 'SM', 'SW', 'TN', 'TW', 'UB', 
  'W', 'WC', 'WD'
];

// Check if a postcode is in a well-covered area
function isInPrimaryCoverageArea(searchTerm: string): boolean {
  if (!isUKPostcode(searchTerm)) return true; // Not a postcode, use default behavior
  const outwardCode = searchTerm.trim().toUpperCase().split(' ')[0];
  const area = outwardCode.replace(/[0-9]/g, '');
  return COVERAGE_AREAS.includes(area);
}

export const usePlanningSearch = (coordinates: [number, number] | null, searchTerm?: string) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchRadius, setSearchRadius] = useState<number>(5); // Default radius in km
  const { toast } = useToast();
  
  // Adjust radius based on search term location
  useEffect(() => {
    if (!coordinates || !searchTerm) return;
    
    // For postcodes outside our main coverage area, use a smaller radius to improve performance
    if (isUKPostcode(searchTerm) && !isInPrimaryCoverageArea(searchTerm)) {
      console.log('Postcode outside primary coverage area, using reduced search radius');
      setSearchRadius(3); // Smaller radius for areas with less coverage
    } else {
      setSearchRadius(5); // Default radius
    }
  }, [coordinates, searchTerm]);
  
  // Detailed debug logging for coordinates changes
  useEffect(() => {
    if (coordinates) {
      console.group('🔍 usePlanningSearch - Coordinates Change');
      console.log(`Search coordinates updated: [${coordinates[0]}, ${coordinates[1]}]`);
      console.log('Current filters:', filters);
      console.log('Current radius:', searchRadius);
      console.log('Device memory:', (navigator as any).deviceMemory || 'unknown');
      console.log('Hardware concurrency:', navigator.hardwareConcurrency);
      console.log('Online status:', navigator.onLine);
      console.groupEnd();
    }
  }, [coordinates, filters, searchRadius]);
  
  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['planning-applications', coordinates?.join(','), filters, searchRadius],
    queryFn: async () => {
      if (!coordinates) return [];
      
      try {
        console.group('🔍 Planning Search - DETAILED DIAGNOSTICS');
        const startTime = Date.now();
        console.log(`Search with coordinates: [${coordinates[0]}, ${coordinates[1]}], radius: ${searchRadius}km`);
        console.log('Filters:', filters);
        console.log('Browser details:', navigator.userAgent);
        console.log('Window dimensions:', { 
          width: window.innerWidth, 
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio
        });
        
        // Log memory usage if available
        if (window.performance && (window.performance as any).memory) {
          console.log('Memory usage:', {
            jsHeapSizeLimit: (window.performance as any).memory.jsHeapSizeLimit,
            totalJSHeapSize: (window.performance as any).memory.totalJSHeapSize,
            usedJSHeapSize: (window.performance as any).memory.usedJSHeapSize
          });
        }
        
        // Log network conditions if available
        if ((navigator as any).connection) {
          console.log('Network conditions:', {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt,
            saveData: (navigator as any).connection.saveData
          });
        }
        
        // Log search attempt for analytics
        await logSearchAttempt(coordinates, filters, searchRadius);
        
        const [lat, lng] = coordinates;
        let radiusKm = searchRadius; // Using let so we can modify it if needed
        
        // Try spatial search first with a longer timeout
        try {
          console.log('Attempting spatial search with PostGIS...');
          const spatialStartTime = Date.now();
          console.log(`Spatial search started at: ${new Date(spatialStartTime).toISOString()}`);
          
          const spatialResults = await performSpatialSearch(lat, lng, radiusKm, filters);
          
          const spatialEndTime = Date.now();
          console.log(`Spatial search took ${spatialEndTime - spatialStartTime}ms`);
          console.log(`Spatial search completed at: ${new Date(spatialEndTime).toISOString()}`);
          
          if (spatialResults && spatialResults.length > 0) {
            console.log('Spatial search results:', spatialResults.length);
            console.log('First result distance:', spatialResults[0].distance);
            console.log('Last result distance:', spatialResults[spatialResults.length - 1].distance);
            
            const endTime = Date.now();
            console.log(`Total search time: ${endTime - startTime}ms`);
            console.groupEnd();
            return spatialResults;
          }
          
          console.log('Spatial search returned no results, falling back to standard search');
        } catch (spatialFunctionError: any) {
          console.error('Spatial function error details:', {
            error: spatialFunctionError,
            message: spatialFunctionError.message,
            stack: spatialFunctionError.stack,
            name: spatialFunctionError.name,
            code: (spatialFunctionError as any).code || 'unknown'
          });
          console.log('Spatial function not available or failed, using fallback method');
          
          // If this was a timeout error, we should adjust our approach for the fallback
          if (spatialFunctionError.name === 'AbortError' || 
              spatialFunctionError.message?.toLowerCase().includes('timeout')) {
            console.log('Reducing search radius for fallback due to timeout');
            radiusKm = Math.max(2, radiusKm - 2); // Reduce radius but keep at least 2km
          }
        }
        
        // If spatial search fails or isn't available, fall back to manual search
        console.log('Using fallback bounding box search with radius:', radiusKm);
        const fallbackStartTime = Date.now();
        console.log(`Fallback search started at: ${new Date(fallbackStartTime).toISOString()}`);
        
        // Use a smaller radius for the fallback search if we're outside primary coverage areas
        if (searchTerm && !isInPrimaryCoverageArea(searchTerm)) {
          console.log('Using smaller radius for fallback search in non-primary area');
          radiusKm = Math.min(radiusKm, 3);
        }
        
        const fallbackResults = await performFallbackSearch(lat, lng, radiusKm, filters);
        
        const fallbackEndTime = Date.now();
        console.log(`Fallback search took ${fallbackEndTime - fallbackStartTime}ms`);
        console.log(`Fallback search completed at: ${new Date(fallbackEndTime).toISOString()}`);
        console.log('Fallback search results:', fallbackResults.length);
        
        if (fallbackResults.length > 0) {
          console.log('First result distance:', fallbackResults[0].distance);
          console.log('Last result distance:', fallbackResults[fallbackResults.length - 1].distance);
        }
        
        const endTime = Date.now();
        console.log(`Total search time: ${endTime - startTime}ms`);
        console.groupEnd();
        return fallbackResults;
      } catch (err: any) {
        const searchParams = {
          coordinates,
          filters,
          radius: searchRadius,
          searchTerm
        };
        
        console.error('Search error details:', {
          error: err,
          message: err.message,
          stack: err.stack,
          coordinates,
          filters,
          radius: searchRadius,
          timestamp: new Date().toISOString()
        });
        
        return handleSearchError(err, toast, searchParams);
      }
    },
    enabled: !!coordinates,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
    retry: (failureCount, error) => {
      // Detailed retry logging
      console.group('🔄 Query Retry Evaluation');
      console.log(`Query retry attempt ${failureCount}`, { error });
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: (error as any).code
      });
      
      // Don't retry more than once
      if (failureCount >= 1) {
        console.log('Not retrying: max failure count reached');
        console.groupEnd();
        return false;
      }
      
      // Don't retry timeout errors
      if (error instanceof AppError && error.type === ErrorType.TIMEOUT) {
        console.log('Not retrying: timeout error detected in AppError type');
        console.groupEnd();
        return false;
      }
      
      // Don't retry network errors when offline
      if (!navigator.onLine) {
        console.log('Not retrying: browser is offline');
        console.groupEnd();
        return false;
      }
      
      // Check error message for timeout indicators
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message).toLowerCase();
        if (
          errorMessage.includes('timeout') || 
          errorMessage.includes('timed out') ||
          errorMessage.includes('too long')
        ) {
          console.log('Not retrying: timeout error detected in message');
          console.groupEnd();
          return false;
        }
      }
      
      console.log('Retrying query once');
      console.groupEnd();
      return true;
    },
    retryDelay: 1000, // Wait 1 second before retrying
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
