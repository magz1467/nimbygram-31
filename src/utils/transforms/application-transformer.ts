
import { Application } from "@/types/planning";

/**
 * Transforms raw application data from the database into a consistent format
 */
export function transformApplicationData(rawData: any): Application {
  // Ensure we have valid coordinates if provided
  const lat = typeof rawData.latitude === 'number' ? rawData.latitude : null;
  const lng = typeof rawData.longitude === 'number' ? rawData.longitude : null;
  
  // Extract the coordinates if both values exist
  const coordinates = (lat !== null && lng !== null) ? [lat, lng] : null;
  
  return {
    id: rawData.id,
    reference: rawData.reference || '',
    title: rawData.title || 'Unknown Application',
    description: rawData.description || '',
    address: rawData.address || '',
    status: rawData.status || 'Unknown',
    applicant: rawData.applicant || '',
    decision: rawData.decision || '',
    type: rawData.type || '',
    validatedDate: rawData.validated_date || rawData.validatedDate || null,
    applicationDate: rawData.application_date || rawData.applicationDate || null,
    decisionDate: rawData.decision_date || rawData.decisionDate || null,
    appealDate: rawData.appeal_date || rawData.appealDate || null,
    coordinates: coordinates,
    latitude: lat,
    longitude: lng,
    url: rawData.url || '',
    authority: rawData.authority || '',
    distance: rawData.distance || null,
    images: rawData.images || [],
    documents: rawData.documents || [],
    staticMapUrl: rawData.static_map_url || rawData.staticMapUrl || null,
  };
}

/**
 * Maps an array of raw application data to Application objects
 */
export function mapApplications(data: any[]): Application[] {
  if (!data || !Array.isArray(data)) return [];
  return data.map(item => transformApplicationData(item));
}
