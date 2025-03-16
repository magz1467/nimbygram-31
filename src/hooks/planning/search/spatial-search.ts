
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { useSearchLogger } from "@/hooks/use-search-logger";
import { type PostgrestResponse } from '@supabase/supabase-js';
import { SearchFilters } from "./types";

// This service uses PostGIS spatial functions to find applications within a radius
export const useSpatialSearch = () => {
  const { logSearch, logSearchError } = useSearchLogger();

  const searchNearbyApplications = async (lat: number, lng: number, radius: number, limit = 25) => {
    try {
      console.log(`Performing spatial search at ${lat},${lng} with radius ${radius}km`);
      
      // Try to use the optimized spatial function if available
      const query = supabase
        .rpc('get_nearby_applications', {
          latitude: lat,
          longitude: lng,
          distance_km: radius,
          max_results: limit
        });

      // Add timeout to query execution
      const response = await withTimeout<PostgrestResponse<any>>(
        query, 
        30000, 
        'Spatial search timeout'
      );
      
      if (response && 'data' in response && 'error' in response) {
        const { data, error } = response;
        
        if (error) {
          console.error('Error in spatial search:', error);
          // Check if it's a function not found error (common if PostGIS is not set up)
          const isFunctionMissingError = 
            error.message.includes('function') && 
            (error.message.includes('does not exist') || error.message.includes('not found'));
            
          logSearchError('spatial', isFunctionMissingError ? 'function_missing' : 'database_error', JSON.stringify(error));
          
          // Return error for caller to handle
          return { data: [], error };
        }

        if (data && Array.isArray(data)) {
          console.log(`Found ${data.length} results from spatial search`);
          return { data, error: null };
        }
      }
      
      return { data: [], error: new Error('Invalid response format from database') };
    } catch (error) {
      console.error('Error in spatial search:', error);
      logSearchError('spatial', 'exception', error instanceof Error ? error.message : String(error));
      return { data: [], error };
    }
  };

  return { searchNearbyApplications };
};

// Standalone function for direct use in other modules
export const performSpatialSearch = async (
  lat: number, 
  lng: number, 
  radius: number, 
  filters?: SearchFilters,
  limit = 25
) => {
  try {
    console.log(`Performing standalone spatial search at ${lat},${lng} with radius ${radius}km`);
    
    // Build the query
    let query = supabase
      .rpc('get_nearby_applications', {
        latitude: lat,
        longitude: lng,
        distance_km: radius,
        max_results: limit
      });
    
    // Apply filters if provided (simplified example - expand based on your filter structure)
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('category', filters.type);
      }
    }

    // Add timeout to query execution
    const response = await withTimeout<PostgrestResponse<any>>(
      query, 
      30000, 
      'Spatial search timeout'
    );
    
    if (response && 'data' in response && 'error' in response) {
      const { data, error } = response;
      
      if (error) {
        console.error('Error in spatial search:', error);
        // If it's a function missing error, return null to trigger fallback
        const isFunctionMissingError = 
          error.message.includes('function') && 
          (error.message.includes('does not exist') || error.message.includes('not found'));
          
        if (isFunctionMissingError) {
          console.log('Spatial function not available, returning null to trigger fallback');
          return null;
        }
        
        return [];
      }

      if (data && Array.isArray(data)) {
        console.log(`Found ${data.length} results from spatial search`);
        return data;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error in standalone spatial search:', error);
    return [];
  }
};
