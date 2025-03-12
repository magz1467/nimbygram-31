
import { supabase } from '@/integrations/supabase/client';
import { Application } from '@/types/planning';
import { handleSpatialSearchError } from './error-handler';

/**
 * Executes a spatial search using PostGIS via the get_nearby_applications_paginated RPC
 */
export async function executeSpatialQuery(
  lat: number,
  lng: number,
  radius: number,
  page: number = 0,
  pageSize: number = 50
): Promise<Application[]> {
  try {
    console.log(
      `Executing spatial query with lat: ${lat}, lng: ${lng}, radius: ${radius}km, page: ${page}, pageSize: ${pageSize}`
    );
    
    const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radius,
      page_number: page,
      page_size: pageSize
    });
    
    if (error) {
      console.error('Spatial search RPC error:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No data returned from spatial search');
      return [];
    }
    
    console.log(`Got ${data.length} results from spatial search`);
    return data as Application[];
  } catch (error) {
    return handleSpatialSearchError(error);
  }
}

/**
 * Executes a filtered spatial search with additional query parameters
 */
export async function executeFilteredSpatialQuery(
  lat: number,
  lng: number,
  radius: number,
  filters: Record<string, string>,
  page: number = 0,
  pageSize: number = 50
): Promise<Application[]> {
  try {
    // Basic validation
    if (!lat || !lng || radius <= 0) {
      throw new Error('Invalid coordinates or radius');
    }
    
    // For now, we ignore filters in the DB query and filter them in memory
    // This is because the RPC doesn't support filtering yet
    const results = await executeSpatialQuery(lat, lng, radius, page, pageSize);
    
    // Apply filters if available
    if (filters && Object.keys(filters).length > 0) {
      return results.filter(app => {
        return Object.entries(filters).every(([key, value]) => {
          // Skip empty filter values
          if (!value) return true;
          
          // Match the filter value against the application property
          const appValue = (app as any)[key];
          return appValue === value;
        });
      });
    }
    
    return results;
  } catch (error) {
    return handleSpatialSearchError(error);
  }
}
