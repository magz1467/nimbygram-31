
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
        width: 24px;
        height: 24px;
        background-color: rgba(242, 103, 152, 0.3);
        border: 3px solid rgb(242, 103, 152);
        border-radius: 50%;
        box-shadow: 0 0 0 2px rgba(242, 103, 152, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: rgb(242, 103, 152);
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker 
      position={position} 
      icon={searchIcon} 
      zIndexOffset={1000} 
    />
  );
};
