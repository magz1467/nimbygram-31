
// If this file doesn't exist, we need to create it with the Application type definition
export interface Application {
  id: number;
  title?: string;
  address: string;
  status: string;
  distance?: string;
  distanceValue?: number; // Add this property for numeric distance sorting
  reference?: string;
  description?: string;
  applicant?: string;
  submissionDate?: string;
  submittedDate?: string | null;
  decisionDue?: string;
  type?: string;
  ward?: string;
  officer?: string;
  consultationEnd?: string;
  image?: string;
  streetview_url?: string | null;
  image_map_url?: string | null;
  coordinates?: [number, number] | null;
  ai_title?: string;
  postcode?: string;
  impact_score?: number | null;
  impact_score_details?: any;
  last_date_consultation_comments?: string | null;
  valid_date?: string | null;
  centroid?: any;
  class_3?: string;
  final_impact_score?: number | null;
  engaging_title?: string | null;
  storybook?: any;
  storybook_header?: any;
  received_date?: string | null;
}
