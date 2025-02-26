
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
  selectedId?: number | null;
  onMarkerClick: (id: number) => void;
  onCenterChange?: (center: [number, number]) => void;
  onMapMove?: (map: LeafletMap) => void;
}

export const MapContainer = memo(({
  coordinates,
  applications,
  selectedId,
  onMarkerClick,
  onCenterChange,
  onMapMove,
}: MapContainerProps) => {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      console.log('🗺️ Setting map view to coordinates:', coordinates);
      mapRef.current.setView(coordinates, 14);
      mapRef.current.invalidateSize();
    }
  }, [coordinates]);

  useEffect(() => {
    if (mapRef.current && onMapMove) {
      onMapMove(mapRef.current);
    }
  }, [onMapMove]);

  return (
    <div className="w-full h-full relative bg-white">
      <LeafletMapContainer
        ref={mapRef}
        center={coordinates}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          className="z-0"
        />
        <SearchLocationPin position={coordinates} />
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

