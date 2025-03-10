
import { LatLngTuple } from 'leaflet';

export const extractCoordinates = (app: any, center: LatLngTuple): [number, number] | null => {
  console.log('Extracting coordinates for:', app.id);
  
  let lat: number | null = null;
  let lng: number | null = null;

  // Try direct lat/lng fields first as they're most reliable
  if (app.latitude && app.longitude) {
    lat = parseFloat(app.latitude);
    lng = parseFloat(app.longitude);
    console.log(`Extracted from direct fields: [${lat}, ${lng}]`);
  }
  
  // Try WKT POINT format if direct fields failed
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.geom && typeof app.geom === 'string' && app.geom.startsWith('SRID=4326;POINT(')) {
    const match = app.geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      // WKT is in longitude, latitude order - swap them to get [lat, lng]
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
      console.log(`Extracted from WKT: [${lat}, ${lng}]`);
    }
  }
  
  // As a last resort, try geometry.coordinates if available
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.geometry && app.geometry.coordinates && 
      Array.isArray(app.geometry.coordinates) && 
      app.geometry.coordinates.length >= 2) {
    // GeoJSON is in [longitude, latitude] order - swap them
    lng = parseFloat(app.geometry.coordinates[0]);
    lat = parseFloat(app.geometry.coordinates[1]);
    console.log(`Extracted from geometry.coordinates: [${lat}, ${lng}]`);
  }
  
  // Validate coordinates more strictly
  if (lat !== null && lng !== null && 
      !isNaN(lat) && !isNaN(lng) &&
      Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
    
    // Ensure we're returning [latitude, longitude] consistently
    const coordinates: [number, number] = [lat, lng];
    
    // Validate the coordinates are in the UK (rough check)
    const inUK = lat > 49 && lat < 61 && lng > -11 && lng < 2;
    if (!inUK) {
      console.warn(`Coordinates for ${app.id} appear to be outside the UK: [${lat}, ${lng}]`);
    }
    
    console.log(`Valid coordinates for ${app.id}: [${coordinates[0]}, ${coordinates[1]}]`);
    return coordinates;
  }

  console.warn('No valid coordinates found for application:', app.id);
  return null;
};
