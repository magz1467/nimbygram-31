
import { Application } from "./planning";
import { SortType } from "./application-types";

export interface MapState {
  selectedId: number | null;
  applications: Application[];
  isMapView: boolean;
  coordinates: [number, number];
  activeSort: SortType;
}

export type MapAction =
  | { type: 'SELECT_APPLICATION'; payload: number | null }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'TOGGLE_VIEW' }
  | { type: 'SET_COORDINATES'; payload: [number, number] }
  | { type: 'SET_SORT'; payload: SortType };
