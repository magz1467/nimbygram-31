
import { Application } from "@/types/planning";

/**
 * Transforms raw application data into the Application type
 * with proper type conversions and formatting
 */
export function transformApplicationData(rawData: any): Application {
  if (!rawData) return {} as Application;
  
  // Ensure coordinates are properly formatted as [number, number]
  let coordinates: [number, number] | null = null;
  
  // Handling different coordinate formats
  if (Array.isArray(rawData.coordinates) && rawData.coordinates.length === 2) {
    coordinates = [Number(rawData.coordinates[0]), Number(rawData.coordinates[1])];
  } else if (typeof rawData.latitude === 'number' && typeof rawData.longitude === 'number') {
    coordinates = [Number(rawData.latitude), Number(rawData.longitude)];
  }
  
  // Transform the raw data to match Application type
  return {
    id: rawData.id,
    reference: rawData.reference || '',
    address: rawData.address || '',
    coordinates: coordinates,
    status: rawData.status || 'Unknown',
    type: rawData.type || '',
    title: rawData.title || rawData.proposal || '',
    latitude: typeof rawData.latitude === 'number' ? rawData.latitude : null,
    longitude: typeof rawData.longitude === 'number' ? rawData.longitude : null,
    distance: rawData.distance || null,
    image: rawData.image_url || null,
    description: rawData.description || rawData.proposal || '',
    streetview_url: rawData.streetview_url || null,
    image_map_url: rawData.image_map_url || null,
    submittedDate: rawData.date_received || null,
    decisionDue: rawData.decision_date || null,
    ai_title: rawData.ai_title || null,
    postcode: rawData.postcode || null,
    impact_score: rawData.impact_score || null,
    impact_score_details: rawData.impact_score_details || null,
    storybook: rawData.storybook || null,  // Make sure storybook is included
    received_date: rawData.received_date || null
  };
}

/**
 * Transforms an array of raw application data into Application objects
 */
export function transformApplicationsData(rawDataArray: any[]): Application[] {
  if (!Array.isArray(rawDataArray)) return [];
  
  return rawDataArray.map(transformApplicationData);
}
