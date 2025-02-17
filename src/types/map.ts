
import { Application } from "./planning";
import { SortType } from "./application-types";

export type MapLocation = {
  coordinates: [number, number];
  zoom: number;
};

export type MapFeatures = {
  applications: Application[];
  selectedId: number | null;
  activeSort: SortType;
  postcode: string;
};

export type MapState = MapLocation & MapFeatures;

export type MapAction =
  | { type: 'SET_COORDINATES'; payload: [number, number] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_APPLICATIONS'; payload: Application[] }
  | { type: 'SET_SELECTED_ID'; payload: number | null }
  | { type: 'SET_SORT'; payload: SortType }
  | { type: 'SET_POSTCODE'; payload: string };
