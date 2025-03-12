
import { Application } from "@/types/planning";

export const transformApplicationFromDatabase = (data: any): Application => {
  return {
    id: data.id,
    reference: data.reference || '',
    title: data.title || '',
    description: data.description || '',
    status: data.status || '',
    type: data.type || '',
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address || '',
    documents: data.documents || [],
    coordinates: data.latitude && data.longitude ? [data.latitude, data.longitude] : null,
    distance: data.distance || null,
    created_at: data.created_at || null,
    updated_at: data.updated_at || null,
    impact_score: data.impact_score || null,
    classification: data.classification || '',
    postcode: data.postcode || '',
    image_url: data.image_url || null,
  };
};

export const transformApplicationsData = (applications: any[]): Application[] => {
  return applications
    .filter(app => app && typeof app === 'object')
    .map(transformApplicationFromDatabase);
};
