
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
  // Use a very small initial limit for immediate results
  const initialLimit = 100;
  
  console.log(`🔍 Simplified fallback search at [${lat}, ${lng}] with radius ${radiusKm}km and limit ${initialLimit}`);
  
  // Use a simple distance-based approach with very small radius first
  const smallRadiusKm = Math.min(radiusKm, 2); // Start with max 2km radius
  
  // Calculate bounding box for more efficient querying (uses approximately km to degrees conversion)
  const latDegPerKm = 1/111; // 1 degree latitude is approximately 111km
  const lngDegPerKm = 1/(111 * Math.cos(lat * Math.PI/180)); // Adjust for longitude at this latitude
  
  const latMin = lat - (smallRadiusKm * latDegPerKm);
  const latMax = lat + (smallRadiusKm * latDegPerKm);
  const lngMin = lng - (smallRadiusKm * lngDegPerKm);
  const lngMax = lng + (smallRadiusKm * lngDegPerKm);
  
  try {
    // First attempt - very targeted, small radius query with minimal filtering
    let query = supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', latMin)
      .lte('latitude', latMax)
      .gte('longitude', lngMin)
      .lte('longitude', lngMax)
      .limit(initialLimit)
      .order('id', { ascending: false }) // Get newest first
      .timeout(5); // Short timeout
    
    // Apply minimal filters if provided
    if (filters.status) {
      query = query.ilike('status', `%${filters.status}%`);
    }
    
    const { data: smallRadiusData, error: smallRadiusError } = await query;
    
    if (smallRadiusError) {
      console.warn('Small radius query failed:', smallRadiusError);
      // Fall through to next attempt
    } else if (smallRadiusData && smallRadiusData.length > 0) {
      console.log(`✅ Found ${smallRadiusData.length} results with small radius search`);
      
      // Process results into Application objects
      const applications = smallRadiusData.map(mapDatabaseRecordToApplication);
      
      // Sort by distance from search point
      return sortApplicationsByDistance(applications, [lat, lng]);
    }
    
    // Second attempt - direct ID query for a few recent records
    // This avoids complex queries altogether and is extremely fast
    const { data: recentData, error: recentError } = await supabase
      .from('crystal_roof')
      .select('*')
      .order('id', { ascending: false })
      .limit(50)
      .timeout(3);
    
    if (recentError) {
      console.warn('Recent records query failed:', recentError);
      throw new Error('Unable to retrieve planning data at this time.');
    }
    
    if (recentData && recentData.length > 0) {
      console.log(`✅ Returning ${recentData.length} recent applications as fallback`);
      
      // Process results into Application objects
      const applications = recentData.map(mapDatabaseRecordToApplication);
      
      // Sort by distance from search point even if they're not in radius
      return sortApplicationsByDistance(applications, [lat, lng]);
    }
    
    // If we get here, both attempts failed but didn't throw
    return [];
    
  } catch (error) {
    console.error('❌ All fallback search attempts failed:', error);
    throw error;
  }
}

/**
 * Maps a database record to an Application object
 */
function mapDatabaseRecordToApplication(item: any): Application {
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
}
