
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Application } from '@/types/planning';

interface MapComponentProps {
  applications: Application[];
  center?: LatLngTuple;
  zoom?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({ 
  applications,
  center = [51.505, -0.09], // Default to London
  zoom = 13
}) => {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {applications.map((app) => {
          // Check if application has coordinates
          const position: LatLngTuple = app.coordinates 
            ? [app.coordinates[0], app.coordinates[1]] 
            : (app.latitude && app.longitude 
                ? [app.latitude, app.longitude] 
                : [51.505, -0.09]); // Default fallback
                
          return (
            <Marker key={app.id} position={position}>
              <Popup>
                <div>
                  <h3 className="font-bold">{app.title || 'Unknown Application'}</h3>
                  <p>{app.address}</p>
                  <p>Status: {app.status}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
