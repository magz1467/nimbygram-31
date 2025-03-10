
import { Application } from "@/types/planning";
import { calculateDistance } from "@/utils/distance";
import { transformApplicationData } from "@/utils/applicationTransforms";

/**
 * Transforms raw application data into Application objects
 * @param properties - Raw application data from the database
 * @param coordinates - Search coordinates [lat, lng]
 * @returns Transformed and sorted Application objects
 */
export const transformAndSortApplications = (
  properties: any[] | null,
  coordinates: [number, number]
): Application[] => {
  if (!properties || properties.length === 0) {
    console.log('No properties data to transform');
    return [];
  }

  // Transform the application data using our shared transformer
  const transformedData = properties
    .map((item: any) => transformApplicationData(item, coordinates))
    .filter((app): app is Application => app !== null);
  
  console.log(`✅ Total transformed applications: ${transformedData.length}`);
  
  // Sort by distance - make sure to handle missing coordinates gracefully
  return transformedData
    .sort((a, b) => {
      // Handle applications without coordinates (push to end of list)
      if (!a.coordinates && !b.coordinates) return 0;
      if (!a.coordinates) return 1;
      if (!b.coordinates) return -1;
      
      // Calculate distances
      const distanceA = calculateDistance(coordinates, a.coordinates);
      const distanceB = calculateDistance(coordinates, b.coordinates);
      
      // Sort by distance ascending (closest first)
      return distanceA - distanceB;
    });
};

/**
 * Filters applications based on location relevance
 * This is useful when you want to prioritize applications in a specific area
 */
export const filterByLocationRelevance = (
  applications: Application[],
  targetLocation: string
): Application[] => {
  if (!targetLocation || targetLocation.trim() === '') {
    return applications;
  }
  
  // Normalize search terms for case-insensitive comparison
  const normalizedLocation = targetLocation.toLowerCase().trim();
  const locationParts = normalizedLocation.split(/[,\s]+/).filter(Boolean);
  
  // Create a scoring function for location relevance
  const getLocationScore = (app: Application): number => {
    let score = 0;
    
    // Check different fields for location matches
    const addressLower = (app.address || '').toLowerCase();
    const postcodeLower = (app.postcode || '').toLowerCase();
    const wardLower = (app.ward || '').toLowerCase();
    
    // Award points for address, postcode, and ward matches
    locationParts.forEach(part => {
      if (part.length < 3) return; // Skip very short terms
      
      if (addressLower.includes(part)) score += 3;
      if (postcodeLower.includes(part)) score += 5;
      if (wardLower.includes(part)) score += 4;
    });
    
    return score;
  };
  
  // First filter out applications with no relevance at all
  const relevantApps = applications.filter(app => getLocationScore(app) > 0);
  
  // If we have relevant applications, sort them by score and return
  if (relevantApps.length > 0) {
    return relevantApps.sort((a, b) => getLocationScore(b) - getLocationScore(a));
  }
  
  // If no relevant applications, return original list
  return applications;
};
