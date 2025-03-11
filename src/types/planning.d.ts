export interface Application {
  id: number;
  title?: string;
  description: string;
  status: string;
  reference?: string;
  submissionDate?: string;
  coordinates: [number, number];
  postcode: string;
  applicant?: string;
  decisionDue?: string;
  type?: string;
  ward?: string;
  officer?: string;
  consultationEnd?: string;
  address: string;
  image?: string;
  image_map_url?: string;
  ai_title?: string;
  last_date_consultation_comments?: string;
  valid_date?: string;
  centroid?: any;
  impact_score?: number | null;
  impact_score_details?: any;
  impacted_services?: any;
  distance?: string;
  final_impact_score?: number;
  engaging_title?: string;
  feedback_stats?: {
    yimby?: number;
    nimby?: number;
  };
}