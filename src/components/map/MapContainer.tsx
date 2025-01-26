import { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import { Application } from "@/types/planning";
import { SearchLocationPin } from "./SearchLocationPin";
import { MapInitializer } from "./components/MapInitializer";
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

  useEffect(() => {
    if (!mapRef.current) {
      console.log('Map not initialized yet, skipping effect...');
      return;
    }
    
    const map = mapRef.current;

    // Add vector tile source if it doesn't exist
    if (!map.getSource('planning-applications')) {
      console.log('Adding vector tile source...');
      map.addSource('planning-applications', {
        type: 'vector',
        tiles: [`${window.location.origin}/functions/v1/fetch-searchland-mvt/{z}/{x}/{y}`],
        minzoom: 0,
        maxzoom: 22,
        scheme: "xyz",
        tileSize: 512,
        attribution: "",
        promoteId: "id"
      });

      // Add the planning applications layer
      map.addLayer({
        'id': 'planning-applications',
        'type': 'circle',
        'source': 'planning-applications',
        'source-layer': 'planning',
        'paint': {
          'circle-radius': 8,
          'circle-color': [
            'match',
            ['get', 'status'],
            'approved', '#16a34a',
            'refused', '#ea384c',
            '#F97316' // default orange
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add click handler for the vector tile layer
      map.on('click', 'planning-applications', (e) => {
        if (e.features && e.features[0]) {
          const feature = e.features[0];
          const id = feature.properties?.id;
          if (id) {
            onMarkerClick(id);
          }
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'planning-applications', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      
      map.on('mouseleave', 'planning-applications', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // Update when map moves
    const moveEndHandler = () => {
      if (!map) return;
      if (onMapMove) {
        onMapMove(map);
      }
    };

    map.on('moveend', moveEndHandler);

    return () => {
      map.off('moveend', moveEndHandler);
    };

  }, [applications, onMapMove, onMarkerClick]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      <SearchLocationPin position={coordinates} />
      <MapInitializer 
        mapContainer={mapContainerRef}
        mapRef={mapRef}
        coordinates={coordinates}
      />
    </div>
  );
};