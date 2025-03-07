
// Add these types to your existing file
export type SortType = 'closingSoon' | 'newest' | 'impact' | 'distance' | null;

// Add these types if they are missing (import errors indicate they are missing)
export interface MapState {
  applications: any[];
  selectedId: number | null;
  showSidebar: boolean;
  isMapView: boolean;
  coordinates: [number, number] | null;
  postcode: string;
  activeFilters: {
    status?: string;
    type?: string;
  };
  activeSort: SortType;
}

export interface MapAction {
  type: 'SELECT_APPLICATION' | 'TOGGLE_SIDEBAR' | 'SET_MAP_VIEW' | 'SET_COORDINATES' | 'SET_POSTCODE' | 'SET_FILTER' | 'SET_SORT';
  payload: any;
}
