
import { supabase } from "@/integrations/supabase/client";
import { SpatialSearchParams } from "./types";
import { validateSpatialSearchParams } from "./error-handler";

/**
 * Executes the spatial search query against the database
 */
export async function executeQuery(params: SpatialSearchParams): Promise<any[]> {
  const { lat, lng, radiusKm, page, pageSize } = params;
  
  // Validate coordinates
  validateSpatialSearchParams(lat, lng);
  
  console.log(`Executing spatial search at (${lat}, ${lng}) with radius ${radiusKm}km`);
  
  const { data, error } = await supabase.rpc('get_nearby_applications_paginated', {
    center_lat: lat,
    center_lng: lng,
    radius_km: radiusKm,
    page_number: page,
    page_size: pageSize
  });
  
  if (error) {
    console.error('Spatial query error:', error);
    throw error;
  }
  
  return data || [];
}
