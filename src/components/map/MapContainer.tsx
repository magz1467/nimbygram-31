
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { Application } from "@/types/planning";
import { ApplicationMarkers } from "./ApplicationMarkers";
import { useEffect, useRef, memo } from "react";
import { Map as LeafletMap } from "leaflet";
import { SearchLocationPin } from "./SearchLocationPin";
import "leaflet/dist/leaflet.css";

interface MapContainerProps {
  applications: Application[];
  coordinates: [number, number];
  searchLocation: [number, number]; // Search location prop
  selectedId?: number | null;
  onMarkerClick: (id: number) => void;
  onCenterChange?: (center: [number, number]) => void;
  onMapMove?: (map: LeafletMap) => void;
}

export const MapContainer = memo(({
  coordinates,
  searchLocation, // Added search location
  applications,
  selectedId,
  onMarkerClick,
  onCenterChange,
  onMapMove,
}: MapContainerProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate coordinates are in correct format [lat, lng]
  const validCoordinates = Array.isArray(coordinates) && 
                          coordinates.length === 2 && 
                          Math.abs(coordinates[0]) <= 90 && 
                          Math.abs(coordinates[1]) <= 180;
  
  if (!validCoordinates) {
    console.error('Invalid coordinates provided to MapContainer:', coordinates);
  }

  // Handle map view updates for both initial coordinates and selected application
  useEffect(() => {
    if (!mapRef.current || !validCoordinates) return;
    
    const map = mapRef.current;
    
    if (selectedId) {
      // Find the selected application
      const selectedApp = applications.find(app => app.id === selectedId);
      
      if (selectedApp?.coordinates) {
        // Center on the selected application with appropriate zoom
        map.setView(selectedApp.coordinates, 16, { animate: true });
        console.log('🗺️ Centering map on selected application:', selectedId);
        return;
      }
    }
    
    // If no selection or selection not found, center on search coordinates
    map.setView(coordinates, 14, { animate: true });
    
    // Force map to redraw
    const invalidateTimes = [0, 100, 300, 500];
    invalidateTimes.forEach(delay => {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, delay);
    });
  }, [coordinates, selectedId, applications, validCoordinates]);

  // Handle first mount of the map
  useEffect(() => {
    const checkAndInvalidateSize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(true);
        console.log('🗺️ Map initial size invalidation');
      }
    };
    
    // Check multiple times to ensure the map is fully initialized
    const timers = [100, 300, 500, 1000, 2000].map(delay => 
      setTimeout(checkAndInvalidateSize, delay)
    );
    
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  // Add styles for marker visibility
  useEffect(() => {
    // Add CSS to ensure markers are visible on mobile
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .leaflet-marker-icon {
        z-index: 1000 !important;
      }
      .custom-marker {
        z-index: 1000 !important;
        pointer-events: auto !important;
      }
      .selected-marker {
        z-index: 1001 !important;
      }
      .leaflet-pane {
        z-index: 400 !important;
      }
      .leaflet-marker-pane {
        z-index: 600 !important;
      }
      .leaflet-popup-pane {
        z-index: 700 !important;
      }
      .custom-pin {
        filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.3));
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Use a fallback center if coordinates are invalid
  const centerPoint: [number, number] = validCoordinates ? coordinates : [51.5074, -0.1278]; // London fallback

  return (
    <div className="w-full h-full relative bg-white" ref={containerRef}>
      <LeafletMapContainer
        ref={mapRef}
        center={coordinates}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
        whenReady={() => {
          console.log('🗺️ Map is ready');
          mapRef.current?.invalidateSize(true);
        }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        {/* Show search location pin at search coordinates */}
        <SearchLocationPin position={searchLocation} />
        <ApplicationMarkers
          applications={applications}
          baseCoordinates={coordinates}
          onMarkerClick={onMarkerClick}
          selectedId={selectedId || null}
        />
      </LeafletMapContainer>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';
