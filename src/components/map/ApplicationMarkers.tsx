
import { Marker } from "react-leaflet";
import { Application } from "@/types/planning";
import { LatLngTuple } from "leaflet";
import { useMemo } from "react";
import L from "leaflet";

interface ApplicationMarkersProps {
  applications: Application[];
  baseCoordinates: LatLngTuple;
  onMarkerClick: (id: number) => void;
  selectedId: number | null;
}

// Helper function to determine marker color based on application status
const getStatusColor = (status: string): string => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('approved')) {
    return '#16a34a'; // green
  } else if (statusLower.includes('refused') || statusLower.includes('declined') || statusLower.includes('withdrawn')) {
    return '#ea384c'; // red
  } else {
    return '#F97316'; // orange for under consideration/pending
  }
};

// Create marker icon with appropriate color and size
const createMarkerIcon = (color: string, isSelected: boolean) => {
  // Make selected markers significantly larger on desktop
  const size = isSelected ? 48 : 24; // Larger size for selected marker
  const strokeWidth = isSelected ? 2 : 1; // Thicker stroke for selected marker
  const strokeColor = isSelected ? "#000000" : "#444444"; // Darker stroke for selected marker
  
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" 
        fill="${color}" 
        stroke="${strokeColor}" 
        stroke-width="${strokeWidth}"
      />
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
  });
};

export const ApplicationMarkers = ({
  applications,
  baseCoordinates,
  onMarkerClick,
  selectedId,
}: ApplicationMarkersProps) => {
  console.log('🎯 ApplicationMarkers props:', {
    applicationsCount: applications.length,
    selectedId,
    baseCoordinates
  });

  const markers = useMemo(() => {
    return applications
      .filter(app => {
        // Filter out applications without valid coordinates
        if (!app.coordinates) {
          console.log(`⚠️ Missing coordinates for application ${app.id}`);
          return false;
        }
        
        const [lat, lng] = app.coordinates;
        if (isNaN(lat) || isNaN(lng)) {
          console.log(`⚠️ Invalid coordinates for application ${app.id}:`, app.coordinates);
          return false;
        }
        
        return true;
      })
      .map(app => {
        const color = getStatusColor(app.status || 'pending');
        const isSelected = app.id === selectedId;

        return (
          <Marker
            key={app.id}
            position={app.coordinates as LatLngTuple}
            eventHandlers={{
              click: () => {
                console.log('🖱️ Marker clicked:', app.id);
                onMarkerClick(app.id);
              }
            }}
            icon={createMarkerIcon(color, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0} // Make selected marker appear on top
          />
        );
      });
  }, [applications, selectedId, onMarkerClick]);

  return <>{markers}</>;
};
