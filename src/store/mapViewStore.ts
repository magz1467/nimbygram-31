import { create } from 'zustand';

interface MapViewState {
  isMapView: boolean;
  applications: any[]; // Replace with your application type
  setMapView: (isMap: boolean) => void;
  setApplications: (apps: any[]) => void;
}

export const useMapViewStore = create<MapViewState>((set) => ({
  isMapView: false,
  applications: [],
  setMapView: (isMap) => set({ isMapView: isMap }),
  setApplications: (apps) => set({ applications: apps }),
})); 