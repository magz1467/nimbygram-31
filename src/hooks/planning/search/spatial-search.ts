
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a spatial search for planning applications
 * Since the RPC function might not exist, this function will return null if the function is not available
 * which will trigger the fallback search method
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
    
    // First try with a limit of 50 to get quick results
    let { data: quickData, error: quickError } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 50
    });
    
    // If the function doesn't exist, return null to trigger fallback
    if (quickError) {
      if (quickError.message.includes('Could not find the function') || 
          quickError.message.includes('does not exist')) {
        console.log('Spatial search RPC function not available, will use fallback search');
        return null;
      }
      
      if (quickError.message.includes('canceling statement') || 
          quickError.message.includes('timeout')) {
        console.warn('Spatial search timeout, will use fallback search');
        return null;
      }
      
      console.error('Spatial search error:', quickError);
      // Don't throw, return null to trigger fallback
      return null;
    }
    
    // Process quick results if available
    if (quickData && quickData.length > 0) {
      const processedQuickData = processResults(quickData, lat, lng, filters);
      
      // Try to get more results in the background
      try {
        const { data: fullData, error: fullError } = await supabase.rpc('get_nearby_applications', {
          center_lat: lat,
          center_lng: lng,
          radius_km: radiusKm,
          result_limit: 200
        });
        
        if (!fullError && fullData && fullData.length > quickData.length) {
          return processResults(fullData, lat, lng, filters);
        }
      } catch (fullError) {
        console.warn('Full spatial query failed, using quick results:', fullError);
      }
      
      return processedQuickData;
    }
    
    // If no quick results or error, try with full limit
    const { data, error } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 200
    });
    
    if (error) {
      if (error.message.includes('canceling statement') || 
          error.message.includes('timeout')) {
        console.warn('Spatial search timeout, will use fallback search');
        return null;
      }
      
      console.error('Spatial search error:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in spatial search');
      return [];
    }
    
    return processResults(data, lat, lng, filters);
    
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
