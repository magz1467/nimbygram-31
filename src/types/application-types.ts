
export type FilterType = {
  status?: string;
  type?: string;
  [key: string]: string | undefined;
};

export type StatusType = 'Under Review' | 'Approved' | 'Declined' | 'Other';

export type SortType = 'closingSoon' | 'newest' | 'impact' | 'distance' | null;

export type StatusCounts = {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
};

// Add MapState and MapAction types that were missing
export interface MapState {
  selectedId: number | null;
  applications: any[];
  isMapView: boolean;
  coordinates: [number, number];
  activeSort: SortType;
}

export type MapAction =
  | { type: 'SELECT_APPLICATION'; payload: number | null }
  | { type: 'SET_APPLICATIONS'; payload: any[] }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'SET_COORDINATES'; payload: [number, number] }
  | { type: 'SET_SORT'; payload: SortType };
