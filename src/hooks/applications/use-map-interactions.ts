
import { useState, useCallback } from 'react';

export const useMapInteractions = () => {
  const [showMap, setShowMap] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Handle marker click
  const handleMarkerClick = useCallback((id: number | null) => {
    console.log('Marker clicked for application:', id);
    setSelectedId(id);
    if (id) {
      const element = document.getElementById(`application-${id}`);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    showMap,
    setShowMap,
    selectedId,
    setSelectedId,
    handleMarkerClick
  };
};
