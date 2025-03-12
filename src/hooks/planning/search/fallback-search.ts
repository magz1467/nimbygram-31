
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a bounding box search when spatial search is unavailable
 * This is our primary search method since the spatial search function may not exist
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  try {
    console.log('Performing fallback search with bounding box');
    console.log('Search parameters:', { lat, lng, radiusKm, filters });
    
    // Calculate bounding box - accurate calculation for UK latitudes
    const latDelta = radiusKm / 111.32; // 1 degree latitude is approximately 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180)); // Account for longitude distortion
    
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;
    
    console.log(`Search bounds: lat ${minLat.toFixed(4)} to ${maxLat.toFixed(4)}, lng ${minLng.toFixed(4)} to ${maxLng.toFixed(4)}`);
    
    // Create query with smaller batch size to avoid timeouts
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng);
    
    // Add other filters if they exist
    if (filters?.status && filters.status.trim() !== '') {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters?.type && filters.type.trim() !== '') {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    // Use a smaller limit to prevent timeout errors
    query = query.limit(200);
    
    console.log('Executing fallback search query');
    let { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      
      // Handle timeout errors specifically
      if (error.message.includes('timeout') || error.message.includes('canceling statement')) {
        console.log('Query timeout occurred, reducing search area');
        
        // Try a more restricted search area
        const reducedRadius = radiusKm * 0.5;
        const reducedLatDelta = reducedRadius / 111.32;
        const reducedLngDelta = reducedRadius / (111.32 * Math.cos(lat * Math.PI / 180));
        
        const reducedQuery = supabase
          .from('crystal_roof')
          .select('*')
          .gte('latitude', lat - reducedLatDelta)
          .lte('latitude', lat + reducedLatDelta)
          .gte('longitude', lng - reducedLngDelta)
          .lte('longitude', lng + reducedLngDelta)
          .limit(100);
        
        const { data: reducedData, error: reducedError } = await reducedQuery;
        
        if (reducedError) {
          console.error('Reduced area search also failed:', reducedError);
          throw reducedError;
        }
        
        if (!reducedData || reducedData.length === 0) {
          console.log('No results found in reduced search area');
          return [];
        }
        
        data = reducedData;
      } else {
        throw error;
      }
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in fallback search');
      return [];
    }
    
    console.log(`Found ${data.length} raw results in fallback search`);
    
    // Filter out invalid coordinates and calculate distances
    const results = data
      .filter(app => typeof app.latitude === 'number' && typeof app.longitude === 'number')
      .map(app => {
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        const distanceMiles = distanceKm * 0.621371;
        
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)]
        };
      })
      .sort((a, b) => {
        const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
        const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
        return distA - distB;
      });
    
    console.log(`Returning ${results.length} sorted results`);
    return results;
  } catch (error) {
    console.error('Fallback search failed:', error);
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
}
