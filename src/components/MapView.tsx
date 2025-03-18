
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapViewStore } from '../store/mapViewStore';
import 'leaflet/dist/leaflet.css';

export function MapView() {
  const { applications, selectedId } = useMapViewStore();
  
  useEffect(() => {
    console.log("MapView component mounted with applications:", applications.length);
  }, [applications]);
  
  return (
    <div className="h-full w-full">
      <div className="absolute inset-0">
        <MapContainer 
          center={[51.505, -0.09]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {applications.map(app => (
            <Marker 
              key={app.id}
              position={[
                app.latitude || 51.505, 
                app.longitude || -0.09
              ]}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">{app.address || 'Unknown address'}</h3>
                  <p>{(app.description || 'No description').substring(0, 100)}...</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
