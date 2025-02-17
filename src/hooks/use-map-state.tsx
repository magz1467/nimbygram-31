
import { useCallback, useReducer } from 'react';
import { MapAction, MapState } from '@/types/map';
import { SortType } from '@/types/application-types';

const initialState: MapState = {
  coordinates: [51.5074, -0.1278],
  zoom: 13,
  applications: [],
  selectedId: null,
  activeSort: null,
  postcode: ''
};

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'SET_COORDINATES':
      return { ...state, coordinates: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    case 'SET_SELECTED_ID':
      return { ...state, selectedId: action.payload };
    case 'SET_SORT':
      return { ...state, activeSort: action.payload };
    case 'SET_POSTCODE':
      return { ...state, postcode: action.payload };
    default:
      return state;
  }
}

export const useMapState = () => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const handleMarkerClick = useCallback((id: number | null) => {
    dispatch({ type: 'SET_SELECTED_ID', payload: id });
  }, []);

  const handleSortChange = useCallback((sortType: SortType) => {
    dispatch({ type: 'SET_SORT', payload: sortType });
  }, []);

  return {
    state,
    dispatch,
    handleMarkerClick,
    handleSortChange
  };
};
