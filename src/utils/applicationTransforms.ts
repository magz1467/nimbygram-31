
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { calculateDistance } from './distance';

export const transformApplicationData = (
  app: any, 
  center: LatLngTuple,
  imageUrl = '/placeholder.svg'
): Application | null => {
  console.group(`🔄 Transforming application ${app.id}`);
  console.log('Raw application data:', {
    id: app.id,
    geom: app.geom,
    latitude: app.latitude,
    longitude: app.longitude,
    received_date: app.received_date,
    submittedDate: app.submittedDate,
    streetview_url: app.streetview_url,
    image: app.image
  });
  
  // Extract coordinates from geometry - prioritize the geometry column for accuracy
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
          coordinates = [
            parseFloat(match[2]), // lat
            parseFloat(match[1])  // lng
          ];
          console.log('Extracted coordinates from WKT geometry:', coordinates);
        }
      }
      // Handle GeoJSON geometry object
      else if (typeof app.geom === 'object') {
        if (app.geom.type === 'Point' && Array.isArray(app.geom.coordinates)) {
          // GeoJSON Point objects have coordinates in [longitude, latitude] order!
          coordinates = [
            parseFloat(app.geom.coordinates[1]), // lat
            parseFloat(app.geom.coordinates[0])  // lng
          ];
          console.log('Extracted coordinates from GeoJSON Point:', coordinates);
        } else if (Array.isArray(app.geom.coordinates)) {
          // Generic GeoJSON coordinate arrays are in [longitude, latitude] order!
          coordinates = [
            parseFloat(app.geom.coordinates[1]), // lat
            parseFloat(app.geom.coordinates[0])  // lng
          ];
          console.log('Extracted coordinates from GeoJSON coordinates array:', coordinates);
        }
      }
      // Handle stringified geometry
      else if (typeof app.geom === 'string') {
        try {
          const geomObj = JSON.parse(app.geom);
          if (geomObj.coordinates && Array.isArray(geomObj.coordinates)) {
            // GeoJSON coordinates are [longitude, latitude]
            coordinates = [
              parseFloat(geomObj.coordinates[1]), // lat
              parseFloat(geomObj.coordinates[0])  // lng
            ];
            console.log('Extracted coordinates from stringified geometry:', coordinates);
          }
        } catch (e) {
          console.warn('⚠️ Could not parse geom string:', e);
        }
      }
    }

    // Fallback 1: Direct latitude/longitude fields
    if (!coordinates && app.latitude && app.longitude) {
      coordinates = [
        parseFloat(app.latitude),
        parseFloat(app.longitude)
      ];
      console.log('Using direct latitude/longitude fields:', coordinates);
    } 
    // Fallback 2: Centroid
    else if (!coordinates && app.centroid) {
      if (typeof app.centroid === 'object' && app.centroid.coordinates) {
        coordinates = [
          parseFloat(app.centroid.coordinates[1]), // lat
          parseFloat(app.centroid.coordinates[0])  // lng
        ];
        console.log('Using centroid coordinates:', coordinates);
      } else if (typeof app.centroid === 'object' && app.centroid.lat && app.centroid.lon) {
        coordinates = [
          parseFloat(app.centroid.lat),
          parseFloat(app.centroid.lon)
        ];
        console.log('Using centroid lat/lon:', coordinates);
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

  // Check for valid coordinates but don't return null if missing
  // We'll use a fallback location if coordinates are missing
  if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
    console.warn('⚠️ Invalid coordinates for application:', app.id);
    // Use center as fallback instead of returning null
    // Make sure we create a new array, not just reference center
    coordinates = [center[0], center[1]];
  }

  // Calculate distance if we have coordinates
  let formattedDistance = 'Unknown';
  if (coordinates) {
    const distanceInKm = calculateDistance(center, coordinates);
    const distanceInMiles = distanceInKm * 0.621371;
    formattedDistance = `${distanceInMiles.toFixed(1)} mi`;
  }

  // Parse final_impact_score carefully
  let finalImpactScore: number | null = null;
  if (app.final_impact_score !== null && app.final_impact_score !== undefined) {
    const parsed = parseFloat(app.final_impact_score);
    if (!isNaN(parsed)) {
      finalImpactScore = Math.round(parsed);
    }
  }

  // Construct a more robust address from available fields
  let address = 'Address unavailable';
  if (app.street_name || app.site_name || app.locality || app.postcode) {
    address = [
      app.site_name, 
      app.street_name, 
      app.locality, 
      app.postcode
    ].filter(Boolean).join(', ');
  } else if (app.address) {
    // Use direct address field if available
    address = app.address;
  }

  // Process image URLs - ensure we have valid URLs
  const processedImage = app.image && app.image !== 'undefined' && app.image !== 'null' 
    ? app.image 
    : imageUrl;
  
  const processedStreetviewUrl = app.streetview_url && app.streetview_url !== 'undefined' && app.streetview_url !== 'null'
    ? app.streetview_url
    : null;
    
  const processedImageMapUrl = app.image_map_url && app.image_map_url !== 'undefined' && app.image_map_url !== 'null'
    ? app.image_map_url
    : null;

  const application: Application = {
    id: app.id,
    title: app.description || app.title || `Application ${app.id}`,
    address: address,
    status: app.status || 'Status unavailable',
    distance: formattedDistance,
    reference: app.lpa_app_no || '',
    description: app.description || '',
    applicant: typeof app.application_details === 'object' ? 
      (app.application_details as any)?.applicant || '' : '',
    submissionDate: app.valid_date || '',
    submittedDate: app.received_date || app.valid_date || app.submittedDate || null,
    decisionDue: app.decision_target_date || '',
    type: app.application_type || '',
    ward: app.ward || '',
    officer: typeof app.application_details === 'object' ? 
      (app.application_details as any)?.officer || '' : '',
    consultationEnd: app.last_date_consultation_comments || '',
    image: processedImage,
    streetview_url: processedStreetviewUrl,
    image_map_url: processedImageMapUrl,
    coordinates,
    ai_title: app.ai_title,
    postcode: app.postcode || '',
    impact_score: app.impact_score || null,
    impact_score_details: app.impact_score_details || null,
    last_date_consultation_comments: app.last_date_consultation_comments || null,
    valid_date: app.valid_date || null,
    centroid: app.centroid || null,
    class_3: app.class_3 === null || app.class_3 === undefined || app.class_3 === 'undefined' ? 'Miscellaneous' : app.class_3,
    final_impact_score: finalImpactScore,
    engaging_title: app.engaging_title || null,
    storybook: app.storybook || null,
    storybook_header: app.storybook_header || null,
    received_date: app.received_date || null
  };

  console.log('✅ Transformed application:', {
    id: application.id,
    coordinates: application.coordinates,
    title: application.title,
    address: application.address,
    image: application.image,
    streetview_url: application.streetview_url,
    image_map_url: application.image_map_url,
    submittedDate: application.submittedDate,
    received_date: application.received_date
  });
  console.groupEnd();
  
  return application;
};
