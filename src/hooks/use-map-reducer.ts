
import { Application } from "@/types/planning";
import { MapState, MapAction, SortType } from "@/types/application-types";

export const initialState: MapState = {
  selectedId: null,
  applications: [],
  showSidebar: true,
  isMapView: true,
  coordinates: [51.5074, -0.1278], // Default to London
  postcode: "",
  activeFilters: {},
  activeSort: null
};

export const mapReducer = (state: MapState, action: MapAction): MapState => {
  switch (action.type) {
    case 'SELECT_APPLICATION':
      return {
        ...state,
        selectedId: action.payload
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        showSidebar: !state.showSidebar
      };
    case 'SET_MAP_VIEW':
      return {
        ...state,
        isMapView: action.payload
      };
    case 'SET_COORDINATES':
      return {
        ...state,
        coordinates: action.payload
      };
    case 'SET_POSTCODE':
      return {
        ...state,
        postcode: action.payload
      };
    case 'SET_FILTER':
      return {
        ...state,
        activeFilters: {
          ...state.activeFilters,
          ...action.payload
        }
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
