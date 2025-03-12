
import { Application } from "@/types/planning";
import { calculateDistance } from "@/hooks/planning/utils/distance-calculator";

/**
 * Transforms raw application data from the database into the Application type
 * 
 * @param app - The raw application data from the database
 * @returns Transformed Application object or null if invalid data
 */
export function transformApplicationData(app: any): Application | null {
  if (!app || (app.latitude === null && app.longitude === null)) {
    return null;
  }

  // Create a properly typed Application object
  const transformedApp: Application = {
    id: app.id,
    address: app.address || "Unknown address",
    status: app.status || "Unknown status",
    submissionDate: app.submission_date || app.submitted_date || app.received_date || app.received || null,
    description: app.description || "",
    type: app.type || app.application_type || "",
    title: app.title || app.ai_title || app.proposal || app.description?.substring(0, 50) || "Unnamed application",
    reference: app.reference || app.lpa_app_no || app.application_id || null,
    latitude: app.latitude || (app.centroid?.coordinates ? app.centroid.coordinates[1] : null),
    longitude: app.longitude || (app.centroid?.coordinates ? app.centroid.coordinates[0] : null),
    applicant: app.applicant || "",
    distance: app.distance || "",
    officer: app.officer || "",
    ward: app.ward || "",
    impact_score: app.impact_score || app.final_impact_score || null,
    postcode: app.postcode || "",
    decisionDue: app.decision_due || app.decision_target_date || null,
    consultationEnd: app.consultation_end || app.last_date_consultation_comments || null,
    valid_date: app.valid_date || null,
    engaging_title: app.engaging_title || null,
    impact_score_details: app.impact_score_details || null,
    ai_title: app.ai_title || null,
    image_map_url: app.image_map_url || null,
    streetview_url: app.streetview_url || null,
  };

  // Add coordinates if latitude and longitude are available
  if (app.latitude && app.longitude) {
    transformedApp.coordinates = [Number(app.latitude), Number(app.longitude)];
  }

  return transformedApp;
}
