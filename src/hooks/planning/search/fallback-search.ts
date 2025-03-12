
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
    // Calculate bounding box
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    
    // Create query
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', lat - latDelta)
      .lte('latitude', lat + latDelta)
      .gte('longitude', lng - lngDelta)
      .lte('longitude', lng + lngDelta)
      .limit(50);
    
    // Add filters
    if (filters.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters.type) {
      query = query.or(`type.ilike.%${filters.type}%`);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Fallback search error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
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
