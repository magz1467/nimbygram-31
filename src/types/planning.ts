
export interface Application {
  id: number;
  address?: string;
  reference?: string;
  description?: string;
  status?: string;
  date?: string;
  received_date?: string;
  latitude?: number;
  longitude?: number;
  coordinates?: [number, number];
  type?: string;
  classification?: string;
  
  // Additional properties used in the application
  title?: string;
  image?: string;
  distance?: string;
  postcode?: string;
  engaging_title?: string;
  image_map_url?: string;
  streetview_url?: string;
  storybook?: string;
  last_date_consultation_comments?: string;
  final_impact_score?: number;
  feedback_stats?: {
    yimbyCount: number;
    nimbyCount: number;
  };
  notes?: string;
  submittedDate?: string;
  received?: string;
  decisionDue?: string;
  applicant?: string;
  ward?: string;
  officer?: string;
  consultationEnd?: string;
  valid_date?: string;
  decision?: string;
  impact_score_details?: {
    impacted_services?: {
      [key: string]: {
        positive?: string | number;
        negative?: string | number;
        impact?: string;
        details?: string;
      };
    };
  };
  impact_score?: number;
  category?: string;
  application_type_full?: string;
}

// Add Comment interface to fix comment-related errors
export interface Comment {
  id: number | string;
  application_id: number | string;
  user_id?: string;
  user_email?: string;
  parent_id?: number | string | null;
  comment: string;
  created_at?: string;
  upvotes?: number;
  downvotes?: number;
  profiles?: {
    username?: string;
  };
  user?: {
    username?: string;
  };
}

// Define SortType
export type SortType = 'newest' | 'distance' | 'closingSoon';

// Define StatusCounts for use in components
export interface StatusCounts {
  'Under Review'?: number;
  'Approved'?: number;
  'Declined'?: number;
  'Other'?: number;
  [key: string]: number | undefined;
}
