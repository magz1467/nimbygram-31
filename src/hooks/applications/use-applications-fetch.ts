
import { Application } from '@/types/planning';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errors/centralized-handler';
import { transformApplicationData } from '@/utils/applicationTransforms';

/**
 * Fetches planning applications within a specified radius of coordinates
 */
export const fetchApplicationsInRadius = async (
  coordinates: [number, number], 
  radius: number = 5
): Promise<Application[]> => {
  try {
    const [lat, lng] = coordinates;
    
    console.log(`🔍 Fetching applications near [${lat}, ${lng}] with radius ${radius}km`);
    
    // Calculate bounding box (simple approximation)
    const kmPerDegree = 111.32;
    const latDiff = radius / kmPerDegree;
    const lngDiff = radius / (kmPerDegree * Math.cos(lat * Math.PI / 180));
    
    // Query with geographic bounds - make sure to request storybook field EXPLICITLY
    const { data, error } = await supabase
      .from('crystal_roof')
      .select('*, storybook')
      .gte('latitude', lat - latDiff)
      .lte('latitude', lat + latDiff)
      .gte('longitude', lng - lngDiff)
      .lte('longitude', lng + lngDiff)
      .limit(500);
      
    if (error) throw error;

    console.log(`Found ${data?.length || 0} applications`);
    if (data && data.length > 0) {
      console.log(`First application has storybook: ${Boolean(data[0].storybook)}`);
      if (data[0].storybook) {
        console.log(`Storybook preview: ${data[0].storybook.substring(0, 50)}...`);
      }
    }

    // Transform to Application type
    return (data || []).map(item => {
      // Only create coordinates if both latitude and longitude exist
      let coords: [number, number] | undefined = undefined;
      if (item.latitude && item.longitude) {
        coords = [Number(item.latitude), Number(item.longitude)];
      }
      
      return {
        id: item.id,
        title: item.ai_title || item.description || `Application ${item.id}`,
        address: item.address || '',
        status: item.status || 'Under Review',
        coordinates: coords,
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
        received_date: item.received_date || null,
        storybook: item.storybook || null // Make sure to include storybook
      } as Application;
    });
  } catch (err) {
    console.error('Error fetching applications in radius:', err);
    handleError(err, { context: 'fetchApplicationsInRadius' });
    return []; // Return empty array on error
  }
};
