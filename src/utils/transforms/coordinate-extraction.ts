
import { LatLngTuple } from 'leaflet';

/**
 * Extracts coordinates from various geometry formats
 * @param app Application data object
 * @param center Fallback center coordinates
 * @returns Valid coordinates or null
 */
export const extractCoordinates = (app: any, center: LatLngTuple): [number, number] | null => {
  console.group(`Extracting coordinates for application ${app.id}`);
  console.log('Input data:', {
    geom: app.geom,
    latitude: app.latitude,
    longitude: app.longitude,
    centroid: app.centroid
  });
  
  let coordinates: [number, number] | null = null;
  
  try {
    // First try: Use the geometry column if available (most accurate)
    if (app.geom) {
      console.log('Found geom field:', app.geom);
      // Handle PostGIS geometry format (WKT, GeoJSON, etc.)
      if (typeof app.geom === 'string' && app.geom.startsWith('SRID=4326;POINT(')) {
        // Parse WKT format: "SRID=4326;POINT(lng lat)"
        const match = app.geom.match(/POINT\(([^ ]+) ([^)]+)\)/);
        if (match && match[1] && match[2]) {
          // WKT is in longitude, latitude order
          const lat = parseFloat(match[2]);
          const lng = parseFloat(match[1]);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = [lat, lng];
            console.log('Extracted coordinates from WKT geometry:', coordinates);
          }
        }
      }
      // Handle GeoJSON geometry object
      else if (typeof app.geom === 'object') {
        if (app.geom.type === 'Point' && Array.isArray(app.geom.coordinates)) {
          // GeoJSON Point objects have coordinates in [longitude, latitude] order!
          const lat = parseFloat(app.geom.coordinates[1]);
          const lng = parseFloat(app.geom.coordinates[0]);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = [lat, lng];
            console.log('Extracted coordinates from GeoJSON Point:', coordinates);
          }
        } else if (Array.isArray(app.geom.coordinates)) {
          // Generic GeoJSON coordinate arrays are in [longitude, latitude] order!
          const lat = parseFloat(app.geom.coordinates[1]);
          const lng = parseFloat(app.geom.coordinates[0]);
          
          if (!isNaN(lat) && !isNaN(lng)) {
            coordinates = [lat, lng];
            console.log('Extracted coordinates from GeoJSON coordinates array:', coordinates);
          }
        }
      }
      // Handle stringified geometry
      else if (typeof app.geom === 'string') {
        try {
          const geomObj = JSON.parse(app.geom);
          if (geomObj.coordinates && Array.isArray(geomObj.coordinates)) {
            // GeoJSON coordinates are [longitude, latitude]
            const lat = parseFloat(geomObj.coordinates[1]);
            const lng = parseFloat(geomObj.coordinates[0]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
              coordinates = [lat, lng];
              console.log('Extracted coordinates from stringified geometry:', coordinates);
            }
          }
        } catch (e) {
          console.warn('⚠️ Could not parse geom string:', e);
        }
      }
    }

    // Fallback 1: Direct latitude/longitude fields
    if (!coordinates && app.latitude && app.longitude) {
      const lat = parseFloat(app.latitude);
      const lng = parseFloat(app.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        coordinates = [lat, lng];
        console.log('Using direct latitude/longitude fields:', coordinates);
      }
    } 
    // Fallback 2: Centroid
    else if (!coordinates && app.centroid) {
      if (typeof app.centroid === 'object' && app.centroid.coordinates) {
        // GeoJSON coordinates are [longitude, latitude]
        const lat = parseFloat(app.centroid.coordinates[1]);
        const lng = parseFloat(app.centroid.coordinates[0]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = [lat, lng];
          console.log('Using centroid coordinates:', coordinates);
        }
      } else if (typeof app.centroid === 'object' && app.centroid.lat && app.centroid.lon) {
        const lat = parseFloat(app.centroid.lat);
        const lng = parseFloat(app.centroid.lon);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates = [lat, lng];
          console.log('Using centroid lat/lon:', coordinates);
        }
      }
    }
    
    // Validate coordinates
    if (coordinates) {
      // Check for invalid or extreme coordinates
      if (isNaN(coordinates[0]) || isNaN(coordinates[1]) || 
          Math.abs(coordinates[0]) > 90 || Math.abs(coordinates[1]) > 180) {
        console.warn('⚠️ Invalid coordinates detected:', coordinates);
        coordinates = null;
      } else {
        console.log('✅ Final valid coordinates:', coordinates);
      }
    }
  } catch (e) {
    console.warn('⚠️ Error extracting coordinates:', e);
  }

  // Return fallback location if coordinates are missing
  if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
    console.warn('⚠️ Invalid coordinates for application:', app.id);
    coordinates = center ? [center[0], center[1]] : null;
  }
  
  console.groupEnd();
  return coordinates;
};
