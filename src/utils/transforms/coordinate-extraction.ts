
import { LatLngTuple } from 'leaflet';

export const extractCoordinates = (app: any, center: LatLngTuple): [number, number] | null => {
  console.log('Extracting coordinates for:', app.id);
  
  let lat: number | null = null;
  let lng: number | null = null;

  // Try WKT POINT format first
  if (app.geom && typeof app.geom === 'string' && app.geom.startsWith('SRID=4326;POINT(')) {
    const match = app.geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      // WKT is in longitude, latitude order
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
    }
  }
  
  // Try direct lat/lng fields
  if (!lat && !lng && app.latitude && app.longitude) {
    lat = parseFloat(app.latitude);
    lng = parseFloat(app.longitude);
  }
  
  // Validate coordinates
  if (lat && lng && 
      !isNaN(lat) && !isNaN(lng) &&
      Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    // Explicitly return a tuple with exactly two numbers
    return [lat, lng];
  }

  console.warn('No valid coordinates found for application:', app.id);
  return null;
};
