import React, { useEffect, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface PlanningApplication {
  id: string;
  title: string;
  status: string;
  location: Location;
}

interface ApplicationMapProps {
  applications: PlanningApplication[];
  center?: Location;
  zoom?: number;
  height?: string;
  onMarkerClick?: (application: PlanningApplication) => void;
}

const ApplicationMap: React.FC<ApplicationMapProps> = ({
  applications,
  center = { lat: 51.505, lng: -0.09 }, // Default to London
  zoom = 13,
  height = '500px',
  onMarkerClick
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerId = 'application-map';

  // Load leaflet map when component mounts
  useEffect(() => {
    // Check if leaflet is already loaded
    if (window.L) {
      initializeMap();
      return;
    }

    // Load leaflet CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkElement.crossOrigin = '';
    document.head.appendChild(linkElement);

    // Load leaflet JS
    const scriptElement = document.createElement('script');
    scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    scriptElement.crossOrigin = '';
    scriptElement.onload = () => {
      initializeMap();
    };
    document.head.appendChild(scriptElement);

    return () => {
      // Clean up
      document.head.removeChild(linkElement);
      document.head.removeChild(scriptElement);
    };
  }, []);

  // Initialize map when leaflet is loaded
  const initializeMap = () => {
    if (!window.L || mapLoaded) return;

    // Create map
    const map = window.L.map(mapContainerId).setView([center.lat, center.lng], zoom);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for each application
    applications.forEach(app => {
      if (app.location) {
        const marker = window.L.marker([app.location.lat, app.location.lng])
          .addTo(map)
          .bindPopup(`
            <strong>${app.title}</strong><br>
            Status: ${app.status}<br>
            <a href="/application/${app.id}">View details</a>
          `);

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(app));
        }
      }
    });

    setMapLoaded(true);

    // Update map when applications change
    return () => {
      map.remove();
    };
  };

  // Update map when applications change
  useEffect(() => {
    if (window.L && mapLoaded) {
      // Re-initialize map with new applications
      const mapContainer = document.getElementById(mapContainerId);
      if (mapContainer) {
        mapContainer.innerHTML = '';
        initializeMap();
      }
    }
  }, [applications]);

  return (
    <div id={mapContainerId} style={{ height, width: '100%' }} className="rounded-lg shadow-md"></div>
  );
};

// Add window.L type for TypeScript
declare global {
  interface Window {
    L: any;
  }
}

export default ApplicationMap; 