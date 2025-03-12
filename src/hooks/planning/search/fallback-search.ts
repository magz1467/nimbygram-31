
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

function calculateBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  // Calculate bounding box once
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta
  };
}

export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box approach');
  
  // Calculate bounding box once
  const bbox = calculateBoundingBox(lat, lng, radiusKm);
  
  try {
    // Build the query using pre-calculated bounding box
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', bbox.minLat)
      .lte('latitude', bbox.maxLat)
      .gte('longitude', bbox.minLng)
      .lte('longitude', bbox.maxLng);
    
    // Apply filters if provided
    if (filters?.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    if (filters?.type) {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    // First try with a smaller limit to get quick results
    const { data: quickData, error: quickError } = await query.limit(50);
    
    // If we got some initial results, return them while we fetch more
    if (quickData && quickData.length > 0) {
      // Process quick results
      const quickResults = processResults(quickData, lat, lng);
      
      // Then try to get the full result set in the background
      try {
        const { data: fullData } = await query.limit(200);
        if (fullData && fullData.length > quickData.length) {
          return processResults(fullData, lat, lng);
        }
      } catch (fullError) {
        console.warn('Full query error, using quick results:', fullError);
        // Just use the quick results if the full query fails
      }
      
      return quickResults;
    }
    
    // If no quick results, try the full query
    const { data, error } = await query.limit(200);
    
    if (error) {
      console.error('Fallback search error:', error);
      // Instead of throwing, return an empty array
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No results found in fallback search');
      return [];
    }
    
    return processResults(data, lat, lng);
    
  } catch (error) {
    console.error('Error in fallback search:', error);
    // Return empty array instead of throwing
    return [];
  }
}

function processResults(data: any[], lat: number, lng: number): Application[] {
  return data
    .filter((app) => typeof app.latitude === 'number' && typeof app.longitude === 'number')
    .map((app) => {
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
}
