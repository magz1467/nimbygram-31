
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
  short_story?: string | null;
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
  decision?: string | null; // Added to fix timeline references
  // Add any missing fields that are needed
  impacted_services?: {
    [key: string]: {
      impact: 'positive' | 'negative' | 'neutral';
      details: string;
    };
  };
}

export interface Comment {
  id: number | string;
  comment: string;
  application_id: number | string;
  user_id?: string;
  user_email?: string;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
  upvotes?: number;
  downvotes?: number;
  profiles?: {
    username?: string;
  };
  user?: {
    username?: string;
  };
  replies?: Comment[];
}
