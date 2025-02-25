
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { calculateDistance } from './distance';

export const transformApplicationData = (
  app: any, 
  center: LatLngTuple,
  imageUrl = '/placeholder.svg'
): Application | null => {
  console.group(`🔄 Transforming application ${app.id}`);
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
    console.warn('⚠️ Missing geometry for application:', app.id);
    console.groupEnd();
    return null;
  }

  if (!coordinates || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
    console.warn('⚠️ Invalid coordinates for application:', app.id);
    console.groupEnd();
    return null;
  }

  const distanceInKm = calculateDistance(center, coordinates);
  const distanceInMiles = distanceInKm * 0.621371;
  const formattedDistance = `${distanceInMiles.toFixed(1)} mi`;

  // Log raw storybook data
  console.log('Raw storybook data:', {
    storybook: app.storybook,
    storybook_header: app.storybook_header,
    type: typeof app.storybook
  });

  // Extract storybook content from nested object if necessary
  let storybookContent = '';
  let storybookHeader = '';

  if (app.storybook) {
    if (typeof app.storybook === 'object') {
      storybookContent = app.storybook.content || '';
      storybookHeader = app.storybook.header || '';
    } else if (typeof app.storybook === 'string') {
      storybookContent = app.storybook;
      storybookHeader = app.storybook_header || '';
    }
  }

  // Parse final_impact_score carefully
  let finalImpactScore: number | null = null;
  if (app.final_impact_score !== null && app.final_impact_score !== undefined) {
    const parsed = parseFloat(app.final_impact_score);
    if (!isNaN(parsed)) {
      finalImpactScore = Math.round(parsed);
    }
  }

  const application: Application = {
    id: app.id,
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
    storybook: storybookContent,
    storybook_header: storybookHeader
  };

  console.log('✅ Transformed application:', {
    id: application.id,
    coordinates: application.coordinates,
    distance: application.distance,
    storybook: application.storybook,
    storybook_header: application.storybook_header
  });
  console.groupEnd();
  return application;
};

