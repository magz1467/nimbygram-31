
import { Application } from "@/types/planning";
import { extractCoordinates } from "./coordinate-extraction";
import { calculateDistance } from "@/utils/distance";

/**
 * Transforms raw application data from the database into our Application type
 * @param rawData The raw data from database
 * @param searchPoint The coordinates of the search location
 * @returns Application object with properly formatted data, or null if invalid
 */
export const transformApplicationData = (rawData: any, searchPoint: [number, number]): Application | null => {
  // Skip invalid entries
  if (!rawData || !rawData.id) {
    console.warn('Invalid application data received', rawData);
    return null;
  }

  try {
    // Extract coordinates from the raw data
    const coordinates = extractCoordinates(rawData, searchPoint);
    
    // Skip applications without valid coordinates
    if (!coordinates) {
      console.warn(`Application ${rawData.id} has no valid coordinates`);
      return null;
    }
    
    // Calculate distance from search point to application
    const distance = calculateDistance(searchPoint, coordinates);
    
    // Create normalized Application object
    const application: Application = {
      id: rawData.id,
      title: rawData.title || `${rawData.application_type || 'Planning'} Application`,
      reference: rawData.reference_number || rawData.id,
      address: rawData.address || 'Address not available',
      description: rawData.description || '',
      status: rawData.status || 'Unknown',
      coordinates,
      distance,
      application_type: rawData.application_type || '',
      application_type_full: rawData.application_type_full || rawData.application_type || '',
      application_date: rawData.application_date || rawData.created_at,
      decision_date: rawData.decision_date || null,
      class_3: rawData.class_3 || '',
      url: rawData.url || '',
      
      // Additional fields
      authority: rawData.authority || 'Unknown Authority',
      authority_id: rawData.authority_id,
      documents_url: rawData.documents_url || rawData.url,
      
      // Any raw fields we want to preserve
      rawData: {
        ...rawData,
        // We don't need to duplicate large text fields
        description: undefined,
      }
    };
    
    return application;
  } catch (error) {
    console.error(`Error transforming application data for ID ${rawData.id}:`, error);
    return null;
  }
};
