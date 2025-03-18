import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer as CustomMapContainer } from "@/components/map/MapContainer";
import { Application } from "@/types/planning";
import { memo } from "react";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

interface MapViewProps {
  applications: Application[];
  selectedId: number | null;
  coordinates: [number, number];
  onMarkerClick: (id: number | null) => void;
  onCenterChange?: (center: [number, number]) => void;
}

// Component to handle map center changes
const MapUpdater: React.FC<{ center: Location }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  
  return null;
};

export const MapView = memo(({
  applications,
  selectedId,
  coordinates,
  onMarkerClick,
  onCenterChange,
}: MapViewProps) => {
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 51.505, lng: -0.09 }); // Default to London
  const [mapZoom, setMapZoom] = useState(13);
  
  useEffect(() => {
    setMapCenter(coordinates ? { lat: coordinates[0], lng: coordinates[1] } : { lat: 51.505, lng: -0.09 });
    setMapZoom(coordinates ? 13 : 13);
  }, [coordinates]);

  const handleMarkerClick = (application: Application) => {
    if (onMarkerClick) {
      onMarkerClick(application.id ? parseInt(application.id) : null);
    }
  };

  // Log coordinates for debugging
  useEffect(() => {
    console.log("🗺️ MapView rendering with coordinates:", coordinates);
  }, [coordinates]);
  
  // Make sure we have valid coordinates before rendering
  if (!coordinates || 
      !Array.isArray(coordinates) || 
      coordinates.length !== 2 || 
      !isFinite(coordinates[0]) || 
      !isFinite(coordinates[1]) ||
      coordinates[0] === 0 || 
      coordinates[1] === 0) {
    console.warn("MapView - Invalid coordinates, not rendering map:", coordinates);
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-primary">Loading map location...</span>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={mapCenter} />
        
        {applications.map(app => (
          <Marker 
            key={app.id} 
            position={[app.location.lat, app.location.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(app)
            }}
          >
            <Popup>
              <div>
                <h3>{app.title}</h3>
                <p>Status: {app.status}</p>
                <button onClick={() => handleMarkerClick(app)}>
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

MapView.displayName = 'MapView';
