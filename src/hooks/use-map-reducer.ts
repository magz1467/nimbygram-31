import { Application } from "@/types/planning";
import { MapState, MapAction } from "@/types/application-types";
import { useReducer } from 'react';

const initialState: MapState = {
  selectedId: null,
  applications: [],
  isMapView: true,
  coordinates: [51.5074, -0.1278], // Default to London coordinates
  activeSort: null,
  activeFilters: {}
};

function mapReducer(state: MapState, action: MapAction): MapState {
  console.log('Map reducer action:', action.type, 'payload' in action ? action.payload : '');
  
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
    case 'SET_FILTERS':
      return {
        ...state,
        activeFilters: action.payload
      };
    default:
      return state;
  }
}

export const useMapReducer = (initialApplications: Application[] = []) => {
  const [state, dispatch] = useReducer(mapReducer, {
    ...initialState,
    applications: initialApplications
  });

  return {
    state,
    dispatch
  };
};