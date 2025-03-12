
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

/**
 * Performs a bounding box search when spatial search is unavailable
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
    
    // Calculate bounding box - more accurate calculation
    const latDelta = radiusKm / 111.32; // 1 degree latitude is approximately 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180)); // Account for longitude distortion
    
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;
    
    console.log(`Search bounds: lat ${minLat.toFixed(4)} to ${maxLat.toFixed(4)}, lng ${minLng.toFixed(4)} to ${maxLng.toFixed(4)}`);
    
    // Create query - directly using crystal_roof table
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng);
    
    // Add other filters if they exist and are not empty
    if (filters?.status && filters.status.trim() !== '') {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters?.type && filters.type.trim() !== '') {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    if (filters?.classification && filters.classification.trim() !== '') {
      query = query.ilike('classification', `%${filters.classification}%`);
    }
    
    // Increase limit to get more results
    query = query.limit(1000);
    
    // Execute query with timeout handling
    console.log('Executing fallback search query');
    const { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in fallback search');
      return [];
    }
    
    console.log(`Found ${data.length} results in fallback search`);
    
    // Add distance and sort - handle cases where lat/lng might not be numeric
    const results = data
      .filter(app => typeof app.latitude === 'number' && typeof app.longitude === 'number')
      .map(app => {
        // Calculate the actual distance in kilometers
        const distanceKm = calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude));
        // Convert to miles for display (UK standard)
        const distanceMiles = distanceKm * 0.621371;
        
        return {
          ...app,
          distance: `${distanceMiles.toFixed(1)} mi`,
          // Add coordinates array for map display
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
    // Return empty array instead of throwing
    return [];
  }
}
