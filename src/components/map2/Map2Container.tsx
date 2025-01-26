import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Application } from '@/types/planning';

interface Map2ContainerProps {
  coordinates?: [number, number];
  isLoading?: boolean;
}

export const Map2Container = ({ coordinates, isLoading }: Map2ContainerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const searchPinRef = useRef<mapboxgl.Marker | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Get Mapbox token from Supabase
        const { data: { token }, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-0.118092, 51.509865], // London
          zoom: 12
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Handle coordinates changes
  useEffect(() => {
    if (!map.current || !coordinates || isLoading) return;

    // Update map center
    map.current.flyTo({
      center: coordinates,
      zoom: 14,
      essential: true
    });

    // Update search pin
    if (searchPinRef.current) {
      searchPinRef.current.remove();
    }

    // Create new search pin
    const el = document.createElement('div');
    el.className = 'flex items-center justify-center w-6 h-6 animate-bounce';
    el.innerHTML = `
      <svg class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    `;

    searchPinRef.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current);

    // Fetch nearby applications
    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-searchland-search', {
          body: {
            lat: coordinates[1],
            lng: coordinates[0],
            radius: 1000,
            limit: 5
          }
        });

        if (error) throw error;

        if (data?.data) {
          setApplications(data.data);
          
          // Clear existing markers
          Object.values(markersRef.current).forEach(marker => marker.remove());
          markersRef.current = {};

          // Add new markers
          data.data.forEach((app: any) => {
            if (!app.location?.coordinates) return;
            
            const el = document.createElement('div');
            el.className = 'w-6 h-6 bg-white rounded-full border-2 border-primary shadow-lg';
            
            const marker = new mapboxgl.Marker(el)
              .setLngLat([app.location.coordinates[0], app.location.coordinates[1]])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                  .setHTML(`
                    <div class="p-2">
                      <p class="font-medium">${app.address || 'No address'}</p>
                      <p class="text-sm text-gray-600">${app.status || 'Status unknown'}</p>
                    </div>
                  `)
              )
              .addTo(map.current!);

            markersRef.current[app.id] = marker;
          });
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();

  }, [coordinates, isLoading]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};