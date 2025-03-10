
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/applicationTransforms";
import { sortApplicationsByDistance } from "@/utils/applicationDistance";

/**
 * Transform raw application data and sort by distance
 */
export const transformAndSortApplications = (
  applications: any[],
  coordinates: [number, number]
): Application[] => {
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    return [];
  }
  
  // Transform the applications
  const transformedApplications = applications
    .map(app => transformApplicationData(app, coordinates))
    .filter((app): app is Application => app !== null);
  
  // Sort by distance
  return sortApplicationsByDistance(transformedApplications, coordinates);
};
