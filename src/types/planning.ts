
export interface Application {
  id: number;
  reference?: string;
  address: string;
  description: string;
  status?: string;
  valid_date?: string;
  last_date_consultation_comments?: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number;
  support_count?: number;
}

export type PlanningApplication = Application;
