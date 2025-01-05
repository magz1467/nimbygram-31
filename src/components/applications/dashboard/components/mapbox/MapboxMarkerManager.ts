import mapboxgl from 'mapbox-gl';
import { Application } from '@/types/planning';

interface MarkerInfo {
  marker: mapboxgl.Marker;
  application: Application;
}

export class MapboxMarkerManager {
  private map: mapboxgl.Map;
  private markers: { [key: number]: MarkerInfo } = {};
  private onMarkerClick: (id: number) => void;

  constructor(map: mapboxgl.Map, onMarkerClick: (id: number) => void) {
    console.log('Initializing MapboxMarkerManager');
    this.map = map;
    this.onMarkerClick = onMarkerClick;
  }

  public getMarkers() {
    return this.markers;
  }

  public removeAllMarkers() {
    console.log(`Removing ${Object.keys(this.markers).length} markers`);
    Object.values(this.markers).forEach(({ marker }) => {
      marker.remove();
    });
    this.markers = {};
  }

  public addMarker(application: Application, isSelected: boolean) {
    if (!application.coordinates) {
      console.warn(`Application ${application.id} has no coordinates - skipping`);
      return;
    }

    try {
      const [lat, lng] = application.coordinates;
      console.log(`Adding marker for application ${application.id} [${lat}, ${lng}]`);
      
      // Remove existing marker if it exists
      if (this.markers[application.id]) {
        this.markers[application.id].marker.remove();
      }

      // Create marker element
      const el = this.createMarkerElement(isSelected);

      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([lng, lat])
        .addTo(this.map);

      this.markers[application.id] = { marker, application };

      // Add click handler
      el.addEventListener('click', () => {
        console.log(`Marker clicked for application ${application.id}`);
        this.onMarkerClick(application.id);
      });

    } catch (error) {
      console.error(`Error adding marker for application ${application.id}:`, error);
    }
  }

  public updateMarkerStyle(applicationId: number, isSelected: boolean) {
    const markerInfo = this.markers[applicationId];
    if (!markerInfo) {
      console.warn(`Attempted to update style for non-existent marker: ${applicationId}`);
      return;
    }

    const el = markerInfo.marker.getElement();
    this.updateMarkerElement(el, isSelected);
  }

  private createMarkerElement(isSelected: boolean): HTMLDivElement {
    const el = document.createElement('div');
    this.updateMarkerElement(el, isSelected);
    return el;
  }

  private updateMarkerElement(el: HTMLElement, isSelected: boolean) {
    el.className = 'marker';
    el.style.width = '24px';
    el.style.height = '24px';
    el.style.backgroundImage = `url(${isSelected ? '/marker-selected.svg' : '/marker.svg'})`;
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';
  }
}