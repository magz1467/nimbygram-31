
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "../utils/distance-calculator";
import { Application } from "@/types/planning";

/**
 * Fetches applications near a given coordinate point
 * @param coordinates [latitude, longitude]
 * @param radiusKm Search radius in kilometers
 * @returns Array of application data
 */
export async function fetchNearbyApplications(
  coordinates: [number, number], 
  radiusKm: number = 10
): Promise<any[]> {
  const [lat, lng] = coordinates;
  
  // Calculate bounding box for the search area
  const kmPerDegree = 111.32;
  const latDiff = radiusKm / kmPerDegree;
  const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
  
  // Query with geographic bounds
  const { data, error } = await supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', lat - latDiff)
    .lte('latitude', lat + latDiff)
    .gte('longitude', lng - lngDiff)
    .lte('longitude', lng + lngDiff)
    .limit(500);
    
  if (error) throw error;
  return data || [];
}

/**
 * Transforms and sorts applications by distance from coordinates
 * @param rawData Raw application data from the database
 * @param coordinates [latitude, longitude] reference point
 * @returns Transformed Application objects sorted by distance
 */
export function transformAndSortApplications(
  rawData: any[],
  coordinates: [number, number]
): Application[] {
  return rawData
    .filter(item => item.latitude && item.longitude)
    .map(item => {
      const dist = calculateDistance(
        coordinates[0], coordinates[1],
        Number(item.latitude), Number(item.longitude)
      );
      
      return {
        id: item.id,
        title: item.description || `Application ${item.id}`,
        address: item.address || '',
        status: item.status || 'unknown',
        coordinates: [Number(item.latitude), Number(item.longitude)],
        distance: `${(dist * 0.621371).toFixed(1)} mi`, // Convert km to miles
        // Include other fields as needed
      } as Application;
    })
    .sort((a, b) => {
      const distA = calculateDistance(
        coordinates[0], coordinates[1],
        (a.coordinates as [number, number])[0], (a.coordinates as [number, number])[1]
      );
      const distB = calculateDistance(
        coordinates[0], coordinates[1],
        (b.coordinates as [number, number])[0], (b.coordinates as [number, number])[1]
      );
      return distA - distB;
    });
}
