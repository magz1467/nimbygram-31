import { create } from 'zustand';
import { Application } from '@/types/planning';

export interface MapViewState {
  isMapView: boolean;
  selectedId: number | null;
  applications: Application[];
  setMapView: (isMapView: boolean) => void;
  setSelectedId: (id: number | null) => void;
  setApplications: (apps: Application[]) => void;
}

export const useMapViewStore = create<MapViewState>((set) => ({
  isMapView: false,
  selectedId: null,
  applications: [],
  setMapView: (isMapView) => set({ isMapView }),
  setSelectedId: (id) => set({ selectedId: id }),
  setApplications: (apps) => set({ applications: apps }),
}));
