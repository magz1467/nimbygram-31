import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Application } from '@/types/planning';
import { LatLngTuple } from 'leaflet';
import { MapboxMarkerManager } from './mapbox/MapboxMarkerManager';
import { MapboxInitializer } from './mapbox/MapboxInitializer';
import { MapboxErrorDisplay } from './mapbox/MapboxErrorDisplay';

interface MapboxMapProps {
  applications: Application[];
  selectedId: number | null;
  onMarkerClick: (id: number) => void;
  initialCenter: LatLngTuple;
}

export const MapboxMap = ({
  applications,
  selectedId,
  onMarkerClick,
  initialCenter,
}: MapboxMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerManager = useRef<MapboxMarkerManager | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const initializedRef = useRef(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map only once
  useEffect(() => {
    if (initializedRef.current || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        const newMap = await MapboxInitializer.initialize(
          mapContainer.current!,
          initialCenter,
          (error, debug) => {
            console.error('Map initialization error:', error, debug);
            setError(error);
            setDebugInfo(debug);
          }
        );

        if (newMap) {
          map.current = newMap;
          markerManager.current = new MapboxMarkerManager(newMap, onMarkerClick);
          
          // Set initial view immediately
          newMap.setCenter([initialCenter[1], initialCenter[0]]);
          newMap.setZoom(14); // Start with a closer zoom

          // Wait for the style to load before adding markers
          newMap.once('style.load', () => {
            console.log('Map style loaded successfully');
            setIsMapReady(true);
            initializedRef.current = true;

            // Fit bounds to markers after they're added
            if (applications.length > 0) {
              const bounds = new mapboxgl.LngLatBounds();
              applications.forEach(app => {
                if (app.coordinates) {
                  bounds.extend([app.coordinates[1], app.coordinates[0]]);
                }
              });
              
              // Add some padding around the bounds
              newMap.fitBounds(bounds, {
                padding: 50,
                maxZoom: 16
              });
            }
          });

          // Handle map errors
          newMap.on('error', (e) => {
            console.error('Mapbox error:', e);
            setError('Failed to load map resources');
          });
        }
      } catch (err) {
        console.error('Map initialization failed:', err);
        setError('Failed to initialize map');
      }
    };

    initializeMap();

    return () => {
      if (markerManager.current) {
        markerManager.current.removeAllMarkers();
        markerManager.current = null;
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      initializedRef.current = false;
      setIsMapReady(false);
    };
  }, [initialCenter, onMarkerClick, applications]);

  // Update markers only when map is ready and applications change
  useEffect(() => {
    if (!isMapReady || !markerManager.current || !map.current || !applications.length) return;

    console.log('Adding markers for applications:', applications.length);

    // Remove all existing markers
    markerManager.current.removeAllMarkers();

    // Add new markers
    applications.forEach(application => {
      if (application.coordinates) {
        console.log('Adding marker for application:', application.id, application.coordinates);
        markerManager.current?.addMarker(application, application.id === selectedId);
      }
    });
  }, [applications, selectedId, isMapReady]);

  // Update marker styles when selection changes
  useEffect(() => {
    if (!isMapReady || !markerManager.current) return;
    
    const markers = markerManager.current.getMarkers();
    Object.keys(markers).forEach(id => {
      markerManager.current?.updateMarkerStyle(Number(id), Number(id) === selectedId);
    });
  }, [selectedId, isMapReady]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 bg-gray-100"
        style={{ 
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
      />
      <MapboxErrorDisplay error={error} debugInfo={debugInfo} />
    </div>
  );
};