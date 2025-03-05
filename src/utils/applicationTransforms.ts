
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
    submittedDate: app.submittedDate
  });
  
  // Extract coordinates from geometry - more flexible approach
  let coordinates: [number, number] | null = null;
  
  try {
    // Try multiple approaches to get coordinates
    if (app.latitude && app.longitude) {
      // Direct latitude/longitude fields
      coordinates = [
        parseFloat(app.latitude),
        parseFloat(app.longitude)
      ];
    } else if (app.geom) {
      // Geometry object
      if (typeof app.geom === 'object' && app.geom.type === 'Point') {
        coordinates = [
          parseFloat(app.geom.coordinates[1]),
          parseFloat(app.geom.coordinates[0])
        ];
      } else if (typeof app.geom === 'object' && Array.isArray(app.geom.coordinates)) {
        coordinates = [
          parseFloat(app.geom.coordinates[1]),
          parseFloat(app.geom.coordinates[0])
        ];
      } else if (typeof app.geom === 'string') {
        // Handle case where geom might be a stringified object
        try {
          const geomObj = JSON.parse(app.geom);
          if (geomObj.coordinates) {
            coordinates = [
              parseFloat(geomObj.coordinates[1]),
              parseFloat(geomObj.coordinates[0])
            ];
          }
        } catch (e) {
          console.warn('⚠️ Could not parse geom string:', e);
        }
      }
    } else if (app.centroid) {
      // Try using centroid if available
      if (typeof app.centroid === 'object' && app.centroid.coordinates) {
        coordinates = [
          parseFloat(app.centroid.coordinates[1]),
          parseFloat(app.centroid.coordinates[0])
        ];
      }
    }
    
    console.log('📍 Coordinates extracted:', coordinates);
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
    image: app.streetview_url || imageUrl,
    coordinates,
    ai_title: app.ai_title,
    postcode: app.postcode || '',
    impact_score: app.impact_score || null,
    impact_score_details: app.impact_score_details || null,
    image_map_url: app.image_map_url || null,
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
    submittedDate: application.submittedDate,
    received_date: application.received_date
  });
  console.groupEnd();
  
  return application;
};
