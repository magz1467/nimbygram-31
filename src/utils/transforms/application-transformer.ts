
import { Application } from "@/types/planning";

/**
 * Transforms raw database objects into well-formed Application objects
 */
export function transformDatabaseRecordToApplication(record: any): Application {
  // Ensure all required fields are present
  if (!record || typeof record !== 'object') {
    console.error('Invalid record data:', record);
    throw new Error('Invalid application data');
  }
  
  // Basic validation
  if (!record.id) {
    console.warn('Application record missing ID', record);
  }
  
  // Transform coordinates if present
  let coordinates: [number, number] | undefined;
  if (
    typeof record.latitude === 'number' && 
    typeof record.longitude === 'number' &&
    !isNaN(record.latitude) && 
    !isNaN(record.longitude)
  ) {
    coordinates = [Number(record.latitude), Number(record.longitude)];
  }
  
  // Ensure address is a string
  const address = typeof record.address === 'string' 
    ? record.address 
    : record.address?.toString() || 'No address provided';
  
  // Create formatted application object
  const application: Application = {
    id: record.id,
    title: record.title || record.description || `Application ${record.id}`,
    address: address,
    status: record.status || 'Unknown',
    reference: record.reference || '',
    description: record.description || '',
    coordinates: coordinates,
    distance: record.distance || '',
    applicant: record.applicant || '',
    submissionDate: record.submission_date || record.received_date || '',
    decisionDue: record.decision_due || '',
    type: record.type || record.application_type_full || '',
    image: record.image || record.image_map_url || '',
    ward: record.ward || '',
    postcode: record.postcode || '',
    received_date: record.received_date || null,
    latitude: record.latitude,
    longitude: record.longitude,
  };
  
  // Add optional fields if present
  if (record.ai_title) application.ai_title = record.ai_title;
  if (record.engaging_title) application.engaging_title = record.engaging_title;
  if (record.impact_score) application.impact_score = record.impact_score;
  if (record.impact_score_details) application.impact_score_details = record.impact_score_details;
  if (record.streetview_url) application.streetview_url = record.streetview_url;
  if (record.image_map_url) application.image_map_url = record.image_map_url;
  
  return application;
}
