
import { Application } from "@/types/planning";

/**
 * Transforms application data from the database to ensure consistent format
 */
export function transformApplicationsData(applications: any[]): Application[] {
  if (!applications || !Array.isArray(applications)) {
    return [];
  }
  
  return applications.map(app => transformApplicationFromDatabase(app))
    .filter(Boolean) as Application[];
}

/**
 * Transforms a single application from the database to ensure consistent format
 */
export function transformApplicationFromDatabase(app: any): Application | null {
  if (!app) return null;
  
  // Normalize coordinates
  let coordinates: [number, number] | undefined;
  
  if (app.latitude !== undefined && app.longitude !== undefined && 
      app.latitude !== null && app.longitude !== null) {
    coordinates = [Number(app.latitude), Number(app.longitude)];
  } else if (app.coordinates && Array.isArray(app.coordinates) && app.coordinates.length === 2) {
    coordinates = [Number(app.coordinates[0]), Number(app.coordinates[1])];
  }
  
  // Normalize address
  let address = app.address || '';
  if (!address && app.location) {
    address = typeof app.location === 'string' ? app.location : '';
  }
  
  // Normalize status
  let status = app.status || 'Unknown';
  if (!status && app.application_status) {
    status = app.application_status;
  }
  
  // Normalize date fields
  const normalizeDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    
    // If it's already a string, check if it's a valid date
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return dateValue;
      }
      return null;
    }
    
    // If it's a Date object, convert to ISO string
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    
    return null;
  };
  
  // Build a normalized application object
  const normalizedApp: Application = {
    id: app.id || 0,
    address: address,
    status: status,
    title: app.title || app.engaging_title || app.description?.slice(0, 100) || '',
    reference: app.reference || app.app_ref || app.planning_reference || '',
    description: app.description || '',
    type: app.type || app.application_type || app.application_type_full || '',
    coordinates: coordinates as [number, number] | undefined,
    received_date: normalizeDate(app.received_date || app.received || app.submission_date || app.valid_date),
    distance: app.distance || '',
    // Additional normalized fields
    submissionDate: normalizeDate(app.submissionDate || app.received_date || app.received),
    decisionDue: normalizeDate(app.decisionDue || app.decision_date),
    consultationEnd: normalizeDate(app.consultationEnd || app.last_date_consultation_comments),
    ward: app.ward || '',
    postcode: app.postcode || '',
    applicant: app.applicant || '',
    officer: app.officer || '',
    impact_score: typeof app.impact_score === 'number' ? app.impact_score : null,
    impact_score_details: app.impact_score_details || null,
    feedback_stats: app.feedback_stats || { yimby: 0, nimby: 0 },
    image: app.image || app.image_map_url || null,
    streetview_url: app.streetview_url || null,
    category: app.category || '',
    notes: app.notes || '',
    
    // Make sure latitude/longitude are stored explicitly too
    latitude: coordinates ? coordinates[0] : null,
    longitude: coordinates ? coordinates[1] : null
  };
  
  return normalizedApp;
}
