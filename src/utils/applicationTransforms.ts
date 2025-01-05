import { Application } from "@/types/planning";
import { LatLngTuple } from 'leaflet';
import { calculateDistance } from './distance';

export const transformApplicationData = (
  app: any, 
  center: LatLngTuple,
  imageUrl = '/placeholder.svg'
): Application | null => {
  console.group(`🔄 Transforming application ${app.application_id}`);
  const geomObj = app.geom;
  let coordinates: [number, number] | null = null;

  if (geomObj && typeof geomObj === 'object' && 'coordinates' in geomObj) {
    coordinates = [
      geomObj.coordinates[1] as number,
      geomObj.coordinates[0] as number
    ];
    console.log('📍 Coordinates extracted:', coordinates);
  } else {
    console.warn('⚠️ Missing or invalid geometry for application:', app.application_id);
  }

  if (!coordinates) {
    console.warn('⚠️ No valid coordinates for application:', app.application_id);
    console.groupEnd();
    return null;
  }

  const distanceInKm = calculateDistance(center, coordinates);
  const distanceInMiles = distanceInKm * 0.621371;
  const formattedDistance = `${distanceInMiles.toFixed(1)} mi`;

  if (app.application_details && typeof app.application_details === 'object') {
    const details = app.application_details as any;
    if (details.images && Array.isArray(details.images) && details.images.length > 0) {
      const imgUrl = details.images[0];
      imageUrl = imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${imgUrl}`;
      console.log('🖼️ Image URL processed:', imageUrl);
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
    postcode: app.postcode || ''
  };

  console.log('✅ Transformed application:', {
    id: application.id,
    coordinates: application.coordinates,
    distance: application.distance
  });
  console.groupEnd();
  return application;
};