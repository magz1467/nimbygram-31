
export interface Application {
  id: number;
  title?: string;
  address: string;
  status: string;
  distance?: string;
  distanceValue?: number;  // Add this property
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
  coordinates?: [number, number];
  ai_title?: string;
  postcode?: string;
  impact_score?: number | null;
  impact_score_details?: {
    key_concerns?: string[];
    category_scores?: {
      social?: { score: number; details: string };
      environmental?: { score: number; details: string };
      infrastructure?: { score: number; details: string };
    };
    recommendations?: string[];
    impacted_services?: {
      [key: string]: {
        impact: 'positive' | 'negative' | 'neutral';
        details: string;
      };
    };
  };
  last_date_consultation_comments?: string | null;
  valid_date?: string | null;
  centroid?: any;
  impacted_services?: {
    [key: string]: {
      impact: 'positive' | 'negative' | 'neutral';
      details: string;
    };
  };
  class_3?: string | null;
  final_impact_score?: number | null;
  engaging_title?: string | null;
  feedback_stats?: {
    yimby?: number;
    nimby?: number;
  };
  category?: string;
  received?: string;
  decision?: string;
  storybook?: string;
  storybook_header?: string;
  received_date?: string | null;
}
