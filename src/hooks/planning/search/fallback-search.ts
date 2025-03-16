
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";
import { calculateDistance, formatDistance } from "../utils/distance-calculator";

/**
 * Performs a fallback search using basic geographic bounds
 * This is used when PostGIS functions are not available
 */
export const performFallbackSearch = async (
  lat: number,
  lng: number,
  radiusKm: number,
  filters: SearchFilters = {}
): Promise<Application[]> => {
  console.log(`🔍 Performing fallback search at [${lat}, ${lng}] with radius ${radiusKm}km`);
  
  // Convert radius to approximate lat/lng bounds
  // 1 degree of latitude is ~111km, 1 degree of longitude varies by latitude
  const latDiff = radiusKm / 111.32;
  const lngDiff = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  
  const latMin = lat - latDiff;
  const latMax = lat + latDiff;
  const lngMin = lng - lngDiff;
  const lngMax = lng + lngDiff;
  
  // Build query with bounds - fast pre-filtering
  let query = supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax)
    .limit(200); // Get more than needed as we'll filter further
  
  // Apply status filter if provided
  if (filters.status) {
    query = query.ilike('status', `%${filters.status}%`);
  }
  
  // Apply type filter if provided
  if (filters.type) {
    query = query.or(`application_type.ilike.%${filters.type}%,application_type_full.ilike.%${filters.type}%,description.ilike.%${filters.type}%`);
  }
  
  // Execute query
  const { data, error } = await query;
  
  if (error) {
    console.error('🔍 Fallback search error:', error);
    throw error;
  }
  
  if (!data || !data.length) {
    console.log('🔍 No results found in fallback search');
    return [];
  }
  
  console.log(`🔍 Found ${data.length} results in bounding box, filtering by actual distance`);
  
  // Convert to Application objects and calculate actual distances
  const applications = data.map(item => {
    const appLat = Number(item.latitude);
    const appLng = Number(item.longitude);
    
    // Calculate actual distance if coordinates are valid
    let distance;
    let distanceText = '';
    
    if (!isNaN(appLat) && !isNaN(appLng)) {
      distance = calculateDistance(lat, lng, appLat, appLng);
      distanceText = formatDistance(distance);
    }
    
    return {
      id: item.id,
      title: item.ai_title || item.description || `Application ${item.id}`,
      address: item.address || '',
      status: item.status || 'Under Review',
      coordinates: appLat && appLng ? [appLat, appLng] as [number, number] : undefined,
      reference: item.reference || '',
      description: item.description || '',
      applicant: item.applicant || '',
      submittedDate: item.submission_date || '',
      decisionDue: item.decision_due || item.decision_target_date || '',
      type: item.application_type || item.application_type_full || '',
      ward: item.ward || '',
      officer: item.officer || '',
      consultationEnd: item.last_date_consultation_comments || '',
      image: item.image || '',
      streetview_url: item.streetview_url || null,
      image_map_url: item.image_map_url || null,
      postcode: item.postcode || '',
      impact_score: item.impact_score || null,
      impact_score_details: item.impact_score_details || null,
      last_date_consultation_comments: item.last_date_consultation_comments || null,
      valid_date: item.valid_date || null,
      centroid: item.centroid || null,
      received_date: item.received_date || null,
      distance: distanceText,
      _distance: distance // Private property for sorting
    };
  });
  
  // Filter by actual distance and sort by distance
  const filteredApplications = applications
    .filter(app => app._distance !== undefined && app._distance <= radiusKm)
    .sort((a, b) => {
      const distA = a._distance ?? Number.MAX_SAFE_INTEGER;
      const distB = b._distance ?? Number.MAX_SAFE_INTEGER;
      return distA - distB;
    })
    .slice(0, 100); // Limit to 100 results
  
  console.log(`🔍 Returning ${filteredApplications.length} results within ${radiusKm}km radius`);
  
  // Remove private _distance property before returning
  return filteredApplications.map(({ _distance, ...app }) => app as Application);
};
