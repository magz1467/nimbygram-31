
import { Marker } from "react-leaflet";
import { divIcon, LatLngTuple } from "leaflet";

interface SearchLocationPinProps {
  position: LatLngTuple;
}

export const SearchLocationPin = ({ position }: SearchLocationPinProps) => {
  // Create a custom icon for the search location pin
  const searchIcon = divIcon({
    className: 'search-location-pin',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  return <Marker position={position} icon={searchIcon} zIndexOffset={500} />;
};
