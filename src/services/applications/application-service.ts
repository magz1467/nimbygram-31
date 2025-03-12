
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "@/hooks/planning/utils/distance-calculator";
import { tryCatch } from "@/utils/errors/async-error-handler";

/**
 * Fetches applications within a radius of coordinates
 */
export async function fetchApplicationsInRadius(
  lat: number,
  lng: number,
  radiusKm: number = 5,
  limit: number = 200
): Promise<Application[]> {
  // Calculate bounding box for better performance
  const latDelta = radiusKm / 111.32; // 1 degree latitude is approximately 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = lng - lngDelta;
  const maxLng = lng + lngDelta;
  
  console.log(`Fetching applications in radius ${radiusKm}km from [${lat}, ${lng}]`);
  
  const [result, error] = await tryCatch(async () => {
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', minLat)
      .lte('latitude', maxLat)
      .gte('longitude', minLng)
      .lte('longitude', maxLng)
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  }, [], { context: 'fetchApplicationsInRadius' });
  
  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
  
  // Filter, calculate distance and sort applications
  return result
    .filter((app: any) => {
      // Ensure application has valid coordinates
      return (
        typeof app.latitude === 'number' && 
        typeof app.longitude === 'number' && 
        !isNaN(app.latitude) && 
        !isNaN(app.longitude)
      );
    })
    .map((app: any) => {
      // Calculate distance
      const distanceKm = calculateDistance(
        lat, 
        lng, 
        Number(app.latitude), 
        Number(app.longitude)
      );
      
      const distanceMiles = distanceKm * 0.621371;
      
      return {
        ...app,
        distance: `${distanceMiles.toFixed(1)} mi`,
        distance_km: distanceKm,
        coordinates: [Number(app.latitude), Number(app.longitude)] as [number, number]
      };
    })
    .sort((a: any, b: any) => {
      // Sort by distance
      return (a.distance_km || Infinity) - (b.distance_km || Infinity);
    })
    .filter((app: any) => {
      // Only include applications within the specified radius
      return app.distance_km <= radiusKm;
    });
}

/**
 * Fetch a single application by ID
 */
export async function fetchApplicationById(id: number): Promise<Application | null> {
  const [result, error] = await tryCatch(async () => {
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Application;
  }, null, { context: 'fetchApplicationById' });
  
  if (error) {
    console.error(`Error fetching application with ID ${id}:`, error);
    return null;
  }
  
  return result;
}
