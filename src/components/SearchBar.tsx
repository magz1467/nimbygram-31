
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapViewStore } from '../store/mapViewStore';

export function SearchBar() {
  const navigate = useNavigate();
  const { setMapView } = useMapViewStore();
  
  const handleViewMap = () => {
    setMapView(true);
  };
  
  return (
    <div>
      {/* Search bar content */}
      <button onClick={handleViewMap}>View Map</button>
    </div>
  );
}
