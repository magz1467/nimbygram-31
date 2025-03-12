
import { Application } from "@/types/planning";
import { transformApplicationData } from "../transformApplicationData";

export const transformApplicationFromDatabase = (app: any): Application | null => {
  return transformApplicationData(app);
};

// Convert database data to Application object
export const mapDataToApplication = (data: any): Application => {
  if (!data) return {} as Application;

  return {
    id: data.id,
    title: data.title || data.ai_title || "Unnamed planning application",
    address: data.address || "No address provided",
    status: data.status || "Unknown",
    description: data.description || "",
    reference: data.reference || data.lpa_app_no || "",
    type: data.type || data.application_type || "",
    ward: data.ward || "",
    officer: data.officer || "",
    applicant: data.applicant || "",
    submissionDate: data.submission_date || data.submitted_date || data.received_date || null,
    decisionDue: data.decision_due || data.decision_target_date || null,
    consultationEnd: data.consultation_end || data.last_date_consultation_comments || null,
    distance: data.distance || "",
    postcode: data.postcode || "",
    impact_score: data.impact_score || data.final_impact_score || null,
    impact_score_details: data.impact_score_details || null,
    coordinates: data.coordinates || (data.latitude && data.longitude ? [data.latitude, data.longitude] : undefined),
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    ai_title: data.ai_title || null,
    image_map_url: data.image_map_url || null,
    streetview_url: data.streetview_url || null,
  };
};
