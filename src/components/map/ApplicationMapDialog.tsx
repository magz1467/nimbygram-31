
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Application } from "@/types/planning";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  MapContainer as LeafletMapContainer, 
  TileLayer, 
  Marker,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

// Create custom marker icons
const createApplicationIcon = (isSelected: boolean) => {
  const size = isSelected ? 48 : 24;
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#F97316"/>
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
  });
};

const searchLocationIcon = L.divIcon({
  className: 'custom-pin search-location',
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#3B82F6" fill-opacity="0.3" stroke="#3B82F6" stroke-width="2"/>
    <circle cx="12" cy="12" r="4" fill="#3B82F6"/>
  </svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to set map view based on application coordinates
const MapController = ({ 
  coordinates 
}: { 
  coordinates: [number, number] 
}) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(coordinates, 15);
    
    // Force map to redraw after mounting
    setTimeout(() => {
      map.invalidateSize(true);
    }, 100);
  }, [map, coordinates]);
  
  return null;
};

interface ApplicationMapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  allApplications?: Application[];
  searchCoordinates?: [number, number];
}

export const ApplicationMapDialog = ({
  isOpen,
  onClose,
  application,
  allApplications = [],
  searchCoordinates
}: ApplicationMapDialogProps) => {
  const [mapReady, setMapReady] = useState(false);
  
  // If no coordinates are available for the application, we can't show the map
  if (!application.coordinates) {
    return null;
  }

  // Get all applications with valid coordinates
  const validApplications = allApplications.filter(app => !!app.coordinates);
  
  // Use search coordinates if provided, otherwise use the default coordinates
  const actualSearchCoordinates = searchCoordinates || application.coordinates;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[800px] sm:max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-[500px] w-full">
          <Button 
            className="absolute top-2 right-2 z-[1000]" 
            size="icon" 
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="w-full h-full">
            <LeafletMapContainer
              center={application.coordinates}
              zoom={15}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              className="z-10"
              whenReady={() => setMapReady(true)}
            >
              <TileLayer 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />
              
              {/* Fixed Search Location Pin */}
              <Marker 
                position={actualSearchCoordinates}
                icon={searchLocationIcon}
                zIndexOffset={900}
              />
              
              {/* Application Markers */}
              {validApplications.map(app => (
                <Marker
                  key={app.id}
                  position={app.coordinates as [number, number]}
                  icon={createApplicationIcon(app.id === application.id)}
                  zIndexOffset={app.id === application.id ? 1000 : 500}
                />
              ))}
              
              {/* Controller to set map view */}
              <MapController coordinates={application.coordinates} />
            </LeafletMapContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
