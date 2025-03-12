
import { supabase } from "@/integrations/supabase/client";
import { SpatialSearchParams } from "./types";
import { createAppError } from "@/utils/errors/error-factory";
import { ErrorType } from "@/utils/errors/types";

/**
 * Executes a spatial search query against the database
 */
export async function executeQuery(params: SpatialSearchParams): Promise<any[]> {
  const { lat, lng, radiusKm, page, pageSize } = params;
  
  // Input validation
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    throw createAppError('Invalid coordinates for spatial search', null, {
      type: ErrorType.COORDINATES,
      context: { lat, lng, radiusKm },
      userMessage: 'We couldn\'t perform the search with the provided location.'
    });
  }

  console.log('Executing paginated spatial search query');
  
  const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
    center_lat: lat,
    center_lng: lng,
    radius_km: radiusKm,
    page_number: page,
    page_size: pageSize
  });
  
  if (error) {
    console.error('Spatial search error:', error);
    throw createAppError(`Spatial search error: ${error.message}`, error, {
      type: ErrorType.DATABASE,
      context: { lat, lng, radiusKm },
      userMessage: 'We encountered an issue with the search. Please try again.'
    });
  }
  
  if (!data) return [];
  
  return data;
}

/**
 * Try to perform a search with a reduced radius
 */
export async function executeReducedQuery(params: SpatialSearchParams, reductionFactor: number = 0.5): Promise<any[]> {
  const reducedParams = {
    ...params,
    radiusKm: Math.max(params.radiusKm * reductionFactor, 0.5) // Ensure minimum 0.5km radius
  };
  
  console.log(`Trying reduced radius search: ${reducedParams.radiusKm}km`);
  
  return executeQuery(reducedParams);
}
