
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType } from "@/utils/errors/types";

/**
 * Performs a fallback search for planning applications using a bounding box approach
 * This is used when the spatial search function is not available
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box approach');
  console.log('Search parameters:', { lat, lng, radiusKm, filters });
  
  try {
    // Calculate the latitude and longitude deltas for the bounding box
    // 1 degree of latitude = ~111.32 km
    // 1 degree of longitude = ~111.32 km * cos(latitude)
    const latDelta = radiusKm / 111.32;
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
    
    // Build the query
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta);
    
    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.ilike('status', `%${filters.status}%`);
      }
      
      if (filters.type) {
        query = query.ilike('type', `%${filters.type}%`);
      }
    }
    
    // Limit the number of results
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
          throw createAppError('Search failed after retry with reduced area', reducedError, { 
            type: ErrorType.TIMEOUT,
            recoverable: true
          });
        }
        
        if (!reducedData || reducedData.length === 0) {
          console.log('No results found in reduced search area');
          return [];
        }
        
        data = reducedData;
      } else {
        throw createAppError('Search failed', error, { 
          type: ErrorType.DATABASE,
          context: { lat, lng, radiusKm }
        });
      }
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in fallback search');
      return [];
    }
    
    console.log(`Found ${data.length} results in fallback search`);
    
    // Add distance and sort results
    const results = data
      .filter((app) => {
        return (typeof app.latitude === 'number' && typeof app.longitude === 'number');
      })
      .map((app) => {
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        const distanceMiles = distanceKm * 0.621371;
        
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
        };
      })
      .sort((a, b) => {
        const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
        const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
        return distA - distB;
      });
    
    console.log(`Returning ${results.length} filtered and sorted results`);
    return results;
  } catch (error) {
    console.error('Error in fallback search:', error);
    
    // Wrap in AppError if not already
    if (!(error.name === 'AppError')) {
      throw createAppError('Failed to perform fallback search', error, {
        type: ErrorType.UNKNOWN,
        recoverable: false
      });
    }
    
    throw error;
  }
}
