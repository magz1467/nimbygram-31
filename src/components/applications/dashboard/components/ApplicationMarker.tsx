import { memo, useCallback, useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

interface ApplicationMarkerProps {
  application: {
    application_id: number;
    centroid: {
      lat: number;
      lng: number;
    };
  };
  isSelected: boolean;
  onClick: (id: number) => void;
}

export const ApplicationMarker = memo(({ 
  application, 
  isSelected, 
  onClick 
}: ApplicationMarkerProps) => {
  console.log(`Rendering marker ${application.application_id}:`, {
    isSelected,
    coordinates: [application.centroid.lat, application.centroid.lng]
  });

  const handleClick = useCallback((e: L.LeafletMouseEvent) => {
    try {
      e.originalEvent.stopPropagation();
      console.log(`Marker clicked - Application ${application.application_id}`);
      
      // Track marker state before click
      console.log('Marker state before click:', {
        isSelected,
        eventType: e.type,
        hasOriginalEvent: !!e.originalEvent,
        propagationStopped: e.originalEvent.cancelBubble,
        coordinates: [application.centroid.lat, application.centroid.lng]
      });

      onClick(application.application_id);

      // Verify click handler executed successfully
      console.log(`Click handler completed for marker ${application.application_id}`);
    } catch (error) {
      console.error('Error in marker click handler:', {
        markerId: application.application_id,
        error,
        eventDetails: e,
        markerState: { isSelected }
      });
    }
  }, [application.application_id, onClick, isSelected]);

  const icon = useMemo(() => {
    const size = isSelected ? 40 : 24;
    const color = '#F97316'; // Default orange color
    console.log('Creating marker icon - Selected:', isSelected, 'Size:', size + 'px');

    return L.divIcon({
      className: `custom-marker-icon ${isSelected ? 'selected' : ''}`,
      html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="${color}"/>
      </svg>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size],
    });
  }, [isSelected]);

  return (
    <Marker
      position={[application.centroid.lat, application.centroid.lng]}
      eventHandlers={{
        click: handleClick,
      }}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  const shouldUpdate = 
    prevProps.isSelected !== nextProps.isSelected ||
    prevProps.application.application_id !== nextProps.application.application_id ||
    prevProps.application.centroid.lat !== nextProps.application.centroid.lat ||
    prevProps.application.centroid.lng !== nextProps.application.centroid.lng;

  if (shouldUpdate) {
    console.log('Marker will update:', {
      id: prevProps.application.application_id,
      reason: {
        selectedChanged: prevProps.isSelected !== nextProps.isSelected,
        idChanged: prevProps.application.application_id !== nextProps.application.application_id,
        positionChanged: 
          prevProps.application.centroid.lat !== nextProps.application.centroid.lat ||
          prevProps.application.centroid.lng !== nextProps.application.centroid.lng
      }
    });
  }

  return !shouldUpdate;
});

ApplicationMarker.displayName = 'ApplicationMarker';