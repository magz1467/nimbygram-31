
import { supabase } from "@/integrations/supabase/client";
import { FallbackSearchParams } from "./types";

export function buildBoundingBoxQuery(params: FallbackSearchParams, limit: number = 100) {
  const { lat, lng, radiusKm, filters } = params;
  
  // Calculate the bounding box
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  
  console.log('Calculated bounding box:', {
    latMin: lat - latDelta,
    latMax: lat + latDelta,
    lngMin: lng - lngDelta,
    lngMax: lng + lngDelta
  });
  
  // Build the query with bounding box
  let query = supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', lat - latDelta)
    .lte('latitude', lat + latDelta)
    .gte('longitude', lng - lngDelta)
    .lte('longitude', lng + lngDelta);
  
  // Apply filters
  if (filters) {
    if (filters.status && typeof filters.status === 'string') {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    if (filters.type && typeof filters.type === 'string') {
      query = query.ilike('type', `%${filters.type}%`);
    }
    
    if (filters.classification && typeof filters.classification === 'string') {
      query = query.ilike('classification', `%${filters.classification}%`);
    }
  }
  
  // Set the limit
  query = query.limit(limit);
  
  return query;
}

// Perform a query with a reduced area when the original search times out
export function buildReducedAreaQuery(params: FallbackSearchParams, reductionFactor: number = 0.3) {
  const reducedRadius = Math.max(params.radiusKm * reductionFactor, 0.5);
  
  console.log('Retrying with reduced radius:', reducedRadius);
  
  return buildBoundingBoxQuery(
    { ...params, radiusKm: reducedRadius }, 
    50 // Reduced limit
  );
}

// Last resort query with minimal area and fields
export function buildLastResortQuery(params: FallbackSearchParams) {
  const minimalRadius = Math.max(params.radiusKm * 0.15, 0.25);
  
  console.log('Attempting last resort search with minimal area:', minimalRadius);
  
  const { lat, lng } = params;
  
  // Calculate the minimal bounding box
  const latDelta = minimalRadius / 111.32;
  const lngDelta = minimalRadius / (111.32 * Math.cos(lat * Math.PI / 180));
  
  // Minimal fields selection to reduce payload size
  return supabase
    .from('crystal_roof')
    .select('id, latitude, longitude, address, title, status')
    .gte('latitude', lat - latDelta)
    .lte('latitude', lat + latDelta)
    .gte('longitude', lng - lngDelta)
    .lte('longitude', lng + lngDelta)
    .limit(20);
}
