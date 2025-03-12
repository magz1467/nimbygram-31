
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
    
    // Calculate bounding box - more accurate calculation
    const latDelta = radiusKm / 111.32; // 1 degree latitude is approximately 111.32 km
    const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180)); // Account for longitude distortion
    
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;
    
    console.log(`Search bounds: lat ${minLat.toFixed(4)} to ${maxLat.toFixed(4)}, lng ${minLng.toFixed(4)} to ${maxLng.toFixed(4)}`);
    
    // Create query - use more specific column names from crystal_roof
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
      query = query.ilike('classification', `%${filters.classification}%`); // Use classification instead of class_3
    }
    
    // Increase limit for wider search
    query = query.limit(100);
    
    // Execute query with timeout handling
    const queryPromise = query;
    
    // Execute query
    const { data, error } = await queryPromise;
    
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
          // Store the raw distance for sorting
          _rawDistance: distanceKm
        };
      })
      .sort((a, b) => (a._rawDistance || Infinity) - (b._rawDistance || Infinity));
    
    // Remove the temporary _rawDistance property
    return results.map(({ _rawDistance, ...app }) => app);
  } catch (error) {
    console.error('Fallback search failed:', error);
    // Return empty array instead of throwing
    return [];
  }
}
