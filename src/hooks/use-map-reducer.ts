
import { Application } from "@/types/planning";
import { useReducer } from 'react';
import { mapReducer, createInitialMapState } from './planning/map/map-reducer';

export const useMapReducer = (initialApplications: Application[] = []) => {
  const initialState = {
    ...createInitialMapState(),
    applications: initialApplications
  };
  
  const [state, dispatch] = useReducer(mapReducer, initialState);

  return {
    state,
    dispatch
  };
};
