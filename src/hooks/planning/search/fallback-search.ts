
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/types/planning";
import { sortApplicationsByDistance } from "@/utils/distance";

/**
 * Performs a fallback search for applications when the spatial search is not available
 * @param lat Latitude of search point
 * @param lng Longitude of search point
 * @param radiusKm Radius to search in kilometers
 * @param filters Optional filters to apply
 * @returns Array of applications
 */
export async function performFallbackSearch(
  lat: number,
  lng: number,
  radiusKm: number,
  filters: any = {}
): Promise<Application[]> {
  // Start with a small limit to prevent timeouts
  const initialLimit = 500;
  
  console.log(`🔍 Fallback search at [${lat}, ${lng}] with radius ${radiusKm}km and limit ${initialLimit}`);
  
  // Calculate bounding box for more efficient querying (uses approximately km to degrees conversion)
  const latDegPerKm = 1/111; // 1 degree latitude is approximately 111km
  const lngDegPerKm = 1/(111 * Math.cos(lat * Math.PI/180)); // Adjust for longitude at this latitude
  
  const latMin = lat - (radiusKm * latDegPerKm);
  const latMax = lat + (radiusKm * latDegPerKm);
  const lngMin = lng - (radiusKm * lngDegPerKm);
  const lngMax = lng + (radiusKm * lngDegPerKm);
  
  let query = supabase
    .from('crystal_roof')
    .select('*')
    .gte('latitude', latMin)
    .lte('latitude', latMax)
    .gte('longitude', lngMin)
    .lte('longitude', lngMax)
    .limit(initialLimit);
  
  // Apply filters if provided
  if (filters.status) {
    query = query.ilike('status', `%${filters.status}%`);
  }
  if (filters.type) {
    query = query.ilike('type', `%${filters.type}%`);
  }
  if (filters.classification) {
    query = query.ilike('class_3', `%${filters.classification}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('❌ Fallback search error:', error);
    throw error;
  }
  
  console.log(`✅ Fallback search returned ${data?.length || 0} results`);
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Process results into Application objects
  const applications = data.map(item => {
    return {
      id: item.id,
      reference: item.reference || item.lpa_app_no,
      title: item.description || `Application ${item.id}`,
      description: item.description || '',
      status: item.status || 'Unknown',
      address: item.address || '',
      postcode: item.postcode || '',
      coordinates: [Number(item.latitude), Number(item.longitude)] as [number, number],
      application_type: item.application_type || '',
      application_type_full: item.type || '',
      decision: item.decision || '',
      appeal_status: item.appeal_status || '',
      lpa_code: item.lpa_code || '',
      documents_url: item.documents_url || '',
      comment_url: item.comment_url || '',
      published_date: item.date_published || null,
      received_date: item.valid_date || item.date_received || null,
      decision_date: item.decision_date || null,
      class_3: item.class_3 || '',
      consultationEnd: item.consultation_end || null,
      type: item.type || '',
    } as Application;
  });
  
  // Sort by distance from search point
  return sortApplicationsByDistance(applications, [lat, lng]);
}
