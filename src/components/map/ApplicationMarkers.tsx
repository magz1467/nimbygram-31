
import { Application } from "@/types/planning";
import { Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import { useEffect, useMemo } from "react";
import { MAP_DEFAULTS } from '@/utils/mapConstants';

interface ApplicationMarkersProps {
  applications: Application[];
  baseCoordinates: [number, number];
  onMarkerClick: (id: number) => void;
  selectedId: number | null;
  searchRadius?: number;
}

export const ApplicationMarkers = ({
  applications,
  baseCoordinates,
  onMarkerClick,
  selectedId,
  searchRadius = MAP_DEFAULTS.searchRadius
}: ApplicationMarkersProps) => {
  console.log('🎯 ApplicationMarkers props:', {
    applicationsCount: applications.length,
    selectedId,
    baseCoordinates,
    searchRadius
  });

  // Create custom markers for regular and selected applications
  useEffect(() => {
    // Create custom icon for regular markers
    if (!L.Icon.Default.prototype._getIconUrl) {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker.svg',
        iconUrl: '/marker.svg',
        shadowUrl: null,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });
    }
  }, []);

  const createIcon = (isSelected: boolean) => {
    return new L.Icon({
      iconUrl: isSelected ? '/marker-selected.svg' : '/marker.svg',
      iconSize: isSelected ? [35, 57] : [25, 41],
      iconAnchor: isSelected ? [17, 57] : [12, 41],
      popupAnchor: [1, -34],
      className: `custom-marker ${isSelected ? 'selected-marker' : ''}`
    });
  };

  // Filter applications by distance from base coordinates
  const markersToRender = useMemo(() => {
    console.log('🔍 Creating markers for applications:', applications.length);
    
    // Filter applications to those with valid coordinates
    const validApplications = applications.filter(app => app.coordinates && 
      Array.isArray(app.coordinates) && 
      app.coordinates.length === 2 &&
      !isNaN(app.coordinates[0]) && 
      !isNaN(app.coordinates[1]));
    
    // Further filter to those within the search radius
    const filteredApplications = validApplications.filter(app => {
      // Calculate distance using Leaflet
      const appLatLng = L.latLng(app.coordinates![0], app.coordinates![1]);
      const baseLatLng = L.latLng(baseCoordinates[0], baseCoordinates[1]);
      const distanceInMeters = appLatLng.distanceTo(baseLatLng);
      const distanceInKm = distanceInMeters / 1000;
      
      // Only include applications within the search radius
      return distanceInKm <= searchRadius;
    });
    
    console.log(`📏 Filtered to ${filteredApplications.length} applications within ${searchRadius}km radius`);
    
    return filteredApplications;
  }, [applications, baseCoordinates, searchRadius]);

  console.log('🎯 Rendering', markersToRender.length, 'markers');

  return (
    <>
      {markersToRender.map((app) => {
        if (!app.coordinates) return null;
        
        const isSelected = app.id === selectedId;
        const markerIcon = createIcon(isSelected);
        
        return (
          <Marker 
            key={`app-marker-${app.id}`}
            position={app.coordinates as [number, number]}
            icon={markerIcon}
            eventHandlers={{
              click: () => {
                console.log('Marker clicked:', app.id);
                onMarkerClick(app.id);
              },
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{app.title || app.description || 'Planning Application'}</strong>
                <p className="mt-1">{app.address}</p>
                {app.status && (
                  <div className="mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {app.status}
                    </span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
