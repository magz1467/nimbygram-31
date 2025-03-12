
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
    application_id: rawData.application_id || rawData.id?.toString(),
    reference: rawData.reference || '',
    proposal: rawData.proposal || rawData.description || '',
    address: rawData.address || '',
    coordinates: coordinates,
    status: rawData.status || 'Unknown',
    type: rawData.type || '',
    url: rawData.url || '',
    date_received: rawData.date_received || null,
    decision_date: rawData.decision_date || null,
    title: rawData.title || rawData.proposal || '',
    local_authority: rawData.local_authority || '',
    latitude: typeof rawData.latitude === 'number' ? rawData.latitude : null,
    longitude: typeof rawData.longitude === 'number' ? rawData.longitude : null,
    distance: rawData.distance || null,
    image_url: rawData.image_url || null,
    documents: rawData.documents || [],
    description: rawData.description || rawData.proposal || '',
    // Add any other fields needed
  };
}

/**
 * Transforms an array of raw application data into Application objects
 */
export function transformApplicationsData(rawDataArray: any[]): Application[] {
  if (!Array.isArray(rawDataArray)) return [];
  
  return rawDataArray.map(transformApplicationData);
}
