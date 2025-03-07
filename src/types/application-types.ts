
import { Application } from "./planning";

export type SortType = 'closingSoon' | 'newest' | null;

export type FilterType = {
  status?: string;
  type?: string;
  classification?: string;
};

export type StatusCounts = {
  'Under Review': number;
  'Approved': number;
  'Declined': number;
  'Other': number;
};

export type MapState = {
  selectedId: number | null;
  applications: Application[];
  isMapView: boolean;
  coordinates: [number, number];
  activeSort: SortType;
  activeFilters: FilterType;
};

export type MapAction =
  | { type: 'SELECT_APPLICATION'; payload: number | null }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'SET_COORDINATES'; payload: [number, number] }
  | { type: 'SET_SORT'; payload: SortType }
  | { type: 'SET_FILTERS'; payload: FilterType };
