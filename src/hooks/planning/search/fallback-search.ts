
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";
import { isTimeoutError } from "@/utils/errors";

/**
 * Performs a fallback search for planning applications using a bounding box approach
 */
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box approach');
  
  // Start with a smaller radius first
  let searchRadius = radiusKm * 0.5;
  let maxAttempts = 3;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    try {
      console.log(`Search attempt ${attempt + 1} with radius ${searchRadius}km`);
      
      const latDelta = searchRadius / 111.32;
      const lngDelta = searchRadius / (111.32 * Math.cos(lat * Math.PI / 180));
      
      // Build the query with a smaller limit
      let query = supabase
        .from('crystal_roof')
        .select('*')
        .gte('latitude', lat - latDelta)
        .lte('latitude', lat + latDelta)
        .gte('longitude', lng - lngDelta)
        .lte('longitude', lng + lngDelta)
        .limit(50); // Reduced limit for better performance
      
      // Apply any filters
      if (filters?.status) {
        query = query.ilike('status', `%${filters.status}%`);
      }
      if (filters?.type) {
        query = query.ilike('type', `%${filters.type}%`);
      }
      
      console.log('Executing fallback search query');
      
      // Execute the query with an AbortController for timeout handling
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);
      
      try {
        const { data, error } = await query;
        
        // Clear the timeout since the query completed
        clearTimeout(timeoutId);
        
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log('No results found in fallback search');
          return [];
        }
        
        console.log(`Found ${data.length} results in fallback search`);
        
        // Process and return the results
        return data
          .filter(app => typeof app.latitude === 'number' && typeof app.longitude === 'number')
          .map(app => {
            const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
            return {
              ...app,
              distance: `${(distanceKm * 0.621371).toFixed(1)} mi`,
              coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
            };
          })
          .sort((a, b) => {
            const distA = calculateDistance(lat, lng, Number(a.latitude), Number(a.longitude));
            const distB = calculateDistance(lat, lng, Number(b.latitude), Number(b.longitude));
            return distA - distB;
          });
      } catch (error) {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        
        // If it's an abort error, treat it as a timeout
        if (error.name === 'AbortError') {
          console.log('Query timed out, will retry with smaller radius');
          searchRadius = searchRadius * 0.5;
          attempt++;
          continue;
        }
        
        throw error;
      }
    } catch (error) {
      console.error(`Search attempt ${attempt + 1} failed:`, error);
      
      if (!isTimeoutError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      
      searchRadius = searchRadius * 0.5;
      attempt++;
    }
  }
  
  throw new Error('Search failed after multiple attempts. Please try a more specific location.');
}
