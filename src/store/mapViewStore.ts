
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MapViewState {
  isMapView: boolean;
  applications: any[]; // Replace with your application type
  selectedId: number | null;
  setMapView: (isMap: boolean) => void;
  setApplications: (apps: any[]) => void;
  setSelectedId: (id: number | null) => void;
}

export const useMapViewStore = create<MapViewState>()(
  devtools(
    (set) => ({
      isMapView: false,
      applications: [],
      selectedId: null,
      setMapView: (isMap) => {
        console.log('Setting map view state to:', isMap);
        set({ isMapView: isMap });
      },
      setApplications: (apps) => set({ applications: apps }),
      setSelectedId: (id) => set({ selectedId: id }),
    }),
    {
      name: 'map-view-store',
    }
  )
);
