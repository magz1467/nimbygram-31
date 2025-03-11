
import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { extractCoordinates } from './coordinate-extraction';
import { formatAddress } from './address-formatter';
import { processImageUrls } from './image-processor';
import { calculateFormattedDistance } from './distance-calculator';

/**
 * Transforms raw application data into standardized Application format
 * @param app Raw application data
 * @param center Center coordinates for distance calculation [latitude, longitude]
 * @param imageUrl Default image URL
 * @returns Transformed Application object
 */
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
  
  // Extract coordinates from various sources
  const coordinates = extractCoordinates(app, center);
  
  // Format address string
  const address = formatAddress(app);
  
  // Process image URLs
  const { image, streetviewUrl, imageMapUrl } = processImageUrls(app, imageUrl);
  
  // Calculate distance
  const formattedDistance = calculateFormattedDistance(center, coordinates);
  
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
    image: image,
    streetview_url: streetviewUrl,
    image_map_url: imageMapUrl,
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
