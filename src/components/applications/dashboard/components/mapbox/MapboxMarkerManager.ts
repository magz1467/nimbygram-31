import mapboxgl from 'mapbox-gl';
import { Application } from '@/types/planning';

export class MapboxMarkerManager {
  private markers: { [key: number]: { marker: mapboxgl.Marker, application: Application } } = {};
  
  constructor(private map: mapboxgl.Map, private onMarkerClick: (id: number) => void) {}

  private getStatusColor(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'declined':
      case 'refused':
        return '#ea384c';
      case 'under review':
      case 'pending':
      case 'under consideration':
      case 'application under consideration':
        return '#F97316';
      case 'approved':
        return '#16a34a';
      default:
        return '#10B981';
    }
  }

  private createMarkerElement(application: Application, isSelected: boolean): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.width = isSelected ? '30px' : '25px';
    el.style.height = isSelected ? '30px' : '25px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = this.getStatusColor(application.status);
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.style.position = 'relative';

    el.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onMarkerClick(application.id);
    });

    return el;
  }

  addMarker(application: Application, isSelected: boolean) {
    if (!application.coordinates) {
      console.warn(`Application ${application.id} has no coordinates`);
      return;
    }

    try {
      const [lat, lng] = application.coordinates;
      
      // Remove existing marker if it exists
      if (this.markers[application.id]) {
        this.markers[application.id].marker.remove();
      }

      const el = this.createMarkerElement(application, isSelected);
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([lng, lat]) // Mapbox expects [lng, lat]
        .addTo(this.map);

      this.markers[application.id] = { marker, application };
      
    } catch (error) {
      console.error(`Error adding marker for application ${application.id}:`, error);
    }
  }

  updateMarkerStyle(id: number, isSelected: boolean) {
    const markerData = this.markers[id];
    if (markerData) {
      const el = markerData.marker.getElement();
      el.style.width = isSelected ? '30px' : '25px';
      el.style.height = isSelected ? '30px' : '25px';
      el.style.backgroundColor = this.getStatusColor(markerData.application.status);
    }
  }

  removeMarker(id: number) {
    if (this.markers[id]) {
      this.markers[id].marker.remove();
      delete this.markers[id];
    }
  }

  removeAllMarkers() {
    Object.values(this.markers).forEach(({ marker }) => {
      try {
        marker.remove();
      } catch (err) {
        console.warn('Error removing marker:', err);
      }
    });
    this.markers = {};
  }

  getMarkers() {
    return this.markers;
  }
}