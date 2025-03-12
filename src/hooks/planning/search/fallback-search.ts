
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { calculateDistance } from "../utils/distance-calculator";

interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

// Pre-calculate bounding box for better performance
function calculateBoundingBox(lat: number, lng: number, radiusKm: number): BoundingBox {
  // More accurate calculation based on the Earth's radius at the given latitude
  const latRadian = lat * Math.PI / 180;
  const latDegPerKm = 1 / 110.574; // Degrees per km at the equator
  const lngDegPerKm = 1 / (111.320 * Math.cos(latRadian)); // Adjust for latitude
  
  return {
    minLat: lat - (radiusKm * latDegPerKm),
    maxLat: lat + (radiusKm * latDegPerKm),
    minLng: lng - (radiusKm * lngDegPerKm),
    maxLng: lng + (radiusKm * lngDegPerKm)
  };
}

// Progressive search function that returns results in batches
export async function performFallbackSearch(
  lat: number, 
  lng: number, 
  radiusKm: number,
  filters: any
): Promise<Application[]> {
  console.log('Performing fallback search with bounding box approach');
  
  // Calculate bounding box once for efficiency
  const bbox = calculateBoundingBox(lat, lng, radiusKm);
  console.log('Search bounding box:', bbox);
  
  // Storage for all results
  let allResults: any[] = [];
  
  try {
    // Step 1: Try a small quick query first for fast response
    const quickQuery = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', bbox.minLat)
      .lte('latitude', bbox.maxLat)
      .gte('longitude', bbox.minLng)
      .lte('longitude', bbox.maxLng)
      .limit(25);
    
    // Apply filters if provided
    if (filters?.status) {
      quickQuery.ilike('status', `%${filters.status}%`);
    }
    if (filters?.type) {
      quickQuery.ilike('type', `%${filters.type}%`);
    }
    
    // Execute the query with timeout
    const { data: quickData, error: quickError } = await quickQuery.timeout(6000);
    
    // If we got quick results, use them
    if (quickData && quickData.length > 0) {
      console.log(`Got ${quickData.length} quick results from fallback search`);
      allResults = quickData;
      
      // Process and return these initial results while we fetch more
      const quickResults = processResults(allResults, lat, lng);
      
      // Step 2: Try to get more results in a background fetch
      try {
        const fullQuery = supabase
          .from('crystal_roof')
          .select('*')
          .gte('latitude', bbox.minLat)
          .lte('latitude', bbox.maxLat)
          .gte('longitude', bbox.minLng)
          .lte('longitude', bbox.maxLng)
          .limit(150);
        
        // Apply the same filters
        if (filters?.status) {
          fullQuery.ilike('status', `%${filters.status}%`);
        }
        if (filters?.type) {
          fullQuery.ilike('type', `%${filters.type}%`);
        }
        
        // Execute with longer timeout
        const { data: fullData } = await fullQuery.timeout(15000);
        
        if (fullData && fullData.length > quickData.length) {
          console.log(`Got ${fullData.length} total results from fallback search`);
          return processResults(fullData, lat, lng);
        }
      } catch (fullError) {
        console.warn('Full fallback query failed, using quick results:', fullError);
      }
      
      return quickResults;
    }
    
    // If quick query failed or returned no results, try with tighter bounds
    if (quickError || !quickData || quickData.length === 0) {
      console.log('Quick query failed or returned no results, trying with modified bounds');
      
      // Reduce the search radius for faster query
      const tighterBbox = calculateBoundingBox(lat, lng, radiusKm * 0.7);
      
      const backupQuery = supabase
        .from('crystal_roof')
        .select('*')
        .gte('latitude', tighterBbox.minLat)
        .lte('latitude', tighterBbox.maxLat)
        .gte('longitude', tighterBbox.minLng)
        .lte('longitude', tighterBbox.maxLng)
        .limit(75);
      
      if (filters?.status) {
        backupQuery.ilike('status', `%${filters.status}%`);
      }
      if (filters?.type) {
        backupQuery.ilike('type', `%${filters.type}%`);
      }
      
      const { data: backupData, error: backupError } = await backupQuery.timeout(10000);
      
      if (backupError) {
        console.error('Backup query error:', backupError);
        return [];
      }
      
      if (!backupData || backupData.length === 0) {
        console.log('No results found in fallback search');
        return [];
      }
      
      console.log(`Got ${backupData.length} results from backup fallback search`);
      return processResults(backupData, lat, lng);
    }
    
    // This code should never be reached, but just in case
    return processResults(allResults, lat, lng);
    
  } catch (error) {
    console.error('Error in fallback search:', error);
    
    // If we have any results, return them even if partial
    if (allResults.length > 0) {
      console.log(`Returning ${allResults.length} partial results from fallback search`);
      return processResults(allResults, lat, lng);
    }
    
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
