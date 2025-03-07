import { Application } from "./planning";

export interface MapState {
  selectedId: number | null;
  applications: Application[];
  isMapView: boolean;
  coordinates: [number, number];
  activeSort: SortType;
}

export type SortType = 'closingSoon' | 'newest' | 'impact' | null;

export type MapAction =
  | { type: 'SELECT_APPLICATION'; payload: number | null }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'SET_COORDINATES'; payload: [number, number] }
  | { type: 'SET_SORT'; payload: SortType };