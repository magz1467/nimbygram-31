import { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import { Application } from "@/types/planning";
import { SearchLocationPin } from "./SearchLocationPin";
import { MapInitializer } from "./components/MapInitializer";
import { EventHandlers } from "./components/EventHandlers";
import { supabase } from "@/integrations/supabase/client";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapContainerProps {
  coordinates: [number, number];
  applications: Application[];
  selectedId?: number | null;
  onMarkerClick: (id: number) => void;
  onCenterChange?: (center: [number, number]) => void;
  onMapMove?: (map: any) => void;
}

export const MapContainerComponent = ({
  coordinates,
  applications,
  selectedId,
  onMarkerClick,
  onCenterChange,
  onMapMove,
}: MapContainerProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const sourceAddedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;

    map.on('load', async () => {
      if (sourceAddedRef.current) {
        console.log('Vector tile source already added, skipping...');
        return;
      }

      try {
        console.log('Adding vector tile source...');
        
        // Add vector tile source with authentication headers
        map.addSource('planning-applications', {
          type: 'vector',
          tiles: [`${process.env.VITE_SUPABASE_URL || 'https://jposqxdboetyioymfswd.supabase.co'}/functions/v1/fetch-searchland-mvt/{z}/{x}/{y}`],
          minzoom: 0,
          maxzoom: 14,
          tileSize: 512,
          attribution: '© Planning Data',
          scheme: 'xyz',
          promoteId: 'id'
        });

        // Add vector tile layer
        map.addLayer({
          id: 'planning-applications',
          type: 'circle',
          source: 'planning-applications',
          'source-layer': 'planning_applications',
          paint: {
            'circle-radius': 8,
            'circle-color': [
              'match',
              ['get', 'status'],
              'approved', '#16a34a',
              'refused', '#ea384c',
              '#F97316' // default orange
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        sourceAddedRef.current = true;
        console.log('Successfully added vector tile source and layer');
      } catch (error) {
        console.error('Error adding vector tile source:', error);
      }
    });

    // Load pins when moving map
    map.on('moveend', () => {
      if (onMapMove) {
        onMapMove(map);
      }
    });

  }, [onMapMove, onMarkerClick]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <SearchLocationPin position={coordinates} />
      <MapInitializer 
        mapContainer={mapContainerRef}
        mapRef={mapRef}
        coordinates={coordinates}
      />
      {mapRef.current && (
        <>
          <EventHandlers 
            map={mapRef.current}
            onMarkerClick={onMarkerClick}
          />
        </>
      )}
    </div>
  );
};