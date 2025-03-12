
import { supabase } from "@/integrations/supabase/client";
import { validateSpatialSearchParams, handleSpatialSearchError } from "./error-handler";
import { processSpatialSearchResults } from "./results-processor";
import { SpatialSearchParams } from "./types";
import { Application } from "@/types/planning";

/**
 * Executes the spatial search query against the database
 */
export async function executeSpatialQuery({
  lat, 
  lng, 
  radiusKm, 
  filters,
  page = 0,
  pageSize = 50
}: SpatialSearchParams): Promise<Application[]> {
  try {
    console.log('Executing paginated spatial search query');
    
    validateSpatialSearchParams(lat, lng);

    const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      page_number: page,
      page_size: pageSize
    });
    
    if (error) {
      console.error('Spatial search error:', error);
      throw error;
    }
    
    return processSpatialSearchResults(data, lat, lng, filters);
    
  } catch (error) {
    return handleSpatialSearchError(error, { lat, lng, radiusKm, filters });
  }
}
