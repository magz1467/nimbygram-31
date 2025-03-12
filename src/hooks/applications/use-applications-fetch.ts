
import { supabase } from '@/integrations/supabase/client';
import { Application } from '@/types/planning';
import { handleError } from '@/utils/errors/centralized-handler';

export async function fetchApplicationsInRadius(coordinates: [number, number], radiusKm = 5): Promise<Application[]> {
  try {
    const [lat, lng] = coordinates;
    
    // Calculate bounding box for the search area
    const kmPerDegree = 111.32;
    const latDiff = radiusKm / kmPerDegree;
    const lngDiff = radiusKm / (kmPerDegree * Math.cos(lat * Math.PI / 180));
    
    // Query with geographic bounds
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*')
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(500);
      
    if (error) throw error;

    // Transform raw data to Application type
    return (data || []).map(transformApplicationData);
  } catch (error) {
    handleError(error, { context: 'fetchApplicationsInRadius' });
    return [];
  }
}

// Transform raw data to match Application type
function transformApplicationData(item: any): Application {
  return {
    id: item.id,
    title: item.description || `Application ${item.id}`,
    address: item.address || '',
    status: item.status || 'unknown',
    coordinates: item.latitude && item.longitude 
      ? [Number(item.latitude), Number(item.longitude)] 
      : undefined,
    reference: item.reference || '',
    description: item.description || '',
    applicant: item.applicant || '',
    submissionDate: item.submission_date || '',
    submittedDate: item.submission_date || '',
    decisionDue: item.decision_due || '',
    type: item.type || '',
    ward: item.ward || '',
    received_date: item.received_date || item.received || item.submission_date || null,
    image_map_url: item.image_map_url || null,
    postcode: item.postcode || ''
  };
}
