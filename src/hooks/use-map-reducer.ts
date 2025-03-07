import { Application } from "@/types/planning";
import { MapState, MapAction, SortType } from "@/types/application-types";

export const initialState: MapState = {
  selectedId: null,
  applications: [],
  isMapView: true,
  coordinates: [51.5074, -0.1278], // Default to London
  activeSort: null
};

export const mapReducer = (state: MapState, action: MapAction): MapState => {
  switch (action.type) {
    case 'SELECT_APPLICATION':
      return {
        ...state,
        selectedId: action.payload
      };
    case 'SET_APPLICATIONS':
      return {
        ...state,
        applications: action.payload
      };
    case 'TOGGLE_VIEW':
      return {
        ...state,
        isMapView: !state.isMapView
      };
    case 'SET_COORDINATES':
      return {
        ...state,
        coordinates: action.payload
      };
    case 'SET_SORT':
      return {
        ...state,
        activeSort: action.payload
      };
    default:
      return state;
  }
};
