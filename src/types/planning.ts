export interface Application {
  id: number;
  reference: string;
  address: string;
  coordinates?: [number, number] | null;
  status: string;
  type: string;
  title: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: string | null;
  image?: string | null;
  description?: string;
  streetview_url?: string | null;
  image_map_url?: string | null;
  submittedDate?: string | null;
  decisionDue?: string | null;
  ai_title?: string | null;
  postcode?: string | null;
  impact_score?: number | null;
  impact_score_details?: any;
  storybook?: string | null;
  short_story?: string | null; // Add the short_story field
  received_date?: string | null;
  applicant?: string;
  consultationEnd?: string;
  ward?: string;
  officer?: string;
  notes?: string;
  category?: string;
  final_impact_score?: number;
  last_date_consultation_comments?: string | null;
  valid_date?: string | null;
  centroid?: any;
  received?: string | null;
}
