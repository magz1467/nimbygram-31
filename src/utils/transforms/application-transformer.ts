
import { Application } from "@/types/planning";

/**
 * Transforms raw application data into the Application type
 * with proper type conversions and formatting
 */
export function transformApplicationData(rawData: any): Application {
  if (!rawData) return {} as Application;
  
  // Enhanced logging for storybook content
  if (rawData.id) {
    console.log(`Transform for application ${rawData.id}: has storybook: ${Boolean(rawData.storybook)}`);
    if (rawData.storybook) {
      console.log(`Raw storybook data type: ${typeof rawData.storybook}`);
      console.log(`Storybook preview for app ${rawData.id}: ${rawData.storybook.substring(0, 100)}...`);
    }
  }
  
  // Ensure coordinates are properly formatted as [number, number]
  let coordinates: [number, number] | undefined = undefined;
  
  // Handling different coordinate formats
  if (Array.isArray(rawData.coordinates) && rawData.coordinates.length === 2) {
    coordinates = [Number(rawData.coordinates[0]), Number(rawData.coordinates[1])];
  } else if (typeof rawData.latitude === 'number' && typeof rawData.longitude === 'number') {
    coordinates = [Number(rawData.latitude), Number(rawData.longitude)];
  } else if (rawData.latitude && rawData.longitude) {
    // Handle string coordinates
    coordinates = [Number(rawData.latitude), Number(rawData.longitude)];
  }
  
  // Transform the raw data to match Application type
  return {
    id: rawData.id,
    reference: rawData.reference || '',
    address: rawData.address || '',
    description: rawData.description || '',
    status: rawData.status || 'Unknown',
    type: rawData.type || '',
    coordinates: coordinates,
    latitude: typeof rawData.latitude === 'number' ? rawData.latitude : 
              rawData.latitude ? Number(rawData.latitude) : undefined,
    longitude: typeof rawData.longitude === 'number' ? rawData.longitude : 
               rawData.longitude ? Number(rawData.longitude) : undefined,
    title: rawData.title || rawData.proposal || rawData.ai_title || '',
    distance: rawData.distance || null,
    image: rawData.image_url || rawData.image || null,
    streetview_url: rawData.streetview_url || null,
    image_map_url: rawData.image_map_url || null,
    submittedDate: rawData.date_received || rawData.received_date || null,
    decisionDue: rawData.decision_date || null,
    received_date: rawData.received_date || null,
    received: rawData.received || null,
    date: rawData.date || null,
    postcode: rawData.postcode || null,
    impact_score: rawData.impact_score || null,
    impact_score_details: rawData.impact_score_details || null,
    storybook: rawData.storybook || null,
    final_impact_score: rawData.final_impact_score || rawData.impact_score || null,
    engaging_title: rawData.engaging_title || null,
    last_date_consultation_comments: rawData.last_date_consultation_comments || null,
    decision: rawData.decision || null,
    applicant: rawData.applicant || null,
    ward: rawData.ward || null,
    officer: rawData.officer || null,
    consultationEnd: rawData.consultation_end || rawData.last_date_consultation_comments || null,
    valid_date: rawData.valid_date || null,
    feedback_stats: rawData.feedback_stats || null,
    classification: rawData.classification || null,
    category: rawData.category || null,
    notes: rawData.notes || null,
    application_type_full: rawData.application_type_full || null
  };
}

/**
 * Transforms an array of raw application data into Application objects
 */
export function transformApplicationsData(rawDataArray: any[]): Application[] {
  if (!Array.isArray(rawDataArray)) return [];
  
  console.log(`Transforming ${rawDataArray.length} applications`);
  if (rawDataArray.length > 0) {
    console.log(`First application ID: ${rawDataArray[0]?.id}, has storybook: ${Boolean(rawDataArray[0]?.storybook)}`);
    if (rawDataArray[0]?.storybook) {
      console.log(`Storybook length: ${rawDataArray[0].storybook.length}`);
      console.log(`First application storybook preview: ${rawDataArray[0].storybook.substring(0, 100)}...`);
    }
  }
  
  return rawDataArray.map(transformApplicationData);
}
