
import { Marker } from "react-leaflet";
import L from "leaflet";

interface SearchLocationPinProps {
  position: [number, number];
}

export const SearchLocationPin = ({ position }: SearchLocationPinProps) => {
  // Create a distinctive search location pin
  const icon = L.divIcon({
    className: 'search-location-pin',
    html: `<div class="relative animate-bounce">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#0EA5E9"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  return <Marker position={position} icon={icon} />;
};
