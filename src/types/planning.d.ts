
export interface Application {
  id: number;
  title: string;
  address: string;
  status: string;
  distance: string;
  reference?: string;
  description?: string;
  applicant?: string;
  submissionDate?: string;
  submittedDate?: string | Date | null;
  decisionDue?: string;
  type?: string;
  ward?: string;
  officer?: string;
  consultationEnd?: string;
  image?: string;
  streetview_url?: string;
  image_map_url?: string;
  coordinates?: [number, number] | null;
  ai_title?: string;
  postcode?: string;
  impact_score?: number | null;
  impact_score_details?: any;
  last_date_consultation_comments?: string | null;
  valid_date?: string | null;
  centroid?: any;
  class_3?: string | null;
  final_impact_score?: number | null;
  engaging_title?: string | null;
  storybook?: any;
  storybook_header?: any;
  received_date?: string | null;
  notes?: string;
}
