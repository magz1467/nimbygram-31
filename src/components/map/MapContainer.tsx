import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { Application } from "@/types/planning";
import { ApplicationMarkers } from "./ApplicationMarkers";
import { useEffect, useRef, memo, useState } from "react";
import { Map as LeafletMap } from "leaflet";
import { SearchLocationPin } from "./SearchLocationPin";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { MAP_DEFAULTS } from '@/utils/mapConstants';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapContainerProps {
  applications: Application[];
  coordinates: [number, number];
  searchLocation: [number, number]; // Search location prop
  selectedId?: number | null;
  onMarkerClick: (id: number) => void;
  onCenterChange?: (center: [number, number]) => void;
  onMapMove?: (map: LeafletMap) => void;
  searchRadius?: number; // Added search radius prop
}

export const MapContainer = memo(({
  coordinates,
  searchLocation,
  applications,
  selectedId,
  onMarkerClick,
  onCenterChange,
  onMapMove,
  searchRadius = MAP_DEFAULTS.searchRadius, // Default to constants
}: MapContainerProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [mapReady, setMapReady] = useState(false);

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
    if (!mapRef.current || !validCoordinates || !mapReady) return;
    
    const map = mapRef.current;
    
    if (selectedId) {
      // Find the selected application
      const selectedApp = applications.find(app => app.id === selectedId);
      
      if (selectedApp?.coordinates) {
        // Center on the selected application with appropriate zoom
        map.setView(selectedApp.coordinates, isMobile ? MAP_DEFAULTS.mobileMapZoom : 16, { animate: true });
        console.log('🗺️ Centering map on selected application:', selectedId);
        return;
      }
    }
    
    // If no selection or selection not found, center on search coordinates
    const initialZoom = isMobile ? MAP_DEFAULTS.mobileMapZoom : MAP_DEFAULTS.initialZoom;
    map.setView(coordinates, initialZoom, { animate: true });
    
    // Force map to redraw
    const invalidateTimes = [0, 100, 300, 500];
    invalidateTimes.forEach(delay => {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize(true);
        }
      }, delay);
    });
  }, [coordinates, selectedId, applications, validCoordinates, isMobile, mapReady]);

  // Fit bounds to show all markers within search radius when applications change
  useEffect(() => {
    if (!mapRef.current || applications.length === 0 || !mapReady) return;
    
    // Calculate applications within search radius
    const applicationsInRadius = applications.filter(app => {
      if (!app.coordinates) return false;
      
      // Calculate distance using L.latLng
      try {
        const appLatLng = L.latLng(app.coordinates[0], app.coordinates[1]);
        const searchLatLng = L.latLng(searchLocation[0], searchLocation[1]);
        const distanceInMeters = appLatLng.distanceTo(searchLatLng);
        const distanceInKm = distanceInMeters / 1000;
        
        // Keep only applications within the search radius (plus a small buffer)
        return distanceInKm <= (searchRadius + 0.1);
      } catch (err) {
        console.error('Error calculating distance for app:', app.id, err);
        return false;
      }
    });
    
    console.log(`Found ${applicationsInRadius.length} applications within ${searchRadius}km radius`);
    
    if (applicationsInRadius.length > 0) {
      try {
        // Create bounds from radius coordinates
        const bounds = new L.LatLngBounds(
          applicationsInRadius
            .filter(app => app.coordinates)
            .map(app => app.coordinates as [number, number])
        );
        
        // Always include the search location in the bounds
        bounds.extend(searchLocation);
        
        // Add padding to bounds and fit
        const maxZoom = isMobile ? MAP_DEFAULTS.mobileMapZoom : 15;
        mapRef.current.fitBounds(bounds, { 
          padding: [MAP_DEFAULTS.fitBoundsPadding, MAP_DEFAULTS.fitBoundsPadding],
          maxZoom: maxZoom,
          animate: true
        });
        
        console.log('🗺️ Fitted bounds to show applications in radius');
      } catch (error) {
        console.error('Error fitting bounds:', error);
        // Fallback to centered view if fitting bounds fails
        mapRef.current.setView(searchLocation, isMobile ? MAP_DEFAULTS.mobileMapZoom : MAP_DEFAULTS.initialZoom);
      }
    } else {
      // If no applications in radius, center on search location
      mapRef.current.setView(searchLocation, isMobile ? MAP_DEFAULTS.mobileMapZoom : MAP_DEFAULTS.initialZoom);
    }
  }, [applications, searchRadius, searchLocation, isMobile, mapReady]);

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
        zoom={isMobile ? MAP_DEFAULTS.mobileMapZoom : MAP_DEFAULTS.initialZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-10"
        maxZoom={MAP_DEFAULTS.maxZoom}
        minZoom={MAP_DEFAULTS.minZoom}
        whenReady={() => {
          console.log('🗺️ Map is ready');
          mapRef.current?.invalidateSize(true);
          setMapReady(true);
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
          baseCoordinates={searchLocation} // Use searchLocation instead of coordinates
          onMarkerClick={onMarkerClick}
          selectedId={selectedId || null}
          searchRadius={searchRadius}
        />
      </LeafletMapContainer>
    </div>
  );
});

MapContainer.displayName = 'MapContainer';
