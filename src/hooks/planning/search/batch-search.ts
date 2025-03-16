
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { SearchFilters } from "./types";
import { calculateBoundingBox } from "../utils/bounding-box";
import { calculateDistance, kmToMiles } from "../utils/distance-calculator";

/**
 * Performs a batch search for multiple coordinate pairs at once
 * This reduces the number of database connections needed
 */
export const batchSearchLocations = async (
  searchRequests: Array<{
    coordinates: [number, number];
    radius: number;
    filters?: SearchFilters;
  }>,
  limit: number = 25
): Promise<Record<string, any[]>> => {
  if (!searchRequests.length) return {};
  
  try {
    console.log(`Performing batch search for ${searchRequests.length} locations`);
    
    // Step 1: Calculate unified bounding box that encompasses all search areas
    // This allows us to make a single query to the database
    const allBoundingBoxes = searchRequests.map(request => {
      const [lat, lng] = request.coordinates;
      return calculateBoundingBox(lat, lng, request.radius);
    });
    
    // Find the extremes to create one large bounding box
    const unifiedBoundingBox = {
      minLat: Math.min(...allBoundingBoxes.map(box => box.minLat)),
      maxLat: Math.max(...allBoundingBoxes.map(box => box.maxLat)),
      minLng: Math.min(...allBoundingBoxes.map(box => box.minLng)),
      maxLng: Math.max(...allBoundingBoxes.map(box => box.maxLng))
    };
    
    console.log(`Unified bounding box: ${JSON.stringify(unifiedBoundingBox)}`);
    
    // Step 2: Make a single query to get all potential results
    // Get double the limit to ensure we have enough results for each search
    const query = supabase
      .from('crystal_roof')
      .select(`
        id, latitude, longitude, description, status, 
        address, size, category, created_at, updated_at,
        authority_name, impact_score, title, ref_number, image_url,
        location_image, storybook
      `)
      .gte('latitude', unifiedBoundingBox.minLat)
      .lte('latitude', unifiedBoundingBox.maxLat)
      .gte('longitude', unifiedBoundingBox.minLng)
      .lte('longitude', unifiedBoundingBox.maxLng)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(limit * searchRequests.length * 2); // Double the limit to ensure we have enough results
    
    // Add timeout to query execution
    const response = await withTimeout(
      query,
      30000,
      'Batch search timeout'
    );
    
    if (response?.error) {
      console.error('Error in batch search:', response.error);
      throw response.error;
    }
    
    // Step 3: Filter and process results for each search request
    const resultsBySearchKey: Record<string, any[]> = {};
    
    if (response?.data && Array.isArray(response.data)) {
      // For each search request...
      searchRequests.forEach((request, index) => {
        const [lat, lng] = request.coordinates;
        const radius = request.radius;
        const requestKey = `${lat},${lng},${radius}`;
        
        // Filter results that are within this request's radius
        const resultsWithDistance = response.data
          .filter(app => {
            const appLat = parseFloat(app.latitude);
            const appLng = parseFloat(app.longitude);
            
            // Calculate distance
            const distance = calculateDistance(lat, lng, appLat, appLng);
            
            // Check if within radius
            return distance <= radius;
          })
          .map(app => {
            const appLat = parseFloat(app.latitude);
            const appLng = parseFloat(app.longitude);
            
            // Calculate distance
            const distance = calculateDistance(lat, lng, appLat, appLng);
            
            return {
              ...app,
              distance,
              distance_miles: kmToMiles(distance)
            };
          });
        
        // Sort by distance
        resultsWithDistance.sort((a, b) => a.distance - b.distance);
        
        // Take only up to the limit
        resultsBySearchKey[requestKey] = resultsWithDistance.slice(0, limit);
      });
    }
    
    return resultsBySearchKey;
  } catch (error) {
    console.error('Error in batch search:', error);
    throw error;
  }
};

/**
 * Get a unique key for a search request to use in result mapping
 */
export const getSearchRequestKey = (
  coordinates: [number, number],
  radius: number,
  filters?: SearchFilters
): string => {
  return `${coordinates[0]},${coordinates[1]},${radius},${JSON.stringify(filters || {})}`;
};
