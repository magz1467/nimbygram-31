
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create default icon to prevent the missing marker icon issue
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Component to center map on selected application
function MapController({ selectedId, applications, searchLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId) {
      const app = applications.find(a => a.id === selectedId);
      if (app && app.latitude && app.longitude) {
        map.setView([app.latitude, app.longitude], 15);
      }
    } else if (searchLocation && searchLocation.lat && searchLocation.lng) {
      map.setView([searchLocation.lat, searchLocation.lng], 13);
    } else if (applications.length > 0) {
      // Create bounds using valid coordinates
      const validApps = applications.filter(app => app.latitude && app.longitude);
      if (validApps.length > 0) {
        const bounds = L.latLngBounds(validApps.map(app => [app.latitude, app.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedId, applications, searchLocation, map]);
  
  return null;
}

export function MapComponent({ applications, selectedId, searchLocation, onPinClick }) {
  const mapRef = useRef(null);
  
  // Find center point for initial map view
  const getInitialCenter = () => {
    if (searchLocation && searchLocation.lat && searchLocation.lng) {
      return [searchLocation.lat, searchLocation.lng];
    }
    if (applications.length > 0 && applications[0].latitude && applications[0].longitude) {
      return [applications[0].latitude, applications[0].longitude];
    }
    return [51.505, -0.09]; // Default to London
  };
  
  return (
    <MapContainer 
      center={getInitialCenter()} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Controller to handle map movements */}
      <MapController 
        selectedId={selectedId} 
        applications={applications}
        searchLocation={searchLocation}
      />
      
      {/* Search location marker */}
      {searchLocation && searchLocation.lat && searchLocation.lng && (
        <Marker 
          position={[searchLocation.lat, searchLocation.lng]}
          icon={defaultIcon}
        >
          <Popup>Search location</Popup>
        </Marker>
      )}
      
      {/* Application markers */}
      {applications.map(app => {
        if (!app.latitude || !app.longitude) return null;
        return (
          <Marker 
            key={app.id}
            position={[app.latitude, app.longitude]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onPinClick && onPinClick(app.id)
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{app.address || 'Unknown address'}</h3>
                <p>{(app.description || 'No description').substring(0, 100)}...</p>
                <button 
                  className="text-pink-500 underline"
                  onClick={() => onPinClick && onPinClick(app.id)}
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
