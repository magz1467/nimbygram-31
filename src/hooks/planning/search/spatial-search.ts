
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications using PostGIS
 * Returns null if the function is not available, which will trigger fallback search
 */
export async function performSpatialSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[] | null> {
  try {
    console.log('Attempting spatial search with RPC function');
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Use progressive loading - first get a small batch of results quickly
    const quickQuery = supabase.rpc(
      'get_nearby_applications',
      {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 25 // Small limit for fast initial results
      },
      { count: 'exact' }
    );
    
    // Add timeout by using AbortController
    const quickController = new AbortController();
    const quickTimeout = setTimeout(() => quickController.abort(), 8000);
    
    try {
      const { data: quickData, error: quickError } = await quickQuery;
      clearTimeout(quickTimeout);
      
      // Handle RPC function errors
      if (quickError) {
        // Log the specific error for debugging
        console.error('Spatial search quick fetch error:', quickError.code, quickError.message);
        
        // If function doesn't exist, use fallback
        if (quickError.message.includes('function') && 
            (quickError.message.includes('exist') || 
             quickError.message.includes('not found') ||
             quickError.message.includes('does not exist'))) {
          console.log('Spatial search RPC function not available, will use fallback search');
          return null;
        }
        
        // Return null for timeouts to trigger fallback
        if (quickError.message.includes('timeout') || 
            quickError.message.includes('cancel') ||
            quickError.message.includes('57014')) {
          console.warn('Spatial search timeout, will use fallback search');
          return null;
        }
        
        // For other errors, also use fallback
        return null;
      }
      
      // Process initial results if available
      if (quickData && quickData.length > 0) {
        console.log(`Got ${quickData.length} quick results from spatial search`);
        const processedQuickData = processResults(quickData, lat, lng, filters);
        
        // Try to get more complete results in the background
        try {
          // Use a longer timeout for the full results
          const fullQuery = supabase.rpc(
            'get_nearby_applications',
            {
              center_lat: lat,
              center_lng: lng,
              radius_km: radiusKm,
              result_limit: 100
            }
          );
          
          // Create a timeout for the full query
          const fullController = new AbortController();
          const fullTimeout = setTimeout(() => fullController.abort(), 15000);
          
          const { data: fullData } = await fullQuery;
          clearTimeout(fullTimeout);
          
          if (fullData && fullData.length > quickData.length) {
            console.log(`Got ${fullData.length} total results from spatial search`);
            return processResults(fullData, lat, lng, filters);
          }
        } catch (fullError) {
          console.warn('Full spatial query failed, using quick results:', fullError);
        }
        
        // Return the quick results if full results failed
        return processedQuickData;
      }
    } catch (quickErr) {
      clearTimeout(quickTimeout);
      console.error('Quick query aborted or failed:', quickErr);
    }
    
    // If no quick results, try one more time with higher limit
    // but still with reasonable timeout
    const finalQuery = supabase.rpc(
      'get_nearby_applications',
      {
        center_lat: lat,
        center_lng: lng,
        radius_km: radiusKm,
        result_limit: 100
      }
    );
    
    // Create a timeout for the final query
    const finalController = new AbortController();
    const finalTimeout = setTimeout(() => finalController.abort(), 12000);
    
    try {
      const { data, error } = await finalQuery;
      clearTimeout(finalTimeout);
      
      if (error) {
        console.error('Spatial search error:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('No results found in spatial search');
        return [];
      }
      
      console.log(`Got ${data.length} results from spatial search`);
      return processResults(data, lat, lng, filters);
    } catch (err) {
      clearTimeout(finalTimeout);
      console.error('Final spatial search error:', err);
      return null;
    }
    
  } catch (error) {
    console.error('Spatial search error:', error);
    return null; // Return null to indicate fallback should be used
  }
}

function processResults(data: any[], lat: number, lng: number, filters: any): Application[] {
  // Apply additional filters if needed
  let filteredData = data;
  
  if (filters) {
    filteredData = data.filter((app: any) => {
      // Status filter
      if (filters.status && app.status && 
          !app.status.toLowerCase().includes(filters.status.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.type && app.type && 
          !app.type.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }
  
  // Add distance and sort
  return filteredData
    .filter((app: any) => {
      return (typeof app.latitude === 'number' && typeof app.longitude === 'number');
    })
    .map((app: any) => {
      const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
      const distanceMiles = distanceKm * 0.621371;
      
      return {
        ...app,
        distance: `${distanceMiles.toFixed(1)} mi`,
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    })
    .sort((a: any, b: any) => {
      const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
      const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
      return distA - distB;
    });
}
