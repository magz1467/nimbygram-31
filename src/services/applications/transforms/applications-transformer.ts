
import { Application } from "@/types/planning";
import { transformApplicationData } from "@/utils/transforms/application-transformer";
import { calculateDistance, sortApplicationsByDistance } from "@/utils/distance";

export const transformAndSortApplications = (
  applications: any[]
): Application[] => {
  if (!applications || !Array.isArray(applications) || applications.length === 0) {
    return [];
  }
  
  console.log(`Transforming and sorting ${applications.length} applications`);
  
  // Transform the applications
  const transformedApplications = applications
    .map(app => transformApplicationData(app))
    .filter((app): app is Application => app !== null);
  
  // Check if we have coordinates for sorting
  const hasCoordinates = transformedApplications.some(app => 
    app.coordinates !== null && Array.isArray(app.coordinates) && app.coordinates.length === 2
  );
  
  // Sort by distance if possible, otherwise return as-is
  if (hasCoordinates) {
    // We need a reference point for sorting - use the first application with coordinates
    const referenceApp = transformedApplications.find(app => app.coordinates !== null);
    if (referenceApp && referenceApp.coordinates) {
      return sortApplicationsByDistance(transformedApplications, referenceApp.coordinates);
    }
  }
  
  return transformedApplications;
};
