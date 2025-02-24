
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { calculateDistance } from './distance';

export const transformApplicationData = (
  app: any, 
  center: LatLngTuple,
  imageUrl = '/placeholder.svg'
): Application | null => {
  console.group(`🔄 Transforming application ${app.application_id}`);
  console.log('Raw application data:', app);
  
  // Extract coordinates from geometry
  let coordinates: [number, number] | null = null;
  
  if (app.geom) {
    try {
      // Handle both GeoJSON and raw coordinate formats
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
      }
      console.log('📍 Coordinates extracted:', coordinates);
    } catch (e) {
      console.warn('⚠️ Error extracting coordinates:', e);
      console.groupEnd();
      return null;
    }
  } else {
    console.warn('⚠️ Missing geometry for application:', app.application_id);
    console.groupEnd();
    return null;
  }

  if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
    console.warn('⚠️ Invalid coordinates for application:', app.application_id);
    console.groupEnd();
    return null;
  }

  const distanceInKm = calculateDistance(center, coordinates);
  const distanceInMiles = distanceInKm * 0.621371;
  const formattedDistance = `${distanceInMiles.toFixed(1)} mi`;

  // Log storybook data for debugging
  console.log('Storybook data:', {
    raw: app.storybook,
    type: typeof app.storybook,
    header: app.storybook_header
  });

  // Check if storybook is a string or an object with _type and value
  let storybook = '';
  if (typeof app.storybook === 'string') {
    storybook = app.storybook;
  } else if (app.storybook && typeof app.storybook === 'object') {
    if (app.storybook.value && typeof app.storybook.value === 'string') {
      storybook = app.storybook.value;
    }
  }

  // Log impact score data for debugging
  console.log('Impact Score Data:', {
    score: app.impact_score,
    final_score: app.final_impact_score,
    details: app.impact_score_details,
    raw_final_score: typeof app.final_impact_score,
    raw_value: app.final_impact_score
  });

  // Parse final_impact_score carefully
  let finalImpactScore: number | null = null;
  if (app.final_impact_score !== null && app.final_impact_score !== undefined) {
    const parsed = parseFloat(app.final_impact_score);
    if (!isNaN(parsed)) {
      finalImpactScore = Math.round(parsed);
      console.log('✅ Successfully parsed and rounded final_impact_score:', {
        original: app.final_impact_score,
        parsed: parsed,
        rounded: finalImpactScore
      });
    } else {
      console.warn('⚠️ Failed to parse final_impact_score:', app.final_impact_score);
    }
  }

  const application: Application = {
    id: app.application_id,
    title: app.description || '',
    address: `${app.site_name || ''} ${app.street_name || ''} ${app.locality || ''} ${app.postcode || ''}`.trim(),
    status: app.status || '',
    distance: formattedDistance,
    reference: app.lpa_app_no || '',
    description: app.description || '',
    applicant: typeof app.application_details === 'object' ? 
      (app.application_details as any)?.applicant || '' : '',
    submissionDate: app.valid_date || '',
    decisionDue: app.decision_target_date || '',
    type: app.application_type || '',
    ward: app.ward || '',
    officer: typeof app.application_details === 'object' ? 
      (app.application_details as any)?.officer || '' : '',
    consultationEnd: app.last_date_consultation_comments || '',
    image: imageUrl,
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
    storybook: storybook,
    storybook_header: app.storybook_header || ''
  };

  console.log('✅ Transformed application:', {
    id: application.id,
    coordinates: application.coordinates,
    distance: application.distance,
    impact_score: application.impact_score,
    final_impact_score: application.final_impact_score,
    class_3: application.class_3,
    engaging_title: application.engaging_title,
    storybook: application.storybook,
    storybook_header: application.storybook_header
  });
  console.groupEnd();
  return application;
};
