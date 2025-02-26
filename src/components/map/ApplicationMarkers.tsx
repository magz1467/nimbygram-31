
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

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('approved')) {
    return '#16a34a'; // green
  } else if (statusLower.includes('refused') || statusLower.includes('declined') || statusLower.includes('withdrawn')) {
    return '#ea384c'; // red
  } else {
    return '#F97316'; // orange for under consideration/pending
  }
};

const createIcon = (color: string, isSelected: boolean) => {
  const size = isSelected ? 40 : 24;

  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="${color}"/>
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
    baseCoordinates,
    firstApp: applications[0]
  });

  const markers = useMemo(() => {
    return applications.map(app => {
      if (!app.coordinates) {
        console.log(`⚠️ Missing coordinates for application ${app.id}:`, app);
        return null;
      }

      // Ensure coordinates are numbers
      const coords: [number, number] = [
        typeof app.coordinates[0] === 'string' ? parseFloat(app.coordinates[0]) : app.coordinates[0],
        typeof app.coordinates[1] === 'string' ? parseFloat(app.coordinates[1]) : app.coordinates[1]
      ];

      if (isNaN(coords[0]) || isNaN(coords[1])) {
        console.log(`⚠️ Invalid coordinates for application ${app.id}:`, app.coordinates);
        return null;
      }

      const color = getStatusColor(app.status || 'pending');
      const isSelected = app.id === selectedId;
      
      console.log(`📍 Creating marker for application ${app.id}:`, {
        coordinates: coords,
        isSelected,
        color
      });

      return (
        <Marker
          key={app.id}
          position={coords}
          eventHandlers={{
            click: () => {
              console.log('🖱️ Marker clicked:', app.id);
              onMarkerClick(app.id);
            }
          }}
          icon={createIcon(color, isSelected)}
          zIndexOffset={isSelected ? 1000 : 0}
        />
      );
    }).filter(Boolean);
  }, [applications, selectedId, onMarkerClick]);

  return <>{markers}</>;
};

