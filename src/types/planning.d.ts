export interface Application {
  id: number;
  ref: string;
  address: string;
  description: string;
  status: string;
  type?: string;
  application_type?: string;
  application_type_full?: string;
  date?: string;
  distance?: string;
  coordinates?: [number, number];
  image_urls?: string[];
  decision_date?: string;
  url?: string;
  thumbnail?: string;
  documents?: string[];
  document_link?: string;
  agent?: string;
  notes?: string; // Add notes field for system messages
  class_3?: string;
}
