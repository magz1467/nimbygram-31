
import { supabase } from '@/integrations/supabase/client';
import { withTimeout } from '@/utils/coordinates/timeout-handler';
import { calculateDistance } from '@/hooks/planning/utils/distance-calculator';
import { Application } from '@/types/planning';
import { SearchFilters } from './types';

// Default timeout for search queries (15 seconds)
const SEARCH_TIMEOUT_MS = 15000;

// Default search radius (fixed at 5km)
const DEFAULT_RADIUS_KM = 5;

/**
 * Execute a spatial search using the RPC function
 * @param coordinates Latitude and longitude
 * @param filters Optional search filters
 * @param pageNumber Page number for pagination
 * @param pageSize Page size for pagination
 * @returns Promise with the search results
 */
export const executeSearch = async (
  coordinates: [number, number], 
  filters: SearchFilters = {},
  pageNumber: number = 0,
  pageSize: number = 50
): Promise<Application[]> => {
  const [lat, lng] = coordinates;
  
  // Calculate bounding box coordinates for a 5km radius
  // This is a simplification - 1 degree of latitude is ~111km
  const latDelta = DEFAULT_RADIUS_KM / 111.0;
  const lngDelta = DEFAULT_RADIUS_KM / (111.0 * Math.cos(lat * Math.PI / 180));
  
  const ne_lat = lat + latDelta;
  const ne_lng = lng + lngDelta;
  const sw_lat = lat - latDelta;
  const sw_lng = lng - lngDelta;
  
  try {
    console.log(`Executing spatial search at [${lat}, ${lng}] with 5km radius using bounding box`);
    
    // Use the correct function name and parameter structure
    const { data, error } = await supabase.rpc('get_applications_in_bounds_paginated', {
      ne_lat,
      ne_lng,
      sw_lat,
      sw_lng,
      page_number: pageNumber,
      page_size: pageSize
    });

    if (error) {
      console.error('RPC search error:', error);
      throw error;
    }

    if (!data) {
      console.warn('Search returned no data');
      return [];
    }
    
    return data as Application[];
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

/**
 * Execute a search with timeout
 * @param coordinates Latitude and longitude
 * @param filters Optional search filters
 * @param pageNumber Page number for pagination
 * @param pageSize Page size for pagination
 * @returns Promise with the search results
 */
export const executeSearchWithTimeout = async (
  coordinates: [number, number],
  filters: SearchFilters = {},
  pageNumber: number = 0,
  pageSize: number = 50
): Promise<Application[]> => {
  return withTimeout(
    executeSearch(coordinates, filters, pageNumber, pageSize),
    SEARCH_TIMEOUT_MS,
    `Search timeout after ${SEARCH_TIMEOUT_MS / 1000}s at coordinates [${coordinates[0]}, ${coordinates[1]}]`
  );
};
