
import { LatLngTuple } from 'leaflet';

export const extractCoordinates = (app: any, center: LatLngTuple): [number, number] | null => {
  if (!app || app === null) {
    console.warn('Null application object passed to extractCoordinates');
    return null;
  }
  
  console.log('Extracting coordinates for:', app.id);
  
  let lat: number | null = null;
  let lng: number | null = null;

  // Try direct lat/lng fields first as they're most reliable
  if (app.latitude && app.longitude) {
    lat = typeof app.latitude === 'string' ? parseFloat(app.latitude) : app.latitude;
    lng = typeof app.longitude === 'string' ? parseFloat(app.longitude) : app.longitude;
    
    // Validate the parsed values
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`Extracted from direct fields: [${lat}, ${lng}]`);
    } else {
      lat = null;
      lng = null;
    }
  }
  
  // If direct fields didn't work, try lat/lng
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.lat && app.lng) {
    lat = typeof app.lat === 'string' ? parseFloat(app.lat) : app.lat;
    lng = typeof app.lng === 'string' ? parseFloat(app.lng) : app.lng;
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`Extracted from lat/lng fields: [${lat}, ${lng}]`);
    } else {
      lat = null;
      lng = null;
    }
  }
  
  // Try WKT POINT format if direct fields failed
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.geom && typeof app.geom === 'string' && app.geom.startsWith('SRID=4326;POINT(')) {
    const match = app.geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      // WKT is in longitude, latitude order - swap them to get [lat, lng]
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log(`Extracted from WKT: [${lat}, ${lng}]`);
      } else {
        lat = null;
        lng = null;
      }
    }
  }
  
  // Try geometry if it exists as a separate field with coordinates array
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.geometry && app.geometry.coordinates && 
      Array.isArray(app.geometry.coordinates) && 
      app.geometry.coordinates.length >= 2) {
    // GeoJSON is in [longitude, latitude] order - swap them
    lng = parseFloat(app.geometry.coordinates[0]);
    lat = parseFloat(app.geometry.coordinates[1]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`Extracted from geometry.coordinates: [${lat}, ${lng}]`);
    } else {
      lat = null;
      lng = null;
    }
  }
  
  // Try geom if it contains coordinates and is an object
  if ((!lat || !lng || isNaN(lat) || isNaN(lng)) && 
      app.geom && typeof app.geom === 'object' && app.geom.coordinates && 
      Array.isArray(app.geom.coordinates) && 
      app.geom.coordinates.length >= 2) {
    // GeoJSON geom is in [longitude, latitude] order
    lng = parseFloat(app.geom.coordinates[0]);
    lat = parseFloat(app.geom.coordinates[1]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`Extracted from geom object coordinates: [${lat}, ${lng}]`);
    } else {
      lat = null;
      lng = null;
    }
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
