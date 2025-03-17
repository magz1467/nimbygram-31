import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/utils/fetchUtils";
import { SearchFilters } from "./types";
import { PostgrestResponse } from "@supabase/supabase-js";

interface BatchSearchRequest {
  coordinates: [number, number];
  radius: number;
  filters?: SearchFilters;
}

interface BatchSearchResult {
  [key: string]: any[];
}

/**
 * Generates a consistent key for a search request
 */
export const getSearchRequestKey = (
  coordinates: [number, number],
  radius: number,
  filters?: SearchFilters
): string => {
  return `${coordinates[0]},${coordinates[1]},${radius},${JSON.stringify(filters || {})}`;
};

/**
 * Batches multiple location searches into a single request to reduce database load
 */
export const batchSearchLocations = async (
  searchRequests: BatchSearchRequest[]
): Promise<BatchSearchResult> => {
  if (!searchRequests.length) return {};
  
  try {
    // Extract unique coordinates for the query
    const uniqueRequests = deduplicateRequests(searchRequests);
    
    if (uniqueRequests.length === 0) return {};
    if (uniqueRequests.length === 1) {
      // If only one unique request, use standard search
      return singleLocationSearch(
        uniqueRequests[0].coordinates, 
        uniqueRequests[0].radius,
        uniqueRequests[0].filters
      );
    }
    
    // For multiple requests, use batch query approach
    // Combine the requests into a format suitable for the batch RPC call
    const batchParams = {
      locations: uniqueRequests.map(req => ({
        lat: req.coordinates[0],
        lng: req.coordinates[1],
        radius_km: req.radius,
        filters: req.filters || {}
      }))
    };
    
    console.log(`Executing batch search for ${uniqueRequests.length} locations`);
    
    // Execute RPC function for batch search
    const response: PostgrestResponse<any> = await withTimeout(
      supabase.rpc('batch_location_search', batchParams),
      40000, // Longer timeout for batch queries
      'Batch search timeout'
    );
    
    // Fixed type handling for Postgrest response
    if (response && response.error) {
      console.error('Error in batch search:', response.error);
      return fallbackToIndividualQueries(uniqueRequests);
    }
    
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        // Process the batched results into individual result sets
        return processBatchedResults(response.data, uniqueRequests);
      }
    }
    
    console.log('Batch search returned invalid format, falling back to individual queries');
    return fallbackToIndividualQueries(uniqueRequests);
  } catch (error) {
    console.error('Batch search failed:', error);
    // If batch search fails, fall back to individual searches
    return fallbackToIndividualQueries(searchRequests);
  }
};

/**
 * Deduplicates search requests to avoid redundant queries
 */
const deduplicateRequests = (requests: BatchSearchRequest[]): BatchSearchRequest[] => {
  const uniqueKeys = new Set<string>();
  const uniqueRequests: BatchSearchRequest[] = [];
  
  requests.forEach(req => {
    const key = getSearchRequestKey(req.coordinates, req.radius, req.filters);
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      uniqueRequests.push(req);
    }
  });
  
  return uniqueRequests;
};

/**
 * Handles a single location search using standard query
 */
const singleLocationSearch = async (
  coordinates: [number, number],
  radius: number,
  filters?: SearchFilters
): Promise<BatchSearchResult> => {
  // Build query
  let query = supabase
    .from('crystal_roof')
    .select(`
      id, latitude, longitude, description, status, 
      address, size, category, created_at, updated_at,
      authority_name, impact_score, title, ref_number, image_url,
      location_image, storybook
    `)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);
  
  // Apply bounding box filter for efficiency
  const { minLat, maxLat, minLng, maxLng } = calculateBoundingBox(
    coordinates[0], coordinates[1], radius
  );
  
  query = query
    .gte('latitude', minLat)
    .lte('latitude', maxLat)
    .gte('longitude', minLng)
    .lte('longitude', maxLng);
  
  // Apply additional filters
  if (filters) {
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('category', filters.type);
    }
  }
  
  // Execute the query with timeout
  const response: PostgrestResponse<any> = await withTimeout(
    query.order('updated_at', { ascending: false }).limit(100),
    20000,
    'Single location search timeout'
  );
  
  const key = getSearchRequestKey(coordinates, radius, filters);
  
  // Handle response safely
  if (response && response.data) {
    if (Array.isArray(response.data)) {
      // Add distance calculations and return
      const resultsWithDistance = response.data.map(item => {
        // Calculate distance using coordinates
        // For this example, we just return the item
        return item;
      });
      
      return { [key]: resultsWithDistance };
    }
  }
  
  return { [key]: [] };
};

/**
 * Fallback method that performs individual searches when batch fails
 */
const fallbackToIndividualQueries = async (
  requests: BatchSearchRequest[]
): Promise<BatchSearchResult> => {
  console.log('Falling back to individual queries');
  
  const results: BatchSearchResult = {};
  
  // Process each request individually
  for (const request of requests) {
    const key = getSearchRequestKey(
      request.coordinates, 
      request.radius, 
      request.filters
    );
    
    const singleResult = await singleLocationSearch(
      request.coordinates,
      request.radius,
      request.filters
    );
    
    results[key] = singleResult[key];
  }
  
  return results;
};

/**
 * Process batched results from the server into individual result sets
 */
const processBatchedResults = (
  batchedData: any[],
  requests: BatchSearchRequest[]
): BatchSearchResult => {
  const results: BatchSearchResult = {};
  
  // Each request should have a corresponding result set in the response
  requests.forEach((request, index) => {
    const key = getSearchRequestKey(
      request.coordinates, 
      request.radius, 
      request.filters
    );
    
    // Match this request with its results in the batched data
    // For simplicity, we assume the results are in the same order as requests
    const resultSet = batchedData[index] || [];
    
    results[key] = resultSet;
  });
  
  return results;
};

/**
 * Calculate a bounding box for more efficient spatial queries
 */
const calculateBoundingBox = (lat: number, lng: number, radius: number) => {
  // 1 degree of latitude is approximately 111km
  const degreesLat = radius / 111.0;
  
  // 1 degree of longitude varies with latitude, roughly 111km * cos(latitude)
  const degreesLng = radius / (111.0 * Math.cos(lat * (Math.PI / 180)));

  return {
    minLat: lat - degreesLat,
    maxLat: lat + degreesLat,
    minLng: lng - degreesLng,
    maxLng: lng + degreesLng
  };
};
