
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
    
    // Calculate bounding box
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    
    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;
    
    console.log(`Search bounds: lat ${minLat} to ${maxLat}, lng ${minLng} to ${maxLng}`);
    
    // Create query with proper typings for the filter conditions
    let query = supabase
      .from('crystal_roof')
      .select('*');
    
    // Add lat/lng filters using gt/lt operators
    query = query.gte('latitude', minLat);
    query = query.lte('latitude', maxLat);
    query = query.gte('longitude', minLng);
    query = query.lte('longitude', maxLng);
    
    // Add other filters
    if (filters.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters.type) {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    if (filters.classification) {
      query = query.ilike('classification', `%${filters.classification}%`);
    }
    
    // Limit to a reasonable number
    query = query.limit(50);
    
    // Execute query
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
    
    // Add distance and sort
    return data
      .map(app => ({
        ...app,
        distance: calculateDistance(lat, lng, Number(app.latitude), Number(app.longitude))
      }))
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Fallback search failed:', error);
    return [];
  }
}
