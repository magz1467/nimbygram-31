import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Use existing pin icons from your project
// Adjust these paths to match your actual pin locations
const defaultIcon = L.icon({
  iconUrl: '/path/to/your/existing/pin.svg', // Update with your actual path
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const selectedIcon = L.icon({
  iconUrl: '/path/to/your/existing/pin.svg', // Update with your actual path
  iconSize: [35, 51], // Bigger when selected
  iconAnchor: [17, 51],
  popupAnchor: [1, -34]
});

const searchIcon = L.icon({
  iconUrl: '/path/to/your/existing/search-pin.svg', // Update with your actual path
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Component to center map on selected application
function MapController({ selectedId, applications, searchLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedId) {
      const app = applications.find(a => a.id === selectedId);
      if (app && app.location) {
        map.setView([app.location.lat, app.location.lng], 15);
      }
    } else if (searchLocation) {
      map.setView([searchLocation.lat, searchLocation.lng], 13);
    } else if (applications.length > 0) {
      // Fit bounds to show all applications
      const bounds = L.latLngBounds(applications.map(app => [app.location.lat, app.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedId, applications, searchLocation, map]);
  
  return null;
}

export function MapComponent({ applications, selectedId, searchLocation, onPinClick }) {
  const mapRef = useRef(null);
  
  // Find center point for initial map view
  const getInitialCenter = () => {
    if (searchLocation) {
      return [searchLocation.lat, searchLocation.lng];
    }
    if (applications.length > 0) {
      return [applications[0].location.lat, applications[0].location.lng];
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
      {searchLocation && (
        <Marker 
          position={[searchLocation.lat, searchLocation.lng]}
          icon={searchIcon}
        >
          <Popup>Search location</Popup>
        </Marker>
      )}
      
      {/* Application markers */}
      {applications.map(app => (
        <Marker 
          key={app.id}
          position={[app.location.lat, app.location.lng]}
          icon={app.id === selectedId ? selectedIcon : defaultIcon}
          eventHandlers={{
            click: () => onPinClick(app.id)
          }}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{app.address}</h3>
              <p>{app.description.substring(0, 100)}...</p>
              <button 
                className="text-pink-500 underline"
                onClick={() => onPinClick(app.id)}
              >
                View details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 