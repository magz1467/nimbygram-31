
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { SearchFilters } from "../use-planning-search";

/**
 * Performs a spatial search using PostGIS functions if available
 * @returns Applications within the radius, or null if spatial search not available
 */
export const performSpatialSearch = async (
  lat: number,
  lng: number,
  radiusKm: number,
  filters: SearchFilters = {}
): Promise<Application[] | null> => {
  console.log(`🔍 Performing spatial search at [${lat}, ${lng}] with radius ${radiusKm}km`);
  
  try {
    // Try calling the PostGIS function first, with a reasonable timeout
    const { data, error } = await supabase.rpc('get_nearby_applications', {
      center_lat: lat,
      center_lng: lng,
      radius_km: radiusKm,
      result_limit: 100
    });
    
    if (error) {
      // Check if this is an RPC not found error (function doesn't exist)
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('🔍 Spatial search function not available, will try fallback search');
        return null; // Signal that spatial search is not available
      }
      
      console.error('🔍 Spatial search error:', error);
      throw error;
    }
    
    // Convert raw data to Application objects with distance information
    return convertDbResultsToApplications(data, [lat, lng]);
  } catch (error) {
    // If error is timeout or similar, we'll still return null to try fallback
    if (error instanceof Error && 
       (error.message.includes('timeout') || 
        error.message.includes('canceling statement'))) {
      console.log('🔍 Spatial search timed out, will try fallback search');
      return null;
    }
    
    throw error;
  }
};

/**
 * Convert database results to Application objects
 */
function convertDbResultsToApplications(
  data: any[],
  coordinates: [number, number]
): Application[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(item => ({
    id: item.id,
    title: item.ai_title || item.description || `Application ${item.id}`,
    address: item.address || '',
    status: item.status || 'Under Review',
    coordinates: item.latitude && item.longitude ? [Number(item.latitude), Number(item.longitude)] : undefined,
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
    // Calculate distance (to be implemented in the application)
  }));
}
